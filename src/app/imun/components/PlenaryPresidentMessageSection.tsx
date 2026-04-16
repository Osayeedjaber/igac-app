"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Quote } from "lucide-react";
import Image from "next/image";

export default function PlenaryPresidentMessageSection() {
    const containerRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const imageY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
    const textY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

    return (
        <section
            ref={containerRef}
            className="w-full relative min-h-screen py-12 lg:py-16 bg-transparent flex items-center justify-center"
        >
            {/* Background Texture & Gradients */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-[#f2c45f]/5 rounded-full blur-[150px] pointer-events-none transform -translate-x-1/3 -translate-y-1/4" />
                <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-[#b38e36]/5 rounded-full blur-[130px] pointer-events-none transform translate-x-1/4 translate-y-1/4" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            </div>

            <div className="container mx-auto px-6 relative z-10 2xl:max-w-[1400px]">
                <div className="flex flex-col lg:flex-row-reverse items-center justify-between gap-8 lg:gap-12 xl:gap-20">

                    {/* Right Side - Image Core (But visually on the right due to row-reverse) */}
                    <div className="w-full lg:w-5/12 relative mt-4 lg:mt-0">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full aspect-[3/4] sm:aspect-[4/5] max-w-[380px] lg:max-w-[420px] mx-auto lg:ml-auto lg:mr-0"
                        >
                            {/* Elegant Architectural Frame */}
                            <div className="absolute inset-0 border border-white/10 -translate-x-4 translate-y-4 rounded-sm z-0" />
                            <div className="absolute inset-0 border border-[#f2c45f]/40 translate-x-4 -translate-y-4 rounded-sm z-0" />

                            <div className="absolute -top-6 -right-6 w-12 h-12 border-t border-r border-[#f2c45f] z-20" />
                            <div className="absolute -bottom-6 -left-6 w-12 h-12 border-b border-l border-[#f2c45f] z-20" />

                            {/* Main Image Container */}
                            <motion.div
                                style={{ y: imageY }}
                                className="w-full h-full relative rounded-sm overflow-hidden bg-[#151515] border border-white/5 z-10 shadow-[0_0_60px_rgba(242,196,95,0.15)] group"
                            >
                                <Image
                                    src="/governing-panel/chairman.jpg"
                                    alt="Plenary President"
                                    fill
                                    className="object-cover object-top transition-all duration-700 ease-in-out scale-105 group-hover:scale-100"
                                />

                                {/* Overlay Gradient for drama */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/20 to-transparent z-20 pointer-events-none" />

                                {/* Subtitle overlay */}
                                <div className="absolute bottom-6 right-6 z-30 transition-transform duration-500 group-hover:-translate-x-2 text-right">
                                    <div className="w-6 h-px bg-[#f2c45f] mb-2 ml-auto" />
                                    <p className="text-white font-secondary text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold drop-shadow-md">Plenary President</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Left Side - Message Content (But visually on the left due to row-reverse) */}
                    <motion.div
                        style={{ y: textY }}
                        className="w-full lg:w-7/12 flex flex-col justify-center mt-8 lg:mt-0"
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                            className="mb-6 lg:mb-8"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-px w-10 bg-[#f2c45f]" />
                                <span className="text-[#f2c45f] font-secondary tracking-[0.2em] text-[10px] uppercase font-bold">
                                    Official Welcome
                                </span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-primary text-white mb-2 lg:mb-4 leading-tight tracking-tight">
                                Letter from the <br />
                                <span className="italic font-light text-[#f2c45f]">
                                    Plenary President
                                </span>
                            </h2>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                            className="relative flex flex-col gap-4 lg:gap-6"
                        >
                            {/* Inline Quote Block */}
                            <div className="flex gap-4 lg:gap-6 items-start border-b border-white/10 pb-4 lg:pb-6">
                                <Quote className="w-8 h-8 md:w-12 md:h-12 text-[#f2c45f]/40 flex-shrink-0 mt-1" />
                                <p className="font-primary text-xl md:text-2xl text-white leading-snug">
                                    "A thriving society requires the unyielding courage of individuals who are willing to bridge the gap between conflict and consensus."
                                </p>
                            </div>

                            <div className="prose prose-invert max-w-none font-secondary text-neutral-300 leading-relaxed text-sm md:text-base lg:pb-0">
                                <p className="mb-4">
                                    <strong className="text-[#f2c45f] font-primary text-lg uppercase tracking-widest mr-2">Honorable Participants,</strong>
                                    I warmly welcome you to this iteration of Imperial Model United Nations. This platform exists to echo the principles of harmonious cooperation and intellectual debate that shape the future we dare to envision.
                                </p>

                                {/* Accentuated Callout Box */}
                                <div className="pr-4 lg:pr-6 border-r-2 border-[#f2c45f] bg-gradient-to-l from-[#f2c45f]/5 to-transparent py-3 lg:py-4 rounded-l-lg mb-4 text-right">
                                    <p className="text-white/90 italic text-base font-light">
                                        Together, we must illuminate the path through meticulous strategy, patience, and profound diplomatic empathy.
                                    </p>
                                </div>

                                <p className="mb-0">
                                    The decisions we forge here extend far beyond these walls. They carry the weight of tomorrow. I expect nothing but the highest standard of excellence and collaboration. Let the sessions commence.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                            className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/10 pt-6 gap-6"
                        >
                            <div>
                                {/* Premium Special Signature */}
                                <h3 className="text-2xl lg:text-3xl font-primary font-bold tracking-wide mb-1 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-[#f2c45f] to-amber-600 drop-shadow-[0_0_15px_rgba(242,196,95,0.4)] custom-signature">
                                    Marzia Jannat Tayeba
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                                    <span className="font-secondary tracking-[0.2em] text-[#f2c45f] text-[10px] sm:text-xs uppercase font-bold">
                                        Plenary President
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-white/40 hidden sm:block" />
                                    <span className="font-secondary tracking-[0.2em] text-white/90 text-[10px] sm:text-xs uppercase font-bold">
                                        Imperial Model United Nations <span className="text-[#f2c45f]/50 mx-1">•</span> Session II
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
