import Image from 'next/image';

interface TripCardProps {
    title: string;
    image: string;
}

export function TripCard({ title, image }: TripCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:backdrop-blur-md active:backdrop-blur-md hover:bg-white/10 active:bg-white/10 hover:border-white/20 active:border-white/20 hover:shadow-2xl active:shadow-2xl hover:shadow-purple-500/10 active:shadow-purple-500/10 transition-all duration-300 ring-1 ring-white/5">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110 group-active:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700">No Image</div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 group-active:opacity-90 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0 group-active:translate-y-0">
                    <div className="relative z-10 glass-pane rounded-2xl p-4 border border-white/10 bg-black/40 backdrop-blur-md mb-2 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-300 delay-75 transform translate-y-4 group-hover:translate-y-0 group-active:translate-y-0">
                        <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/20 rounded-xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 tracking-wide">
                            View Itinerary
                        </button>
                    </div>

                    <h3 className="font-bold text-2xl text-white mb-1 line-clamp-2 leading-tight drop-shadow-lg transform group-hover:-translate-y-16 group-active:-translate-y-16 transition-transform duration-300 ease-in-out">{title}</h3>
                </div>
            </div>
        </div>
    );
}
