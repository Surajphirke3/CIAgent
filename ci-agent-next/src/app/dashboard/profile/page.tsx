"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);

    const [profile, setProfile] = useState({
        firstName: "Loading...",
        lastName: "",
        email: "loading@ciagent.io",
        role: "Lead Analyst",
        bio: "Specializing in competitor intelligence for the APAC region. Tracking emerging threats and predictive market modeling.",
    });

    const [preferences, setPreferences] = useState({
        emailAlerts: true,
        pushNotifications: false,
        weeklyDigest: true,
        darkMode: true,
    });

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { apiFetch } = await import("@/lib/api");
                const data = await apiFetch("/auth/me") as any;
                if (data) {
                    setProfile(prev => ({
                        ...prev,
                        firstName: data.name || prev.firstName,
                        lastName: data.last_name || prev.lastName,
                        email: data.email || prev.email,
                        role: data.role || prev.role,
                        bio: data.bio || prev.bio,
                    }));
                    if (data.preferences) {
                        setPreferences({
                            emailAlerts: !!data.preferences.email_alerts,
                            pushNotifications: !!data.preferences.push_notifications,
                            weeklyDigest: !!data.preferences.weekly_digest,
                            darkMode: data.preferences.dark_mode !== false,
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to load profile", error);
                setProfile(prev => ({ ...prev, firstName: "Unknown", email: "error@ciagent.io" }));
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setIsEditing(false);
        try {
            const { apiPatch } = await import("@/lib/api");
            await apiPatch("/auth/me", {
                name: profile.firstName,
                last_name: profile.lastName,
                role: profile.role,
                bio: profile.bio
            });
            showToast("Profile saved successfully");
        } catch (error) {
            console.error("Failed to save profile", error);
            showToast("Failed to save profile");
        }
    };

    const updatePreference = async (key: keyof typeof preferences, value: boolean) => {
        if (!isEditing) return;

        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);

        try {
            const { apiPatch } = await import("@/lib/api");
            await apiPatch("/auth/preferences", {
                email_alerts: newPrefs.emailAlerts,
                push_notifications: newPrefs.pushNotifications,
                weekly_digest: newPrefs.weeklyDigest,
                dark_mode: newPrefs.darkMode,
            });
            showToast("Preferences updated");
        } catch (error) {
            console.error("Failed to update preferences", error);
            showToast("Failed to update preferences");
            // Revert on error
            setPreferences(preferences);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-10 space-y-8 max-w-5xl mx-auto w-full"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glass-panel rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-24 h-24 rounded-full border-4 border-pink-500/40 p-1">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500/50 to-purple-500/50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-4xl">
                                person
                            </span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                            {profile.firstName} {profile.lastName}
                            <span className="px-2 py-1 bg-accent-cyan/20 text-accent-cyan text-xs rounded uppercase tracking-wider font-bold">
                                Admin
                            </span>
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">{profile.email}</p>
                    </div>
                </div>

                <div className="relative z-10">
                    {isEditing ? (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 rounded-xl text-slate-300 font-bold text-sm border border-white/10 hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 vibrant-gradient shadow-lg shadow-purple-500/20 text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
                            >
                                Save Changes
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personal Details Panel */}
                    <div className="glass-panel rounded-2xl p-8">
                        <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-pink-500">badge</span>
                            Personal Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">First Name</label>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    value={profile.firstName}
                                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Last Name</label>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    value={profile.lastName}
                                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                                <input
                                    type="email"
                                    disabled={!isEditing}
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Job Role</label>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    value={profile.role}
                                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Bio</label>
                                <textarea
                                    disabled={!isEditing}
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Preferences & Security */}
                <div className="space-y-8">
                    <div className="glass-panel rounded-2xl p-8">
                        <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">tune</span>
                            Preferences
                        </h2>

                        <div className="space-y-6">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <p className="text-sm font-bold text-slate-200">Email Alerts</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Alerts for high-risk signals</p>
                                </div>
                                <div className={`w-11 h-6 rounded-full transition-colors relative ${preferences.emailAlerts ? 'bg-pink-500' : 'bg-slate-700/50'} ${!isEditing && 'opacity-60'}`}>
                                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${preferences.emailAlerts ? 'translate-x-5' : ''}`}></div>
                                </div>
                                {/* Hidden input for accessibility/state if we weren't just toggling div visually */}
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    disabled={!isEditing}
                                    checked={preferences.emailAlerts}
                                    onChange={(e) => isEditing && updatePreference('emailAlerts', !preferences.emailAlerts)}
                                />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <p className="text-sm font-bold text-slate-200">Push Notifications</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Desktop & browser alerts</p>
                                </div>
                                <div className={`w-11 h-6 rounded-full transition-colors relative ${preferences.pushNotifications ? 'bg-pink-500' : 'bg-slate-700/50'} ${!isEditing && 'opacity-60'}`}>
                                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${preferences.pushNotifications ? 'translate-x-5' : ''}`}></div>
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    disabled={!isEditing}
                                    checked={preferences.pushNotifications}
                                    onChange={(e) => isEditing && updatePreference('pushNotifications', !preferences.pushNotifications)}
                                />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <p className="text-sm font-bold text-slate-200">Weekly Digest</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Receive weekly reports</p>
                                </div>
                                <div className={`w-11 h-6 rounded-full transition-colors relative ${preferences.weeklyDigest ? 'bg-pink-500' : 'bg-slate-700/50'} ${!isEditing && 'opacity-60'}`}>
                                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${preferences.weeklyDigest ? 'translate-x-5' : ''}`}></div>
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    disabled={!isEditing}
                                    checked={preferences.weeklyDigest}
                                    onChange={(e) => isEditing && updatePreference('weeklyDigest', !preferences.weeklyDigest)}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl p-8 border-dashed border-white/10">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Account Status</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-sm text-slate-400">Clearance</span>
                                <span className="text-sm font-bold text-accent-cyan">Level 5 (Max)</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-sm text-slate-400">Member Since</span>
                                <span className="text-sm font-bold text-slate-200">Oct 2023</span>
                            </div>
                            <div className="flex justify-between items-center py-2 pb-0">
                                <span className="text-sm text-slate-400">Last Login</span>
                                <span className="text-sm font-bold text-slate-200">Today, 09:41 AM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Toast Notification */}
            {toastMessage && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass px-6 py-4 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-accent-cyan/30"
                >
                    <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></div>
                    <p className="text-sm font-bold text-slate-100">
                        {toastMessage}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
