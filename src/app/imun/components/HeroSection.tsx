"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Crown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export const GoldenDust = () => {
    const [particles, setParticles] = useState<{ id: number, size: number, x: number, y: number, duration: number, delay: number }[]>([]);

    useEffect(() => {
        const generated = Array.from({ length: 80 }).map((_, i) => ({
            id: i,
            size: Math.random() * 4 + 1,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5
        }));
        setParticles(generated);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute bg-[#f2c45f] rounded-full"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        boxShadow: `0 0 ${Math.floor(p.size * 2)}px ${Math.floor(p.size / 2)}px rgba(242,196,95,0.4)`,
                    }}
                    animate={{ y: ["0vh", "-100vh"], opacity: [0, 1, 0] }}
                    transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
                />
            ))}
        </div>
    );
};

export default function HeroSection() {
    const { scrollYProgress } = useScroll();
    const yTransform = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacityTransform = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

    return (
        <section className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-transparent selection:bg-[#f2c45f]/30 -mt-20">
            {/* Ambient Grandeur Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.02)_0%,transparent_70%)] pointer-events-none z-0" />
            <GoldenDust />

            {/* Majestic Architecture Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] md:w-[1200px] md:h-[1200px] opacity-25 pointer-events-none z-0 flex items-center justify-center">
                {/* Outer Ring */}
                <motion.div
                    className="absolute w-full h-full border-[1px] border-[#f2c45f]/20 rounded-full"
                    animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                />
                {/* Middle Dashed Ring */}
                <motion.div
                    className="absolute w-[85%] h-[85%] border-[1px] border-[#f2c45f]/20 rounded-full border-dashed"
                    animate={{ rotate: -360, scale: [1, 0.98, 1] }}
                    transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
                />
                {/* Inner Dotted Ring */}
                <motion.div
                    className="absolute w-[70%] h-[70%] border-[2px] border-[#f2c45f]/15 rounded-full border-dotted"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
                />
            </div>

            <motion.div
                style={{ y: yTransform, opacity: opacityTransform }}
                className="relative z-20 flex flex-col items-center justify-center w-full px-4 pt-32 pb-20"
            >
                {/* Prestige Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 mb-6 z-30"
                >
                    <motion.div
                        className="absolute inset-0 bg-[#f2c45f]/20 blur-3xl rounded-full"
                        animate={{ opacity: [0.15, 0.4, 0.15] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <Image
                        src="/Imun/Logo/Golden.png"
                        alt="IMUN Golden Logo"
                        fill
                        className="object-contain drop-shadow-[0_0px_30px_rgba(242,196,95,0.4)] z-10"
                        priority
                        unoptimized
                    />
                </motion.div>

                {/* Monumental Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                    className="text-center z-30 w-full px-2"
                >
                    <h1 className="font-primary font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[70px] text-transparent bg-clip-text bg-gradient-to-b from-[#ffedb3] via-[#f2c45f] to-[#cca63b] leading-[1.2] tracking-[0.05em] md:tracking-[0.1em] uppercase whitespace-normal sm:whitespace-nowrap">
                        IMPERIAL MODEL <br className="block sm:hidden" /> UNITED NATIONS
                    </h1>
                </motion.div>

                {/* Powerful Tagline */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.6 }}
                    className="mt-4 md:mt-6 z-30"
                >
                    <h2 className="font-primary font-medium text-xs md:text-base lg:text-xl text-[#f2c45f] uppercase tracking-[0.2em] md:tracking-[0.4em] drop-shadow-sm whitespace-nowrap text-center">
                        THE PROPHECY BEGINS
                    </h2>
                </motion.div>

                {/* Elegant Separator */}
                <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.9 }}
                    className="flex items-center justify-center gap-6 mt-10 w-full max-w-[600px] opacity-70 z-30"
                >
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-[#f2c45f]/50 to-[#f2c45f]/80 w-1/3" />
                    <Crown
                        className="w-6 h-6 md:w-8 md:h-8 text-[#f2c45f] drop-shadow-sm"
                        strokeWidth={1.5}
                    />
                    <div className="h-[1px] bg-gradient-to-l from-transparent via-[#f2c45f]/50 to-[#f2c45f]/80 w-1/3" />
                </motion.div>

                {/* Organization Endorsement */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="mt-14 z-30 w-full flex justify-center"
                >
                    <p className="font-secondary text-[10px] md:text-xs lg:text-sm text-[#f2c45f]/80 uppercase tracking-[0.15em] md:tracking-[0.25em] whitespace-nowrap text-center px-4 md:px-8">
                        ORGANIZED BY THE INTERNATIONAL GLOBAL AFFAIRS COUNCIL
                    </p>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10 cursor-pointer"
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
            >
                <span className="font-primary text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#f2c45f]/50">
                    Descend
                </span>
                <ChevronDown className="w-5 h-5 text-[#f2c45f]/50" />
            </motion.div>
        </section>
    );
}

