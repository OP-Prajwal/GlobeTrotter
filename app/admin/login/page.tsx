"use client";

import { useTransition, useState } from "react";
import { loginAdmin } from "@/lib/actions/admin-auth";
import { Loader2, Lock, User } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");

    const handleLogin = (formData: FormData) => {
        setError("");
        startTransition(async () => {
            const result = await loginAdmin(formData);
            if (result?.error) {
                setError(result.error);
                toast.error("Access Denied: Invalid credentials.");
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#05050A] relative overflow-hidden">

            {/* Background Ambient Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />

            <div className="relative z-10 w-full max-w-md p-8">
                <div className="glass-card p-8 border border-white/10 shadow-2xl backdrop-blur-2xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4 border border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Access</h1>
                        <p className="text-gray-400 text-sm mt-2">Restricted Area. Authorized Personnel Only.</p>
                    </div>

                    <form action={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <div className="relative group">
                                <User className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                <input
                                    name="username"
                                    type="text"
                                    placeholder="Username"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-gray-600 focus:bg-white/10 focus:border-primary/50 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-gray-600 focus:bg-white/10 focus:border-primary/50 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            disabled={isPending}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] flex items-center justify-center gap-2"
                        >
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Credentials"}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-6">
                    <p className="text-xs text-gray-600">
                        Detailed Audit Logging Enabled. <br />
                        IP Address Monitored.
                    </p>
                </div>
            </div>
        </div>
    );
}
