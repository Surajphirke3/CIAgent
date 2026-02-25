"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { apiFetch, apiPatch, ApiError } from "@/lib/api";
import { timeAgo, formatDate } from "@/lib/time";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DiffItem {
    section: string;
    change_type: string;
    old_content: string;
    new_content: string;
}

interface Signal {
    id: string;
    competitor_id: string;
    competitor_name: string;
    user_id: string;
    type: "pricing" | "hiring" | "tech" | "acquisition" | "launch" | "web_update";
    impact_level: "high" | "medium" | "low";
    risk_score: number;
    description: string;
    diffs: DiffItem[];
    detected_at: string;
    read: boolean;
}

interface SignalStats {
    high: number;
    medium: number;
    low: number;
    scanned_today: number;
}

const TYPE_META: Record<string, { label: string; icon: string; classes: string }> = {
    pricing: { label: "Pricing", icon: "sell", classes: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" },
    hiring: { label: "Hiring", icon: "group_add", classes: "bg-blue-500/10 text-blue-300 border border-blue-500/20" },
    tech: { label: "Tech/IP", icon: "memory", classes: "bg-violet-500/10 text-violet-300 border border-violet-500/20" },
    acquisition: { label: "M&A", icon: "handshake", classes: "bg-orange-500/10 text-orange-300 border border-orange-500/20" },
    launch: { label: "Launch", icon: "rocket_launch", classes: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" },
    web_update: { label: "Web Update", icon: "public", classes: "bg-slate-700/50 text-slate-300 border border-slate-600/30" },
};

function impactColor(level: string) {
    if (level === "high") return { text: "text-pink-400", bg: "bg-pink-500", border: "border-pink-500/30", badge: "bg-pink-500/10" };
    if (level === "medium") return { text: "text-yellow-400", bg: "bg-yellow-500", border: "border-yellow-500/30", badge: "bg-yellow-500/10" };
    return { text: "text-slate-400", bg: "bg-slate-500", border: "border-slate-500/30", badge: "bg-slate-500/10" };
}



// ─── Signal Detail Drawer ─────────────────────────────────────────────────────
function SignalDrawer({ signal, onClose, onDismiss }: {
    signal: Signal | null;
    onClose: () => void;
    onDismiss: (id: string) => void;
}) {
    if (!signal) return null;
    const meta = TYPE_META[signal.type] ?? TYPE_META.web_update;
    const ic = impactColor(signal.impact_level);

    return (
        <AnimatePresence>
            {signal && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-xl z-50 flex flex-col bg-[#0f1117] border-l border-white/10 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between p-6 border-b border-white/10 shrink-0">
                            <div className="flex-1 min-w-0 pr-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ic.badge} ${ic.text} border ${ic.border} uppercase tracking-wider`}>
                                        {signal.impact_level} severity
                                    </span>
                                    <span className="text-xs text-slate-500">{timeAgo(signal.detected_at)}</span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-100">{signal.competitor_name}</h2>
                                <p className="text-sm text-slate-400 mt-0.5">Signal Analysis</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Type + Risk Score */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="glass-panel rounded-xl p-4 border border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Signal Type</p>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-300 text-lg">{meta.icon}</span>
                                        <span className="font-bold text-slate-200">{meta.label}</span>
                                    </div>
                                </div>
                                <div className="glass-panel rounded-xl p-4 border border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Risk Score</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${signal.risk_score >= 70 ? 'bg-pink-500' : signal.risk_score >= 40 ? 'bg-yellow-500' : 'bg-slate-500'}`}
                                                style={{ width: `${signal.risk_score}%` }}
                                            />
                                        </div>
                                        <span className={`text-sm font-bold ${ic.text}`}>{signal.risk_score}</span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Analysis */}
                            <div className="glass-panel rounded-xl p-5 border border-white/5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-accent-cyan text-sm">smart_toy</span>
                                    <p className="text-xs font-bold uppercase tracking-wider text-accent-cyan">AI Analysis</p>
                                </div>
                                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{signal.description || "No AI analysis available for this signal."}</p>
                            </div>

                            {/* What Changed (Diffs) */}
                            {signal.diffs && signal.diffs.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                                        What Changed ({signal.diffs.length} sections)
                                    </p>
                                    <div className="space-y-3">
                                        {signal.diffs.map((diff, i) => (
                                            <div key={i} className="glass-panel rounded-xl overflow-hidden border border-white/5">
                                                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                                                    <span className="text-xs font-bold text-slate-300 capitalize">{diff.section}</span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 uppercase tracking-wider">
                                                        {diff.change_type}
                                                    </span>
                                                </div>
                                                {diff.old_content && (
                                                    <div className="px-4 py-3 border-b border-white/5">
                                                        <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1">Before</p>
                                                        <p className="text-xs text-slate-400 line-clamp-3">{diff.old_content}</p>
                                                    </div>
                                                )}
                                                {diff.new_content && (
                                                    <div className="px-4 py-3">
                                                        <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider mb-1">After</p>
                                                        <p className="text-xs text-slate-300 line-clamp-3">{diff.new_content}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-5 border-t border-white/10 flex gap-3 shrink-0">
                            <a
                                href="/dashboard/reports"
                                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-accent-cyan/20 to-primary/20 border border-accent-cyan/30 rounded-lg text-sm font-bold text-accent-cyan hover:from-accent-cyan/30 hover:to-primary/30 transition-all text-center flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">description</span>
                                View Full Reports
                            </a>
                            {!signal.read && (
                                <button
                                    onClick={() => { onDismiss(signal.id); onClose(); }}
                                    className="flex-1 py-2.5 px-4 bg-white/5 border border-white/10 rounded-lg text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Mark as Read
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SignalsPage() {
    const [signals, setSignals] = useState<Signal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [activeFilter, setActiveFilter] = useState("All");
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [stats, setStats] = useState<SignalStats>({ high: 0, medium: 0, low: 0, scanned_today: 0 });

    const filterCategories = ["All", "Pricing", "Hiring", "Tech/IP", "M&A", "Launch", "Web Update"];
    const typeMap: Record<string, string> = {
        "Pricing": "pricing", "Hiring": "hiring", "Tech/IP": "tech",
        "M&A": "acquisition", "Launch": "launch", "Web Update": "web_update",
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const loadSignals = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [data, statsData] = await Promise.all([
                apiFetch<Signal[]>("/signals/"),        // fetch ALL signals, filter on client
                apiFetch<SignalStats>("/signals/stats"),
            ]);
            setSignals(data);
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
            await apiPatch("/signals/mark-all-read", {});
            setSignals(prev => prev.map(s => ({ ...s, read: true })));
            showToast("All signals marked as read ✓");
            loadSignals(); // refresh stats
        } catch {
            showToast("Failed to mark signals as read");
        }
    };

    const handleDismiss = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
            await apiPatch(`/signals/${id}/read`, {});
            setSignals(prev => prev.map(s => s.id === id ? { ...s, read: true } : s));
            showToast("Signal marked as read");
        } catch {
            showToast("Failed to dismiss signal");
        }
    };

    const handleConfigure = () => {
        setIsConfiguring(true);
        showToast("Alert configuration coming soon...");
        setTimeout(() => setIsConfiguring(false), 2000);
    };

    // Client-side filtering
    const filteredSignals = signals.filter(s => {
        if (showUnreadOnly && s.read) return false;
        if (activeFilter !== "All") {
            const mapped = typeMap[activeFilter];
            if (mapped && s.type !== mapped) return false;
        }
        return true;
    });

    const unreadCount = signals.filter(s => !s.read).length;

    return (
        <>
            <SignalDrawer
                signal={selectedSignal}
                onClose={() => setSelectedSignal(null)}
                onDismiss={handleDismiss}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-10 space-y-8 h-full flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-end shrink-0">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100 mb-1">Live Signals</h1>
                        <p className="text-slate-400 text-sm">
                            Real-time competitor intelligence feed.
                            {unreadCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded-full text-xs font-bold border border-pink-500/30">
                                    {unreadCount} unread
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowUnreadOnly(v => !v)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${showUnreadOnly ? 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                        >
                            {showUnreadOnly ? "Showing Unread" : "Show Unread"}
                        </button>
                        <button
                            onClick={handleMarkAllRead}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                        >
                            Mark All Read
                        </button>
                        <button
                            onClick={handleConfigure}
                            disabled={isConfiguring}
                            className="px-4 py-2 border border-secondary text-secondary rounded-lg text-sm hover:bg-secondary/10 transition-all flex items-center gap-2 group disabled:opacity-50"
                        >
                            <span className={`material-symbols-outlined text-sm ${isConfiguring ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}>settings</span>
                            Configure Alerts
                        </button>
                        <button
                            onClick={loadSignals}
                            className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            title="Refresh"
                        >
                            <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>refresh</span>
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 shrink-0">
                        <span className="material-symbols-outlined text-red-400">error</span>
                        <p className="text-red-400 text-sm font-medium">{error}</p>
                        <button onClick={loadSignals} className="ml-auto text-xs text-red-400 hover:text-red-300 underline">Retry</button>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 shrink-0">
                    {[
                        { label: "High Impact", value: stats.high, color: "pink-500", icon: "warning" },
                        { label: "Medium Impact", value: stats.medium, color: "yellow-500", icon: "info" },
                        { label: "Low Impact", value: stats.low, color: "secondary", icon: "notifications" },
                        { label: "Scanned Today", value: stats.scanned_today, color: "white/20", icon: "radar" },
                    ].map(({ label, value, color, icon }) => (
                        <div key={label} className={`glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-${color}`}>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</p>
                                <p className="text-2xl font-bold text-slate-100">{loading ? "..." : value}</p>
                            </div>
                            <span className={`material-symbols-outlined text-${color}/50 text-3xl`}>{icon}</span>
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap gap-2 shrink-0">
                    {filterCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors border ${activeFilter === cat ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Signal Feed */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {loading ? (
                        <div className="space-y-3">
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
                    ) : filteredSignals.length === 0 ? (
                        <div className="glass-panel p-10 rounded-xl flex flex-col items-center justify-center text-center border-dashed border-white/20 h-64">
                            <span className="material-symbols-outlined text-4xl text-slate-500 mb-4">task_alt</span>
                            <h3 className="text-xl font-bold text-slate-300 mb-2">
                                {showUnreadOnly ? "You're all caught up!" : "No signals yet"}
                            </h3>
                            <p className="text-sm text-slate-500 max-w-sm">
                                {showUnreadOnly
                                    ? "No unread signals. Click 'Show All' to see your history."
                                    : "No signals detected yet. Add competitors and trigger a scan to start collecting intelligence."}
                            </p>
                            {showUnreadOnly && (
                                <button onClick={() => setShowUnreadOnly(false)} className="mt-4 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10">
                                    Show All Signals
                                </button>
                            )}
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredSignals.map((signal, i) => {
                                const meta = TYPE_META[signal.type] ?? TYPE_META.web_update;
                                const ic = impactColor(signal.impact_level);
                                return (
                                    <motion.div
                                        key={signal.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: Math.min(i * 0.04, 0.3) }}
                                        onClick={() => setSelectedSignal(signal)}
                                        className={`glass-panel p-5 rounded-xl flex gap-5 group hover:border-white/10 transition-all relative overflow-hidden cursor-pointer ${signal.read ? 'opacity-60' : ''}`}
                                    >
                                        {/* Unread indicator */}
                                        {!signal.read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-cyan/0 via-accent-cyan to-accent-cyan/0" />
                                        )}

                                        {/* Avatar */}
                                        <div className="relative shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 group-hover:bg-slate-700 transition-colors text-sm">
                                                {signal.competitor_name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0f1117] flex items-center justify-center">
                                                <span className={`w-2.5 h-2.5 rounded-full ${ic.bg}`}></span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-slate-100 text-sm group-hover:text-accent-cyan transition-colors">
                                                    {signal.competitor_name}
                                                    {signal.read && <span className="ml-2 text-xs text-slate-600 font-normal">• read</span>}
                                                </h4>
                                                <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{timeAgo(signal.detected_at)}</span>
                                            </div>
                                            <p className="text-slate-300 text-sm mb-3 line-clamp-2">{signal.description}</p>
                                            <div className="flex gap-2 flex-wrap">
                                                <span className={`text-xs px-2 py-1 rounded ${meta.classes} flex items-center gap-1`}>
                                                    <span className="material-symbols-outlined text-[10px]">{meta.icon}</span>
                                                    {meta.label}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded ${ic.badge} ${ic.text} border ${ic.border} flex items-center gap-1`}>
                                                    <span className="material-symbols-outlined text-[10px]">bolt</span>
                                                    {signal.impact_level} impact
                                                </span>
                                                <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-500 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[10px]">shield</span>
                                                    Risk: {signal.risk_score}/100
                                                </span>
                                                {signal.diffs?.length > 0 && (
                                                    <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-500 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[10px]">difference</span>
                                                        {signal.diffs.length} change{signal.diffs.length !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right controls */}
                                        <div className="flex flex-col justify-center gap-2 border-l border-white/5 pl-4 ml-2 shrink-0">
                                            <span className="material-symbols-outlined text-slate-600 group-hover:text-accent-cyan transition-colors">chevron_right</span>
                                            {!signal.read && (
                                                <button
                                                    onClick={(e) => handleDismiss(signal.id, e)}
                                                    className="text-slate-600 hover:text-pink-400 transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>

                {/* Toast */}
                <AnimatePresence>
                    {toastMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass px-6 py-4 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-accent-cyan/30"
                        >
                            <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></div>
                            <p className="text-sm font-bold text-slate-100">{toastMessage}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
}
