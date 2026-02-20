"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const navItems = [
    { icon: "dashboard", label: "Overview", active: true },
    { icon: "group", label: "Competitors", active: false },
    { icon: "sensors", label: "Signals", active: false },
    { icon: "description", label: "Reports", active: false },
];

const statCards = [
    {
        label: "High Risk Score",
        value: "84",
        change: "12%",
        changeDir: "up",
        color: "pink-500",
        barWidth: "84%",
    },
    {
        label: "Total Changes",
        value: "1,240",
        change: "5%",
        changeDir: "up",
        color: "secondary",
        barWidth: "65%",
    },
    {
        label: "AI Insights",
        value: "32",
        change: "2%",
        changeDir: "down",
        color: "accent-purple",
        barWidth: "40%",
    },
    {
        label: "Last Scan",
        value: "2m ago",
        change: null,
        changeDir: null,
        color: null,
        barWidth: null,
    },
];

const signals = [
    {
        initials: "NV",
        name: "Nebula Ventures",
        type: "Pricing Shift",
        impact: "High",
        impactColor: "text-pink-500",
        time: "14 mins ago",
    },
    {
        initials: "TC",
        name: "Titan Core",
        type: "Hiring Spike",
        impact: "Med",
        impactColor: "text-yellow-500",
        time: "2 hrs ago",
    },
    {
        initials: "AE",
        name: "Aether Edge",
        type: "Tech Patent",
        impact: "Low",
        impactColor: "text-secondary",
        time: "5 hrs ago",
    },
];

const reports = [
    {
        month: "SEPT 2023",
        title: "Market Deep Dive Q3",
        desc: "Analysis of emerging APAC competitors.",
        iconColor: "text-secondary",
        icon: "description",
    },
    {
        month: "AUG 2023",
        title: "Competitor X Analysis",
        desc: "Detailed breakdown of feature parity.",
        iconColor: "text-pink-500",
        icon: "summarize",
    },
    {
        month: "JUL 2023",
        title: "Strategic Outlook",
        desc: "Future trends and predictive scoring.",
        iconColor: "text-accent-purple",
        icon: "clinical_notes",
    },
];

