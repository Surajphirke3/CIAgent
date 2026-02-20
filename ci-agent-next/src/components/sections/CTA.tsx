"use client";
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CTA() {
    const [showToast, setShowToast] = useState(false);

    const handleDemoRequest = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <section id="cta" className="py-24 px-6 relative">
            <div className="max-w-5xl mx-auto glass rounded-3xl p-12 lg:p-20 text-center border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
                <h2 className="text-3xl lg:text-5xl font-black text-slate-100 mb-8 leading-tight">Ready to outmaneuver the competition?</h2>
                <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto">
                    Join 500+ high-growth teams using CIAgent to win more deals and protect their market share.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/login" className="gradient-btn text-white font-bold px-10 py-5 rounded-xl neon-glow transition-all text-xl">
                        Get Started Now
                    </Link>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleDemoRequest}
                        className="glass text-slate-100 font-bold px-10 py-5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-xl"
                    >
                        Request Demo
                    </motion.button>
                </div>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl glass border border-accent-cyan/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex items-center gap-3"
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-white font-semibold text-sm tracking-wide">Demo request received! We&apos;ll be in touch soon.</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
