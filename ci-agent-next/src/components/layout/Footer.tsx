import Link from 'next/link';
import { LineChart, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-white/5 relative z-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 gradient-btn rounded flex items-center justify-center text-white">
                            <LineChart className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-100 uppercase italic">
                            <span className="text-accent-pink">CI</span>Agent
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
                        Predicting market shifts before they happen. The enterprise standard for competitive AI.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    <div className="flex flex-col gap-3">
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Platform</span>
                        <a href="#workflow" className="text-sm text-slate-500 hover:text-primary transition-colors">Features</a>
                        <a href="#architecture" className="text-sm text-slate-500 hover:text-primary transition-colors">API</a>
                        <a href="#architecture" className="text-sm text-slate-500 hover:text-primary transition-colors">Security</a>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Resources</span>
                        <a href="#problem" className="text-sm text-slate-500 hover:text-primary transition-colors">Documentation</a>
                        <a href="#workflow" className="text-sm text-slate-500 hover:text-primary transition-colors">Help Center</a>
                        <a href="#cta" className="text-sm text-slate-500 hover:text-primary transition-colors">Guides</a>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Social</span>
                        <Link href="#" className="text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
                            <Twitter className="w-4 h-4" /> Twitter
                        </Link>
                        <Link href="#" className="text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
                            <Linkedin className="w-4 h-4" /> LinkedIn
                        </Link>
                        <Link href="#" className="text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-2">
                            <Github className="w-4 h-4" /> Github
                        </Link>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-600 text-xs text-center md:text-left">© 2024 CIAgent Technologies Inc. All rights reserved.</p>
                <div className="flex gap-6">
                    <Link href="#" className="text-slate-600 text-xs hover:text-slate-300">Privacy Policy</Link>
                    <Link href="#" className="text-slate-600 text-xs hover:text-slate-300">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}
