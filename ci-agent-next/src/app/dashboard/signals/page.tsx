"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { apiFetch, ApiError } from "@/lib/api";

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
    read: boolean;
}

// Convert a DB report into a "Live Signal" format
function reportToSignal(r: Report) {
    const isHigh = r.severity === "high";
    const isMed = r.severity === "medium";

    // Determine pseudo-type based on diff section or summary for the badge
    let type = "Web Update";
    let icon = "public";
    if (r.ai_summary.toLowerCase().includes("pricin")) { type = "Pricing"; icon = "sell"; }
    else if (r.ai_summary.toLowerCase().includes("hir") || r.ai_summary.toLowerCase().includes("job")) { type = "Hiring"; icon = "group_add"; }
    else if (r.ai_summary.toLowerCase().includes("feature") || r.ai_summary.toLowerCase().includes("launch")) { type = "Launch"; icon = "rocket_launch"; }

    return {
        id: r.id,
        initials: r.competitor_name.substring(0, 2).toUpperCase(),
        name: r.competitor_name,
        type: type,
        impact: isHigh ? "High" : isMed ? "Med" : "Low",
        impactColor: isHigh ? "pink-500" : isMed ? "yellow-500" : "secondary",
        time: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        desc: r.ai_summary,
        icon: icon,
        originalReport: r
    };
}

