"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { Button } from "@/components/ui/button-premium";
import { Meteors } from "@/components/ui/meteors";
import { CheckCircle2, CreditCard, FileText, Send, Sparkles, UserPlus, Globe, Award, Users, BookOpen, Anchor, Ship, Shield, Waves, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface JoinPageProps {
    recruitmentOpen: boolean;
    joinFormUrl: string;
}

export default function JoinPage({ recruitmentOpen, joinFormUrl }: JoinPageProps) {
    return (
        <main className="min-h-screen bg-background relative selection:bg-primary selection:text-background overflow-hidden">
            {/* Cinematic Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 blur-[180px] rounded-full -translate-y-1/2 translate-x-1/4 opacity-60" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full translate-y-1/4 -translate-x-1/4 opacity-40" />
                <Meteors number={20} />
            </div>

            {/* 1. HERO SECTION - Cinematic */}
            <section className="relative min-h-[60vh] md:h-[80vh] flex flex-col items-center justify-center px-6 pt-24 pb-20">
                <div className="relative w-full max-w-[1400px] h-64 md:h-80 mx-auto">
                    <TextHoverEffect text="JOIN US" />
                </div>

                <Reveal width="100%" delay={0.5} className="flex flex-col items-center text-center mt-[-40px] z-10" overflowVisible>
                    <span className="text-primary text-[10px] font-black uppercase tracking-[1em] mb-8 block animate-pulse">
                        Engineers of Diplomacy
                    </span>

                    <h1 className="text-4xl md:text-7xl font-serif font-black text-white mb-8 leading-tight tracking-tighter">
                        Forge Your <span className="text-primary italic">Legacy.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-3xl font-serif italic leading-relaxed mb-12">
                        Step into a crucible of leadership where young minds grapple with the pressing challenges of our era.
                    </p>

                    <div className="flex flex-col items-center gap-6">
                        {recruitmentOpen ? (
                            <a href="https://forms.gle/vTMVqN637Q5QGmXcA" target="_blank" rel="noopener noreferrer">
                                <Button size="lg" variant="primary" withArrow className="h-16 px-12 text-base shadow-[0_0_50px_rgba(212,175,55,0.2)] hover:shadow-[0_0_70px_rgba(212,175,55,0.4)] hover:scale-105 transition-all duration-300">
                                    Launch Application
                                </Button>
                            </a>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <Button size="lg" variant="primary" disabled className="h-16 px-12 text-base opacity-50 cursor-not-allowed">
                                    Recruitment Closed
                                </Button>
                                <div className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-full">
                                    <XCircle className="w-4 h-4 text-red-400" />
                                    <span className="text-sm text-red-300 font-medium">Recruitment is currently closed. Check back later.</span>
                                </div>
                            </div>
                        )}
                    </div>
                </Reveal>
            </section>

            {/* 2. BENEFITS - Governing Body Style */}
            <section className="py-24 md:py-48 relative z-10">
                <div className="container mx-auto px-6">
                    <Reveal width="100%" className="mb-12 md:mb-24 flex flex-col items-center text-center">
                        <h2 className="text-4xl md:text-8xl font-serif font-black text-white mb-4 tracking-tighter">
                            Why Join <span className="text-primary italic">IGAC?</span>
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mt-6" />
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
                        <BenefitCardGrande
                            icon={Globe}
                            title="Global Network"
                            description="Access a vast network of delegates, mentors, and alumni from over 15 countries. Build connections that transcend borders."
                            delay={0.1}
                            className="md:col-span-2"
                            cardClassName="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20"
                        />
                        <BenefitCardGrande
                            icon={Award}
                            title="Elite Certification"
                            description="Earn prestigious certificates recognized by international bodies for your contributions and leadership."
                            delay={0.2}
                            cardClassName="bg-gradient-to-b from-primary/5 to-transparent border-primary/20"
                        />
                        <BenefitCardGrande
                            icon={BookOpen}
                            title="Diplomatic Training"
                            description="Master the art of negotiation, public speaking, and crisis management through our exclusive curriculum."
                            delay={0.3}
                            cardClassName="bg-gradient-to-b from-primary/5 to-transparent border-primary/20"
                        />
                        <BenefitCardGrande
                            icon={Users}
                            title="Leadership Roles"
                            description="Step into executive positions early. Lead committees, organize conferences, and manage teams."
                            delay={0.4}
                            className="md:col-span-2"
                            cardClassName="bg-gradient-to-bl from-cyan-500/10 to-transparent border-cyan-500/20"
                        />
                    </div>
                </div>
            </section>

            {/* 3. THE PROCESS - Core Panel Style Cinematic Container */}
            <section className="w-full max-w-[1800px] mx-auto px-4 md:px-6 mb-32 md:mb-64 relative z-10">
                <div className="bg-[#020d08] border border-emerald-900/40 rounded-3xl md:rounded-[5rem] p-6 md:p-32 overflow-hidden relative shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
                    {/* Maritime Watermarks */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                        <Anchor className="absolute top-10 left-10 w-[400px] h-[400px] -rotate-12" />
                        <Ship className="absolute bottom-10 right-10 w-[500px] h-[500px] rotate-12" />
                        <Waves className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full" />
                    </div>

                    <Reveal width="100%" className="mb-32 flex flex-col items-center text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-8">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Merit-Based Selection</span>
                        </div>
                        <h2 className="text-4xl md:text-9xl font-serif font-black text-white text-center leading-none tracking-tighter mb-8 md:mb-12">
                            How It <span className="text-primary italic">Works.</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-2xl mx-auto font-serif italic">
                            A transparent journey tailored to identify the leaders of tomorrow.
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 max-w-[1400px] mx-auto">
                        <ProcessCard
                            number="01"
                            title="Submit Application"
                            description="Complete the online membership form with your details and specific interests."
                            icon={FileText}
                            delay={0.1}
                        />
                        <ProcessCard
                            number="02"
                            title="Selection Review"
                            description="Our board reviews applications based on merit, passion, and potential contribution."
                            icon={UserPlus}
                            delay={0.2}
                        />
                        <ProcessCard
                            number="03"
                            title="Official Induction"
                            description="Accepted members pay a one-time fee to finalize their lifetime membership."
                            icon={CheckCircle2}
                            delay={0.3}
                            isLast
                        />
                    </div>
                </div>
            </section>

            {/* 4. FINAL CTA - Apply Section */}
            <section id="application-form" className="py-24 relative z-10 overflow-visible">
                <div className="container mx-auto px-6 relative">
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    <Reveal className="max-w-6xl mx-auto pt-10" overflowVisible>
                        <div className="relative bg-[#022c22]/40 backdrop-blur-3xl border border-emerald-500/20 rounded-3xl md:rounded-[4rem] p-6 md:p-20 text-center shadow-[0_50px_100px_rgba(0,0,0,0.6)] group">
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] z-0 rounded-3xl md:rounded-[4rem] overflow-hidden" />

                            <div className="relative z-10">
                                <Reveal width="100%" className="mb-6" overflowVisible>
                                    <div className="flex flex-col items-center justify-center w-full">
                                        <motion.div
                                            animate={{ y: [0, -15, 0] }}
                                            transition={{
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            className="mb-6 flex justify-center"
                                        >
                                            <Sparkles className="w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                                        </motion.div>
                                        <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-center">
                                            Part of the Global Family
                                        </span>
                                    </div>
                                </Reveal>

                                <h2 className="text-4xl md:text-8xl font-serif font-black text-white mb-6 md:mb-8 tracking-tighter leading-none">
                                    Join the <span className="text-primary italic">Legacy.</span>
                                </h2>

                                <p className="text-xl md:text-2xl text-emerald-100/70 font-serif italic mb-12 max-w-2xl mx-auto leading-relaxed">
                                    The future of global leadership is being forged today. Your seat at the table awaits.
                                </p>

                                <div className="flex flex-col items-center gap-8">
                                    {recruitmentOpen ? (
                                        <a href={joinFormUrl || "#"} target="_blank" rel="noopener noreferrer">
                                            <Button size="lg" variant="primary" withArrow className="h-20 px-12 text-lg rounded-full shadow-[0_0_50px_rgba(212,175,55,0.3)] hover:scale-105 transition-all duration-300">
                                                Apply for Membership
                                            </Button>
                                        </a>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <Button size="lg" variant="primary" disabled className="h-20 px-12 text-lg rounded-full opacity-50 cursor-not-allowed">
                                                Applications Closed
                                            </Button>
                                            <div className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-full">
                                                <XCircle className="w-4 h-4 text-red-400" />
                                                <span className="text-sm text-red-300 font-medium">Recruitment is currently closed</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 px-8 py-3 bg-black/60 backdrop-blur-xl rounded-full border border-primary/20">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                        <span className="text-xs font-black uppercase tracking-[0.4em] text-white/80">
                                            Membership Fee applicable upon acceptance
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
        </main>
    );
}

function BenefitCardGrande({ icon: Icon, title, description, delay, className, cardClassName }: { icon: any, title: string, description: string, delay: number, className?: string, cardClassName?: string }) {
    return (
        <Reveal width="100%" delay={delay} className={cn("h-full", className)}>
            <div className={cn("group h-full p-8 md:p-10 rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-primary/30 transition-all duration-500 relative overflow-hidden z-10", cardClassName)}>
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform translate-x-4 -translate-y-4 z-0 pointer-events-none">
                    <Icon className="w-40 h-40" />
                </div>

                <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-500">
                    <Icon className="w-7 h-7 text-white group-hover:text-primary transition-colors" />
                </div>

                <h3 className="relative z-10 text-2xl md:text-3xl font-serif font-bold text-white mb-4">{title}</h3>
                <p className="relative z-10 text-muted-foreground/80 text-lg leading-relaxed">{description}</p>
            </div>
        </Reveal>
    );
}

function ProcessCard({ number, title, description, icon: Icon, delay, isLast }: { number: string, title: string, description: string, icon: any, delay: number, isLast?: boolean }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <Reveal width="100%" delay={delay} className="relative z-10">
            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className="group relative h-full bg-[#051b11]/20 border border-emerald-900/40 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 transition-all duration-500 hover:border-primary/50 hover:bg-[#051b11]/40 overflow-hidden cursor-default shadow-2xl"
            >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-[-100%] bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                </div>

                <div
                    className="relative z-20 flex flex-col items-center text-center h-full"
                    style={{ transform: "translateZ(50px)" }}
                >
                    <div className="w-14 h-14 bg-background border-2 border-white/10 rounded-full flex items-center justify-center mb-8 text-sm font-black text-primary group-hover:border-primary group-hover:scale-110 transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                        {number}
                    </div>

                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-primary/20 group-hover:rotate-12 transition-all duration-500 border border-white/5">
                        <Icon className="w-10 h-10 text-white group-hover:text-primary transition-colors" />
                    </div>

                    <h3 className="text-3xl font-serif font-black text-white mb-6 group-hover:text-primary transition-colors duration-500 tracking-tight leading-none">
                        {title}
                    </h3>

                    <div className="w-12 h-1 bg-primary/20 mb-6 group-hover:w-24 group-hover:bg-primary transition-all duration-500 rounded-full" />

                    <p className="text-muted-foreground/80 leading-relaxed text-lg font-medium group-hover:text-white transition-colors duration-500">
                        {description}
                    </p>
                </div>

                {/* Aesthetic Background Grain */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />
            </motion.div>
        </Reveal>
    );
}
