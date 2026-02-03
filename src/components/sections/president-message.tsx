"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { teamData } from "@/config/site-data";
import { Reveal } from "@/components/motion/reveal";
import { Quote } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export function PresidentMessage() {
    const { presidentMessage, governingBody } = teamData;
    const president = governingBody.find(m => m.role === "President") || governingBody[0];
    const containerRef = useRef<HTMLElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const imgY = useTransform(scrollYProgress, [0, 1], [-100, 100]);
    const textY = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const logoRotation = 0; // Keeping it straight as requested

    return (
        <section ref={containerRef} className="py-24 md:py-40 relative overflow-hidden group">


            {/* Background Logo Watermark - Straight and subtle */}
            <motion.div
                style={{ opacity: 0.05 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none z-0"
            >
                <Image
                    src="/logo.png"
                    alt="IGAC Logo Watermark"
                    fill
                    className="object-contain grayscale"
                />
            </motion.div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
                    {/* Image Column with Parallax */}
                    <div className="w-full lg:w-[45%] relative">
                        <motion.div style={{ y: imgY }} className="relative z-10">
                            <Reveal delay={0.2} width="100%">
                                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/10 group">
                                    <Image
                                        src={president.image}
                                        alt={president.name}
                                        fill
                                        className="object-cover object-top transition-transform duration-1000 group-hover:scale-110"
                                        priority
                                    />
                                    {/* Glassmorphism card attached to image - Moved inside frame */}
                                    <div className="absolute bottom-10 right-8 bg-black/60 backdrop-blur-xl border border-primary/30 p-8 rounded-2xl shadow-2xl hidden lg:block max-w-[280px] z-20">
                                        <Quote className="w-10 h-10 text-primary mb-4 opacity-80" />
                                        <p className="text-white text-lg font-serif italic leading-relaxed text-left">
                                            "Leading with integrity, vision, and action."
                                        </p>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#051b11] via-transparent to-transparent opacity-60" />
                                </div>
                            </Reveal>
                        </motion.div>
                    </div>

                    {/* Content Column with layered reveal */}
                    <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left">
                        <motion.div style={{ y: textY }}>
                            <Reveal delay={0.3}>
                                <div className="inline-flex items-center gap-4 mb-6">
                                    <div className="w-12 h-px bg-primary/50" />
                                    <span className="text-primary text-sm font-bold tracking-[0.5em] uppercase text-left">
                                        {presidentMessage.heading}
                                    </span>
                                </div>
                            </Reveal>

                            <Reveal delay={0.4}>
                                <h2 className="text-5xl md:text-7xl font-serif font-bold text-white mb-10 leading-[1.1] tracking-tight text-left">
                                    A Vision for <span className="text-primary">Global</span> Excellence<span className="text-primary">.</span>
                                </h2>
                            </Reveal>

                            <Reveal delay={0.5}>
                                <div className="relative group/text">
                                    <p className="text-xl md:text-2xl text-muted-foreground/90 leading-relaxed mb-12 italic font-serif relative z-10 pl-0 lg:pl-10 border-l-0 lg:border-l-2 border-primary/30 transition-all group-hover/text:border-primary duration-500 text-left">
                                        {presidentMessage.content}
                                    </p>
                                </div>
                            </Reveal>

                            <Reveal delay={0.6}>
                                <div className="flex flex-col items-center lg:items-start group/sig">
                                    <h4 className="text-3xl font-serif font-bold text-white mb-2 group-hover/sig:text-primary transition-colors duration-300 text-left">
                                        {presidentMessage.author}
                                    </h4>
                                    <div className="relative overflow-hidden pt-1">
                                        <p className="text-primary/70 text-sm font-bold uppercase tracking-[0.3em] text-left">
                                            {presidentMessage.role}
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
