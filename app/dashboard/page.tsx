import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import RegionalDiscovery from "@/components/dashboard/regional-discovery"
import AppHeader from "@/components/shared/AppHeader"

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/")
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30">

            {/* Interactive Header with Hamburger Menu */}
            <AppHeader userEmail={user.email} />

            <main className="py-8">
                {/* 1. Regional Discovery Section */}
                <section className="mb-12">
                    <RegionalDiscovery />
                </section>

                {/* Placeholder for future sections */}

            </main>
        </div>
    )
}
