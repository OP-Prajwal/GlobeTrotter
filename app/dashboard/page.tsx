import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function Dashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/")
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold">Welcome, {user.email}</h1>
            <p className="mt-4 text-gray-400">Your journey begins here.</p>
            <div className="mt-8 border border-white/10 rounded-xl p-6 bg-white/5">
                <h2 className="text-xl font-semibold mb-4">Your Itineraries</h2>
                <p className="text-sm text-gray-500">Coming soon: Drizzle + Framer Motion drag-and-drop builder.</p>
            </div>
        </div>
    )
}
