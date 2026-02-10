import { getEvents } from "@/lib/data";
import { homeContent } from "@/config/site-data";
import { Reveal } from "@/components/motion/reveal";
import Link from "next/link";
import Image from "next/image";

export async function EventsPreview() {
    const { label, title, description, ctaLabel } = homeContent.eventsPreview;

    // Fetch events from database, filter by featured flag
    const allEvents = await getEvents();
    let previewEvents = allEvents.filter(event => event.featured && event.is_visible);

    // Sort by sort_order
    previewEvents.sort((a, b) => a.sort_order - b.sort_order);

    // Limit to 2 for homepage preview
    previewEvents = previewEvents.slice(0, 2);

    // Fallback: if no featured events, show the first 2 visible events
    if (previewEvents.length === 0) {
        previewEvents = allEvents.filter(e => e.is_visible).slice(0, 2);
    }

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Subtle light green glow accent */}
            <div className="absolute bottom-0 right-[-5%] w-[40%] h-[40%] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />
            <div className="container mx-auto px-6 text-center mb-20 flex flex-col items-center">
                <Reveal className="flex flex-col items-center w-full">
                    <span className="text-primary text-sm font-bold tracking-[0.3em] uppercase mb-4 block">{label}</span>
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">{title}</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto italic">
                        {description}
                    </p>
                </Reveal>
            </div>

            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid md:grid-cols-2 gap-12">
                    {previewEvents.map((event, index) => (
                        <Reveal key={index} delay={index * 0.2}>
                            <div className="group relative bg-[#06140e] border border-white/10 rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-500 h-full flex flex-col shadow-2xl">
                                {/* Banner Image */}
                                <div className="h-64 relative overflow-hidden">
                                    {event.image ? (
                                        <Image
                                            src={event.image}
                                            alt={event.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
                                            <h3 className="text-3xl font-serif font-bold text-white/20 uppercase">{event.title.split(' ')[0]}</h3>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#06140e] to-transparent opacity-60" />
                                </div>

                                <div className="p-8 flex-1 flex flex-col relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{event.date}</span>
                                        <span className="text-xs text-muted-foreground/80 flex items-center gap-1">
                                            {event.location}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors font-serif">{event.title}</h3>
                                    <p className="text-muted-foreground/80 mb-6 flex-1 text-sm leading-relaxed">{event.description}</p>

                                    <div className="flex gap-8 border-t border-white/5 pt-6 mt-auto">
                                        <div>
                                            <span className="block text-2xl font-bold text-white">{event.stats.delegates}</span>
                                            <span className="text-[10px] uppercase text-muted-foreground tracking-widest">Delegates</span>
                                        </div>
                                        <div>
                                            <span className="block text-2xl font-bold text-white">{event.stats.committees}</span>
                                            <span className="text-[10px] uppercase text-muted-foreground tracking-widest">Committees</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <div className="text-center mt-16 flex justify-center w-full">
                    <Reveal delay={0.4} className="flex flex-col items-center justify-center w-full">
                        <Link href="/events" className="group flex items-center justify-center gap-2 text-sm font-bold text-primary hover:text-white uppercase tracking-widest transition-colors">
                            {ctaLabel}
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
