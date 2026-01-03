import { getItinerary } from "@/app/actions/itinerary";
import { ItineraryEditor } from "./itinerary-editor";

export const dynamic = 'force-dynamic';

export default async function ItineraryPage(props: { params: Promise<{ tripId: string }> }) {
    const params = await props.params;
    const initialSections = await getItinerary(params.tripId);

    return <ItineraryEditor tripId={params.tripId} initialSections={initialSections} />;
}
