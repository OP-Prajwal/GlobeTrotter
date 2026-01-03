'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center overflow-hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="relative z-10 w-full max-w-4xl perspective-1000">
                <AnimatePresence mode="wait" initial={false}>
                    {isLogin ? (
                        <motion.div
                            key="login"
                            initial={{ rotateY: -180, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            exit={{ rotateY: 180, opacity: 0 }}
                            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                            className="w-full flex justify-center backface-hidden"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <LoginForm onFlip={() => setIsLogin(false)} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="signup"
                            initial={{ rotateY: 180, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            exit={{ rotateY: -180, opacity: 0 }}
                            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                            className="w-full flex justify-center backface-hidden"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <SignupForm onFlip={() => setIsLogin(true)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
