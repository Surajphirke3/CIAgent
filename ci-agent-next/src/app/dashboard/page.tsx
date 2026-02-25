"use client";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { timeAgo, formatDate } from "@/lib/time";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Competitor {
    id: string;
    name: string;
    url: string;
    status: string;
    last_scraped: string | null;
    tags: string[];
}

interface Report {
    id: string;
    competitor_name: string;
    created_at: string;
    ai_summary: string;
    severity: "low" | "medium" | "high";
    diffs: { section: string; change_type: string }[];
}

interface Signal {
    id: string;
    competitor_name: string;
    type: string;
    impact_level: "high" | "medium" | "low";
    detected_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────


function severityColor(s: string) {
    if (s === "high") return "text-pink-500";
    if (s === "medium") return "text-yellow-500";
    return "text-secondary";
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, barWidth, loading }: {
    label: string; value: string; sub?: string | null;
    color?: string; barWidth?: string; loading?: boolean;
}) {
    if (loading) return (
        <div className="glass-panel rounded-2xl p-6 bg-background-dark/60 backdrop-blur-md border border-white/10 shadow-2xl animate-pulse">
            <div className="h-3 bg-white/5 rounded w-2/3 mb-3"></div>
            <div className="h-8 bg-white/5 rounded w-1/2"></div>
        </div>
    );
    return (
        <motion.div className="glass-panel rounded-2xl p-6 relative overflow-hidden group bg-background-dark/60 backdrop-blur-md border border-white/10 shadow-2xl">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">{label}</p>
            <div className="flex items-end gap-3">
                <h3 className="text-4xl font-bold text-slate-100 tracking-tighter">{value}</h3>
                {sub && <span className={`${color ?? "text-secondary"} text-sm font-bold pb-1`}>{sub}</span>}
            </div>
            {barWidth ? (
                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${color ? `bg-${color}` : "bg-secondary"} rounded-full transition-all duration-1000`} style={{ width: barWidth }}></div>
                </div>
            ) : (
                <div className="mt-4 flex gap-1">
                    <div className="h-1 flex-1 bg-secondary/60 rounded-full animate-pulse"></div>
                    <div className="h-1 flex-1 bg-secondary/40 rounded-full"></div>
                    <div className="h-1 flex-1 bg-secondary/20 rounded-full"></div>
                </div>
            )}
        </motion.div>
    );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [signals, setSignals] = useState<Signal[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [comps, reps, sigs] = await Promise.all([
                apiFetch<Competitor[]>("/competitors/"),
                apiFetch<Report[]>("/reports/"),
                apiFetch<Signal[]>("/signals/"),
            ]);
            setCompetitors(comps);
            setReports(reps);
            setSignals(sigs);
        } catch (err) {
            // Silently fall back — dashboard still renders with empty data
            console.warn("Dashboard fetch error:", err instanceof ApiError ? err.message : err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Derived stats ──────────────────────────────────────────────────────────
    const activeCount = competitors.filter(c => c.status === "active").length;
    const highSeverityReports = reports.filter(r => r.severity === "high");
    const totalChanges = reports.reduce((acc, r) => acc + r.diffs?.length || 0, 0);
    const latestScan = competitors
        .map(c => c.last_scraped)
        .filter(Boolean)
        .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0] ?? null;

    // ── Recent signals = last 5 real signals ───────────────
    const recentSignals = signals.slice(0, 5).map(s => {
        const typeLabels: Record<string, string> = {
            pricing: "Pricing", hiring: "Hiring", tech: "Tech/IP",
            acquisition: "M&A", launch: "Launch", web_update: "Web Update"
        };
        const typeLabel = typeLabels[s.type] || s.type;

        return {
            id: s.id,
            initials: s.competitor_name.slice(0, 2).toUpperCase(),
            name: s.competitor_name,
            type: typeLabel,
            impact: s.impact_level === "high" ? "High" : s.impact_level === "medium" ? "Med" : "Low",
            impactColor: severityColor(s.impact_level),
            time: timeAgo(s.detected_at),
        };
    });

    // ── Recent reports = last 3 ────────────────────────────────────────────────
    const recentReports = reports.slice(0, 3);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-10 space-y-8"
        >
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard loading={loading} label="High Risk Reports" value={String(highSeverityReports.length)} sub={highSeverityReports.length > 0 ? "⚠ Active" : null} color="pink-500" barWidth={`${Math.min(100, (highSeverityReports.length / Math.max(reports.length, 1)) * 100).toFixed(0)}%`} />
                <StatCard loading={loading} label="Total Changes" value={String(totalChanges)} sub={totalChanges > 0 ? "across scans" : null} color="secondary" barWidth={totalChanges > 0 ? "65%" : "5%"} />
                <StatCard loading={loading} label="AI Reports" value={String(reports.length)} sub={reports.length > 0 ? "generated" : null} color="accent-purple" barWidth={`${Math.min(100, reports.length * 10)}%`} />
                <StatCard loading={loading} label="Last Scan" value={timeAgo(latestScan)} sub={activeCount > 0 ? `${activeCount} active` : null} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Intelligence Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-panel rounded-2xl p-8 relative overflow-hidden bg-background-dark/60 backdrop-blur-md border border-white/10 shadow-2xl"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-pink-500 text-sm font-bold flex items-center gap-0.5 mb-1">Featured Insight</span>
                                <h2 className="text-2xl font-bold text-slate-100">Intelligence Overview</h2>
                            </div>
                            <button onClick={fetchData} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors" title="Refresh Dashboard">
                                <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span>
                            </button>
                        </div>
                        {loading ? (
                            <div className="space-y-3">
                                <div className="h-4 bg-white/5 rounded animate-pulse w-full"></div>
                                <div className="h-4 bg-white/5 rounded animate-pulse w-5/6"></div>
                                <div className="h-4 bg-white/5 rounded animate-pulse w-4/5"></div>
                            </div>
                        ) : reports.length > 0 ? (
                            <>
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    {reports[0]?.ai_summary ?? "No recent intelligence available."}
                                </p>
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Top Threat</p>
                                        <p className="text-slate-100 font-semibold truncate">{reports[0]?.competitor_name ?? "—"}</p>
                                    </div>
                                    <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Severity</p>
                                        <p className={`font-semibold capitalize ${severityColor(reports[0]?.severity ?? "low")}`}>{reports[0]?.severity ?? "—"}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-slate-500 text-sm">No intelligence reports yet. Add competitors and trigger a scan to begin.</p>
                        )}
                    </motion.div>

                    {/* Signals Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-panel rounded-2xl overflow-hidden bg-background-dark/60 backdrop-blur-md border border-white/10 shadow-2xl"
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-100">Recent Signals</h3>
                            <a href="/dashboard/signals" className="text-secondary text-sm font-bold flex items-center gap-0.5 hover:opacity-80 transition-opacity">
                                View all
                            </a>
                        </div>
                        {loading ? (
                            <div className="p-6 space-y-4">
                                {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-white/5 rounded animate-pulse"></div>)}
                            </div>
                        ) : recentSignals.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-slate-500">
                                            <th className="px-6 py-4 font-bold">Competitor</th>
                                            <th className="px-6 py-4 font-bold">Signal Type</th>
                                            <th className="px-6 py-4 font-bold">Impact</th>
                                            <th className="px-6 py-4 font-bold">Time</th>
                                            <th className="px-6 py-4 font-bold"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {recentSignals.map((s, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400">{s.initials}</div>
                                                        <span className="text-sm font-semibold text-slate-200">{s.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4"><span className="text-xs px-2 py-1 bg-white/5 rounded text-slate-400">{s.type}</span></td>
                                                <td className="px-6 py-4">
                                                    <div className={`${s.impactColor} text-sm font-bold flex items-center gap-1.5`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${s.impactColor.replace("text-", "bg-")}`}></span>
                                                        {s.impact}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-500">{s.time}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="material-symbols-outlined text-slate-600 group-hover:text-accent-cyan text-sm transition-colors">arrow_forward</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-500 text-sm">No signals yet — trigger a scan to see intelligence signals.</div>
                        )}
                    </motion.div>
                </div>

                {/* Right Column */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-6"
                >
                    {/* Add Competitor CTA */}
                    <div className="glass-panel rounded-2xl p-6 border-dashed border-white/20 flex flex-col items-center text-center bg-background-dark/60 backdrop-blur-md shadow-2xl">
                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-slate-400 text-3xl">add_business</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-100 mb-2">Monitor More</h4>
                        <p className="text-slate-400 text-sm mb-6">
                            {competitors.length > 0
                                ? `You are tracking ${competitors.length} competitor${competitors.length > 1 ? "s" : ""}.`
                                : "Add your first competitor to start collecting intelligence."}
                        </p>
                        <a
                            href="/dashboard/competitors"
                            className="w-full py-3 vibrant-gradient text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-500/10 hover:opacity-90 text-center block"
                        >
                            {competitors.length > 0 ? "Manage Competitors" : "Start Free Scan"}
                        </a>
                    </div>

                    {/* Recent Reports */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Recent Reports</h3>
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => <div key={i} className="glass-panel rounded-2xl p-4 animate-pulse h-20 bg-background-dark/60 border border-white/10"></div>)}
                            </div>
                        ) : recentReports.length > 0 ? (
                            recentReports.map((report) => (
                                <a
                                    key={report.id}
                                    href="/dashboard/reports"
                                    className="glass-panel rounded-2xl p-4 group hover:border-white/30 transition-all cursor-pointer bg-background-dark/60 backdrop-blur-md border border-white/10 shadow-2xl block"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`${severityColor(report.severity)} flex items-center pt-1`}>
                                            <span className="material-symbols-outlined">
                                                {report.severity === "high" ? "warning" : report.severity === "medium" ? "info" : "description"}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-500 font-bold mb-0.5">{formatDate(report.created_at)}</p>
                                            <h5 className="text-sm font-bold text-slate-100 group-hover:text-accent-cyan transition-colors">{report.competitor_name}</h5>
                                            <p className="text-[11px] text-slate-400 mt-1 truncate">{report.ai_summary}</p>
                                        </div>
                                    </div>
                                </a>
                            ))
                        ) : (
                            <div className="glass-panel rounded-2xl p-6 text-center border border-dashed border-white/10">
                                <p className="text-slate-500 text-sm">No reports yet.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
