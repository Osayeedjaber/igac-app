"use client";

import { ProfileCard } from "@/components/ui/profile-card";
import { Reveal } from "@/components/motion/reveal";
import { useState } from "react";

type Member = {
    name: string;
    role: string;
    image: string;
    quote?: string;
    socials: Record<string, string>;
};

export function GoverningBodyHome({ members }: { members: Member[] }) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Subtle light green glow accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-emerald-500/15 blur-[180px] rounded-full pointer-events-none opacity-50" />
            <div className="container mx-auto px-6 mb-16 text-center flex flex-col items-center">
                <Reveal className="flex flex-col items-center w-full">
                    <span className="text-primary text-sm font-bold tracking-[0.3em] uppercase mb-4 block text-center">Leadership</span>
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-2 text-center">Meet the Visionaries</h2>
                    <div className="w-24 h-1 bg-primary/30 mx-auto mt-8" />
                </Reveal>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
                {members.slice(0, 3).map((member, i) => (
                    <ProfileCard
                        key={i}
                        {...member}
                        delay={i * 0.15}
                        opacity={hoveredIndex !== null && hoveredIndex !== i ? 0.3 : 1}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    />
                ))}
            </div>

        </section>
    );
}
