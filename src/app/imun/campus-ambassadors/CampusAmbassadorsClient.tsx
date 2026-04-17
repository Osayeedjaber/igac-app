"use client";

import { motion } from "framer-motion";
import { Users, Award, Star, Map } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export default function CampusAmbassadorsClient() {
    return (
        <main className="min-h-screen bg-[#111111] text-[#f2c45f] mx-auto selection:bg-[#f2c45f]/30 selection:text-[#111111] relative overflow-clip w-full pt-32 pb-24">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.03)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10 2xl:max-w-[1400px]">
                
                {/* Header & Empty State Call to Action */}
                <div className="text-center max-w-4xl mx-auto mb-20">
                    <Reveal>
                        <h1 className="font-primary font-bold text-4xl md:text-5xl lg:text-7xl text-white mb-6 uppercase tracking-tight">
                            Global <span className="text-[#f2c45f]">Ambassadors</span>
                        </h1>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-light mx-auto max-w-2xl">
                            Our network of campus leaders bridging the gap between their institutions and the international stage of Imperial MUN.
                        </p>
                    </Reveal>
                </div>

                <div className="mt-12 text-center">
                    <Reveal delay={0.2}>
                        <div className="p-8 border border-[#f2c45f]/10 rounded-2xl bg-white/[0.02] backdrop-blur-sm relative overflow-hidden group inline-block max-w-md">
                           <div className="absolute inset-0 bg-gradient-to-br from-[#f2c45f]/5 to-transparent pointer-events-none" />
                           <p className="text-[#f2c45f] font-medium text-lg relative z-10 font-inter">
                               Applications for the Campus Ambassador program are now open.
                           </p>
                        </div>
                    </Reveal>
                </div>
            </div>
        </main>
    );
}
