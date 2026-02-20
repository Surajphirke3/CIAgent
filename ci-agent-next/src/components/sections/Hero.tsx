"use client";
import Link from 'next/link';
import { ArrowRight, UserPlus, TrendingUp, Activity, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hero() {
    return (
        <section className="relative pt-32 pb-32 px-6 overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-pink/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10"></div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="z-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 hover:bg-white/10 transition-colors cursor-default group">
                        <span className="flex h-2 w-2 rounded-full bg-accent-pink animate-pulse ring-4 ring-accent-pink/20"></span>
                        <span className="text-xs font-bold text-accent-pink uppercase tracking-[0.2em]">v2.4 Active Intelligence</span>
                    </div>

                    <h1 className="text-6xl lg:text-8xl font-black text-slate-100 leading-[0.95] mb-8 tracking-tighter">
                        Turn Signals into <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-pink to-primary italic">Strategic Intelligence</span>
                    </h1>

                    <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-xl font-medium">
                        CIAgent automatically monitors competitor websites, detects pricing, hiring, and messaging changes, and transforms them into AI-powered business insights.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5">
                        <Link href="/login">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="gradient-btn text-white font-bold px-10 py-5 rounded-2xl neon-glow transition-all text-lg flex items-center justify-center gap-3"
                            >
                                Access Dashboard
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </Link>
                        <a href="#workflow">
                            <motion.button
                                whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                                className="glass text-slate-100 font-bold px-10 py-5 rounded-2xl border border-white/10 transition-all text-lg"
                            >
                                Explore How It Works
                            </motion.button>
                        </a>
                    </div>

                    <div className="mt-12 flex items-center gap-8 py-6 border-t border-white/5">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Shield className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Enterprise Ready</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                            <Zap className="w-4 h-4 text-yellow-500/50" />
                            <span className="text-xs font-bold uppercase tracking-widest">Real-time Delivery</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative perspective-1000"
                >
                    <div className="absolute -inset-4 bg-gradient-to-r from-accent-pink/20 to-primary/20 blur-3xl rounded-[3rem] -z-10 animate-pulse"></div>

                    <div className="relative glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-3xl">
                        <div className="flex items-center gap-2 p-6 border-b border-white/5 bg-white/5">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/40"></div>
                            </div>
                            <div className="mx-auto text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase opacity-50">Live Competitor Stream</div>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Animated Signal Items */}
                            {[
                                {
                                    type: "Pricing Update",
                                    text: "Competitor X reduced \"Pro Plan\" by 15%",
                                    time: "2m ago",
                                    icon: <Activity className="w-4 h-4" color="#FF00E5" />,
                                    delay: 0.4
                                },
                                {
                                    type: "Hiring Signal",
                                    text: "TechCorp hired 4 Enterprise AE's in APAC",
                                    time: "14m ago",
                                    icon: <UserPlus className="w-4 h-4" color="#00F5FF" />,
                                    delay: 0.6
                                }
                            ].map((signal, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: signal.delay }}
                                    className="flex items-center justify-between gap-6 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-default"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                            {signal.icon}
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-accent-pink uppercase tracking-widest mb-1">{signal.type}</div>
                                            <div className="text-sm font-semibold text-slate-100">{signal.text}</div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-500 tabular-nums">{signal.time}</div>
                                </motion.div>
                            ))}

                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 group hover:border-white/20 transition-all shadow-inner">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Market Share</div>
                                    <div className="text-3xl font-black text-slate-100 flex items-center gap-3">
                                        +4.2% <TrendingUp className="w-6 h-6 text-emerald-400 group-hover:scale-125 transition-transform" />
                                    </div>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-accent-pink/20 transition-all">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Signal Score</div>
                                    <div className="text-3xl font-black text-slate-100 flex items-center gap-3">
                                        88<span className="text-sm font-bold text-slate-500">/100</span>
                                        <Activity className="w-6 h-6 text-accent-pink animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            <div className="relative mt-2 group overflow-hidden rounded-2xl border border-white/10">
                                <img
                                    className="w-full h-44 object-cover filter brightness-75 group-hover:brightness-100 transition-all duration-700 scale-105 group-hover:scale-100"
                                    alt="Competitive trends visualization"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUhKsi6XDjh2pk0g5xWXCQuJOPQHLHldMAY83JOg7jQls6uBIy_MaeT54yIM3y-kY1pQfNllhKh05UB985V13rfXYFWjpYrlbxW4w2fm-_Nfkx8XxPwQaPkoSg0fQ3ndU4zpC1VLxvUOah5_52w7J6W35vHOImTFjjA91F0eQDNX4xRqmON_nC-caWCxv8wYsOpkwzyYsu1ENmf3oV9UXbfkNX9667OfaMX2JrneJNJME8GewAl8YINMe95dwyuwSKWfaNyUnSOdPb"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                                    <div className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">Historical Data Index</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
