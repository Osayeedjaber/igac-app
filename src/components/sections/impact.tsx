"use client";

import { eventStats } from "@/config/site-data";
import { Reveal } from "@/components/motion/reveal";

export function Impact() {
    return (
        <section className="py-24 border-y border-white/5">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center items-center">
                    <Reveal delay={0.1} width="100%" className="flex flex-col items-center justify-center w-full text-center">
                        <span className="text-6xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/40 block mb-4 text-center">
                            {eventStats.totalEvents}
                        </span>
                        <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-medium text-center">Total Events</span>
                    </Reveal>
                    <Reveal delay={0.2} width="100%" className="flex flex-col items-center justify-center w-full text-center">
                        <span className="text-6xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/40 block mb-4 text-center">
                            {eventStats.totalDelegates}
                        </span>
                        <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-medium text-center">Delegates Inspired</span>
                    </Reveal>
                    <Reveal delay={0.3} width="100%" className="flex flex-col items-center justify-center w-full text-center">
                        <span className="text-6xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/40 block mb-4 text-center">
                            {eventStats.yearsActive}
                        </span>
                        <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-medium text-center">Years of Excellence</span>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
