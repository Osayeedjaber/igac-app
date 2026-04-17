"use client";

import { motion } from "framer-motion";
import { Trophy, Crown, Star, Medal } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export default function AwardeesClient() {
    return (
        <main className="min-h-screen bg-[#111111] text-[#f2c45f] mx-auto selection:bg-[#f2c45f]/30 selection:text-[#111111] relative overflow-clip w-full pt-32 pb-24">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.04)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10 2xl:max-w-[1400px]">
                
                {/* Header & Empty State Call to Action */}
                <div className="text-center max-w-4xl mx-auto mb-24">
                    <Reveal>
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f2c45f]/20 to-transparent border border-[#f2c45f]/20 flex items-center justify-center relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#f2c45f] to-[#d4af37] opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                                <Trophy className="w-8 h-8 text-[#f2c45f] relative z-10" />
                            </div>
                        </div>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <h1 className="font-primary font-bold text-4xl md:text-6xl lg:text-7xl text-white mb-8 uppercase tracking-tight">
                            The Hall of <span className="text-[#f2c45f]">Excellence</span>
                        </h1>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-light mx-auto max-w-2xl">
                            Recognizing the diplomats who defined the standards of debate, leadership, and negotiation at Imperial MUN Session II.
                        </p>
                    </Reveal>
                    <Reveal delay={0.3}>
                        <div className="mt-12 p-8 border border-[#f2c45f]/10 rounded-2xl bg-white/[0.02] backdrop-blur-sm relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-[#f2c45f]/5 to-transparent pointer-events-none" />
                           <p className="text-[#f2c45f] font-medium text-lg relative z-10">
                               Awards will be officially announced after the conference concludes.
                           </p>
                        </div>
                    </Reveal>
                </div>
            </div>
        </main>
    );
}