export default function SignalsPage() {
    const [signals, setSignals] = useState<ReturnType<typeof reportToSignal>[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [activeFilter, setActiveFilter] = useState("All Signals");
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const [stats, setStats] = useState({ total: 0, high: 0, medium: 0, low: 0 });
    const filterCategories = ["All Signals", "Pricing", "Hiring", "Tech/IP", "M&A", "Launch", "Acquisition"];

    const loadSignals = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [data, statsData] = await Promise.all([
                apiFetch<Report[]>("/reports/"),
                apiFetch<{ total: number; high: number; medium: number; low: number }>("/reports/stats")
            ]);

            const unreadData = data.filter(r => !r.read);
            // Take up to 20 most recent reports for the signals feed
            const mapped = unreadData.slice(0, 20).map(reportToSignal);
            setSignals(mapped);
            setStats(statsData);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to load signals");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadSignals(); }, [loadSignals]);

    const handleMarkAllRead = async () => {
        try {
            const { apiPatch } = await import("@/lib/api");
            await apiPatch("/reports/mark-all-read", {});
            setSignals([]);
            setToastMessage("All signals marked as read");
        } catch (err) {
            setToastMessage("Failed to mark signals as read");
        }
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleDismiss = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const { apiPatch } = await import("@/lib/api");
            await apiPatch(`/reports/${id}/read`, {});
            setSignals(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            setToastMessage("Failed to dismiss signal");
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const handleConfigure = () => {
        setIsConfiguring(true);
        setToastMessage("Opening alert configuration matrix...");
        setTimeout(() => {
            setIsConfiguring(false);
            setToastMessage(null);
        }, 2000);
    };

    const highCount = stats.high;
    const medCount = stats.medium;
    const lowCount = stats.low;

    const filteredSignals = signals.filter(s => activeFilter === "All Signals" || s.type.includes(activeFilter));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-10 space-y-8 h-full flex flex-col"
        >
            <div className="flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 mb-2">
                        Live Signals
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Real-time feed of competitor activities and market shifts.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleMarkAllRead}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                    >
                        Mark All Read
                    </button>
                    <button
                        onClick={handleConfigure}
                        disabled={isConfiguring}
                        className="px-4 py-2 border border-secondary text-secondary rounded-lg text-sm hover:bg-secondary/10 hover:shadow-[0_0_15px_rgba(43,43,238,0.3)] transition-all flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className={`material-symbols-outlined text-sm ${isConfiguring ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}>settings</span>
                        Configure Alerts
                    </button>
                </div>
            </div>

            {/* Error handling */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-400">error</span>
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Signal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-pink-500">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                            High Impact
                        </p>
                        <p className="text-2xl font-bold text-slate-100">{loading ? "..." : highCount}</p>
                    </div>
                    <span className="material-symbols-outlined text-pink-500/50 text-3xl">
                        warning
                    </span>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-yellow-500">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                            Medium Impact
                        </p>
                        <p className="text-2xl font-bold text-slate-100">{loading ? "..." : medCount}</p>
                    </div>
                    <span className="material-symbols-outlined text-yellow-500/50 text-3xl">
                        info
                    </span>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-secondary">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                            Low Impact
                        </p>
                        <p className="text-2xl font-bold text-slate-100">{loading ? "..." : lowCount}</p>
                    </div>
                    <span className="material-symbols-outlined text-secondary/50 text-3xl">
                        notifications
                    </span>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center justify-between bg-gradient-to-br from-white/5 to-white/0">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                            Total Scanned Today
                        </p>
                        <p className="text-2xl font-bold text-slate-100">{loading ? "..." : stats.total.toLocaleString()}</p>
                    </div>
                    <span className="material-symbols-outlined text-white/20 text-3xl">
                        radar
                    </span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2 shrink-0">
                {filterCategories.map(cat => (
                    <div
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors border ${activeFilter === cat ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10'}`}
                    >
                        {cat}
                    </div>
                ))}
            </div>

            {/* Signal Feed */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass-panel p-5 rounded-xl h-24 animate-pulse flex items-center gap-4 border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-white/10"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-white/10 rounded w-1/4"></div>
                                    <div className="h-3 bg-white/10 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredSignals.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-panel p-10 rounded-xl flex flex-col items-center justify-center text-center border-dashed border-white/20 h-64"
                            >
                                <span className="material-symbols-outlined text-4xl text-slate-500 mb-4">task_alt</span>
                                <h3 className="text-xl font-bold text-slate-300 mb-2">You're all caught up!</h3>
                                <p className="text-sm text-slate-500 max-w-sm">No {activeFilter !== "All Signals" ? activeFilter.toLowerCase() : "new"} signals detected in your reports. We'll notify you as soon as our automated scrapers find something.</p>
                            </motion.div>
                        ) : (
                            filteredSignals.map((signal, i) => (
                                <motion.div
                                    key={signal.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-panel p-5 rounded-xl flex gap-5 group hover:border-white/10 transition-colors relative overflow-hidden text-left"
                                >
                                    {/* Active indicator */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="relative shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 group-hover:bg-slate-700 transition-colors">
                                            {signal.initials}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-background-dark flex items-center justify-center`}>
                                            <span className={`w-2 h-2 rounded-full bg-${signal.impactColor}`}></span>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-slate-100 text-base group-hover:text-accent-cyan transition-colors">
                                                {signal.name}
                                            </h4>
                                            <span className="text-xs text-slate-500 whitespace-nowrap">
                                                {signal.time}
                                            </span>
                                        </div>
                                        <p className="text-slate-300 text-sm mb-3 truncate">{signal.desc}</p>
                                        <div className="flex gap-2">
                                            <span className={`text-xs px-2 py-1 rounded bg-white/5 text-${signal.impactColor} border border-${signal.impactColor}/20 flex items-center gap-1`}>
                                                <span className="material-symbols-outlined text-[10px]">{signal.icon}</span>
                                                {signal.type}
                                            </span>
                                            <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-400 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                                                AI Verified
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center border-l border-white/5 pl-5 ml-2">
                                        <button
                                            onClick={(e) => handleDismiss(signal.id, e)}
                                            className="text-secondary hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 group/btn"
                                            title="Dismiss"
                                        >
                                            <span className="material-symbols-outlined group-hover/btn:rotate-90 transition-transform">close</span>
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass px-6 py-4 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-accent-cyan/30"
                    >
                        <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></div>
                        <p className="text-sm font-bold text-slate-100">
                            {toastMessage}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
