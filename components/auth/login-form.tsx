'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginValues } from "@/lib/validations/auth"
import { login } from "@/app/auth/actions"
import { useState } from "react"
import { Loader2 } from "lucide-react"

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
        <div className="w-full max-w-md p-8 bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl text-white">
            <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
                    GT
                </div>
            </div>

            <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-center mb-8">Sign in to continue your journey</p>

            {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm text-center">{error}</div>}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email</label>
                    <input
                        {...form.register("email")}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-500"
                        placeholder="traveler@example.com"
                    />
                    {form.formState.errors.email && <p className="text-red-400 text-xs">{form.formState.errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Password</label>
                    <input
                        type="password"
                        {...form.register("password")}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-500"
                        placeholder="••••••••"
                    />
                    {form.formState.errors.password && <p className="text-red-400 text-xs">{form.formState.errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 flex items-center justify-center mt-6"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                    Don't have an account?{" "}
                    <button onClick={onFlip} className="text-blue-400 hover:text-blue-300 font-semibold underline-offset-4 hover:underline">
                        Join the adventure
                    </button>
                </p>
            </div>
        </div>
    )
}
