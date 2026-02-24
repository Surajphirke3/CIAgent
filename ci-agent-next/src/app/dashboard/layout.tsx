"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardBackground from "@/components/ui/DashboardBackground";

const navItems = [
    { icon: "dashboard", label: "Overview", href: "/dashboard" },
    { icon: "group", label: "Competitors", href: "/dashboard/competitors" },
    { icon: "sensors", label: "Signals", href: "/dashboard/signals" },
    { icon: "description", label: "Reports", href: "/dashboard/reports" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isAdding, setIsAdding] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [bgKey, setBgKey] = useState(0);
    const [user, setUser] = useState<{ name: string, email: string } | null>(null);

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                // Must dynamically import apiFetch to avoid hydration/circular issues if any,
                // or just import at top. I'll import at top in a moment, or use window.fetch if needed.
                const { apiFetch } = await import("@/lib/api");
                const data = await apiFetch("/auth/me");
                setUser(data as { name: string, email: string });
            } catch (err) {
                console.error("Failed to load user:", err);
            }
        };
        fetchUser();
    }, []);

    const handleAddClick = () => {
        setIsAdding(true);
        setTimeout(() => {
            setIsAdding(false);
            setNotification("Connecting to global intelligence network...");
            setTimeout(() => setNotification(null), 3000);
        }, 1500);
    };

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-dashboard-bg relative">
            <DashboardBackground key={bgKey} />
            {/* Sidebar */}
            <aside className="w-72 glass-panel h-full flex flex-col border-r border-white/5 shrink-0 relative z-10">
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
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setBgKey(p => p + 1)}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive(item.href)
                                ? "vibrant-active text-secondary"
                                : "hover:bg-white/5 text-slate-400"
                                }`}
                        >
                            <span className="material-symbols-outlined">
                                {item.icon}
                            </span>
                            <span className="text-sm font-medium">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>

                <div className="p-6 mt-auto">
                    <button
                        onClick={handleAddClick}
                        disabled={isAdding}
                        className="w-full py-3 vibrant-gradient text-white rounded-xl font-bold text-sm shadow-xl shadow-purple-500/10 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        {isAdding ? (
                            <>
                                <span className="absolute inset-0 bg-white/20 animate-pulse"></span>
                                <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                                Initializing...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">add</span>
                                Add Competitor
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto relative z-10">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 sticky top-0 z-20 glass-panel shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">
                            Dashboard
                        </span>
                        <span className="material-symbols-outlined text-sm text-slate-500">
                            chevron_right
                        </span>
                        <h2 className="text-lg font-semibold text-slate-100">
                            {navItems.find((item) => isActive(item.href))
                                ?.label ?? "Overview"}
                        </h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer">
                            <span className="material-symbols-outlined text-slate-400 hover:text-accent-cyan transition-colors">
                                notifications
                            </span>
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full border-2 border-background-dark"></div>
                        </div>
                        <Link
                            href="/dashboard/profile"
                            onClick={() => setBgKey(p => p + 1)}
                            className="flex items-center gap-3 pl-6 border-l border-white/10 group cursor-pointer hover:bg-white/5 pr-4 py-2 rounded-xl transition-all"
                        >
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-100 leading-tight group-hover:text-accent-cyan transition-colors">
                                    {user ? user.name || "Agent" : "Loading..."}
                                </p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider group-hover:text-pink-500 transition-colors">
                                    {user ? "Lead Analyst" : ""}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-pink-500/40 p-0.5 group-hover:border-accent-cyan/60 transition-colors">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 group-hover:from-accent-cyan/30 group-hover:to-blue-500/30 flex items-center justify-center transition-colors">
                                    <span className="material-symbols-outlined text-slate-300 text-lg group-hover:text-white transition-colors">
                                        person
                                    </span>
                                </div>
                            </div>
                        </Link>
                        <Link
                            href="/"
                            className="flex items-center gap-2 pl-4 border-l border-white/10 text-slate-400 hover:text-red-400 transition-colors group"
                            title="Log out"
                        >
                            <span className="material-symbols-outlined text-xl group-hover:translate-x-0.5 transition-transform">
                                logout
                            </span>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                {children}

                {/* Global Notification Toast */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed bottom-8 right-8 z-50 glass-card px-6 py-4 rounded-xl border-l-4 border-l-accent-cyan flex items-center gap-3 shadow-2xl shadow-cyan-500/20"
                        >
                            <span className="material-symbols-outlined text-accent-cyan animate-pulse">
                                radar
                            </span>
                            <p className="text-sm font-medium text-slate-100">{notification}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
