"use client";
import { EyeOff, AlertCircle, BarChart3, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Problem() {
    const problems = [
        {
            title: "3–5 Hours Wasted Weekly",
            desc: "Manual screenshotting and spreadsheet updates drain your team's creative potential.",
            icon: <EyeOff className="w-6 h-6" />,
            color: "from-blue-500/20 to-blue-600/20"
        },
        {
            title: "Missed Pricing Updates",
            desc: "Stay unaware of silent price adjustments until your prospects bring them up in sales calls.",
            icon: <AlertCircle className="w-6 h-6" />,
            color: "from-purple-500/20 to-purple-600/20"
        },
        {
            title: "No Structured Intelligence",
            desc: "Raw data is everywhere, but connecting the dots into actionable strategy is nearly impossible.",
            icon: <BarChart3 className="w-6 h-6" />,
            color: "from-accent-pink/20 to-red-500/20"
        },
        {
            title: "Strategic Blind Spots",
            desc: "Messaging pivots and GTM shifts from competitors go unnoticed until it's too late to react.",
            icon: <Target className="w-6 h-6" />,
            color: "from-emerald-500/20 to-teal-500/20"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <section id="problem" className="py-24 px-6 relative">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl lg:text-6xl font-black text-slate-100 mb-6 tracking-tight"
                    >
                        The <span className="text-accent-pink">Blind Spots</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-400 max-w-2xl mx-auto"
                    >
                        Don’t let manual research hold back your growth. Most teams are missing critical data points every single day.
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {problems.map((prob, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="glass p-8 rounded-2xl border border-white/5 bg-gradient-to-br transition-all flex flex-col gap-6 group hover:border-white/20"
                        >
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${prob.color} flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform`}>
                                <div className="text-accent-pink">
                                    {prob.icon}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-accent-pink transition-colors">
                                    {prob.title}
                                </h3>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {prob.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
