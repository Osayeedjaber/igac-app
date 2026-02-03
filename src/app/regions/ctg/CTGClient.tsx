"use client";

import { teamData } from "@/config/site-data";
import { ProfileCard } from "@/components/ui/profile-card";
import { Reveal } from "@/components/motion/reveal";
import { motion } from "framer-motion";
import { Instagram, MapPin, Target, Anchor, Ship, Waves, Globe2, MousePointer2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button-premium";

export default function CTGRegionPage() {
    const ctgData = teamData.regions.ctg;

    return (
        <main className="min-h-screen bg-[#022c22] text-white overflow-x-hidden selection:bg-emerald-500/30">

            {/* --- 1. Gateway Hero Section --- */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-emerald-500/10">
                {/* Background Atmosphere */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)] opacity-60" />

                    {/* Precise Maritime Watermarks (Matched to Homepage/Team) */}
                    <div className="absolute top-[-10%] left-[-10%] opacity-[0.03] rotate-[-15deg] animate-pulse-slow">
                        <Anchor className="w-[800px] h-[800px] text-emerald-400" />
                    </div>
                    <div className="absolute bottom-[-10%] right-[-10%] opacity-[0.03] rotate-[15deg] animate-pulse-slow delay-1000">
                        <Ship className="w-[1000px] h-[1000px] text-emerald-400" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02]">
                        <Waves className="w-full h-full text-emerald-300" />
                    </div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <Reveal width="100%" className="flex flex-col items-center">
                        {/* Gateway Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-10 backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                        >
                            <Anchor className="w-5 h-5 text-emerald-400" />
                            <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.4em]">The Gateway Command</span>
                        </motion.div>

                        <h1 className="text-7xl md:text-[8rem] lg:text-[10rem] font-serif font-black text-white mb-8 tracking-tighter leading-[0.85] select-none">
                            Chattogram <br />
                            <span className="text-emerald-400 italic">Division<span className="text-amber-400">.</span></span>
                        </h1>

                        <p className="text-xl md:text-3xl text-emerald-100/60 font-medium leading-relaxed max-w-4xl mx-auto italic font-serif">
                            "{ctgData.description}"
                        </p>
                    </Reveal>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
                >
                    <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-500/50 font-bold">Scroll to Explore</span>
                    <div className="w-[1px] h-16 bg-gradient-to-b from-emerald-500/50 to-transparent" />
                </motion.div>
            </section>


            {/* --- 2. Leadership Showcase --- */}
            <section className="py-32 relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">

                        {/* Profile Card Area */}
                        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                            <Reveal delay={0.2} width="100%">
                                <div className="relative w-full max-w-[450px]">
                                    <div className="absolute -inset-10 bg-emerald-500/10 blur-[120px] rounded-full" />

                                    <div className="relative border-4 border-emerald-500/20 rounded-[3rem] p-3 bg-emerald-950/40 backdrop-blur-xl shadow-2xl hover:border-emerald-500/40 transition-colors duration-500">
                                        <ProfileCard
                                            {...ctgData.head}
                                            image="/ctghead.jpg"
                                            delay={0}
                                        />
                                    </div>

                                    {/* Visionary Badge */}
                                    <div className="absolute -top-6 -left-6 bg-[#022c22] border border-emerald-500/30 p-6 rounded-full shadow-xl hidden md:block animate-spin-slow-reverse">
                                        <Globe2 className="w-8 h-8 text-emerald-400" />
                                    </div>
                                </div>
                            </Reveal>
                        </div>

                        {/* Content Area */}
                        <div className="w-full lg:w-1/2">
                            <Reveal delay={0.3}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-[1px] w-12 bg-emerald-500/50" />
                                    <span className="text-emerald-400 font-bold tracking-[0.3em] uppercase text-xs">Regional Leadership</span>
                                </div>

                                <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight">
                                    Meet the <br /><span className="text-emerald-400 italic">Regional Head.</span>
                                </h2>

                                <p className="text-lg text-emerald-100/60 leading-relaxed mb-10 font-light border-l border-emerald-500/20 pl-6">
                                    Under the leadership of {ctgData.head.name}, IGAC Chattogram has grown into a vibrant hub for diplomatic discourse. We are committed to providing the youth of the port city with the same excellence and global perspective that IGAC is known for nationwide.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors group">
                                        <MapPin className="w-6 h-6 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                                        <h4 className="font-bold text-white mb-1">Local Reach</h4>
                                        <p className="text-xs text-emerald-100/50">Engaging students across all major institutions in CTG.</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors group">
                                        <Target className="w-6 h-6 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                                        <h4 className="font-bold text-white mb-1">Regional Goal</h4>
                                        <p className="text-xs text-emerald-100/50">Cultivating leadership and global awareness locally.</p>
                                    </div>
                                </div>

                                <Link href={ctgData.instagram} target="_blank">
                                    <Button variant="primary" className="gap-3 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                        <Instagram className="w-4 h-4" />
                                        Follow IGAC CTG
                                    </Button>
                                </Link>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section>


            {/* --- 3. CTG Core Panel (Grid) --- */}
            {ctgData.corePanel && ctgData.corePanel.length > 0 && (
                <section className="py-32 border-t border-emerald-500/10">
                    <div className="container mx-auto px-6 max-w-[1400px]">
                        <Reveal width="100%" className="mb-20 text-center">
                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">Regional Hub</span>
                            <h2 className="text-5xl md:text-7xl font-serif font-black text-white tracking-tighter">
                                CTG Core <span className="text-emerald-400 italic">Panel.</span>
                            </h2>
                        </Reveal>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {ctgData.corePanel.map((member: any, i: number) => (
                                <Reveal key={i} delay={i * 0.1}>
                                    <ProfileCard {...member} delay={0} />
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}


            {/* --- 4. Department Heads & Deputies --- */}
            <section className="py-32 border-t border-emerald-500/10 bg-[#01221a]">
                <div className="container mx-auto px-6 max-w-[1400px]">

                    {/* Heads */}
                    {ctgData.heads && ctgData.heads.length > 0 && (
                        <div className="mb-32">
                            <Reveal width="100%" className="mb-16 text-center">
                                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">Chattogram Execution</span>
                                <h2 className="text-4xl md:text-6xl font-serif font-black text-white tracking-tighter">
                                    Department Heads <span className="text-emerald-400 italic">(CTG)</span>
                                </h2>
                            </Reveal>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {ctgData.heads.map((member: any, i: number) => (
                                    <Reveal key={i} delay={i * 0.1}>
                                        <ProfileCard {...member} image="/logo.png" delay={0} />
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Deputies */}
                    {ctgData.deputies && ctgData.deputies.length > 0 && (
                        <div>
                            <Reveal width="100%" className="mb-16 text-center">
                                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">Chattogram Support</span>
                                <h2 className="text-4xl md:text-6xl font-serif font-black text-white tracking-tighter">
                                    Deputy Heads <span className="text-emerald-400 italic">(CTG)</span>
                                </h2>
                            </Reveal>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {ctgData.deputies.map((member: any, i: number) => (
                                    <Reveal key={i} delay={i * 0.1}>
                                        <ProfileCard {...member} image="/logo.png" delay={0} />
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </section>


            {/* --- 5. Cinematic Footer --- */}
            <section className="py-24 border-t border-emerald-500/10 bg-gradient-to-b from-[#022c22] to-black text-center">
                <Reveal width="100%">
                    <div className="flex flex-col items-center pt-10">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="mb-6"
                        >
                            <MousePointer2 className="w-10 h-10 text-emerald-500" />
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl font-serif font-black text-white mb-6">
                            Part of the <br /> <span className="text-emerald-400 italic">Global Family.</span>
                        </h2>
                        <Link href="/join">
                            <Button variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white">
                                Become a Member
                            </Button>
                        </Link>
                    </div>
                </Reveal>
            </section>

        </main>
    );
}
