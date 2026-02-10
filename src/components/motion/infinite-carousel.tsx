"use client";

import Image from "next/image";
import { useState } from "react";
import { Facebook, Instagram, Linkedin } from "lucide-react";

type Member = {
    name: string;
    role: string;
    image: string;
    socials: Record<string, string>;
};

export function InfiniteCarousel({ members }: { members: Member[] }) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!members || members.length === 0) return null;

    return (
        <div className="relative w-full overflow-hidden py-24">
            {/* Gradient masks */}
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-[#051b11] via-[#051b11]/80 to-transparent z-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-[#051b11] via-[#051b11]/80 to-transparent z-20 pointer-events-none" />

            {/* Auto-scrolling track */}
            <div className="flex w-fit animate-infinite-scroll">
                {[0, 1].map((setIndex) => (
                    <div key={setIndex} className="flex gap-8 px-4">
                        {members.map((member, idx) => {
                            const globalIdx = setIndex * members.length + idx;
                            const isHovered = hoveredIndex === globalIdx;
                            const isAnyHovered = hoveredIndex !== null;
                            const socials = member.socials as any;

                            return (
                                <div
                                    key={`member-${globalIdx}`}
                                    onMouseEnter={() => setHoveredIndex(globalIdx)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    className={`relative w-[380px] h-[520px] shrink-0 rounded-[2rem] overflow-hidden border border-white/10 transition-all duration-300 ease-out cursor-pointer
                                        ${isHovered ? 'scale-[1.02] border-primary/50' : ''}
                                        ${isAnyHovered && !isHovered ? 'opacity-40 grayscale-[0.5] scale-[0.98]' : 'opacity-100'}
                                    `}
                                    style={{ zIndex: isHovered ? 40 : 10 }}
                                >
                                    {/* Image */}
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className={`object-cover object-top transition-transform duration-700 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}
                                        draggable={false}
                                    />

                                    {/* Overlays */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-90' : 'opacity-70'}`}
                                        style={{ zIndex: 1 }}
                                    />
                                    <div
                                        className={`absolute inset-0 bg-primary/10 transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                                        style={{ zIndex: 2 }}
                                    />

                                    {/* Social Links */}
                                    {isHovered && (
                                        <div className="absolute inset-0 flex items-center justify-center gap-4 z-50">
                                            {socials?.linkedin && socials.linkedin !== "#" && (
                                                <a
                                                    href={socials.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-black hover:border-primary transition-all duration-200 animate-fade-in"
                                                    style={{ animationDelay: '0ms' }}
                                                >
                                                    <Linkedin size={20} />
                                                </a>
                                            )}
                                            {socials?.instagram && socials.instagram !== "#" && (
                                                <a
                                                    href={socials.instagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-black hover:border-primary transition-all duration-200 animate-fade-in"
                                                    style={{ animationDelay: '50ms' }}
                                                >
                                                    <Instagram size={20} />
                                                </a>
                                            )}
                                            {socials?.facebook && socials.facebook !== "#" && (
                                                <a
                                                    href={socials.facebook}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-black hover:border-primary transition-all duration-200 animate-fade-in"
                                                    style={{ animationDelay: '100ms' }}
                                                >
                                                    <Facebook size={20} />
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-10 pointer-events-none" style={{ zIndex: 30 }}>
                                        <div className={`flex flex-col items-start transition-transform duration-300 ${isHovered ? '-translate-y-4' : 'translate-y-0'}`}>
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
