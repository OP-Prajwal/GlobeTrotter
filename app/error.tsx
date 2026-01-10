"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-[#050505] text-white space-y-4 text-center p-6">
            <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20">
                <AlertCircle className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold">Something went wrong!</h2>
            <p className="text-white/60 max-w-md">
                We encountered an unexpected error. Please try again later or contact support if the issue persists.
            </p>
            <div className="pt-4">
                <Button variant="default" onClick={() => reset()}>
                    Try again
                </Button>
            </div>
        </div>
    )
}
