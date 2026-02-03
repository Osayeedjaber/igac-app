"use client";

import ShinyText from "@/components/ShinyText";
import TextType from "@/components/TextType";

import { motion } from "framer-motion";
import { WordReveal } from "@/components/motion/word-reveal";
import { Reveal } from "@/components/motion/reveal";
import Image from "next/image";
import { Button } from "@/components/ui/button-premium";
import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";

export function Hero() {
    return (
        <section
            className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden px-6 pt-20 group"
        >
            <div className="container max-w-5xl mx-auto flex flex-col items-center text-center z-10">

                {/* Assembling Logo/Title */}
                <div className="mb-10 relative w-64 h-64 md:w-80 md:h-80">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="w-full h-full relative"
                    >
                        <Image
                            src="/logo.png"
                            alt="IGAC Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </motion.div>
                </div>

                <div className="flex flex-col items-center w-full max-w-[95vw] mx-auto text-center">
                    <h1 className="w-full whitespace-nowrap text-[3.5vw] md:text-5xl lg:text-6xl xl:text-7xl font-bold font-serif mb-6 tracking-tight drop-shadow-xl leading-none text-center">
                        <ShinyText
                            text="International Global Affairs Council"
                            disabled={false}
                            speed={15}
                            delay={2}
                            className="text-center mx-auto block"
                            color="#f8fafc"
                            shineColor="#d4af37"
                            spread={90}
                        />
                    </h1>

                    <div className="text-xl md:text-2xl text-muted-foreground uppercase tracking-[0.2em] font-light mb-12 flex flex-col md:flex-row flex-wrap items-center justify-center gap-2 text-center w-full">
                        <span>Forging the</span>
                        <span className="font-bold text-[#d4af37] min-w-[120px] text-center">
                            <TextType
                                text={["Diplomats", "Leaders", "Changemakers"]}
                                loop={true}
                                cursorCharacter="_"
                                typingSpeed={100}
                                deletingSpeed={50}
                                pauseDuration={2000}
                            />
                        </span>
                        <span>of Tomorrow</span>
                    </div>
                </div>

                {/* Word-by-word Intro */}
                <div className="max-w-4xl flex flex-col items-center">
                    <Reveal delay={1.5} width="100%" className="flex flex-col items-center">
                        <div className="text-lg md:text-2xl text-muted-foreground/80 leading-relaxed font-light text-center flex flex-col items-center italic">
                            <WordReveal
                                text="The governing body of South East Asia's largest Model United Nations."
                                delay={1.6}
                                className="justify-center text-center"
                            />
                        </div>
                    </Reveal>
                </div>

                {/* CTA */}
                <Reveal delay={3.0}>
                    <div className="mt-12 flex flex-wrap gap-6 justify-center">
                        <Link href="/join">
                            <Button withArrow variant="magic" size="lg">
                                Join Us
                            </Button>
                        </Link>
                        <Link href="/about">
                            <Button variant="outline" size="lg">
                                Our Mission
                            </Button>
                        </Link>
                    </div>
                </Reveal>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
                <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
            </motion.div>
        </section >
    );
}
