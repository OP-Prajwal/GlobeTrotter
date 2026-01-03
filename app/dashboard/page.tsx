import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import RegionalDiscovery from "@/components/dashboard/regional-discovery"

export default async function Dashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/")
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">

            {/* Navigation / Header (Placeholder) */}
            <header className="border-b border-white/10 p-4 sticky top-0 bg-black/80 backdrop-blur-md z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="font-bold text-2xl tracking-tighter bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        GlobeTrotter
                    </div>
                    <Link href="/profile" className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
                        <span className="text-sm text-gray-400 hidden md:block">Hello, {user.email?.split('@')[0]}</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border border-white/20" />
                    </Link>
                </div>
            </header>

            <main className="py-8">
                {/* 1. Regional Discovery Section */}
                <section className="mb-12">
                    <RegionalDiscovery />
                </section>

                {/* Placeholder for future sections */}
                <div className="max-w-7xl mx-auto px-8">
                    <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl text-center">
                        <p className="text-gray-500">Upcoming: My Trips & Itinerary Planner</p>
                    </div>
                </div>
            </main>
        </div>
    )
}
