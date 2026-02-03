"use client";

import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { Globe2, Users2, Award, Building2 } from "lucide-react";
import { aboutPageContent } from "@/config/site-data";

interface StatItem {
    label: string;
    value: number;
    suffix: string;
}

export function GlobalImpact() {
    const { globalImpact } = aboutPageContent;

    // Map icons manually since they are components
    const icons = [
        <Users2 className="w-6 h-6" key="users" />,
        <Globe2 className="w-6 h-6" key="globe" />,
        <Building2 className="w-6 h-6" key="building" />,
        <Award className="w-6 h-6" key="award" />
    ];

    const stats = globalImpact.stats.map((stat: StatItem, i: number) => ({
        ...stat,
        icon: icons[i] || icons[0]
    }));

    return (
        <section className="py-24 relative overflow-hidden bg-secondary/5 border-y border-white/5">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <Reveal width="100%" className="flex justify-center mb-20">
                    <div className="text-center flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
                        <span className="text-primary text-xs font-bold tracking-[0.4em] uppercase mb-4 block">{globalImpact.bgLabel}</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground text-center">{globalImpact.title}</h2>
                    </div>
                </Reveal>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 place-items-center w-full">
                    {stats.map((stat, index) => (
                        <Reveal key={index} delay={index * 0.1} className="w-full">
                            <div className="flex flex-col items-center text-center group w-full">
                                <div className="mb-6 p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500 border border-primary/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                                    {stat.icon}
                                </div>
                                <div className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2 flex items-baseline justify-center">
                                    <CountUp value={stat.value} suffix={stat.suffix} />
                                </div>
                                <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-bold">{stat.label}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
