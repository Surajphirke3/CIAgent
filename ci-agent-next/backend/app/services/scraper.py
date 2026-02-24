from typing import Dict, List

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

SECTION_SELECTORS = {
    "pricing": ["#pricing", ".pricing", "[data-page='pricing']"],
    "homepage": ["main", "#main", ".main-content", "body"],
    "blog": ["#blog", ".blog", "article", ".posts"],
    "jobs": [".careers", "#jobs", ".job-listings", "[data-section='careers']"],
}


async def scrape_competitor(url: str, sections: List[str]) -> Dict[str, str]:
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox"],
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (compatible; CI-Agent/1.0)"
        )
        page = await context.new_page()

        try:
            await page.goto(url, wait_until="networkidle", timeout=30000)
            html = await page.content()
        finally:
            await browser.close()

    soup = BeautifulSoup(html, "html.parser")

    for tag in soup(["script", "style", "nav", "footer", "head", "noscript"]):
        tag.decompose()

    results: Dict[str, str] = {}

    for section in sections:
        selectors = SECTION_SELECTORS.get(section, ["body"])
        for selector in selectors:
            el = soup.select_one(selector)
            if el:
                text = el.get_text(separator=" ", strip=True)
                results[section] = text[:5000]
                break
        if section not in results:
            results[section] = ""

    return results

