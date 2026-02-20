"use client";
import { CheckCircle, Layout, Server, Database, Brain, Workflow } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Architecture() {
    const stack = [
        { name: "Next.js", label: "Frontend", icon: <Layout className="w-5 h-5" /> },
        { name: "FastAPI", label: "Logic Layer", icon: <Server className="w-5 h-5" /> },
        { name: "MongoDB", label: "Database", icon: <Database className="w-5 h-5" /> },
        { name: "LLaMA 3", label: "Groq Inference", icon: <Brain className="w-5 h-5" />, className: "md:col-span-1" },
        { name: "Slack & Webhooks", label: "Integrations", icon: <Workflow className="w-5 h-5" />, className: "col-span-2 md:col-span-2" },
    ];

    return (
        <section id="architecture" className="py-24 px-6 bg-black/40 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="lg:w-1/2"
                    >
                        <h2 className="text-4xl lg:text-6xl font-black text-slate-100 mb-6 tracking-tight">
                            Enterprise-Grade <br />
                            <span className="text-accent-pink">Architecture</span>
                        </h2>
                        <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-lg">
                            Built for speed and massive scale. Our distributed scraping engine and AI inference layer provide real-time updates without taxing your target sites' servers.
                        </p>
                        <div className="space-y-5">
                            {[
                                "99.9% Up-time SLA for Enterprise Users",
                                "GDPR & SOC2 Type II Compliant",
                                "Custom Private Model Fine-tuning"
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-4 text-slate-200 group">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                                        <CheckCircle className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <span className="font-medium">{text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:w-1/2 w-full"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            {stack.map((item, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ y: -5 }}
                                    className={`glass p-8 rounded-2xl border border-white/5 flex flex-col items-center text-center gap-4 transition-all hover:border-accent-pink/30 hover:shadow-[0_0_30px_rgba(255,0,229,0.1)] ${item.className || ''}`}
                                >
                                    <div className="p-3 rounded-xl bg-white/5 text-accent-pink border border-white/5">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-white tracking-tighter mb-1 uppercase">
                                            {item.name}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                            {item.label}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
