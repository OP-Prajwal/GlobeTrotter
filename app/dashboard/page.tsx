import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import RegionalDiscovery from "@/components/dashboard/regional-discovery"
import DashboardHeader from "@/components/dashboard/dashboard-header"

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/")
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">

            {/* Interactive Header with Hamburger Menu */}
            <DashboardHeader userEmail={user.email} />

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
