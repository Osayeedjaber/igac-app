"use client";

import { motion } from "framer-motion";
import { Users, Award, CheckCircle2, ChevronRight, MoveRight, Gem, Briefcase, Star, Map } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";

export default function CampusAmbassadorsPage() {
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
                            Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-[#f2c45f] to-amber-600">Ambassadors</span>
                        </h1>
                        <p className="font-secondary text-neutral-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto italic px-4">
                            The distinguished leaders driving the Imperial Model United Nations vision across institutions worldwide. 
                            All officially recognized Campus Ambassadors will be prominently showcased here, complete with their photographs and profiles. Our grand gallery is currently awaiting its first inductees. Will you take the mantle?
                        </p>
                        
                        <div className="flex justify-center w-full mt-6">
                            <Link href="/imun/register/ca">
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
                                        BECOME AN AMBASSADOR
                                    </span>
                                    <MoveRight className="relative z-10 w-4 h-4 md:w-5 md:h-5 text-[#f2c45f] group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" />
                                </motion.button>
                            </Link>
                        </div>
                    </Reveal>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                    
                    {/* Why Become a Campus Ambassador */}
                    <div className="space-y-8">
                        <Reveal delay={0.2}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-px flex-1 bg-gradient-to-r from-[#f2c45f]/50 to-transparent max-w-[50px]" />
                                <h3 className="font-primary text-2xl md:text-3xl font-bold uppercase tracking-widest text-[#f2c45f]">
                                    Why Join Us?
                                </h3>
                            </div>
                            
                            <div className="bg-[#151515]/50 border border-white/5 rounded-3xl p-8 md:p-10 shadow-lg">
                                <ul className="space-y-6">
                                    <li className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#f2c45f]/10 flex flex-shrink-0 items-center justify-center border border-[#f2c45f]/20 mt-1">
                                            <Users className="w-4 h-4 text-[#f2c45f]" />
                                        </div>
                                        <div>
                                            <p className="font-secondary text-neutral-300 leading-relaxed text-sm">
                                                Build strong leadership by representing Imperial Model United Nations within your institution and taking initiative in driving participation.
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#f2c45f]/10 flex flex-shrink-0 items-center justify-center border border-[#f2c45f]/20 mt-1">
                                            <Briefcase className="w-4 h-4 text-[#f2c45f]" />
                                        </div>
                                        <div>
                                            <p className="font-secondary text-neutral-300 leading-relaxed text-sm">
                                                Develop advanced communication and public speaking skills through real engagement. Gain hands-on experience in outreach, promotion, coordination, and team management.
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#f2c45f]/10 flex flex-shrink-0 items-center justify-center border border-[#f2c45f]/20 mt-1">
                                            <Star className="w-4 h-4 text-[#f2c45f]" />
                                        </div>
                                        <div>
                                            <p className="font-secondary text-neutral-300 leading-relaxed text-sm">
                                                Expand your network with students, experienced delegates, and organizers across different institutions. Strengthen your academic and professional profile with credible leadership experience.
                                            </p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#f2c45f]/10 flex flex-shrink-0 items-center justify-center border border-[#f2c45f]/20 mt-1">
                                            <Map className="w-4 h-4 text-[#f2c45f]" />
                                        </div>
                                        <div>
                                            <p className="font-secondary text-neutral-300 leading-relaxed text-sm">
                                                Stand out in future opportunities by demonstrating initiative, responsibility, and impact. Get exposure to collaborations, opportunities, and deeper involvement within the MUN circuit.
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </Reveal>

                        {/* Exclusive Benefits & Rewards */}
                        <Reveal delay={0.3}>
                            <div className="flex items-center gap-4 mb-6 mt-12">
                                <div className="h-px flex-1 bg-gradient-to-r from-[#f2c45f]/50 to-transparent max-w-[50px]" />
                                <h3 className="font-primary text-2xl md:text-3xl font-bold uppercase tracking-widest text-[#f2c45f]">
                                    Exclusive Rewards
                                </h3>
                            </div>
                            
                            <div className="bg-gradient-to-b from-[#f2c45f]/5 to-transparent border border-[#f2c45f]/20 rounded-3xl p-8 md:p-10 shadow-[0_0_30px_rgba(242,196,95,0.05)] text-center sm:text-left">
                                <div className="space-y-4 font-secondary text-neutral-300 text-sm leading-relaxed">
                                    <p className="font-bold text-[#f2c45f] text-base mb-4 uppercase tracking-widest font-primary">Benefits</p>
                                    <p>• 100% registration fee waiver upon bringing 80+ delegates.</p>
                                    <p>• 50% registration discount upon bringing 50+ delegates.</p>
                                    <p className="pb-4 border-b border-white/10">• An exclusive Ambassador certificate, in addition to your participation certificate. Get featured on our official page recognizing your visibility.</p>
                                    
                                    <p className="font-bold text-[#f2c45f] text-base mb-4 mt-6 uppercase tracking-widest font-primary">Recognition</p>
                                    <p>• Top performers will be awarded premium titles such as Best Ambassador and Outstanding Ambassador.</p>
                                    <p>• Receive exclusive, premium rewards including a specially designed crest and a distinguished certificate unlike the standard ones.</p>
                                    <p>• Get curated gift boxes and sponsored merchandise as a token of recognition for your contribution.</p>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    {/* Requirements */}
                    <div>
                        <Reveal delay={0.4} className="sticky top-32">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-px flex-1 bg-gradient-to-r from-[#f2c45f]/50 to-transparent max-w-[50px]" />
                                <h3 className="font-primary text-2xl md:text-3xl font-bold uppercase tracking-widest text-[#f2c45f]">
                                    Requirements
                                </h3>
                            </div>
                            
                            <div className="space-y-4">
                                {[
                                    { title: "Confirmed Delegate Recruitment", desc: "A minimum of five confirmed delegates must be successfully registered under your reference." },
                                    { title: "Communication & Coordination", desc: "Maintain consistent and professional communication with the Secretariat, ensuring timely responses to all updates and instructions." },
                                    { title: "Professional Conduct", desc: "Demonstrate a high standard of professionalism, accountability, and reliability in all responsibilities undertaken." },
                                    { title: "Delegate Engagement", desc: "Actively guide and support prospective delegates throughout the registration process, ensuring clarity and ease of participation." },
                                    { title: "Outreach Capability", desc: "Possess strong networking and outreach skills within your institution or community to effectively promote participation." },
                                    { title: "Workshop Initiative (Optional)", desc: "Organize and conduct a workshop or awareness session. Delegates recruited through this initiative will be counted under your official reference." }
                                ].map((req, i) => (
                                    <div key={i} className="group p-6 bg-[#151515] hover:bg-[#1a1a1a] rounded-2xl border border-white/5 hover:border-[#f2c45f]/30 transition-all duration-300">
                                        <div className="flex gap-4">
                                            <div className="mt-1 flex-shrink-0">
                                                <CheckCircle2 className="w-5 h-5 text-[#f2c45f] group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div>
                                                <h4 className="font-primary font-bold text-white uppercase tracking-widest text-xs mb-2">
                                                    {req.title}
                                                </h4>
                                                <p className="font-secondary text-sm text-neutral-400">
                                                    {req.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Reveal>
                    </div>

                </div>
            </div>
        </main>
    );
}
