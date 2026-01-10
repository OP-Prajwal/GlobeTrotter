import { ProfileHeader } from "@/components/profile/profile-header";
import { TripsSection } from "@/components/profile/trips-section";
import { getUserProfile, getUserTrips } from "@/lib/actions/profile";
import { redirect } from "next/navigation";
import AppHeader from "@/components/shared/AppHeader";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const profile = await getUserProfile();
    const trips = await getUserTrips();

    if (!profile) {
        redirect("/login");
    }

    // Format trips for display component
    const formattedTrips = trips.map(t => ({
        id: t.id,
        title: t.title,
        image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80" // Placeholder for now as trips dont have images in schema yet
    }));

    // Split trips - For now just showing all as "My Trips" since we dont have "preplanned" vs "previous" distinction in schema clearly yet (or use endDate)
    const upcomingTrips = formattedTrips;

    return (
        <div className="min-h-screen bg-black text-foreground selection:bg-purple-500/30">
            <AppHeader />

            {/* Ambient Background */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-black to-black -z-20" />
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] -z-10 mix-blend-screen animate-blob" />
            <div className="fixed top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -z-10 mix-blend-screen animate-blob" style={{ animationDelay: '2s' }} />
            <div className="fixed bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] -z-10 mix-blend-screen animate-blob" style={{ animationDelay: '4s' }} />

            <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto relative z-0">
                <ProfileHeader initialProfile={{
                    firstName: profile.firstName || '',
                    lastName: profile.lastName || '',
                    email: profile.email,
                    bio: profile.bio || '',
                    avatarUrl: profile.avatarUrl || ''
                }} />

                <div className="space-y-12 pb-20">
                    <TripsSection title="My Trips" trips={upcomingTrips} />

                    {upcomingTrips.length === 0 && (
                        <div className="text-center py-20 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm border-dashed">
                            <p className="text-gray-400 text-lg">No trips planned yet. Time for an adventure! 🌍</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
