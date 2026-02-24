"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ApiError, apiPost } from "@/lib/api";

const BackgroundAnimation = () => {
    const video1Ref = useRef<HTMLVideoElement>(null);
    const video2Ref = useRef<HTMLVideoElement>(null);
    const [showVideo2, setShowVideo2] = useState(false);

    useEffect(() => {
        const video1 = video1Ref.current;
        const video2 = video2Ref.current;
        if (!video1 || !video2) return;

        video1.playbackRate = 1.0;
        video1.play().catch(() => { });

        const handleVideo1End = () => {
            setShowVideo2(true);
            video2.playbackRate = 1.0;
            video2.play().catch(() => { });
        };

        video1.addEventListener("ended", handleVideo1End);
        return () => { video1.removeEventListener("ended", handleVideo1End); };
    }, []);

    return (
        <>
            <video
                ref={video1Ref}
                src="/login1.mp4"
                muted
                playsInline
                preload="auto"
                className={`fixed inset-0 z-0 w-full h-full object-cover pointer-events-none opacity-80 transition-opacity duration-500 ${showVideo2 ? 'opacity-0' : 'opacity-80'}`}
            />
            <video
                ref={video2Ref}
                src="/login2.mp4"
                muted
                playsInline
                loop
                preload="auto"
                className={`fixed inset-0 z-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 ${showVideo2 ? 'opacity-80' : 'opacity-0'}`}
            />
        </>
    );
};

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; general?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Enter a valid email address";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            // Call POST /auth/register
            await apiPost("/auth/register", {
                email: email.trim(),
                name: name.trim() || undefined,
                password: password,
            });

            // Redirect to login with success state
            router.push("/login?registered=true");
        } catch (err) {
            if (err instanceof ApiError) {
                setErrors({ general: err.message });
            } else {
                setErrors({ general: "Unable to reach the server. Is the backend running?" });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
            {/* Background Animation */}
            <BackgroundAnimation />
            <div className="fixed inset-0 z-0 bg-black/40 pointer-events-none"></div>

            <main className="relative z-10 flex flex-col items-center justify-center p-6 w-full my-8">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 flex flex-col items-center gap-3"
                >
                    <Link href="/" className="flex flex-col items-center gap-3 group">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent-cyan rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(43,43,238,0.4)] group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor" />
                                <path clipRule="evenodd" d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" fill="currentColor" fillRule="evenodd" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">CIAgent</h1>
                    </Link>
                </motion.div>

                {/* Signup Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="w-full max-w-[440px] glass-card neon-border rounded-xl p-8 md:p-10 flex flex-col gap-6"
                >
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-white leading-tight">
                            Create Your Account
                        </h2>
                        <p className="text-slate-400 text-sm font-medium tracking-wide">
                            Join to monitor the competitive landscape.
                        </p>
                    </div>

                    {/* General API error banner */}
                    {errors.general && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3"
                        >
                            <span className="material-symbols-outlined text-red-400 text-lg">error</span>
                            <p className="text-red-400 text-sm font-medium">{errors.general}</p>
                        </motion.div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Name (Optional) */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1" htmlFor="name">
                                Full Name <span className="text-slate-600 normal-case tracking-normal">(Optional)</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                    <span className="material-symbols-outlined text-lg">badge</span>
                                </div>
                                <input
                                    className="w-full bg-slate-900/40 border border-slate-700 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-lg py-3 pl-11 pr-4 text-white placeholder:text-slate-600 outline-none transition-all"
                                    id="name"
                                    placeholder="Jane Doe"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1" htmlFor="email">
                                Work Email
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                    <span className="material-symbols-outlined text-lg">mail</span>
                                </div>
                                <input
                                    className={`w-full bg-slate-900/40 border ${errors.email ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-700 focus:border-primary/50 focus:ring-primary/50'} focus:ring-1 rounded-lg py-3 pl-11 pr-4 text-white placeholder:text-slate-600 outline-none transition-all`}
                                    id="email"
                                    placeholder="name@company.com"
                                    type="text"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                                    }}
                                />
                            </div>
                            {errors.email && (
                                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs font-medium ml-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {errors.email}
                                </motion.p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1" htmlFor="password">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                    <span className="material-symbols-outlined text-lg">lock</span>
                                </div>
                                <input
                                    className={`w-full bg-slate-900/40 border ${errors.password ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-700 focus:border-accent-cyan/50 focus:ring-accent-cyan/50'} focus:ring-1 rounded-lg py-3 pl-11 pr-12 text-white placeholder:text-slate-600 outline-none transition-all`}
                                    id="password"
                                    placeholder="••••••••"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                                    }}
                                />
                                <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 hover:text-slate-400 transition-colors" type="button" onClick={() => setShowPassword(!showPassword)}>
                                    <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                                </button>
                            </div>
                            {errors.password && (
                                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs font-medium ml-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {errors.password}
                                </motion.p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                    <span className="material-symbols-outlined text-lg">lock_reset</span>
                                </div>
                                <input
                                    className={`w-full bg-slate-900/40 border ${errors.confirmPassword ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-700 focus:border-accent-cyan/50 focus:ring-accent-cyan/50'} focus:ring-1 rounded-lg py-3 pl-11 pr-12 text-white placeholder:text-slate-600 outline-none transition-all`}
                                    id="confirmPassword"
                                    placeholder="••••••••"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                                    }}
                                />
                                <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 hover:text-slate-400 transition-colors" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <span className="material-symbols-outlined text-lg">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs font-medium ml-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {errors.confirmPassword}
                                </motion.p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isLoading}
                                className="w-full h-14 bg-gradient-to-r from-accent-cyan to-accent-purple hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all"
                                type="submit"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="material-symbols-outlined text-lg animate-spin">autorenew</span>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Sign Up
                                        <span className="material-symbols-outlined text-lg">person_add</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>

                    <div className="text-center">
                        <p className="text-slate-500 text-sm">
                            Already have an account?
                            <Link href="/login" className="hover:underline font-semibold ml-1 text-accent-cyan">
                                Log in
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
