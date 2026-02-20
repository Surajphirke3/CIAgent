"use client";
import Link from 'next/link';
import { LineChart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-4"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 gradient-btn rounded-xl flex items-center justify-center text-white neon-glow transition-transform group-hover:rotate-12">
                        <LineChart className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-slate-100 uppercase italic">
                        <span className="text-accent-pink">CI</span>Agent
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-10">
                    {[
                        { label: 'Platform', href: '#problem' },
                        { label: 'Intelligence', href: '#workflow' },
                        { label: 'Pricing', href: '#architecture' },
                        { label: 'Enterprise', href: '#cta' },
                    ].map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="text-sm font-bold text-slate-400 hover:text-accent-pink transition-colors tracking-widest uppercase"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    <Link
                        href="/login"
                        className="text-sm font-bold text-slate-100 hover:text-accent-pink transition-colors tracking-widest uppercase"
                    >
                        Log In
                    </Link>
                    <Link href="/login">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="gradient-btn rounded-xl flex items-center justify-center text-white neon-glow px-6 py-3 font-bold text-xs tracking-widest uppercase"
                        >
                            Access Dashboard
                        </motion.button>
                    </Link>
                </div>
            </div>
        </motion.nav>
    );
}
