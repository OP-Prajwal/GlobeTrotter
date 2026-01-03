'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, SignupValues } from "@/lib/validations/auth"
import { signup } from "@/app/auth/actions"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function SignupForm({ onFlip }: { onFlip: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const form = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: { firstName: "", lastName: "", email: "", password: "", phone: "" },
    })

    async function onSubmit(data: SignupValues) {
        setLoading(true)
        setError(null)
        setSuccess(null)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = await signup(data)
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else if (result?.message) {
            setSuccess(result.message)
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl p-8 bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl text-white">
            <h2 className="text-3xl font-bold text-center mb-2">Start Your Journey</h2>
            <p className="text-gray-400 text-center mb-8">Create your customized travel profile</p>

            {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm text-center">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded text-green-200 text-sm text-center">{success}</div>}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">First Name</label>
                        <input {...form.register("firstName")} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="John" />
                        {form.formState.errors.firstName && <p className="text-red-400 text-xs">{form.formState.errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Last Name</label>
                        <input {...form.register("lastName")} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Doe" />
                        {form.formState.errors.lastName && <p className="text-red-400 text-xs">{form.formState.errors.lastName.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email</label>
                    <input {...form.register("email")} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
                    {form.formState.errors.email && <p className="text-red-400 text-xs">{form.formState.errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Phone</label>
                        <input {...form.register("phone")} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="+1 234..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <input type="password" {...form.register("password")} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                        {form.formState.errors.password && <p className="text-red-400 text-xs">{form.formState.errors.password.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">City</label>
                        <input {...form.register("city")} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="New York" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Country</label>
                        <input {...form.register("country")} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="USA" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Additional Information</label>
                    <textarea {...form.register("bio")} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 h-24" placeholder="Tell us about your travel preferences..." />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center mt-6"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                    Already have an account?{" "}
                    <button onClick={onFlip} className="text-purple-400 hover:text-purple-300 font-semibold underline-offset-4 hover:underline">
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    )
}
