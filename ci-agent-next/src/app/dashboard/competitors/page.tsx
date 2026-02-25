"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { apiFetch, apiPost, apiDelete, ApiError } from "@/lib/api";
import { timeAgo } from "@/lib/time";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Competitor {
    id: string;
    name: string;
    url: string;
    watch_sections: string[];
    notify_email: boolean;
    notify_slack: boolean;
    tags: string[];
    created_at: string;
    last_scraped: string | null;
    status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getThreatClasses(tags: string[]): { level: string; badgeClass: string; dotClass: string; textClass: string } {
    if (tags.includes("high")) return {
        level: "High",
        badgeClass: "bg-pink-500/10 border-pink-500/20",
        dotClass: "bg-pink-500",
        textClass: "text-pink-500",
    };
    if (tags.includes("medium")) return {
        level: "Med",
        badgeClass: "bg-yellow-500/10 border-yellow-500/20",
        dotClass: "bg-yellow-500",
        textClass: "text-yellow-500",
    };
    return {
        level: "Low",
        badgeClass: "bg-secondary/10 border-secondary/20",
        dotClass: "bg-secondary",
        textClass: "text-secondary",
    };
}



// ─── Add Competitor Modal ──────────────────────────────────────────────────────
function AddCompetitorModal({
    onClose,
    onAdded,
}: {
    onClose: () => void;
    onAdded: (c: Competitor) => void;
}) {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !url.trim()) {
            setError("Name and URL are required");
            return;
        }

        // Auto-prefix https if missing
        const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

        setSubmitting(true);
        setError(null);
        try {
            const newComp = await apiPost<Competitor>("/competitors/", {
                name: name.trim(),
                url: normalizedUrl,
                watch_sections: ["pricing", "homepage", "blog", "jobs"],
                notify_email: true,
                notify_slack: true,
                tags: [],
            });
            onAdded(newComp);
            onClose();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to add competitor");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ scale: 0.92, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 20 }}
                className="w-full max-w-md glass-panel rounded-2xl p-8 border border-white/10 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-100">Track New Competitor</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4">
                        <span className="material-symbols-outlined text-red-400 text-sm">error</span>
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleAdd} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Company Name</label>
                        <input
                            className="w-full bg-slate-900/40 border border-slate-700 focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/50 rounded-lg py-3 px-4 text-white placeholder:text-slate-600 outline-none transition-all"
                            placeholder="e.g. Acme Corp"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Website URL</label>
                        <input
                            className="w-full bg-slate-900/40 border border-slate-700 focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/50 rounded-lg py-3 px-4 text-white placeholder:text-slate-600 outline-none transition-all"
                            placeholder="https://acmecorp.com"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-semibold rounded-lg transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-3 vibrant-gradient text-white font-bold rounded-lg shadow-lg shadow-purple-500/20 hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <><span className="material-symbols-outlined text-sm animate-spin">autorenew</span> Adding...</>
                            ) : (
                                <><span className="material-symbols-outlined text-sm">add_moderator</span> Track</>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// ─── Delete confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({
    competitor,
    onCancel,
    onDeleted,
}: {
    competitor: Competitor;
    onCancel: () => void;
    onDeleted: (id: string) => void;
}) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await apiDelete(`/competitors/${competitor.id}`);
            onDeleted(competitor.id);
        } catch {
            /* silently surface via toast in parent */
        } finally {
            setDeleting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.92 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.92 }}
                className="w-full max-w-sm glass-panel rounded-2xl p-7 border border-red-500/20 shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-red-400 text-3xl">delete_forever</span>
                    <h3 className="text-lg font-bold text-slate-100">Remove Competitor?</h3>
                </div>
                <p className="text-slate-400 text-sm mb-6">
                    This will permanently remove <span className="text-white font-semibold">{competitor.name}</span> and all associated data.
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-300 font-semibold rounded-lg hover:bg-white/10 transition-all">
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 py-3 bg-red-500/20 border border-red-500/40 text-red-400 font-bold rounded-lg hover:bg-red-500/30 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                    >
                        {deleting ? <span className="material-symbols-outlined text-sm animate-spin">autorenew</span> : <span className="material-symbols-outlined text-sm">delete</span>}
                        {deleting ? "Removing..." : "Remove"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CompetitorsPage() {
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Competitor | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const fetchCompetitors = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const data = await apiFetch<Competitor[]>("/competitors/");
            setCompetitors(data);
        } catch (err) {
            setFetchError(err instanceof ApiError ? err.message : "Failed to load competitors");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCompetitors(); }, [fetchCompetitors]);

    const handleAdded = (c: Competitor) => {
        setCompetitors(prev => [c, ...prev]);
        showToast(`Now tracking ${c.name}`);
    };

    const handleDeleted = (id: string) => {
        const name = competitors.find(c => c.id === id)?.name;
        setCompetitors(prev => prev.filter(c => c.id !== id));
        setDeleteTarget(null);
        if (name) showToast(`Removed ${name}`);
    };

    const filtered = competitors.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.url.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-10 space-y-8"
            >
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100 mb-2">Competitor Intelligence</h1>
                        <p className="text-slate-400 text-sm">Track, analyze, and predict competitor movements across the market.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
                            <input
                                type="text"
                                placeholder="Search competitors..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-secondary transition-colors w-64 glass"
                            />
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 vibrant-gradient rounded-lg text-sm text-white font-semibold shadow-lg shadow-purple-500/20 hover:opacity-90 transition-opacity flex items-center gap-2 group"
                        >
                            <span className="material-symbols-outlined text-sm group-hover:scale-125 transition-transform">add_moderator</span>
                            Track New
                        </button>
                    </div>
                </div>

                {/* Error */}
                {fetchError && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4">
                        <span className="material-symbols-outlined text-red-400">wifi_off</span>
                        <div>
                            <p className="text-red-400 font-semibold text-sm">Backend unreachable</p>
                            <p className="text-red-400/70 text-xs mt-0.5">{fetchError}</p>
                        </div>
                        <button onClick={fetchCompetitors} className="ml-auto text-xs font-bold text-red-400 hover:text-white transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">refresh</span> Retry
                        </button>
                    </div>
                )}

                {/* Loading Skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="glass-panel rounded-2xl p-6 animate-pulse">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-white/5"></div>
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-white/5 rounded w-2/3"></div>
                                        <div className="h-3 bg-white/5 rounded w-1/3"></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {[...Array(3)].map((_, j) => <div key={j} className="h-16 bg-white/5 rounded-lg"></div>)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !fetchError && competitors.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-24 glass-panel rounded-2xl border border-dashed border-white/10"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-slate-400 text-3xl">add_business</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-200 mb-2">No competitors yet</h3>
                        <p className="text-slate-500 text-sm mb-6">Add your first competitor to start tracking intelligence.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-5 py-2.5 vibrant-gradient rounded-xl text-sm text-white font-semibold shadow-lg shadow-purple-500/20 hover:opacity-90 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">add_moderator</span>
                            Track First Competitor
                        </button>
                    </motion.div>
                )}

                {/* Competitor Grid */}
                {!loading && filtered.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {filtered.map((comp) => {
                                const threat = getThreatClasses(comp.tags);
                                return (
                                    <motion.div
                                        key={comp.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="glass-panel p-6 rounded-2xl relative group overflow-hidden hover:border-white/10 transition-all"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none"></div>

                                        <div className="relative z-10 flex justify-between items-start mb-6">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center font-bold text-lg text-slate-300 shadow-inner group-hover:scale-110 transition-transform uppercase">
                                                    {comp.name.slice(0, 2)}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-100 group-hover:text-accent-cyan transition-colors">{comp.name}</h3>
                                                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{comp.url}</p>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full ${threat.badgeClass} border flex items-center gap-1.5`}>
                                                <span className={`w-2 h-2 rounded-full ${threat.dotClass} animate-pulse`}></span>
                                                <span className={`text-xs font-bold ${threat.textClass} uppercase tracking-wider`}>{threat.level} Threat</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
                                            <div className="bg-background-dark/50 rounded-lg p-3 border border-white/5">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Status</p>
                                                <p className={`text-sm font-bold ${comp.status === 'active' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                                    {comp.status === 'active' ? 'Active' : 'Paused'}
                                                </p>
                                            </div>
                                            <div className="bg-background-dark/50 rounded-lg p-3 border border-white/5">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Last Scan</p>
                                                <p className="text-sm font-bold text-slate-200">{timeAgo(comp.last_scraped)}</p>
                                            </div>
                                            <div className="bg-background-dark/50 rounded-lg p-3 border border-white/5">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Sections</p>
                                                <p className="text-sm font-bold text-slate-200">{comp.watch_sections.length}</p>
                                            </div>
                                        </div>

                                        <div className="relative z-10 border-t border-white/5 pt-4 flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Watching</p>
                                                <p className="text-sm font-medium text-slate-300">{comp.watch_sections.join(", ")}</p>
                                            </div>
                                            <button
                                                onClick={() => setDeleteTarget(comp)}
                                                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition-all"
                                                title="Remove competitor"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

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

            {/* Modals */}
            <AnimatePresence>
                {showModal && (
                    <AddCompetitorModal onClose={() => setShowModal(false)} onAdded={handleAdded} />
                )}
                {deleteTarget && (
                    <DeleteConfirm competitor={deleteTarget} onCancel={() => setDeleteTarget(null)} onDeleted={handleDeleted} />
                )}
            </AnimatePresence>
        </>
    );
}
