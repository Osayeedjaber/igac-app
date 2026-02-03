"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { About } from "@/components/sections/about";
import { FoundingStory } from "@/components/sections/founding-story";
import { Topics } from "@/components/sections/topics";
import { GlobalImpact } from "@/components/sections/global-impact";
import ScrollVelocity from "@/components/ScrollVelocity";
import { Journey } from "@/components/sections/journey";
import { RegionalPresence } from "@/components/sections/regional-presence";
import { Reveal } from "@/components/motion/reveal";
import FlowingMenu from "@/components/FlowingMenu";
import ShinyText from "@/components/ShinyText";


export function AboutClient() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const values = [
        { link: "#", text: "Integrity", image: "/logo.png" },
        { link: "#", text: "Diplomacy", image: "/logo.png" },
        { link: "#", text: "Leadership", image: "/logo.png" },
        { link: "#", text: "Excellence", image: "/logo.png" }
    ];

    return (
        <div className="relative">
            {/* Scroll Progress Indicator */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left"
                style={{ scaleX }}
            />

            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/5 blur-[150px] rounded-full animate-pulse delay-700" />
            </div>

            {/* Hero Section */}
            <section className="container mx-auto px-6 mb-32 text-center flex flex-col items-center relative py-24 overflow-hidden z-10">
                <Reveal className="flex flex-col items-center w-full relative z-10">
                    <span className="text-primary text-sm font-bold tracking-[0.5em] uppercase mb-8 block drop-shadow-sm">Since 2023 • Shaping History</span>
                    <h1 className="text-5xl sm:text-7xl md:text-9xl font-serif font-bold text-foreground mb-12 leading-none text-wrap max-w-[90vw]">
                        <ShinyText text="Our Legacy" speed={15} />
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-4xl mx-auto leading-relaxed font-light">
                        The <span className="text-foreground font-medium">International Global Affairs Council</span> stands as a beacon of diplomatic excellence—a crucible where youth leadership transforms into global impact.
                    </p>
                </Reveal>
            </section>

            {/* Integrated Sections with clear hierarchy */}
            <div className="relative z-10 space-y-40 md:space-y-64">
                <About />

                <FoundingStory />

                <Topics />

                <GlobalImpact />

                <section className="py-24 relative">
                    <div className="absolute inset-0 bg-primary/5 -skew-y-2" />
                    <ScrollVelocity
                        texts={["INTEGRITY • DIPLOMACY • LEADERSHIP • EXCELLENCE • ", "THE FUTURE OF DIPLOMACY • SHAPING GLOBAL LEADERS • "]}
                        velocity={25}
                    />
                </section>

                <Journey />

                <RegionalPresence />

                {/* Mission & Vision - Re-styled for cinematic feel */}
                <section className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-12 gap-20 items-start">
                        <div className="lg:col-span-7 space-y-24">
                            <Reveal>
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-1 bg-primary" />
                                        <h2 className="text-5xl font-serif font-bold text-foreground">Our Mission</h2>
                                    </div>
                                    <p className="text-muted-foreground text-2xl font-light leading-relaxed text-left max-w-2xl">
                                        To empower the next generation with the strategic tools of negotiation, critical reasoning, and executive hosting.
                                        We believe that leadership is not just learned—it's forged in the fires of real-world diplomatic simulations.
                                    </p>
                                </div>
                            </Reveal>

                            <Reveal delay={0.2}>
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-1 bg-emerald-500" />
                                        <h2 className="text-5xl font-serif font-bold text-foreground">Our Vision</h2>
                                    </div>
                                    <p className="text-muted-foreground text-2xl font-light leading-relaxed text-left max-w-2xl">
                                        A global landscape where every young voice is equipped to curate policy, manage crisis, and drive sustainable international progress through collaborative innovation.
                                    </p>
                                </div>
                            </Reveal>
                        </div>

                        <Reveal delay={0.3} className="lg:col-span-5 h-[600px] w-full border border-white/5 rounded-[3rem] overflow-hidden bg-secondary/10 backdrop-blur-xl relative group">
                            <div className="absolute inset-x-0 top-0 p-10 z-20 bg-background border-b border-white/5">
                                <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase block mb-2">Core Identity</span>
                                <h3 className="text-2xl font-serif font-bold">The Pillars of IGAC</h3>
                            </div>
                            <div className="pt-32 h-full"> {/* Add padding to push menu down slightly if needed, or rely on flex */}
                                <FlowingMenu
                                items={values}
                                bgColor="#051b11"
                                textColor="#ffffff"
                                marqueeBgColor="#d4af37"
                                marqueeTextColor="#051b11"
                            />
                            </div>
                        </Reveal>
                    </div>
                </section>


            </div>
        </div>
    );
}
