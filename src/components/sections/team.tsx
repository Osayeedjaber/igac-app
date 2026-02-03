"use client";

import { Reveal } from "@/components/motion/reveal";
import { InfiniteCarousel } from "@/components/motion/infinite-carousel";
import Image from "next/image";
import { teamData } from "@/config/site-data";

export function Team() {
    return (
        <section id="governing-body" className="py-24 bg-background relative overflow-hidden">

            {/* Part 1: The Governing Body */}
            <div className="container mx-auto px-6 mb-24">
                <Reveal className="text-center mb-16">
                    <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block">Leadership</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">The Governing Body</h2>
                    <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                        The visionaries steering the International Global Affairs Council towards a future of diplomatic excellence.
                    </p>
                </Reveal>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {teamData.governingBody.map((leader, index) => (
                        <Reveal key={index} delay={0.2 * index} width="100%">
                            <div className="group relative overflow-hidden rounded-sm bg-secondary/5 border border-white/5 hover:border-primary/30 transition-all duration-500">
                                {/* Image Container */}
                                <div className="relative h-[400px] w-full overflow-hidden">
                                    <Image
                                        src={leader.image}
                                        alt={leader.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
                                </div>

                                {/* Text Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <span className="text-primary text-xs font-bold uppercase tracking-widest mb-2 block">{leader.role}</span>
                                    <h3 className="text-2xl font-serif font-bold text-foreground mb-4">{leader.name}</h3>
                                    <p className="text-muted-foreground text-sm italic opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 border-l-2 border-primary pl-4">
                                        "{leader.quote}"
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>

            {/* Part 2: The Core Panel Carousel */}
            <div className="py-12 border-t border-white/5 bg-secondary/5">
                <div className="container mx-auto px-6 mb-10 text-center">
                    <Reveal>
                        <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">The Core Panel</h3>
                        <p className="text-muted-foreground">The heartbeat of our operations and execution.</p>
                    </Reveal>
                </div>

                {/* Full width carousel */}
                <InfiniteCarousel />
            </div>

        </section>
    );
}
