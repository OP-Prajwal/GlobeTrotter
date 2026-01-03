import { TripCard } from "./trip-card";

interface Trip {
    id: string;
    title: string;
    image: string;
}

interface TripsSectionProps {
    title: string;
    trips: Trip[];
}

export function TripsSection({ title, trips }: TripsSectionProps) {
    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip) => (
                    <TripCard key={trip.id} title={trip.title} image={trip.image} />
                ))}
            </div>
        </section>
    );
}
