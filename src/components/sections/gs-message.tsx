"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { teamData } from "@/config/site-data";
import { Reveal } from "@/components/motion/reveal";
import { Quote } from "lucide-react";
import { useRef } from "react";

type MemberProp = {
    name: string;
    role: string;
    image: string;
};

export function GSMessage({ gs }: { gs?: MemberProp }) {
    const { gsMessage } = teamData;
    // Use Supabase data if provided, otherwise fall back to static
    const fallback = teamData.corePanel.find(m => m.role.toLowerCase().includes("general secretary")) || teamData.corePanel[0];
    const member = gs || fallback;
    const containerRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const imgY = useTransform(scrollYProgress, [0, 1], [-80, 80]);
    const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

    return (
        <section ref={containerRef} className="py-24 md:py-40 relative overflow-hidden border-t border-white/5">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-32">
                    {/* Image Column - Right side */}
                    <div className="w-full lg:w-[45%] relative">
                        <motion.div style={{ y: imgY }} className="relative z-10">
                            <Reveal delay={0.2} width="100%">
                                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-primary/20 group">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover object-top transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    {/* Glassmorphism card */}
                                    <div className="absolute bottom-10 left-8 bg-black/60 backdrop-blur-xl border border-primary/30 p-8 rounded-2xl shadow-2xl hidden lg:block max-w-[280px] z-20">
                                        <Quote className="w-10 h-10 text-primary mb-4 opacity-80" />
                                        <p className="text-white text-lg font-serif italic leading-relaxed text-left">
                                            "Excellence through unity and dedication."
                                        </p>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#051b11] via-transparent to-transparent opacity-60" />
                                </div>
                            </Reveal>
                        </motion.div>
                    </div>

                    {/* Content Column - Left side */}
                    <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left">
                        <motion.div style={{ y: textY }}>
                            <Reveal delay={0.3}>
                                <div className="inline-flex items-center gap-4 mb-6">
                                    <div className="w-12 h-px bg-primary/50" />
                                    <span className="text-primary text-sm font-bold tracking-[0.5em] uppercase text-left">
                                        {gsMessage.heading}
                                    </span>
                                </div>
                            </Reveal>

                            <Reveal delay={0.4}>
                                <h2 className="text-4xl md:text-7xl font-serif font-bold text-white mb-10 leading-[1.1] tracking-tight text-left">
                                    Driving the <span className="text-primary">Mission</span> Forward<span className="text-primary">.</span>
                                </h2>
                            </Reveal>

                            <Reveal delay={0.5}>
                                <div className="relative group/text">
                                    <p className="text-xl md:text-2xl text-muted-foreground/90 leading-relaxed mb-12 italic font-serif relative z-10 pl-0 lg:pl-10 border-l-0 lg:border-l-2 border-primary/30 transition-all group-hover/text:border-primary duration-500 text-left">
                                        {gsMessage.content}
                                    </p>
                                </div>
                            </Reveal>

                            <Reveal delay={0.6}>
                                <div className="flex flex-col items-center lg:items-start group/sig">
                                    <h4 className="text-3xl font-serif font-bold text-white mb-2 group-hover/sig:text-primary transition-colors duration-300 text-left">
                                        {gsMessage.author}
                                    </h4>
                                    <div className="relative overflow-hidden pt-1">
                                        <p className="text-primary/70 text-sm font-bold uppercase tracking-[0.3em] text-left">
                                            {gsMessage.role}
                                        </p>
                                        <motion.div
                                            initial={{ x: "-100%" }}
                                            whileInView={{ x: "100%" }}
                                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                                            className="absolute bottom-0 left-0 w-full h-[1px] bg-primary"
                                        />
                                    </div>
                                </div>
                            </Reveal>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
