"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { apiFetch, apiPost, ApiError } from "@/lib/api";
import { timeAgo, formatDate } from "@/lib/time";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DiffItem {
    section: string;
    old_content: string;
    new_content: string;
    change_type: "added" | "removed" | "modified";
}

interface CompetitorInsight {
    name: string;
    key_changes: string[];
    strategic_implications: string;
    risk_level: string;
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
    report_type?: string;
    competitors_included?: string[];
    executive_summary?: string;
    strategic_insights?: string[];
    recommendations?: string[];
    market_trend?: string;
    competitor_insights?: CompetitorInsight[];
    overall_risk_level?: string;
}

interface Competitor {
    id: string;
    name: string;
    url: string;
    status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function severityStyle(s: string) {
    if (s === "high") return { color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20", icon: "text-pink-500" };
    if (s === "medium") return { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "text-yellow-500" };
    return { color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20", icon: "text-secondary" };
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

                    {report.executive_summary ? (
                        <>
                            {/* AI Strategic Format */}
                            <div className="glass-panel rounded-xl p-5 border border-white/5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-accent-cyan text-sm">auto_graph</span>
                                    <p className="text-xs font-bold uppercase tracking-wider text-accent-cyan">Executive Summary</p>
                                </div>
                                <p className="text-slate-200 font-medium text-sm leading-relaxed mb-4">{report.executive_summary}</p>
                                {report.market_trend && (
                                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                        <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Market Trend</p>
                                        <p className="text-sm text-slate-300">{report.market_trend}</p>
                                    </div>
                                )}
                            </div>

                            {report.strategic_insights && report.strategic_insights.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Strategic Insights</p>
                                    <ul className="space-y-2">
                                        {report.strategic_insights.map((insight, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5">
                                                <span className="material-symbols-outlined text-yellow-500 text-[18px] shrink-0">lightbulb</span>
                                                <span>{insight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {report.recommendations && report.recommendations.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Recommended Actions</p>
                                    <ul className="space-y-2">
                                        {report.recommendations.map((action, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5">
                                                <span className="material-symbols-outlined text-emerald-500 text-[18px] shrink-0">check_circle</span>
                                                <span>{action}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {report.competitor_insights && report.competitor_insights.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Competitor Analysis</p>
                                    <div className="space-y-4">
                                        {report.competitor_insights.map((comp, i) => (
                                            <div key={i} className="glass-panel p-4 rounded-xl border border-white/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-bold text-slate-100">{comp.name}</h3>
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${severityStyle(comp.risk_level).bg} ${severityStyle(comp.risk_level).color}`}>Risk: {comp.risk_level}</span>
                                                </div>
                                                <p className="text-sm text-slate-300 mb-3">{comp.strategic_implications}</p>
                                                {comp.key_changes.length > 0 && (
                                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                                        {comp.key_changes.map((change, j) => (
                                                            <li key={j} className="text-xs text-slate-400">{change}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Standard Old Format */}
                            <div className="glass-panel rounded-xl p-5 border border-white/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-accent-cyan text-sm">smart_toy</span>
                                    <p className="text-xs font-bold uppercase tracking-wider text-accent-cyan">AI Summary</p>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">{report.ai_summary}</p>
                            </div>

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
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Custom Report Modal ───────────────────────────────────────────────────────
const SECTIONS = ["pricing", "homepage", "blog", "jobs"];
const TEMPLATES = [
    { value: "competitor_profile", label: "Competitor Profile", icon: "person_search", desc: "Deep dive on a single competitor" },
    { value: "market_deep_dive", label: "Market Deep Dive", icon: "public", desc: "Broad overview of all tracked competitors" },
    { value: "custom", label: "Custom", icon: "add_box", desc: "Pick competitors and sections manually" },
];

function CustomReportModal({
    onClose,
    onGenerate,
}: {
    onClose: () => void;
    onGenerate: (template: string, competitorIds: string[], sections: string[]) => Promise<void>;
}) {
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [loadingComps, setLoadingComps] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedSections, setSelectedSections] = useState<string[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState("market_deep_dive");
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiFetch<Competitor[]>("/competitors/")
            .then(data => setCompetitors(data.filter(c => c.status === "active")))
            .catch(() => setCompetitors([]))
            .finally(() => setLoadingComps(false));
    }, []);

    const toggleId = (id: string) =>
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const toggleSection = (s: string) =>
        setSelectedSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

    const handleGenerate = async () => {
        setError(null);
        setGenerating(true);
        try {
            await onGenerate(selectedTemplate, selectedIds, selectedSections);
            onClose();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Generation failed");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ scale: 0.93, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.93, y: 20 }}
                className="w-full max-w-lg glass-panel rounded-2xl p-8 border border-blue-500/20 shadow-2xl shadow-blue-500/10 max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-400">add_box</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100">Custom Report</h3>
                            <p className="text-xs text-slate-400">Choose competitors, template & sections</p>
                        </div>
                    </div>
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

                {/* Template selector */}
                <div className="mb-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Report Template</p>
                    <div className="grid grid-cols-3 gap-2">
                        {TEMPLATES.map(t => (
                            <button
                                key={t.value}
                                onClick={() => setSelectedTemplate(t.value)}
                                className={`p-3 rounded-xl border text-left transition-all ${selectedTemplate === t.value
                                    ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                                    : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-base block mb-1">{t.icon}</span>
                                <p className="text-xs font-bold leading-tight">{t.label}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Competitor selector */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Competitors</p>
                        <span className="text-xs text-slate-500">
                            {selectedIds.length === 0 ? "All active" : `${selectedIds.length} selected`}
                        </span>
                    </div>

                    {loadingComps ? (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : competitors.length === 0 ? (
                        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
                            <span className="material-symbols-outlined text-yellow-400 text-sm">warning</span>
                            <p className="text-sm text-yellow-400">No active competitors found. Add some first.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {/* Select all option */}
                            <button
                                onClick={() => setSelectedIds(
                                    selectedIds.length === competitors.length ? [] : competitors.map(c => c.id)
                                )}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all ${selectedIds.length === competitors.length
                                    ? "border-blue-500/40 bg-blue-500/10"
                                    : "border-white/10 bg-white/5 hover:bg-white/10"
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${selectedIds.length === competitors.length
                                    ? "bg-blue-500 border-blue-500"
                                    : "border-slate-600"
                                    }`}>
                                    {selectedIds.length === competitors.length && (
                                        <span className="material-symbols-outlined text-white text-xs">check</span>
                                    )}
                                </div>
                                <span className="text-sm font-semibold text-slate-200">All Competitors</span>
                            </button>

                            {competitors.map(comp => (
                                <button
                                    key={comp.id}
                                    onClick={() => toggleId(comp.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all ${selectedIds.includes(comp.id)
                                        ? "border-blue-500/40 bg-blue-500/10"
                                        : "border-white/10 bg-white/5 hover:bg-white/10"
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${selectedIds.includes(comp.id)
                                        ? "bg-blue-500 border-blue-500"
                                        : "border-slate-600"
                                        }`}>
                                        {selectedIds.includes(comp.id) && (
                                            <span className="material-symbols-outlined text-white text-xs">check</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-200 truncate">{comp.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{comp.url}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Section filter */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sections</p>
                        <span className="text-xs text-slate-500">{selectedSections.length === 0 ? "All sections" : `${selectedSections.length} selected`}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {SECTIONS.map(s => (
                            <button
                                key={s}
                                onClick={() => toggleSection(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${selectedSections.includes(s)
                                    ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">Leave empty to include all sections</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-300 font-semibold rounded-xl hover:bg-white/10 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={generating || (competitors.length === 0 && !loadingComps)}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        {generating ? (
                            <><span className="material-symbols-outlined text-sm animate-spin">autorenew</span>Generating...</>
                        ) : (
                            <><span className="material-symbols-outlined text-sm">magic_button</span>Generate Report</>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Report Types (top card templates — static) ────────────────────────────────
const reportTypes = [
    { title: "Competitor Profile", desc: "Scrape & analyze a single competitor's latest changes.", icon: "person_search", gradient: "from-pink-500/10 to-transparent border-pink-500/20", iconColor: "text-pink-500" },
    { title: "Market Deep Dive", desc: "Broad overview of all tracked competitors.", icon: "public", gradient: "from-secondary/10 to-transparent border-secondary/20", iconColor: "text-secondary" },
    { title: "Custom Report", desc: "Choose specific competitors, template, and sections.", icon: "add_box", gradient: "from-blue-500/10 to-transparent border-blue-500/20", iconColor: "text-blue-500" },
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
    const [showCustomModal, setShowCustomModal] = useState(false);

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

    const handleGenerate = async (
        template: string = "market_deep_dive",
        competitorIds: string[] = [],
        sections: string[] = [],
    ) => {
        setIsGenerating(true);
        try {
            const result = await apiPost<{ generated: number; reports: { competitor_name: string }[]; template: string }>(
                "/reports/generate",
                { template, competitor_ids: competitorIds, sections }
            );
            const count = result.generated ?? 1;
            showToast(`✓ Generated ${count} report${count !== 1 ? "s" : ""} successfully.`);
            fetchReports();
        } catch (err) {
            showToast(err instanceof ApiError ? err.message : "Failed to generate report");
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
                        onClick={() => handleGenerate("market_deep_dive")}
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
                                    if (type.title === "Custom Report") {
                                        setShowCustomModal(true);
                                    } else if (type.title === "Market Deep Dive") {
                                        handleGenerate("market_deep_dive");
                                    } else {
                                        handleGenerate("competitor_profile");
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
                                onClick={() => handleGenerate("market_deep_dive")}
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

            {/* Custom Report Modal */}
            <AnimatePresence>
                {showCustomModal && (
                    <CustomReportModal
                        onClose={() => setShowCustomModal(false)}
                        onGenerate={handleGenerate}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
