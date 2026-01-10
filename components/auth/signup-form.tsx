'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, SignupValues } from "@/lib/validations/auth"
import { signup } from "@/app/auth/actions"
import { useState } from "react"
import { User, Mail, Phone, Lock, MapPin, AlignLeft, Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export function SignupForm({ onFlip }: { onFlip: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    const form = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: { firstName: "", lastName: "", email: "", password: "", phone: "", avatarUrl: "" },
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
            toast.success("Account created! Check your email to proceed.", {
                duration: 5000,
            })
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl p-8 glass-card text-white relative overflow-hidden">
            {/* Decorative decorative elements */}
            <div className="absolute top-0 left-0 p-4 opacity-50">
                <div className="w-24 h-24 bg-blue-500/20 rounded-full blur-xl" />
            </div>

            <div className="flex flex-col items-center mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 text-glow">
                    Start Your Journey
                </h2>
                <p className="text-white/60 text-sm mt-2">Create your customized travel profile</p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center backdrop-blur-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-200 text-sm text-center backdrop-blur-sm">{success}</div>}

            <div className="flex justify-center mb-6">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                    <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-white/50 group-hover:text-blue-400 transition-colors" />
                        )}
                        {uploadingImage && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-blue-500 p-1.5 rounded-full border-2 border-[#0a0a0a]">
                        <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                    <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            try {
                                setUploadingImage(true);
                                const formData = new FormData();
                                formData.append("file", file);

                                // Import dynamically to avoid circular dependencies if any, or just use valid import
                                const { uploadImageAction } = await import("@/app/actions/image-upload");
                                const result = await uploadImageAction(formData);

                                if (result.success && result.url) {
                                    setAvatarUrl(result.url);
                                    form.setValue("avatarUrl", result.url);
                                } else {
                                    setError("Failed to upload image");
                                }
                            } catch (err) {
                                console.error(err);
                                setError("Image upload error");
                            } finally {
                                setUploadingImage(false);
                            }
                        }}
                    />
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/60 ml-1 uppercase tracking-wider">First Name</label>
                        <div className="relative group">
                            <User className="input-icon group-focus-within:text-blue-400 transition-colors" />
                            <input {...form.register("firstName")} className="w-full h-11 glass-input input-with-icon rounded-xl" placeholder="John" />
                        </div>
                        {form.formState.errors.firstName && <p className="text-red-400 text-xs ml-1">{form.formState.errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/60 ml-1 uppercase tracking-wider">Last Name</label>
                        <div className="relative group">
                            <User className="input-icon group-focus-within:text-blue-400 transition-colors" />
                            <input {...form.register("lastName")} className="w-full h-11 glass-input input-with-icon rounded-xl" placeholder="Doe" />
                        </div>
                        {form.formState.errors.lastName && <p className="text-red-400 text-xs ml-1">{form.formState.errors.lastName.message}</p>}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 ml-1 uppercase tracking-wider">Email</label>
                    <div className="relative group">
                        <Mail className="input-icon group-focus-within:text-blue-400 transition-colors" />
                        <input {...form.register("email")} className="w-full h-11 glass-input input-with-icon rounded-xl" placeholder="john@example.com" />
                    </div>
                    {form.formState.errors.email && <p className="text-red-400 text-xs ml-1">{form.formState.errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/60 ml-1 uppercase tracking-wider">Phone</label>
                        <div className="relative group">
                            <Phone className="input-icon group-focus-within:text-blue-400 transition-colors" />
                            <input {...form.register("phone")} className="w-full h-11 glass-input input-with-icon rounded-xl" placeholder="+1 234..." />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/60 ml-1 uppercase tracking-wider">Password</label>
                        <div className="relative group">
                            <Lock className="input-icon group-focus-within:text-blue-400 transition-colors" />
                            <input type="password" {...form.register("password")} className="w-full h-11 glass-input input-with-icon rounded-xl" placeholder="••••••••" />
                        </div>
                        {form.formState.errors.password && <p className="text-red-400 text-xs ml-1">{form.formState.errors.password.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/60 ml-1 uppercase tracking-wider">City</label>
                        <div className="relative group">
                            <MapPin className="input-icon group-focus-within:text-blue-400 transition-colors" />
                            <input {...form.register("city")} className="w-full h-11 glass-input input-with-icon rounded-xl" placeholder="New York" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/60 ml-1 uppercase tracking-wider">Country</label>
                        <div className="relative group">
                            <MapPin className="input-icon group-focus-within:text-blue-400 transition-colors" />
                            <input {...form.register("country")} className="w-full h-11 glass-input input-with-icon rounded-xl" placeholder="USA" />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 ml-1 uppercase tracking-wider">Additional Information</label>
                    <div className="relative group">
                        <AlignLeft className="input-icon top-4 translate-y-0 group-focus-within:text-blue-400 transition-colors" />
                        <textarea {...form.register("bio")} className="w-full p-3 pl-12 glass-input rounded-xl focus:ring-0 h-24 resize-none" placeholder="Tell us about your travel preferences..." />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center mt-6 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative flex items-center gap-2">
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                            <>
                                Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </span>
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-white/40 text-sm">
                    Already have an account?{" "}
                    <button onClick={onFlip} className="text-white hover:text-cyan-300 font-medium hover:underline transition-colors decoration-cyan-400 underline-offset-4">
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    )
}
