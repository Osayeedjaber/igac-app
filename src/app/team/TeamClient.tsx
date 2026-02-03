"use client";

import { teamData } from "@/config/site-data";
import { ProfileCard } from "@/components/ui/profile-card";
import { Reveal } from "@/components/motion/reveal";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { Anchor, Ship, Waves, MousePointer2, Shield, Zap, Award, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function TeamPage() {
    const ctgData = teamData.regions.ctg;

    // Group Core Panel by role for the tiered showcase
    const coreTiers = {
        gs: teamData.corePanel.filter(m => m.role === "General Secretary"),
        ags: teamData.corePanel.filter(m => m.role === "Add. General Secretary"),
        js: teamData.corePanel.filter(m => m.role === "Joint Secretary"),
        os: teamData.corePanel.filter(m => m.role === "Organizing Secretary")
    };

    return (
        <main className="min-h-screen pt-20 pb-32 overflow-hidden bg-background relative selection:bg-primary selection:text-background">
            {/* Cinematic Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 blur-[180px] rounded-full -translate-y-1/2 translate-x-1/4 opacity-60" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full translate-y-1/4 -translate-x-1/4 opacity-40" />
            </div>

            {/* 1. Hero Section */}
            <section className="h-[60vh] flex flex-col items-center justify-center relative px-6 mb-20">
                <div className="relative w-full max-w-[1400px] h-64 md:h-80 mx-auto">
                    <TextHoverEffect text="THE TEAM" />
                </div>

                <Reveal delay={0.5} className="flex flex-col items-center text-center mt-[-40px]">
                    <span className="text-primary text-[10px] font-black uppercase tracking-[1em] mb-8 block animate-pulse">
                        Engineers of Diplomacy
                    </span>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-[1400px] font-serif italic leading-relaxed opacity-80">
                        Forging the future through strategic leadership and unwavering dedication.
                    </p>
                </Reveal>
            </section>

            {/* 2. Governing Body */}
            <section className="w-full max-w-[1600px] mx-auto px-6 mb-48 relative z-10">
                <div className="mb-24 flex flex-col items-center">
                    <Reveal>
                        <h2 className="text-5xl md:text-8xl font-serif font-black text-white mb-4 tracking-tighter text-center">
                            Governing <span className="text-primary italic">Body.</span>
                        </h2>
                    </Reveal>
                    <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mt-6" />
                </div>

                <div className="grid md:grid-cols-3 gap-12 max-w-[1400px] mx-auto">
                    {teamData.governingBody.map((member, i) => (
                        <div key={i} className="group relative">
                            <ProfileCard {...member} delay={0.2 + i * 0.15} />
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Core Panel - Hierarchical but flat labels */}
            <section className="w-full max-w-[1800px] mx-auto px-6 mb-64 relative z-10">
                <div className="bg-[#020d08] border border-emerald-900/40 rounded-[5rem] p-12 md:p-32 overflow-hidden relative shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
                    <Reveal width="100%" className="mb-32 flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-6">
                            <Shield className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest text-center">Administrative Core</span>
                        </div>
                        <h2 className="text-6xl md:text-9xl font-serif font-black text-white text-center leading-none mx-auto w-full tracking-tighter mb-16">
                            The Core <span className="text-primary italic">Panel.</span>
                        </h2>
                    </Reveal>

                    {/* General Secretary */}
                    <div className="flex justify-center mb-32">
                        <div className="w-full max-w-xl text-center">
                            <ProfileCard {...coreTiers.gs[0]} />
                        </div>
                    </div>

                    {/* Add. General Secretary */}
                    <div className="flex justify-center mb-32">
                        <div className="w-full max-w-lg text-center">
                            <ProfileCard {...coreTiers.ags[0]} />
                        </div>
                    </div>

                    {/* Joint Secretaries */}
                    <div className="mb-32">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-[1400px] mx-auto">
                            {coreTiers.js.map((member: any, i: number) => (
                                <ProfileCard key={i} {...member} delay={i * 0.15} />
                            ))}
                        </div>
                    </div>

                    {/* Organizing Secretaries */}
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-[1400px] mx-auto">
                            {coreTiers.os.map((member: any, i: number) => (
                                <ProfileCard key={i} {...member} delay={i * 0.1} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Department Heads (Main) */}
            <section className="w-full max-w-[1600px] mx-auto px-6 mb-48 relative z-10 text-center">
                <Reveal width="100%" className="mb-20 flex flex-col items-center">
                    <Award className="w-10 h-10 text-primary mb-6" />
                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 text-center">The Front Line</span>
                    <h2 className="text-5xl md:text-8xl font-serif font-black text-white text-center tracking-tighter mx-auto w-full">Department <span className="text-primary italic">Heads.</span></h2>
                    <div className="w-16 h-1 bg-primary/20 mt-10 rounded-full" />
                </Reveal>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-[1400px] mx-auto">
                    {teamData.heads.map((member: any, i: number) => (
                        <ProfileCard key={i} {...member} image={member.image || "/logo.png"} delay={i * 0.1} />
                    ))}
                </div>
            </section>

            {/* 7. Deputies (Main) */}
            <section className="w-full max-w-[1600px] mx-auto px-6 mb-48 relative z-10 text-center">
                <Reveal width="100%" className="mb-20 flex flex-col items-center">
                    <Zap className="w-8 h-8 text-primary/60 mb-6" />
                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-4 text-center">Operational Support</span>
                    <div className="mb-20">
                        <h2 className="text-5xl md:text-8xl font-serif font-black text-white text-center tracking-tighter mx-auto w-full">Deputy <span className="text-primary italic">Heads.</span></h2>
                    </div>
                </Reveal>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-[1400px] mx-auto">
                    {teamData.deputies.map((member: any, i: number) => (
                        <ProfileCard key={i} {...member} image={member.image || "/logo.png"} delay={i * 0.05} />
                    ))}
                </div>
            </section>

            {/* REGIONAL HUB START */}

            {/* 3. Regional Head (Chattogram) - Emerald/Teal Theme */}
            <section className="relative py-48 mb-48 overflow-hidden bg-[#022c22]/50 border-y border-emerald-500/20 backdrop-blur-3xl group/ctg">
                {/* Aggressive Maritime Watermarks */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] opacity-[0.05] rotate-[-15deg] group-hover/ctg:rotate-0 transition-transform duration-[3s]">
                        <Anchor className="w-[600px] h-[600px] text-emerald-400" />
                    </div>
                    <div className="absolute bottom-[-10%] right-[-10%] opacity-[0.05] rotate-[15deg] group-hover/ctg:rotate-0 transition-transform duration-[3s]">
                        <Ship className="w-[800px] h-[800px] text-cyan-400" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]">
                        <Waves className="w-full h-full text-emerald-300" />
                    </div>
                </div>

                <div className="w-full max-w-[1400px] mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="w-full lg:w-1/2 order-2 lg:order-1 text-left">
                            <Reveal delay={0.2} className="flex flex-col items-start">
                                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                    <Anchor className="w-5 h-5 text-emerald-400" />
                                    <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]">The Gateway Command</span>
                                </div>
                                <h1 className="text-6xl md:text-9xl font-serif font-black text-white mb-6 tracking-tight">
                                    Chattogram <br /><span className="text-emerald-400 italic">Division.</span>
                                </h1>
                                <p className="text-xl md:text-3xl text-emerald-100/70 font-medium leading-relaxed mb-12 max-w-xl">
                                    Steering the commercial pulse of the nation with maritime precision and diplomatic excellence.
                                </p>
                            </Reveal>
                        </div>

                        <div className="w-full lg:w-1/2 order-1 lg:order-2 flex justify-center">
                            <Reveal delay={0.4} width="100%">
                                <div className="max-w-md relative group">
                                    <div className="absolute -inset-10 bg-emerald-500/20 blur-[100px] rounded-full group-hover:bg-cyan-500/30 transition-all duration-1000" />
                                    <div className="relative border-4 border-emerald-500/30 rounded-[2.5rem] p-2 bg-emerald-950/20 backdrop-blur-md">
                                        <ProfileCard {...ctgData.head} />
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. CTG Core Panel */}
            {ctgData.corePanel && ctgData.corePanel.length > 0 && (
                <section className="w-full max-w-[1600px] mx-auto px-6 mb-48 relative z-10 text-center">
                    <Reveal width="100%" className="mb-20 flex flex-col items-center">
                        <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4 text-center">Regional Hub</span>
                        <div className="mb-20">
                            <h2 className="text-5xl md:text-8xl font-serif font-black text-white text-center tracking-tighter mx-auto w-full">CTG Core <span className="text-emerald-400 italic">Panel.</span></h2>
                        </div>
                    </Reveal>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-[1400px] mx-auto">
                        {ctgData.corePanel.map((member: any, i: number) => (
                            <ProfileCard key={i} {...member} delay={i * 0.05} />
                        ))}
                    </div>
                </section>
            )}

            {/* 8. CTG Regional Sections */}
            {ctgData.heads && ctgData.heads.length > 0 && (
                <section className="w-full max-w-[1600px] mx-auto px-6 mb-48 relative z-10 text-center">
                    <Reveal width="100%" className="mb-20 flex flex-col items-center">
                        <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4 text-center">Chattogram Execution</span>
                        <div className="mb-20">
                            <h2 className="text-5xl md:text-8xl font-serif font-black text-white text-center tracking-tighter mx-auto w-full">Department Heads <span className="text-emerald-400 italic">(CTG).</span></h2>
                        </div>
                    </Reveal>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-[1400px] mx-auto">
                        {ctgData.heads.map((member: any, i: number) => (
                            <ProfileCard key={i} {...member} image="/logo.png" delay={i * 0.1} />
                        ))}
                    </div>
                </section>
            )}

            {ctgData.deputies && ctgData.deputies.length > 0 && (
                <section className="w-full max-w-[1600px] mx-auto px-6 mb-48 relative z-10 text-center">
                    <Reveal width="100%" className="mb-20 flex flex-col items-center">
                        <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4 text-center">Chattogram Support</span>
                        <div className="mb-20">
                            <h2 className="text-5xl md:text-8xl font-serif font-black text-white text-center tracking-tighter mx-auto w-full">Deputy Heads <span className="text-emerald-400 italic">(CTG).</span></h2>
                        </div>
                    </Reveal>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-[1400px] mx-auto">
                        {ctgData.deputies.map((member: any, i: number) => (
                            <ProfileCard key={i} {...member} image="/logo.png" delay={i * 0.05} />
                        ))}
                    </div>
                </section>
            )}

            {/* Cinematic Ending */}
            <section className="py-48 flex flex-col items-center justify-center relative">
                <Reveal width="100%" className="flex flex-col items-center pt-10">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="mb-8 flex justify-center w-full"
                    >
                        <MousePointer2 className="w-12 h-12 text-primary" />
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-serif font-black text-white mb-6 text-center">Built by Visionaries. <br />Controlled by <span className="text-primary italic">You.</span></h2>
                    <p className="text-muted-foreground uppercase tracking-[0.4em] text-xs text-center">International Global Affairs Council</p>
                </Reveal>
            </section>
        </main>
    );
}
