import { getTrips } from "@/lib/actions/trips";
import TripListingClient from "@/components/trips/TripListingClient";

export const dynamic = 'force-dynamic';

export default async function TripListingPage() {
    const trips = await getTrips();

    return <TripListingClient initialTrips={trips} />;
}
