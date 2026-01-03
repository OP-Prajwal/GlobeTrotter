import { getTrips } from "@/lib/actions/trips";
import TripListingClient from "@/components/trips/TripListingClient";

export default async function TripListingPage() {
    const trips = await getTrips();

    return <TripListingClient initialTrips={trips} />;
}
