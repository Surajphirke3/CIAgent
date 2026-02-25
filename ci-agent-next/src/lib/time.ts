/**
 * Time utilities — all helpers treat incoming ISO strings as UTC,
 * which is what the FastAPI backend always stores (datetime.utcnow / datetime.now(UTC)).
 *
 * The backend currently returns naive UTC strings like "2026-02-25T13:38:00"
 * (no trailing Z). We normalise them by appending Z before parsing,
 * which forces the browser to interpret them as UTC rather than local time.
 */

function toUTC(iso: string): Date {
    // Already has timezone info (Z or +offset) — parse as-is
    if (/[Zz]$/.test(iso) || /[+-]\d{2}:\d{2}$/.test(iso)) {
        return new Date(iso);
    }
    // Naive UTC string from Python's datetime.utcnow() — append Z
    return new Date(iso + "Z");
}

export function timeAgo(iso: string | null | undefined): string {
    if (!iso) return "Never";
    const d = toUTC(iso);
    if (isNaN(d.getTime())) return "Unknown";
    const diff = Date.now() - d.getTime();
    if (diff < 0) return "just now";
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return "just now";
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(iso);
}

export function formatDate(iso: string): string {
    return toUTC(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function formatDateTime(iso: string): string {
    const d = toUTC(iso);
    const isToday = d.toDateString() === new Date().toDateString();
    if (isToday) {
        return `Today, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
