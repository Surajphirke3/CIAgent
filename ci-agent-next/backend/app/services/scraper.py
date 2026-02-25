"""
Scraper Service — Production-grade Playwright-based competitor scraper.

Features:
- Stealth user-agent rotation (anti-bot)
- Per-URL retry with exponential backoff
- Content hash fingerprinting (skip unchanged pages)
- Asyncio Semaphore for parallel scraping (max 5 concurrent)
- Structured logging
- Graceful timeout handling
"""
import asyncio
import hashlib
import logging
import random
from typing import Dict, List, Optional

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Error as PlaywrightError

logger = logging.getLogger(__name__)

# ── Anti-Detection: User-Agent Pool ──────────────────────────────────────────
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
]

# ── CSS selectors per section ─────────────────────────────────────────────────
SECTION_SELECTORS = {
    "pricing": ["#pricing", ".pricing", "[data-page='pricing']", ".pricing-section", "section.pricing"],
    "homepage": ["main", "#main", ".main-content", "article", "body"],
    "blog": ["#blog", ".blog", "article", ".posts", ".blog-list"],
    "jobs": [".careers", "#jobs", ".job-listings", "[data-section='careers']", ".open-positions"],
}

# Semaphore: at most 5 concurrent browser scrapes
_scrape_semaphore = asyncio.Semaphore(5)


# ── SHA-256 fingerprint ────────────────────────────────────────────────────────

def content_hash(text: str) -> str:
    """Return a SHA-256 hex digest of page content for fast change detection."""
    return hashlib.sha256(text.encode("utf-8", errors="replace")).hexdigest()


def snapshot_hash(snapshot: Dict[str, str]) -> str:
    """Return a combined hash of all sections in a snapshot."""
    combined = "|".join(f"{k}:{v}" for k, v in sorted(snapshot.items()))
    return content_hash(combined)


# ── Core Scrape ───────────────────────────────────────────────────────────────

async def _scrape_once(url: str, sections: List[str]) -> Dict[str, str]:
    """Single scrape attempt — raises on failure."""
    user_agent = random.choice(USER_AGENTS)

    async with _scrape_semaphore:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-dev-shm-usage",
                ],
            )
            context = await browser.new_context(
                user_agent=user_agent,
                viewport={"width": 1280, "height": 800},
                locale="en-US",
                timezone_id="America/New_York",
                extra_http_headers={
                    "Accept-Language": "en-US,en;q=0.9",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                },
            )
            page = await context.new_page()

            # Hide automation signals
            await page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
                window.chrome = {runtime: {}};
            """)

            try:
                await page.goto(url, wait_until="networkidle", timeout=30_000)
                # Small random delay to mimic human browsing
                await asyncio.sleep(random.uniform(0.5, 1.5))
                html = await page.content()
            finally:
                await browser.close()

    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "head", "noscript", "aside"]):
        tag.decompose()

    results: Dict[str, str] = {}
    for section in sections:
        selectors = SECTION_SELECTORS.get(section, ["body"])
        for selector in selectors:
            el = soup.select_one(selector)
            if el:
                text = el.get_text(separator=" ", strip=True)
                # Normalize whitespace to reduce false positives from formatting changes
                text = " ".join(text.split())
                results[section] = text[:5000]
                break
        if section not in results:
            results[section] = ""

    return results


async def scrape_competitor(
    url: str,
    sections: List[str],
    max_retries: int = 3,
) -> Dict[str, str]:
    """
    Public entry-point. Scrapes with retry and exponential backoff.
    Returns section → text mapping. Raises on all-retries exhausted.
    """
    last_exc: Optional[Exception] = None

    for attempt in range(1, max_retries + 1):
        try:
            logger.info("Scraping %s (attempt %d/%d)", url, attempt, max_retries)
            result = await _scrape_once(url, sections)
            logger.info("Scrape OK for %s — %d sections", url, len(result))
            return result
        except PlaywrightError as exc:
            last_exc = exc
            wait = 2 ** attempt  # 2s, 4s, 8s
            logger.warning(
                "Playwright error on %s attempt %d: %s — retrying in %ds",
                url, attempt, exc, wait,
            )
            await asyncio.sleep(wait)
        except Exception as exc:  # noqa: BLE001
            last_exc = exc
            wait = 2 ** attempt
            logger.warning(
                "Scrape error on %s attempt %d: %s — retrying in %ds",
                url, attempt, exc, wait,
            )
            await asyncio.sleep(wait)

    raise RuntimeError(
        f"All {max_retries} scrape attempts failed for {url}: {last_exc}"
    )


async def scrape_many(
    targets: List[Dict],  # [{"url": str, "sections": list, "competitor_id": str}]
) -> Dict[str, Dict[str, str]]:
    """
    Scrape multiple competitors concurrently (bounded by semaphore).
    Returns {competitor_id: snapshot_dict}.
    """
    async def _scrape_target(t):
        try:
            snapshot = await scrape_competitor(t["url"], t["sections"])
            return t["competitor_id"], snapshot
        except Exception as exc:  # noqa: BLE001
            logger.error("Failed to scrape competitor %s: %s", t["competitor_id"], exc)
            return t["competitor_id"], None

    results_list = await asyncio.gather(*[_scrape_target(t) for t in targets])
    return {cid: snap for cid, snap in results_list if snap is not None}
