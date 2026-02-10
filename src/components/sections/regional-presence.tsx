"use client";
import { Reveal } from "@/components/motion/reveal";
import { teamData } from "@/config/site-data";
import { ProfileCard } from "@/components/ui/profile-card";
import { Anchor, Ship, Waves, Instagram, MapPin, Target, Globe2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button-premium";

type MemberProp = {
    name: string;
    role: string;
    image: string;
    socials: Record<string, string>;
};

export function RegionalPresence({ ctgHead }: { ctgHead?: MemberProp }) {
    const { ctg } = teamData.regions;
    const head = ctgHead || ctg.head;

    return (
        <section className="relative py-48 md:py-64 overflow-hidden bg-[#022c22]/40 border-y border-emerald-500/10 backdrop-blur-sm group/ctg">
            {/* Precise Maritime Watermarks (Matched with Team Page) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] opacity-[0.05] rotate-[-15deg] group-hover/ctg:rotate-0 transition-transform duration-[4s] ease-out">
                    <Anchor className="w-[700px] h-[700px] text-emerald-400" />
                </div>
                <div className="absolute bottom-[-10%] right-[-10%] opacity-[0.05] rotate-[15deg] group-hover/ctg:rotate-0 transition-transform duration-[4s] ease-out">
                    <Ship className="w-[900px] h-[900px] text-emerald-400" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]">
                    <Waves className="w-full h-full text-emerald-300" />
                </div>
                {/* Large Subtle CTG text */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-[0.02] -rotate-90 origin-right select-none">
                    <span className="text-[30rem] font-serif font-black leading-none text-white tracking-widest">GATEWAY</span>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-24">

                    {/* Left: Content Area (Inspo from Team & Regional Pages) */}
                    <div className="w-full lg:w-3/5 order-2 lg:order-1">
                        <Reveal className="flex flex-col items-start">
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 mb-10 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                                <Anchor className="w-5 h-5 text-emerald-400" />
                                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]">The Gateway Command</span>
                            </div>

                            <h2 className="text-6xl md:text-9xl font-serif font-black text-white mb-8 tracking-tighter leading-[0.9] select-none">
                                Chattogram <br />
                                <span className="text-emerald-400 italic">Division<span className="text-amber-400">.</span></span>
                            </h2>

                            <p className="text-xl md:text-3xl text-emerald-100/70 font-medium leading-relaxed mb-12 max-w-xl italic">
                                "Steering the commercial pulse of the nation with maritime precision and diplomatic excellence."
                            </p>

                            {/* Regional Specifics Grid (Inspo from Regional Page) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 w-full">
                                <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all group/card">
                                    <div className="p-3 bg-emerald-500/10 rounded-xl group-hover/card:bg-emerald-500/20 transition-colors">
                                        <MapPin className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg">Local Reach</h4>
                                        <p className="text-xs text-emerald-100/40 font-medium leading-relaxed">Engaging students across all major institutions in the port city.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all group/card">
                                    <div className="p-3 bg-emerald-500/10 rounded-xl group-hover/card:bg-emerald-500/20 transition-colors">
                                        <Target className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg">Regional Goal</h4>
                                        <p className="text-xs text-emerald-100/40 font-medium leading-relaxed">Cultivating high-level diplomatic awareness in the commercial heart.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-10">
                                <Link href="/regions/ctg">
                                    <Button variant="primary" size="lg" withArrow className="shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                        Explore Division
                                    </Button>
                                </Link>

                                <a
                                    href={ctg.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 text-emerald-100/40 hover:text-emerald-400 transition-all duration-500 group/insta"
                                >
                                    <div className="p-3 rounded-full border border-white/10 group-hover/insta:border-emerald-500/30 transition-all">
                                        <Instagram className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Regional News</span>
                                </a>
                            </div>
                        </Reveal>
                    </div>

                    {/* Right: Visionary Leader Card (Matched with Core Panel Style) */}
                    <div className="w-full lg:w-2/5 order-1 lg:order-2 flex justify-center">
                        <div className="relative w-full max-w-sm">
                            <div className="absolute -inset-10 bg-emerald-500/10 blur-[120px] rounded-full group-hover/ctg:opacity-50 transition-opacity" />

                            <div className="relative border-4 border-emerald-500/30 rounded-[3rem] p-3 bg-emerald-950/20 backdrop-blur-md shadow-2xl">
                                <ProfileCard
                                    {...head}
                                    image={head.image || "/ctghead.jpg"}
                                    delay={0.2}
                                />
                            </div>

                            {/* Decorative Badge */}
                            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl backdrop-blur-2xl flex items-center justify-center -rotate-12 group-hover/ctg:rotate-0 transition-all duration-700">
                                <Globe2 className="w-10 h-10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
