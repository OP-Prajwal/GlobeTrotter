import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#050505]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
                <p className="text-sm text-white/50 animate-pulse">Loading your experience...</p>
            </div>
        </div>
    )
}
