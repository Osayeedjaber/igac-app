"use client";

import { Reveal } from "@/components/motion/reveal";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRef } from "react";
import { Users, Globe, Award, Heart } from "lucide-react";

const communityStats = [
    { icon: Users, label: "Active Members", value: "200+" },
    { icon: Globe, label: "Countries Represented", value: "15+" },
    { icon: Award, label: "Awards Won", value: "50+" },
    { icon: Heart, label: "Lives Impacted", value: "4000+" },
];

export function Community() {
    const ref = useRef(null);


    return (
        <section className="py-24 md:py-32 relative" style={{ clipPath: 'inset(0)' }}>
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">

                    {/* Column 1: Sticky Heading */}
                    <div className="md:sticky md:top-32 flex flex-col items-start text-left">
                        <Reveal>
                            <span className="text-primary text-sm font-bold tracking-[0.3em] uppercase mb-4 block">Our Community</span>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-[1.1] mb-6">
                                The IGAC <span className="text-primary">Family</span>
                            </h2>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-md">
                                More than an organization, we are a movement. United by purpose, driven by passion, and committed to shaping tomorrow's leaders.
                            </p>
                        </Reveal>

                        {/* Community Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {communityStats.map((stat, index) => (
                                <Reveal key={stat.label} delay={0.3 + index * 0.1}>
                                    <div className="p-6 bg-secondary/10 rounded-xl border border-white/5 hover:border-primary/30 transition-all duration-300 group flex flex-col items-start">
                                        <stat.icon className="w-5 h-5 text-primary mb-4 group-hover:scale-110 transition-transform" />
                                        <h4 className="text-3xl font-serif font-bold text-foreground mb-1 tracking-tight">{stat.value}</h4>
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80 font-bold">{stat.label}</span>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Content */}
                    <div className="space-y-8 relative z-10">
                        {/* Main Image */}
                        <Reveal delay={0.2} width="100%">
                            <div className="relative w-full h-[350px] md:h-[500px] overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-slate-900">
                                <motion.div
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    viewport={{ once: true }}
                                    className="relative w-full h-full"
                                >
                                    <Image
                                        src="/members.jpg"
                                        alt="IGAC Family"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                                </motion.div>
                                <div className="absolute bottom-6 left-6 right-6 z-20">
                                    <p className="text-white/90 text-xl font-medium italic drop-shadow-lg">
                                        "Together, we're building a generation of changemakers."
                                    </p>
                                </div>
                            </div>
                        </Reveal>

                        {/* Values */}
                        <div className="grid grid-cols-2 gap-4">
                            <Reveal delay={0.4}>
                                <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
                                    <h4 className="text-lg font-serif font-bold text-primary mb-2">Collaboration</h4>
                                    <p className="text-sm text-muted-foreground">Working together to achieve greater impact</p>
                                </div>
                            </Reveal>
                            <Reveal delay={0.5}>
                                <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
                                    <h4 className="text-lg font-serif font-bold text-primary mb-2">Growth</h4>
                                    <p className="text-sm text-muted-foreground">Continuous learning and development</p>
                                </div>
                            </Reveal>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
