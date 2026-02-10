"use client";

import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";


export function About() {
    return (
        <section id="about" className="py-24 relative overflow-visible">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-stretch">

                    {/* Column 1: Sticky Container */}
                    <div className="relative">
                        <div className="md:sticky md:top-40 h-fit">
                            <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-6 block">Who We Are</span>
                            <h2 className="text-3xl md:text-6xl font-serif font-bold leading-[1.1] text-foreground mb-8 text-left">
                                Forging the <br className="hidden md:block"/>
                                <span className="text-primary">Diplomats</span> <br className="hidden md:block"/>
                                of Tomorrow<span className="text-primary">.</span>
                            </h2>
                            <div className="w-20 h-1.5 bg-primary/20 rounded-full" />
                        </div>
                    </div>

                    {/* Column 2: Content unfolding */}
                    <div className="space-y-16 text-xl text-muted-foreground leading-relaxed font-light">
                        <Reveal delay={0.2}>
                            <p>
                                <span className="text-foreground font-medium underline decoration-primary/30 underline-offset-8">The International Global Affairs Council (IGAC)</span>, founded in the summer of 2023, is a vanguard youth-led institution dedicated to architecting the next era of global leadership.
                            </p>
                        </Reveal>

                        <Reveal delay={0.3}>
                            <p>
                                We believe that diplomacy is not merely a skill, but a responsibility. By synthesizing critical reasoning, strategic negotiation, and advanced cross-cultural discourse, we prepare our members to navigate the complexities of a fragmented world.
                            </p>
                        </Reveal>

                        <Reveal delay={0.4}>
                            <p>
                                IGAC serves as a high-stakes simulation environment where theoretical academic frameworks meet the rigors of real-world diplomatic practice. Our focus on resilience and systemic innovation ensures that our delegates emerge as battle-tested change-makers.
                            </p>
                        </Reveal>

                        {/* Integrated Stats Row */}
                        <Reveal delay={0.5}>
                            <div className="pt-12 border-t border-white/5">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                    <div className="space-y-1">
                                        <div className="text-3xl md:text-4xl font-serif text-primary font-bold">
                                            <CountUp value={3} suffix="+" />
                                        </div>
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Years of Excellence</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-3xl md:text-4xl font-serif text-primary font-bold">
                                            <CountUp value={15} suffix="+" />
                                        </div>
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Strategic Pillars</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-3xl md:text-4xl font-serif text-primary font-bold">
                                            <CountUp value={5} suffix="+" />
                                        </div>
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Global Sessions</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                </div>
            </div>
        </section>
    );
}