export default function DashboardPage() {
    return (
        <div className="flex h-screen overflow-hidden bg-dashboard-bg">
            {/* Sidebar */}
            <aside className="w-72 glass-panel h-full flex flex-col border-r border-white/5 shrink-0">
                <div className="p-8 flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl vibrant-gradient flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-white text-2xl">
                                shield_person
                            </span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-100">
                                CIAgent
                            </h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold">
                                Enterprise Intel
                            </p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href="#"
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${item.active
                                ? "vibrant-active text-secondary"
                                : "hover:bg-white/5 text-slate-400"
                                }`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="text-sm font-medium">{item.label}</span>
                        </a>
                    ))}
                </nav>

                <div className="p-6 mt-auto">
                    <button className="w-full py-3 vibrant-gradient text-white rounded-xl font-bold text-sm shadow-xl shadow-purple-500/10 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-lg">add</span>
                        Add Competitor
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 sticky top-0 z-10 glass-panel shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">Dashboard</span>
                        <span className="material-symbols-outlined text-sm text-slate-500">
                            chevron_right
                        </span>
                        <h2 className="text-lg font-semibold text-slate-100">
                            Intelligence Overview
                        </h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer">
                            <span className="material-symbols-outlined text-slate-400 hover:text-accent-cyan transition-colors">
                                notifications
                            </span>
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full border-2 border-background-dark"></div>
                        </div>
                        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-100 leading-tight">
                                    Marcus Vane
                                </p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                    Lead Analyst
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-pink-500/40 p-0.5">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-300 text-lg">
                                        person
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Link
                            href="/login"
                            className="flex items-center gap-2 pl-4 border-l border-white/10 text-slate-400 hover:text-red-400 transition-colors group"
                            title="Log out"
                        >
                            <span className="material-symbols-outlined text-xl group-hover:translate-x-0.5 transition-transform">
                                logout
                            </span>
                        </Link>
                    </div>
                </header>

                {/* Dashboard Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-10 space-y-8"
                >
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((card, i) => (
                            <motion.div
                                key={card.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-panel rounded-2xl p-6 relative overflow-hidden group"
                            >
                                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
                                    {card.label}
                                </p>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-4xl font-bold text-slate-100 tracking-tighter">
                                        {card.value}
                                    </h3>
                                    {card.change && (
                                        <span
                                            className={`text-${card.color} text-sm font-bold pb-1 flex items-center gap-0.5`}
                                        >
                                            <span className="material-symbols-outlined text-sm">
                                                {card.changeDir === "up"
                                                    ? "trending_up"
                                                    : "trending_down"}
                                            </span>
                                            {card.change}
                                        </span>
                                    )}
                                    {!card.change && (
                                        <span className="text-slate-500 text-xs font-medium pb-1">
                                            Real-time
                                        </span>
                                    )}
                                </div>
                                {card.barWidth && (
                                    <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-${card.color} rounded-full transition-all duration-1000`}
                                            style={{ width: card.barWidth }}
                                        ></div>
                                    </div>
                                )}
                                {!card.barWidth && (
                                    <div className="mt-4 flex gap-1">
                                        <div className="h-1 flex-1 bg-secondary/60 rounded-full animate-pulse"></div>
                                        <div className="h-1 flex-1 bg-secondary/40 rounded-full"></div>
                                        <div className="h-1 flex-1 bg-secondary/20 rounded-full"></div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Intelligence & Signals */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Intelligence Summary */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass-panel rounded-2xl p-8 relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="text-pink-500 text-sm font-bold flex items-center gap-0.5 mb-1">
                                            Featured Insight
                                        </span>
                                        <h2 className="text-2xl font-bold text-slate-100">
                                            Weekly Intelligence Summary
                                        </h2>
                                    </div>
                                    <button className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">download</span>
                                    </button>
                                </div>
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    AI-generated analysis of market shifts and competitor movements
                                    over the last 7 days. Key trends indicate a{" "}
                                    <span className="text-pink-500 font-bold">15% increase</span>{" "}
                                    in aggressive pricing strategies across the tech sector.
                                    Stealth-mode competitor{" "}
                                    <span className="text-secondary font-bold">
                                        &quot;Project X&quot;
                                    </span>{" "}
                                    has increased hiring in AI research by 40% this month.
                                </p>
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                                            Market Sentiment
                                        </p>
                                        <p className="text-slate-100 font-semibold">
                                            Bearish Volatility
                                        </p>
                                    </div>
                                    <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                                            Primary Threat
                                        </p>
                                        <p className="text-slate-100 font-semibold">
                                            Aggressive Pricing
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Signals Table */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="glass-panel rounded-2xl overflow-hidden"
                            >
                                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-100">
                                        Recent Signals
                                    </h3>
                                    <button className="text-secondary text-sm font-bold flex items-center gap-0.5 hover:opacity-80 transition-opacity">
                                        View all signals
                                    </button>
                                </div>
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
                                            {signals.map((signal) => (
                                                <tr
                                                    key={signal.initials}
                                                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400">
                                                                {signal.initials}
                                                            </div>
                                                            <span className="text-sm font-semibold text-slate-200">
                                                                {signal.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs px-2 py-1 bg-white/5 rounded text-slate-400">
                                                            {signal.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div
                                                            className={`${signal.impactColor} text-sm font-bold flex items-center gap-1.5`}
                                                        >
                                                            <span
                                                                className={`w-1.5 h-1.5 rounded-full ${signal.impactColor.replace("text-", "bg-")}`}
                                                            ></span>
                                                            {signal.impact}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-500">
                                                        {signal.time}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="material-symbols-outlined text-slate-600 group-hover:text-accent-cyan text-sm transition-colors">
                                                            arrow_forward
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
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
                            <div className="glass-panel rounded-2xl p-6 border-dashed! border-white/20 flex flex-col items-center text-center">
                                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-slate-400 text-3xl">
                                        add_business
                                    </span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-100 mb-2">
                                    Monitor More
                                </h4>
                                <p className="text-slate-400 text-sm mb-6">
                                    Expand your network to get a 360-degree view of your industry
                                    landscape.
                                </p>
                                <button className="w-full py-3 vibrant-gradient text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-500/10 hover:opacity-90">
                                    Start Free Scan
                                </button>
                            </div>

                            {/* Recent Reports */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                                    Recent Reports
                                </h3>
                                {reports.map((report) => (
                                    <div
                                        key={report.title}
                                        className="glass-panel rounded-2xl p-4 group hover:border-white/20 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`${report.iconColor} flex items-center pt-1`}
                                            >
                                                <span className="material-symbols-outlined">
                                                    {report.icon}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-slate-500 font-bold mb-0.5">
                                                    {report.month}
                                                </p>
                                                <h5 className="text-sm font-bold text-slate-100 group-hover:text-accent-cyan transition-colors">
                                                    {report.title}
                                                </h5>
                                                <p className="text-[11px] text-slate-400 mt-1 truncate">
                                                    {report.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
