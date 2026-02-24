"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { apiFetch, apiPost, ApiError } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DiffItem {
    section: string;
    old_content: string;
    new_content: string;
    change_type: "added" | "removed" | "modified";
}

interface Report {
    id: string;
    competitor_id: string;
    competitor_name: string;
    user_id: string;
    created_at: string;
    diffs: DiffItem[];
    ai_summary: string;
    severity: "low" | "medium" | "high";
    notified: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function severityStyle(s: string) {
    if (s === "high") return { color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20", icon: "text-pink-500" };
    if (s === "medium") return { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "text-yellow-500" };
    return { color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20", icon: "text-secondary" };
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Report Detail Drawer ──────────────────────────────────────────────────────
function ReportDrawer({ report, onClose }: { report: Report; onClose: () => void }) {
    const sev = severityStyle(report.severity);
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 250 }}
                className="w-full max-w-2xl h-full bg-background-dark/95 border-l border-white/10 flex flex-col overflow-hidden"
            >
                {/* Drawer Header */}
                <div className="p-6 border-b border-white/5 flex items-start justify-between gap-4 flex-shrink-0">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">{formatDate(report.created_at)}</p>
                        <h2 className="text-xl font-bold text-slate-100">{report.competitor_name} — Change Report</h2>
                        <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-full ${sev.bg} border ${sev.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sev.color.replace("text-", "bg-")} animate-pulse`}></span>
                            <span className={`text-xs font-bold uppercase tracking-wider ${sev.color}`}>{report.severity} severity</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors flex-shrink-0">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* AI Summary */}
                    <div className="glass-panel rounded-xl p-5 border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-accent-cyan text-sm">smart_toy</span>
                            <p className="text-xs font-bold uppercase tracking-wider text-accent-cyan">AI Summary</p>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{report.ai_summary}</p>
                    </div>

                    {/* Diff Items */}
                    {report.diffs.length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Detected Changes ({report.diffs.length})</p>
                            <div className="space-y-3">
                                {report.diffs.map((d, i) => (
                                    <div key={i} className="glass-panel rounded-xl p-4 border border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${d.change_type === "added" ? "bg-emerald-500/10 text-emerald-400" : d.change_type === "removed" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                                                {d.change_type}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium">{d.section}</span>
                                        </div>
                                        {d.old_content && (
                                            <p className="text-xs text-red-400/70 bg-red-500/5 rounded p-2 mb-1 font-mono line-clamp-2">− {d.old_content}</p>
                                        )}
                                        {d.new_content && (
                                            <p className="text-xs text-emerald-400/70 bg-emerald-500/5 rounded p-2 font-mono line-clamp-2">+ {d.new_content}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Report Types (top card templates — static) ────────────────────────────────
const reportTypes = [
    { title: "Competitor Profile", desc: "Scrape & analyze a single competitor's latest changes.", icon: "person_search", gradient: "from-pink-500/10 to-transparent border-pink-500/20", iconColor: "text-pink-500" },
    { title: "Market Deep Dive", desc: "Broad overview of all tracked competitors.", icon: "public", gradient: "from-secondary/10 to-transparent border-secondary/20", iconColor: "text-secondary" },
    { title: "Custom Report", desc: "Choose specific competitors and sections.", icon: "add_box", gradient: "from-blue-500/10 to-transparent border-blue-500/20", iconColor: "text-blue-500" },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const data = await apiFetch<Report[]>("/reports/");
            setReports(data);
        } catch (err) {
            setFetchError(err instanceof ApiError ? err.message : "Failed to load reports");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await apiPost("/scrape/trigger-all", {});
            showToast("Intelligence scan queued for all competitors. Reports will appear shortly.");
            // Poll after 3s to pick up any fast results
            setTimeout(() => fetchReports(), 3000);
        } catch (err) {
            showToast(err instanceof ApiError ? err.message : "Failed to trigger scan");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-10 space-y-10"
            >
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100 mb-2">Intelligence Reports</h1>
                        <p className="text-slate-400 text-sm">Generate, view, and share comprehensive intelligence briefs.</p>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="px-5 py-2.5 vibrant-gradient rounded-xl text-sm text-white font-semibold shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        {isGenerating ? (
                            <>
                                <span className="absolute inset-0 bg-white/10 animate-pulse"></span>
                                <span className="material-symbols-outlined text-sm animate-spin">autorenew</span>
                                Scanning...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm group-hover:scale-125 transition-transform">magic_button</span>
                                Auto-Generate Report
                            </>
                        )}
                    </button>
                </div>

                {/* Report Type Templates */}
                <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Templates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {reportTypes.map((type, i) => (
                            <motion.div
                                key={type.title}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`glass-panel p-6 rounded-2xl border-t bg-gradient-to-b ${type.gradient} hover:bg-white/5 transition-colors cursor-pointer group`}
                                onClick={() => {
                                    if (type.title === "Market Deep Dive") {
                                        handleGenerate();
                                    } else {
                                        showToast(`${type.title} template requires selecting competitors first. Proceeding to configure...`);
                                    }
                                }}
                            >
                                <div className="w-12 h-12 rounded-full bg-background-dark/50 flex items-center justify-center mb-4 border border-white/5">
                                    <span className={`material-symbols-outlined ${type.iconColor}`}>{type.icon}</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-100 mb-2">{type.title}</h4>
                                <p className="text-sm text-slate-400">{type.desc}</p>
                                <button className="mt-4 flex items-center text-xs font-bold text-slate-500 group-hover:text-slate-300 transition-colors w-full text-left">
                                    {type.title === "Market Deep Dive" && isGenerating ? "Generating..." : "Use Template"}
                                    <span className={`material-symbols-outlined text-sm ml-1 ${type.title === "Market Deep Dive" && isGenerating ? 'animate-spin' : 'group-hover:translate-x-1 transition-transform'}`}>
                                        {type.title === "Market Deep Dive" && isGenerating ? 'autorenew' : 'arrow_forward'}
                                    </span>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Error */}
                {fetchError && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4">
                        <span className="material-symbols-outlined text-red-400">wifi_off</span>
                        <div className="flex-1">
                            <p className="text-red-400 font-semibold text-sm">Backend unreachable</p>
                            <p className="text-red-400/70 text-xs mt-0.5">{fetchError}</p>
                        </div>
                        <button onClick={fetchReports} className="text-xs font-bold text-red-400 hover:text-white transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">refresh</span> Retry
                        </button>
                    </div>
                )}

                {/* Document Library */}
                <div>
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Document Library {!loading && `(${reports.length})`}
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={() => setViewMode('grid')} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                                <span className="material-symbols-outlined text-sm">grid_view</span>
                            </button>
                            <button onClick={() => setViewMode('list')} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                                <span className="material-symbols-outlined text-sm">view_list</span>
                            </button>
                        </div>
                    </div>

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="glass-panel p-5 rounded-xl animate-pulse flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-xl bg-white/5 flex-shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-white/5 rounded w-1/2"></div>
                                        <div className="h-3 bg-white/5 rounded w-3/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !fetchError && reports.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20 glass-panel rounded-2xl border border-dashed border-white/10"
                        >
                            <span className="material-symbols-outlined text-slate-600 text-5xl mb-4">description</span>
                            <h3 className="text-lg font-bold text-slate-400 mb-2">No reports yet</h3>
                            <p className="text-slate-500 text-sm mb-6">Trigger a scan to generate your first intelligence report.</p>
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="px-5 py-2.5 vibrant-gradient rounded-xl text-sm text-white font-semibold shadow-lg hover:opacity-90 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">magic_button</span>
                                Generate Now
                            </button>
                        </motion.div>
                    )}

                    {/* Reports list */}
                    {!loading && reports.length > 0 && (
                        <div className={viewMode === 'list' ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                            {reports.map((report, i) => {
                                const sev = severityStyle(report.severity);
                                const iconMap: Record<string, string> = { high: "warning", medium: "info", low: "description" };
                                const iconBgMap: Record<string, string> = { high: "bg-pink-500/20", medium: "bg-yellow-500/20", low: "bg-secondary/20" };
                                return (
                                    <motion.div
                                        key={report.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.05 * i }}
                                        onClick={() => setSelectedReport(report)}
                                        className={`glass-panel p-5 rounded-xl group hover:border-white/10 transition-colors cursor-pointer ${viewMode === 'grid' ? 'flex flex-col gap-4' : 'flex items-center gap-6'}`}
                                    >
                                        <div className="flex items-center gap-4 w-full">
                                            <div className={`w-14 h-14 rounded-xl ${iconBgMap[report.severity] ?? 'bg-white/5'} flex items-center justify-center shrink-0`}>
                                                <span className={`material-symbols-outlined text-2xl ${sev.icon}`}>{iconMap[report.severity] ?? "description"}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="text-base font-bold text-slate-100 group-hover:text-accent-cyan transition-colors truncate">
                                                        {report.competitor_name}
                                                    </h4>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${sev.bg} border ${sev.border} ${sev.color}`}>
                                                        {report.severity}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-400 truncate">{report.ai_summary}</p>
                                            </div>
                                        </div>

                                        <div className={`flex items-center gap-6 shrink-0 ${viewMode === 'grid' ? 'border-t border-white/5 pt-4 w-full justify-between' : 'border-l border-white/5 pl-6'}`}>
                                            <div className="text-right hidden md:block">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Date</p>
                                                <p className="text-sm text-slate-300 font-medium">{formatDate(report.created_at)}</p>
                                            </div>
                                            <div className="text-right hidden md:block">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Changes</p>
                                                <p className="text-sm text-slate-300 font-medium">{report.diffs.length}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={e => { e.stopPropagation(); showToast("Download initialized..."); }}
                                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                                                    title="Download"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">download</span>
                                                </button>
                                                <button
                                                    onClick={e => { e.stopPropagation(); showToast("Share link copied!"); }}
                                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                                                    title="Share"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">share</span>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Toast */}
                <AnimatePresence>
                    {toastMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass px-6 py-4 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(255,0,229,0.3)] border border-pink-500/30"
                        >
                            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
                            <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                                {toastMessage}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Report Detail Drawer */}
            <AnimatePresence>
                {selectedReport && (
                    <ReportDrawer report={selectedReport} onClose={() => setSelectedReport(null)} />
                )}
            </AnimatePresence>
        </>
    );
}
