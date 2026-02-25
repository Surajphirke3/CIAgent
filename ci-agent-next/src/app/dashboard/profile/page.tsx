"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { apiFetch, apiPatch, ApiError } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────
interface UserPreferences {
    email_alerts: boolean;
    push_notifications: boolean;
    weekly_digest: boolean;
    dark_mode: boolean;
}

interface UserData {
    id: string;
    email: string;
    name?: string;
    last_name?: string;
    role?: string;
    bio?: string;
    created_at: string;
    last_login?: string;
    preferences: UserPreferences;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatMemberSince(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatLastLogin(iso?: string) {
    if (!iso) return "First session";
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
        return `Today, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Toggle Component ─────────────────────────────────────────────────────────
function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(!enabled)}
            className={`w-11 h-6 rounded-full transition-all relative ${enabled ? "bg-pink-500" : "bg-slate-700/50"} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:opacity-80"}`}
        >
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${enabled ? "translate-x-5" : ""}`} />
        </button>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [savingPrefs, setSavingPrefs] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Local editable copies
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("");
    const [bio, setBio] = useState("");
    const [preferences, setPreferences] = useState<UserPreferences>({
        email_alerts: true,
        push_notifications: false,
        weekly_digest: true,
        dark_mode: true,
    });

    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastIsError, setToastIsError] = useState(false);

    const showToast = (msg: string, isError = false) => {
        setToastMessage(msg);
        setToastIsError(isError);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const loadProfile = useCallback(async () => {
        setLoadingProfile(true);
        try {
            const data = await apiFetch<UserData>("/auth/me");
            setUserData(data);
            setFirstName(data.name ?? "");
            setLastName(data.last_name ?? "");
            setRole(data.role ?? "");
            setBio(data.bio ?? "");
            setPreferences(data.preferences);
        } catch (err) {
            showToast(err instanceof ApiError ? err.message : "Failed to load profile", true);
        } finally {
            setLoadingProfile(false);
        }
    }, []);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    const handleSaveProfile = async () => {
        try {
            const updated = await apiPatch<UserData>("/auth/me", {
                name: firstName.trim(),
                last_name: lastName.trim(),
                role: role.trim(),
                bio: bio.trim(),
            });
            setUserData(updated);
            setIsEditing(false);
            showToast("Profile saved successfully");
        } catch (err) {
            showToast(err instanceof ApiError ? err.message : "Failed to save profile", true);
        }
    };

    const handleCancelEdit = () => {
        if (!userData) return;
        setFirstName(userData.name ?? "");
        setLastName(userData.last_name ?? "");
        setRole(userData.role ?? "");
        setBio(userData.bio ?? "");
        setIsEditing(false);
    };

    const handleTogglePreference = async (key: keyof UserPreferences, value: boolean) => {
        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);
        setSavingPrefs(true);
        try {
            await apiPatch("/auth/preferences", {
                email_alerts: newPrefs.email_alerts,
                push_notifications: newPrefs.push_notifications,
                weekly_digest: newPrefs.weekly_digest,
                dark_mode: newPrefs.dark_mode,
            });
            showToast("Preferences updated");
        } catch (err) {
            // Revert on failure
            setPreferences(preferences);
            showToast(err instanceof ApiError ? err.message : "Failed to update preferences", true);
        } finally {
            setSavingPrefs(false);
        }
    };

    if (loadingProfile) {
        return (
            <div className="p-10 max-w-5xl mx-auto w-full animate-pulse space-y-8">
                <div className="glass-panel rounded-2xl p-8 h-36 bg-white/5" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-panel rounded-2xl h-72 bg-white/5" />
                    <div className="space-y-4">
                        <div className="glass-panel rounded-2xl h-48 bg-white/5" />
                        <div className="glass-panel rounded-2xl h-36 bg-white/5" />
                    </div>
                </div>
            </div>
        );
    }

    const displayName = [firstName, lastName].filter(Boolean).join(" ") || userData?.email || "User";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-10 space-y-8 max-w-5xl mx-auto w-full"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glass-panel rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-24 h-24 rounded-full border-4 border-pink-500/40 p-1">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500/50 to-purple-500/50 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-4xl">person</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                            {displayName}
                            {userData?.role && (
                                <span className="px-2 py-1 bg-accent-cyan/20 text-accent-cyan text-xs rounded uppercase tracking-wider font-bold">
                                    {userData.role}
                                </span>
                            )}
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">{userData?.email}</p>
                    </div>
                </div>

                <div className="relative z-10">
                    {isEditing ? (
                        <div className="flex gap-3">
                            <button onClick={handleCancelEdit} className="px-6 py-2 rounded-xl text-slate-300 font-bold text-sm border border-white/10 hover:bg-white/5 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSaveProfile} className="px-6 py-2 vibrant-gradient shadow-lg shadow-purple-500/20 text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity">
                                Save Changes
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Personal Details */}
                <div className="lg:col-span-2 glass-panel rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-pink-500">badge</span>
                        Personal Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { label: "First Name", value: firstName, onChange: setFirstName },
                            { label: "Last Name", value: lastName, onChange: setLastName },
                            { label: "Job Role", value: role, onChange: setRole },
                        ].map(({ label, value, onChange }) => (
                            <div key={label} className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">{label}</label>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    value={value}
                                    onChange={e => onChange(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>
                        ))}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                            <input
                                type="email"
                                disabled
                                value={userData?.email ?? ""}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 opacity-60 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Bio</label>
                            <textarea
                                disabled={!isEditing}
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Preferences + Account Status */}
                <div className="space-y-6">
                    {/* Preferences */}
                    <div className="glass-panel rounded-2xl p-8">
                        <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">tune</span>
                            Preferences
                            {savingPrefs && <span className="material-symbols-outlined text-xs text-slate-500 animate-spin ml-auto">autorenew</span>}
                        </h2>

                        <div className="space-y-5">
                            {[
                                { label: "Email Alerts", desc: "Alerts for high-risk signals", key: "email_alerts" as const },
                                { label: "Push Notifications", desc: "Desktop & browser alerts", key: "push_notifications" as const },
                                { label: "Weekly Digest", desc: "Receive weekly reports", key: "weekly_digest" as const },
                            ].map(({ label, desc, key }) => (
                                <div key={key} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">{label}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                                    </div>
                                    <Toggle
                                        enabled={preferences[key]}
                                        onChange={v => handleTogglePreference(key, v)}
                                        disabled={savingPrefs}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Account Status — real data */}
                    <div className="glass-panel rounded-2xl p-8 border border-dashed border-white/10">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Account Status</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-sm text-slate-400">Plan</span>
                                <span className="text-sm font-bold text-accent-cyan">Pro</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-sm text-slate-400">Member Since</span>
                                <span className="text-sm font-bold text-slate-200">
                                    {userData?.created_at ? formatMemberSince(userData.created_at) : "—"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 pb-0">
                                <span className="text-sm text-slate-400">Last Login</span>
                                <span className="text-sm font-bold text-slate-200">
                                    {formatLastLogin(userData?.last_login)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass px-6 py-4 rounded-full flex items-center gap-3 shadow-lg border ${toastIsError ? "border-red-500/30 shadow-red-500/20" : "border-accent-cyan/30 shadow-accent-cyan/20"}`}
                    >
                        <div className={`w-2 h-2 rounded-full animate-pulse ${toastIsError ? "bg-red-400" : "bg-accent-cyan"}`} />
                        <p className="text-sm font-bold text-slate-100">{toastMessage}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
