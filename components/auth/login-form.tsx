'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginValues } from "@/lib/validations/auth"
import { login } from "@/app/auth/actions"
import { useState } from "react"
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react"

export function LoginForm({ onFlip }: { onFlip: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    })

    async function onSubmit(data: LoginValues) {
        setLoading(true)
        setError(null)
        const result = await login(data)
        if (result?.error) {
            if (result.error.includes("Email not confirmed")) {
                setError("Please check your email to confirm your account before logging in.")
            } else {
                setError(result.error)
            }
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-[400px] p-8 glass-card text-white relative overflow-hidden">
            {/* Decorative decorative elements */}
            <div className="absolute top-0 right-0 p-4 opacity-50">
                <div className="w-20 h-20 bg-purple-500/20 rounded-full blur-xl" />
            </div>

            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg mb-4 rotate-3 group hover:rotate-6 transition-transform">
                    GT
                </div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 text-glow">
                    Welcome Back
                </h2>
                <p className="text-white/60 text-sm mt-2">Sign in to continue your journey</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center backdrop-blur-sm">
                    {error}
                </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 ml-1 uppercase tracking-wider">Email</label>
                    <div className="relative group">
                        <Mail className="input-icon group-focus-within:text-purple-400 transition-colors" />
                        <input
                            {...form.register("email")}
                            className="w-full h-12 glass-input input-with-icon rounded-xl"
                            placeholder="traveler@example.com"
                        />
                    </div>
                    {form.formState.errors.email && <p className="text-red-400 text-xs ml-1">{form.formState.errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 ml-1 uppercase tracking-wider">Password</label>
                    <div className="relative group">
                        <Lock className="input-icon group-focus-within:text-purple-400 transition-colors" />
                        <input
                            type="password"
                            {...form.register("password")}
                            className="w-full h-12 glass-input input-with-icon rounded-xl"
                            placeholder="••••••••"
                        />
                    </div>
                    {form.formState.errors.password && <p className="text-red-400 text-xs ml-1">{form.formState.errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 flex items-center justify-center mt-2 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative flex items-center gap-2">
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                            <>
                                Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </span>
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-white/40 text-sm">
                    Don't have an account?{" "}
                    <button onClick={onFlip} className="text-white hover:text-purple-300 font-medium hover:underline transition-colors decoration-purple-400 underline-offset-4">
                        Join the adventure
                    </button>
                </p>
            </div>
        </div>
    )
}
