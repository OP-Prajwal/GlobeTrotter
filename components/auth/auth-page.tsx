'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"


export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden relative">
            <div
                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"
                style={{ filter: 'brightness(0.6)' }}
            />

            {/* Ambient background effects */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 to-blue-900/30" />
            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/80 pointer-events-none" />



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
