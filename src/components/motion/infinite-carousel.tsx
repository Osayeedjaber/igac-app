"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { teamData } from "@/config/site-data";
import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";

// Triple for infinite loop and better coverage
const carouselItems = [...teamData.corePanel, ...teamData.corePanel, ...teamData.corePanel];

export function InfiniteCarousel() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="relative w-full overflow-hidden py-24">
            {/* Background decorative elements */}

            {/* Gradient masks for smooth fade edges - Deepened for luxury feel */}
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-[#051b11] via-[#051b11]/80 to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-[#051b11] via-[#051b11]/80 to-transparent z-20 pointer-events-none" />

            {/* The Moving Track */}
            <div className="flex w-fit animate-infinite-scroll group/track">
                {/* We render the set twice to ensure seamless looping */}
                {[0, 1].map((setIndex) => (
                    <div key={setIndex} className="flex gap-8 px-4">
                        {teamData.corePanel.map((member, idx) => {
                            const globalIdx = setIndex * teamData.corePanel.length + idx;
                            const isHovered = hoveredIndex === globalIdx;
                            const isAnyHovered = hoveredIndex !== null;
                            const socials = member.socials as any;

                            return (
                                <div
                                    key={`${globalIdx}`}
                                    onMouseEnter={() => setHoveredIndex(globalIdx)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    className={`relative w-[380px] h-[520px] shrink-0 rounded-[2rem] overflow-hidden border border-white/10 transition-all duration-700 ease-out cursor-pointer
                                        ${isHovered ? 'scale-[1.02] border-primary/50 z-30' : 'z-10'}
                                        ${isAnyHovered && !isHovered ? 'opacity-40 grayscale-[0.5] scale-[0.98]' : 'opacity-100'}
                                    `}
                                >
                                    {/* Image */}
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className={`object-cover object-top transition-transform duration-1000 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}
                                    />

                                    {/* Overlays */}
                                    <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity duration-700 ${isHovered ? 'opacity-90' : 'opacity-70'}`} />
                                    <div className={`absolute inset-0 bg-primary/10 transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                                    {/* Socials appearing on hover */}
                                    <div className={`absolute inset-0 flex items-center justify-center gap-4 transition-all duration-700 z-30 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                        {socials?.linkedin && (
                                            <a href={socials.linkedin} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-black hover:border-primary transition-all duration-300">
                                                <Linkedin size={20} />
                                            </a>
                                        )}
                                        {socials?.instagram && (
                                            <a href={socials.instagram} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-black hover:border-primary transition-all duration-300">
                                                <Instagram size={20} />
                                            </a>
                                        )}
                                        {socials?.facebook && (
                                            <a href={socials.facebook} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-black hover:border-primary transition-all duration-300">
                                                <Facebook size={20} />
                                            </a>
                                        )}
                                        {socials?.email && (
                                            <a href={`mailto:${socials.email}`} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-black hover:border-primary transition-all duration-300">
                                                <Mail size={20} />
                                            </a>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-10 z-20">
                                        <div className={`flex flex-col items-start transition-transform duration-700 ${isHovered ? '-translate-y-4' : 'translate-y-0'}`}>
                                            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] block mb-4 px-4 py-2 bg-primary/10 backdrop-blur-md rounded-full border border-primary/20 text-left">
                                                {member.role}
                                            </span>
                                            <h4 className="text-white text-3xl font-serif font-bold leading-tight drop-shadow-2xl text-left">
                                                {member.name}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
