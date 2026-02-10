"use client";
import { eventStats } from "@/config/site-data";
import { Reveal } from "@/components/motion/reveal";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Globe2, Calendar, Users, Award, ShieldCheck, Landmark } from "lucide-react";

type EventData = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  year: number;
  month: string;
  location: string;
  image: string;
  description: string;
  division: string;
  tag: string;
  stats: Record<string, string>;
  highlights: string[];
  sort_order: number;
  featured: boolean;
  is_visible: boolean;
};

type SiteStats = {
  total_events: string;
  total_delegates: string;
  years_active: string;
};

interface EventsPageProps {
  events: EventData[];
  stats?: SiteStats;
}

export default function EventsPage({ events, stats }: EventsPageProps) {
    // Filter to only visible events and sort by sort_order (already sorted from server, but ensure it's maintained)
    const visibleEvents = events.filter(e => e.is_visible).sort((a, b) => a.sort_order - b.sort_order);

    // 1. Data Selection
    const featuredEvent = visibleEvents.find(e => e.tag === "FEATURED") || visibleEvents[0];
    const otherEvents = visibleEvents.filter(e => e !== featuredEvent);

    // Use sort_order from database instead of year-based sorting
    const sortedArchiveEvents = otherEvents;

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20 overflow-hidden">

            {/* --- 1. Minimalistic Hero --- */}
            <section className="container mx-auto px-6 mb-16">
                <Reveal className="max-w-4xl">
                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Our Journey</span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 tracking-tight">
                        Legacy of <span className="text-primary italic">Diplomacy.</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl italic">
                        From our very first session to our most recent global summit, IGAC has been at the forefront of shaping the next generation of global leaders through rigorous simulation and academic excellence.
                    </p>
                </Reveal>
            </section>

            {/* --- 2. Clean Stats Bar (Simplematic) --- */}
            <section className="container mx-auto px-6 mb-20">
                <Reveal width="100%">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-10 rounded-[2.5rem] bg-secondary/5 border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Users className="text-primary w-7 h-7" />
                            </div>
                            <div>
                                <span className="block text-3xl font-bold text-white">{stats?.total_delegates || eventStats.totalDelegates}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Delegates Impacted</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 md:border-l md:border-white/10 md:pl-12">
                            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                <Award className="text-emerald-400 w-7 h-7" />
                            </div>
                            <div>
                                <span className="block text-3xl font-bold text-white">{stats?.total_events || eventStats.totalEvents}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Flagship Conferences</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 md:border-l md:border-white/10 md:pl-12">
                            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                <Landmark className="text-blue-400 w-7 h-7" />
                            </div>
                            <div>
                                <span className="block text-3xl font-bold text-white">{stats?.years_active || eventStats.yearsActive}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Years of Excellence</span>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* --- 3. Featured Spotlight (Simple) --- */}
            <section className="container mx-auto px-6 mb-32">
                <Reveal width="100%">
                    <div className="group relative rounded-[3rem] overflow-hidden border border-white/10 bg-secondary/5 min-h-[500px] flex items-end p-10 md:p-16">
                        {featuredEvent.image && (
                            <Image
                                src={featuredEvent.image}
                                alt={featuredEvent.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-50"
                                priority
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                        <div className="relative z-10 w-full max-w-4xl">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="px-4 py-1.5 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20">Premier Showcase</span>
                                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">{featuredEvent.date}</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 tracking-tighter">
                                {featuredEvent.title}
                            </h2>
                            <p className="text-xl text-white/70 font-light leading-relaxed max-w-2xl mb-12 italic border-l-4 border-primary pl-8">
                                "{featuredEvent.description || "A transformative experience that redefined our approach to international relations and youth empowerment."}"
                            </p>

                            <div className="flex flex-wrap gap-10 border-t border-white/10 pt-10">
                                <div className="flex items-center gap-4">
                                    <Globe2 className="w-6 h-6 text-primary" />
                                    <div>
                                        <span className="block text-white font-bold">{featuredEvent.location}</span>
                                        <span className="text-[9px] text-primary uppercase font-black tracking-widest">Venue Location</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Users className="w-6 h-6 text-primary" />
                                    <div>
                                        <span className="block text-white font-bold">{featuredEvent.stats?.delegates || "1000+"}</span>
                                        <span className="text-[9px] text-primary uppercase font-black tracking-widest">Total Delegates</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <ShieldCheck className="w-6 h-6 text-primary" />
                                    <div>
                                        <span className="block text-white font-bold">{featuredEvent.stats?.committees || "10+"}</span>
                                        <span className="text-[9px] text-primary uppercase font-black tracking-widest">Active Committees</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* --- 4. Continuous Event Grid --- */}
            <section className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {sortedArchiveEvents.map((event, idx) => (
                        <Reveal key={idx} delay={idx * 0.05}>
                            <div className="group rounded-[2rem] overflow-hidden bg-white/[0.02] border border-white/5 transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.03]">
                                <div className="relative aspect-video overflow-hidden">
                                    {event.image && (
                                        <Image
                                            src={event.image}
                                            alt={event.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-primary uppercase tracking-widest border border-white/10">
                                            {event.division === "CTG" ? "Chattogram" : "Dhaka"}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{event.month} {event.year}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-white/20 truncate max-w-[100px]">{event.location}</span>
                                    </div>
                                    <h4 className="text-2xl font-serif font-bold text-white mb-4 leading-tight group-hover:text-primary transition-colors">
                                        {event.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground line-clamp-3 font-medium leading-relaxed mb-6">
                                        {event.description || event.subtitle || "A milestone event contributing to our growing legacy of international diplomatic excellence and youth leadership."}
                                    </p>

                                    <div className="flex gap-6 border-t border-white/5 pt-6 group-hover:border-primary/20 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-white">{event.stats?.delegates || "300+"}</span>
                                            <span className="text-[8px] uppercase text-primary font-black tracking-widest">Delegates</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-white">{event.stats?.committees || "5+"}</span>
                                            <span className="text-[8px] uppercase text-primary font-black tracking-widest">Councils</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

        </main>
    );
}
