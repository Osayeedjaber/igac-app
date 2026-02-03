"use client";

import { Reveal } from "@/components/motion/reveal";

const committees = [
    { id: 1, name: "UNSC", fullName: "United Nations Security Council", type: "Security" },
    { id: 2, name: "UNHRC", fullName: "United Nations Human Rights Council", type: "Human Rights" },
    { id: 3, name: "DISEC", fullName: "Disarmament and International Security", type: "General Assembly" },
    { id: 4, name: "ECOSOC", fullName: "Economic and Social Council", type: "Specialized" },
    { id: 5, name: "National Parliament", fullName: "Jatiya Sangsad", type: "Specialized" },
    { id: 6, name: "IP", fullName: "International Press", type: "Creative" },
];

export function Conferences() {
    return (
        <section id="conferences" className="py-24 bg-secondary/10 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="mb-16 flex flex-col items-center text-center">
                    <Reveal className="flex flex-col items-center">
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Diplomatic Arenas</h2>
                        <p className="text-muted-foreground max-w-2xl text-lg mx-auto">
                            Engage in high-level diplomatic discussions across diverse global issues.
                            IGACMUN Session III features 12 specialized committees.
                        </p>
                    </Reveal>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {committees.map((committee, index) => (
                        <Reveal key={committee.id} delay={0.1 * index} width="100%">
                            <div className="group relative p-8 bg-background/50 border border-white/5 hover:border-primary/50 transition-all duration-500 rounded-sm overflow-hidden min-h-[200px] flex flex-col justify-end">
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-60" />

                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <span className="text-xs font-bold text-primary tracking-widest uppercase mb-2 block opacity-70 group-hover:opacity-100">
                                        {committee.type}
                                    </span>
                                    <h3 className="text-3xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                                        {committee.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                        {committee.fullName}
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <Reveal delay={0.4} className="mt-12 text-center">
                    <p className="text-muted-foreground italic">
                        + more committees coming soon
                    </p>
                </Reveal>

            </div>
        </section>
    );
}
