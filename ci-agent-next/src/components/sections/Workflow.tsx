"use client";
import { Monitor, ScanEye, BrainCircuit, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Workflow() {
    const steps = [
        {
            icon: <Monitor className="w-8 h-8" />,
            title: "Monitor",
            description: "24/7 scanning of 50+ signal sources per competitor."
        },
        {
            icon: <ScanEye className="w-8 h-8" />,
            title: "Detect",
            description: "Advanced delta detection picks up even 1px layout changes."
        },
        {
            icon: <BrainCircuit className="w-8 h-8" />,
            title: "Interpret",
            description: "LLaMA 3 agents analyze the \"Why\" behind the change."
        },
        {
            icon: <Send className="w-8 h-8" />,
            title: "Deliver",
            description: "Instant alerts pushed to Slack, CRM, or Dashboard."
        }
    ];

    return (
        <section id="workflow" className="py-24 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl lg:text-6xl font-black text-slate-100 mb-6 tracking-tight"
                    >
                        Precision <span className="text-accent-pink">Workflow</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-400 max-w-2xl mx-auto"
                    >
                        Four steps from raw noise to surgical-grade business intelligence.
                    </motion.p>
                </div>

                <div className="relative flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-8">
                    {/* Animated Connector Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[45px] left-[10%] w-[80%] h-[2px] bg-white/5 z-0">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="h-full bg-gradient-to-r from-accent-pink via-primary to-accent-pink origin-left"
                        />
                    </div>

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="relative z-10 flex flex-col items-center text-center lg:w-1/4 group"
                        >
                            <div className="w-24 h-24 rounded-3xl glass border border-white/10 flex items-center justify-center mb-8 relative transition-all group-hover:border-accent-pink/50 group-hover:shadow-[0_0_30px_rgba(255,0,229,0.2)] bg-black/40">
                                <div className="text-accent-pink group-hover:scale-110 transition-transform duration-500">
                                    {step.icon}
                                </div>
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-background-dark border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400">
                                    0{index + 1}
                                </div>
                            </div>
                            <h4 className="text-2xl font-bold text-slate-100 mb-4 group-hover:text-accent-pink transition-colors">
                                {step.title}
                            </h4>
                            <p className="text-slate-400 text-sm leading-relaxed px-4 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
