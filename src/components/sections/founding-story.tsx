"use client";

import { Reveal } from "@/components/motion/reveal";
import { teamData } from "@/config/site-data";
import Image from "next/image";

import { ProfileCard } from "@/components/ui/profile-card";

type MemberProp = {
    name: string;
    role: string;
    image: string;
    quote?: string;
    socials: Record<string, string>;
};

export function FoundingStory({ president: presidentProp }: { president?: MemberProp }) {
    const president = presidentProp || teamData.governingBody[0];

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-primary/5 -skew-y-3 origin-top-left -z-10" />

            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <Reveal className="order-2 lg:order-1">
                        <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-6 block">Our Origin</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-8 leading-tight">
                            From a Vision to <br />
                            <span className="text-primary italic">Regional Leadership.</span>
                        </h2>
                        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                            <p>
                                IGAC wasn't just built; it was envisioned as a sanctuary for those who believe that the future of diplomacy belongs to the youth.
                                Founded in 2023, our mission was simple yet profound: to create the most rigorous and rewarding simulation platform in South East Asia.
                            </p>
                            <p className="border-l-2 border-primary/30 pl-6 italic font-serif text-xl text-foreground/90 py-4">
                                "We believe that every policy debated today is a seed for the peace of tomorrow. IGAC is where those seeds find fertile ground."
                            </p>
                            <p>
                                Today, we stand as a testament to what happens when young leaders are given the tools, the stage, and the responsibility to host, manage, and lead complex global simulations.
                            </p>
                        </div>

                        <div className="mt-12 flex items-center gap-6">
                            <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
                            <div className="text-right">
                                <p className="text-foreground font-bold font-serif text-lg">{president.name}</p>
                                <p className="text-primary text-sm uppercase tracking-widest font-medium">{president.role}</p>
                            </div>
                        </div>
                    </Reveal>

                    <div className="relative order-1 lg:order-2 flex justify-center fade-in">
                        <div className="w-full max-w-md relative z-10">
                            <ProfileCard
                                name={president.name}
                                role={president.role}
                                image={president.image}
                                quote={president.quote}
                                socials={president.socials}
                            />

                            {/* Floating Badge */}
                            <div className="absolute -bottom-6 -left-6 bg-primary p-6 rounded-2xl shadow-xl z-30 hidden md:block border border-white/20">
                                <p className="text-primary-foreground font-bold text-3xl font-serif leading-none mb-1">2023</p>
                                <p className="text-primary-foreground/80 text-xs uppercase tracking-widest font-bold">Est. Foundation</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
