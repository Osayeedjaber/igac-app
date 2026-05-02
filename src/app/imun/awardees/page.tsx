"use client";

import { motion } from "framer-motion";
import { ChevronRight, MoveRight, Trophy, Crown, Star, Medal } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";

export default function AwardeesPage() {
    return (
        <main className="min-h-screen bg-[#111111] text-[#f2c45f] mx-auto selection:bg-[#f2c45f]/30 selection:text-[#111111] relative overflow-clip w-full pt-32 pb-24">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.04)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10 2xl:max-w-[1400px]">
                
                {/* Header & Empty State Call to Action */}
                <div className="text-center max-w-4xl mx-auto mb-24">
                    <Reveal width="100%">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-[#f2c45f]/10 border border-[#f2c45f]/30 flex items-center justify-center shadow-[0_0_30px_rgba(242,196,95,0.2)]">
                                <Trophy className="w-8 h-8 text-[#f2c45f]" />
                            </div>
                        </div>
                        <h1 className="font-primary font-bold text-4xl md:text-5xl lg:text-7xl text-white mb-6 uppercase tracking-tight">
                            Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-[#f2c45f] to-amber-600">Honors</span>
                        </h1>
                        <p className="font-secondary text-neutral-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto italic">
                            This monumental gallery is reserved for the finest diplomats and visionary Campus Ambassadors. 
                            The session has not yet commenced. Will your name be elegantly etched in history as the Best Delegate or Outstanding Campus Ambassador?
                        </p>
                        
                        <div className="flex justify-center w-full mt-6">
                            <Link href="/imun/register" className="w-full sm:w-auto inline-flex justify-center">
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group relative px-6 md:px-10 py-5 rounded-full border border-[#f2c45f]/30 bg-[#111111]/80 backdrop-blur-xl shadow-[0_0_30px_rgba(242,196,95,0.1)] hover:shadow-[0_0_50px_rgba(242,196,95,0.2)] hover:border-[#f2c45f]/60 hover:bg-[#f2c45f]/10 overflow-hidden transition-all duration-500 flex items-center justify-center gap-4 w-full sm:w-auto"
                                >
                                    {/* Hover Glow Sweep */}
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#f2c45f]/10 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out z-0" />
                                    
                                    <span className="relative z-10 font-secondary font-bold text-[#f2c45f] tracking-[0.1em] md:tracking-[0.2em] uppercase text-xs md:text-sm whitespace-nowrap">
                                        SECURE YOUR POSITION
                                    </span>
                                    <MoveRight className="relative z-10 w-4 h-4 md:w-5 md:h-5 text-[#f2c45f] group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" />
                                </motion.button>
                            </Link>
                        </div>
                    </Reveal>
                </div>

                {/* Anticipated Awards Showcase Structure */}
                <div className="grid md:grid-cols-2 gap-8 lg:gap-16 max-w-5xl mx-auto opacity-50 grayscale pointer-events-none select-none">
                    
                    <Reveal delay={0.2} className="relative group" width="100%">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#f2c45f]/5 to-transparent border border-white/10 rounded-3xl group-hover:border-[#f2c45f]/30 transition-colors" />
                        <div className="relative p-10 flex flex-col items-center text-center">
                            <Crown className="w-12 h-12 text-[#f2c45f] mb-6 opacity-60" />
                            <h3 className="font-primary text-2xl font-bold uppercase tracking-widest text-white mb-3">
                                Best Campus Ambassador
                            </h3>
                            <div className="w-12 h-px bg-[#f2c45f]/50 mb-6" />
                            <div className="w-full h-32 flex flex-col items-center justify-center bg-black/50 rounded-xl border border-white/5 border-dashed">
                                <span className="font-secondary uppercase tracking-[0.3em] text-xs text-neutral-600 font-bold">To Be Announced</span>
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={0.3} className="relative group" width="100%">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#f2c45f]/5 to-transparent border border-white/10 rounded-3xl group-hover:border-[#f2c45f]/30 transition-colors" />
                        <div className="relative p-10 flex flex-col items-center text-center">
                            <Medal className="w-12 h-12 text-[#f2c45f] mb-6 opacity-60" />
                            <h3 className="font-primary text-2xl font-bold uppercase tracking-widest text-white mb-3">
                                Outstanding Campus Ambassador
                            </h3>
                            <div className="w-12 h-px bg-[#f2c45f]/50 mb-6" />
                            <div className="w-full h-32 flex flex-col items-center justify-center bg-black/50 rounded-xl border border-white/5 border-dashed">
                                <span className="font-secondary uppercase tracking-[0.3em] text-xs text-neutral-600 font-bold">To Be Announced</span>
                            </div>
                        </div>
                    </Reveal>

                </div>

                {/* Additional Information for Delegates */}
                <div className="max-w-4xl mx-auto mt-20 text-center">
                    <Reveal delay={0.4} width="100%">
                        <div className="p-8 md:p-12 bg-[#151515]/50 border border-[#f2c45f]/10 rounded-3xl shadow-lg relative overflow-hidden backdrop-blur-sm">
                            <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
                                <Star className="w-64 h-64 text-[#f2c45f]" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-primary text-2xl md:text-3xl font-bold text-white mb-4 uppercase tracking-widest">
                                    Committees' Finest
                                </h3>
                                <p className="font-secondary text-neutral-400 text-lg leading-relaxed italic max-w-2xl mx-auto">
                                    All of the committees' Best and Outstanding Delegates will also be proudly featured and posted in here once the session concludes.
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </div>

            </div>
        </main>
    );
}
