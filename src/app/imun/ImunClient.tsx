"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionTemplate } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";
import { ChevronDown, ExternalLink, Globe, ShieldCheck, Ticket, Users, Sparkles, Crown } from "lucide-react";
import Image from "next/image";

// EDIT YOUR LINKS HERE
const LINKS = {
    campusAmbassadorRegistration: "https://docs.google.com/forms/CA_FORM_LINK",
    delegateRegistration: "https://docs.google.com/forms/DELEGATE_FORM_LINK",
    paymentConfirmation: "https://docs.google.com/forms/PAYMENT_FORM_LINK",
    instagram: "https://www.instagram.com/igac.official_/",
};

const faqs = [
    {
        q: "I'm not able to fill up the Google Form, it is showing issues.",
        a: "Try using another device or checking your internet connection. Alternatively, try opening the link in an incognito window or clearing your browser cache."
    },
    {
        q: "Do I need to pay for delegate registration separately if I am a Campus Ambassador?",
        a: "No, the Campus Ambassador registration fee (4080 BDT) includes your Delegate participation. No separate delegate registration is required."
    },
    {
        q: "How can I contact the Secretariat?",
        a: "You can reach out to us directly through our official Instagram page @igac.official_ or the provided contacts on the main website."
    }
];

// --- 3D TILT & SPOTLIGHT CARD COMPONENT ---
function ImperialCard({ children, className, href }: { children: React.ReactNode, className?: string, href: string }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <motion.a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`block relative flex-1 group preserve-3d cursor-pointer ${className}`}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <div 
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="h-full relative overflow-hidden rounded-tr-3xl rounded-bl-3xl flex flex-col items-center justify-center text-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-500"
                style={{ transformStyle: "preserve-3d" }}
            >
                {children}

                {/* Glare / Spotlight Effect */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 pointer-events-none blend-overlay"
                            style={{
                                background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(242,196,95,0.15), transparent 40%)`
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </motion.a>
    );
}

// --- AMBIENT GOLDEN DUST PARTICLES ---
const GoldenDust = () => {
    const [particles, setParticles] = useState<{ id: number, size: number, x: number, y: number, duration: number, delay: number }[]>([]);

    useEffect(() => {
        const generated = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            size: Math.random() * 4 + 1,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5
        }));
        setParticles(generated);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute bg-[#f2c45f] rounded-full blur-[1px]"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                    }}
                    animate={{
                        y: ["0vh", "-100vh"],
                        opacity: [0, 0.8, 0],
                        scale: [1, 1.5, 0.5]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay
                    }}
                />
            ))}
        </div>
    );
};

export default function ImunClient() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const { scrollYProgress } = useScroll();
    
    return (
        <main className="min-h-screen bg-[#111111] text-[#f2c45f] mx-auto selection:bg-[#f2c45f]/30 selection:text-[#111111] relative">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
                
                @font-face {
                    font-family: 'Trajan Pro Bold';
                    src: local('Trajan Pro Bold'), local('TrajanPro-Bold');
                    font-weight: bold;
                }
                @font-face {
                    font-family: 'Baskerville Old Face';
                    src: local('Baskerville Old Face'), local('Baskerville');
                }
                @font-face {
                    font-family: 'DeVinne Swash Regular';
                    src: local('DeVinne Swash Regular'), local('DeVinne Swash');
                }

                .font-primary { font-family: 'Trajan Pro Bold', 'Cinzel', serif; }
                .font-secondary { font-family: 'Baskerville Old Face', 'Libre Baskerville', serif; }
                .font-decorative { font-family: 'DeVinne Swash Regular', 'Playfair Display', serif; }
                
                .preserve-3d { transform-style: preserve-3d; perspective: 1000px; }
            `}</style>

            <GoldenDust />

            {/* Scrolling Royal Line Indicator */}
            <div className="fixed top-0 left-8 md:left-12 w-[1px] h-full bg-[#363636] z-50 pointer-events-none hidden md:block">
                <motion.div 
                    className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#f2c45f] to-transparent shadow-[0_0_10px_#f2c45f]"
                    style={{ height: '30%', top: useTransform(scrollYProgress, [0, 1], ['0%', '70%']) }} 
                />
            </div>

            {/* --- 1. LUXURIOUS HERO SECTION --- */}
            <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden bg-[#111111]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(242,196,95,0.1)_0%,#111111_60%)] pointer-events-none z-0" />
                
                {/* Slowly rotating imperial ring */}
                <motion.div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] border border-[#f2c45f]/5 rounded-full pointer-events-none"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute top-0 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-[#f2c45f]/20 rounded-full blur-[2px]" />
                    <div className="absolute bottom-0 left-1/2 w-6 h-6 -translate-x-1/2 translate-y-1/2 border border-[#f2c45f]/20 rounded-full rotate-45" />
                </motion.div>

                <div className="container relative z-10 mx-auto px-4 text-center flex flex-col items-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}
                        className="flex flex-col items-center w-full"
                    >
                        {/* Logo */}
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="mb-10 relative">
                            <motion.div 
                                className="absolute inset-0 blur-[60px] bg-[#f2c45f]/20 rounded-full"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <div className="relative w-40 h-40 mx-auto transform-gpu group cursor-pointer">
                                <Image 
                                    src="/Imun/Logo/Golden.png" 
                                    alt="IMUN II Golden Logo" 
                                    fill 
                                    className="object-contain drop-shadow-[0_0_20px_rgba(242,196,95,0.6)] transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6"
                                    priority
                                    unoptimized
                                />
                            </div>
                        </motion.div>

                        {/* Title */}
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} className="font-primary text-[10vw] sm:text-5xl md:text-7xl lg:text-8xl text-[#f2c45f] leading-[1.1] tracking-wide uppercase mb-4 drop-shadow-[0_10px_20px_rgba(242,196,95,0.2)]">
                            <span className="block break-words px-2">Imperial Model</span>
                            <span className="block break-words px-2">United Nations</span>
                        </motion.h1>
                        
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center justify-center gap-6 mt-8 mb-10 w-full">
                            <motion.div className="h-[2px] bg-gradient-to-r from-transparent to-[#f2c45f]/60 w-12 md:w-24" />
                            <Crown className="w-8 h-8 text-[#f2c45f]/80" />
                            <motion.div className="h-[2px] bg-gradient-to-l from-transparent to-[#f2c45f]/60 w-12 md:w-24" />
                        </motion.div>

                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="font-secondary text-xl md:text-2xl text-[#dadada] max-w-2xl mx-auto font-light italic opacity-90 drop-shadow-md">
                            Organized by the International Global Affairs Council
                        </motion.p>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10 cursor-pointer"
                    onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                >
                    <span className="font-primary text-xs uppercase tracking-[0.3em] text-[#f2c45f]/60">Begin the Journey</span>
                    <ChevronDown className="w-5 h-5 text-[#f2c45f]/60" />
                </motion.div>
            </section>

            {/* Infinite High-Gloss Marquee Divider */}
            <div className="w-full bg-[#f2c45f] py-4 overflow-hidden shadow-[0_0_30px_rgba(242,196,95,0.3)] relative z-20">
                <motion.div 
                    className="whitespace-nowrap flex"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center text-[#111111] font-primary font-bold text-lg md:text-xl shrink-0 uppercase tracking-widest">
                            <span className="px-8">Imperial Model United Nations</span>
                            <Sparkles className="w-5 h-5" />
                            <span className="px-8">Session II</span>
                            <Sparkles className="w-5 h-5" />
                            <span className="px-8 text-[#111111]/70">Premium Showcase</span>
                            <Sparkles className="w-5 h-5 text-[#111111]/70" />
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="container relative z-10 mx-auto px-4 max-w-6xl py-24 pb-32">
                
                {/* --- 2. LUXURY REGISTRATION ACTION HUB --- */}
                <Reveal delay={0.1} width="100%">
                    <div className="flex flex-col lg:flex-row items-stretch justify-center gap-8 mb-32 z-20 relative">
                        
                        {/* Action 1: CA Form */}
                        <ImperialCard href={LINKS.campusAmbassadorRegistration} className="bg-gradient-to-br from-[#363636] to-[#111111] border border-[#f2c45f]/30 hover:border-[#f2c45f]">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none hidden md:block mix-blend-overlay" />
                            <div className="p-10 z-10 flex flex-col items-center">
                                <Users className="w-10 h-10 text-[#f2c45f] mb-6 drop-shadow-[0_0_15px_rgba(242,196,95,0.8)]" />
                                <h3 className="font-primary text-xl text-[#f2c45f] uppercase tracking-widest mb-3">Campus Ambassador</h3>
                                <p className="font-secondary text-[#a0a0a0] mb-8">Register as an official institutional representative.</p>
                                <span className="font-primary text-xs uppercase tracking-[0.2em] border-b border-[#f2c45f]/50 pb-1 group-hover:border-[#f2c45f] group-hover:tracking-[0.3em] transition-all">Apply Now</span>
                            </div>
                        </ImperialCard>

                        {/* Action 2: Delegate Form (Golden VIP Ticket) */}
                        <ImperialCard href={LINKS.delegateRegistration} className="bg-gradient-to-br from-[#f2c45f] via-[#e2b041] to-[#b38e36] text-[#111111] lg:scale-105 z-10 shadow-[0_20px_50px_rgba(242,196,95,0.25)] border border-white/20">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none hidden md:block mix-blend-overlay" />
                            <div className="p-12 z-10 flex flex-col items-center">
                                <Globe className="w-14 h-14 text-[#111111] mb-6 drop-shadow-md" />
                                <h3 className="font-primary text-2xl text-[#111111] font-bold uppercase tracking-widest mb-3">Delegate Base</h3>
                                <p className="font-secondary text-[#222222] font-bold mb-8">Secure your elite position at the conference.</p>
                                <span className="font-primary text-sm font-bold text-[#111111] tracking-[0.2em] border-b-2 border-[#111111]/50 pb-1 group-hover:border-[#111111] group-hover:tracking-[0.3em] transition-all">Register Now</span>
                            </div>
                        </ImperialCard>

                        {/* Action 3: Payment */}
                        <ImperialCard href={LINKS.paymentConfirmation} className="bg-gradient-to-br from-[#363636] to-[#111111] border border-[#f2c45f]/30 hover:border-[#f2c45f]">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none hidden md:block mix-blend-overlay" />
                            <div className="p-10 z-10 flex flex-col items-center">
                                <Ticket className="w-10 h-10 text-[#f2c45f] mb-6 drop-shadow-[0_0_15px_rgba(242,196,95,0.8)]" />
                                <h3 className="font-primary text-xl text-[#f2c45f] uppercase tracking-widest mb-3">Payment Confirm</h3>
                                <p className="font-secondary text-[#a0a0a0] mb-8">Verify and confirm your conference fee.</p>
                                <span className="font-primary text-xs uppercase tracking-[0.2em] border-b border-[#f2c45f]/50 pb-1 group-hover:border-[#f2c45f] group-hover:tracking-[0.3em] transition-all">Validate Pass</span>
                            </div>
                        </ImperialCard>

                    </div>
                </Reveal>

                {/* --- 3. IMMERSIVE CONTENT --- */}
                <div className="space-y-32 relative">
                    
                    {/* A True Cinematic Section */}
                    <Reveal width="100%">
                        <div className="relative group">
                            {/* Hover glow background */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#f2c45f]/0 via-[#f2c45f]/20 to-[#f2c45f]/0 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                            
                            <section className="flex flex-col lg:flex-row gap-12 items-center bg-[#111]/80 backdrop-blur-xl p-10 md:p-16 border border-[#f2c45f]/20 rounded-[2rem] relative z-10 shadow-2xl overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(242,196,95,0.1)_0%,transparent_60%)] pointer-events-none" />
                                
                                <div className="lg:w-2/3 relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-[1px] w-12 bg-[#f2c45f]" />
                                        <span className="font-primary text-sm text-[#f2c45f] tracking-[0.3em] uppercase">The Pinnacle</span>
                                    </div>
                                    <h2 className="font-primary text-4xl md:text-5xl mb-8 text-white uppercase tracking-wider leading-tight">
                                        The Premiere <span className="text-[#f2c45f] italic font-decorative capitalize block mt-2 text-5xl md:text-6xl drop-shadow-md">Agenda</span>
                                    </h2>
                                    <p className="font-secondary text-[#c0c0c0] leading-loose text-lg md:text-xl drop-shadow-sm">
                                        Imperial Model United Nations - Session II is a premier conference designed to bring together passionate individuals for meaningful debate, diplomacy, and global discourse. Hosted under the prestigious platform of IGAC, IMUN II reflects a steadfast commitment to fostering elite leadership and international awareness among the youth.
                                    </p>
                                </div>
                                <div className="lg:w-1/3 flex justify-center opacity-40 select-none">
                                    <ShieldCheck className="w-56 h-56 text-[#f2c45f] filter drop-shadow-[0_0_20px_rgba(242,196,95,0.5)] transform transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12" />
                                </div>
                            </section>
                        </div>
                    </Reveal>

                    {/* CA Specifics */}
                    <Reveal delay={0.1} width="100%">
                        <section className="relative">
                            <div className="text-center mb-16 relative">
                                <Crown className="w-12 h-12 text-[#f2c45f] mx-auto mb-6 opacity-80" />
                                <h2 className="font-primary text-4xl md:text-5xl text-[#f2c45f] uppercase tracking-[0.2em] mb-4">Campus Ambassador</h2>
                                <p className="font-decorative text-3xl text-[#f2c45f]/70">The Voice of Your Institution</p>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-10">
                                <motion.div 
                                    whileHover={{ y: -5 }}
                                    className="bg-gradient-to-br from-[#363636]/60 to-[#111111] p-12 rounded-3xl border border-[#f2c45f]/15 hover:border-[#f2c45f]/50 transition-colors shadow-xl group"
                                >
                                    <h3 className="font-primary text-2xl text-white mb-6 tracking-wide uppercase border-b border-[#f2c45f]/20 pb-4 group-hover:border-[#f2c45f]/60 transition-colors">Role Overview</h3>
                                    <p className="font-secondary text-[#c0c0c0] leading-relaxed text-xl mb-6">
                                        As an Ambassador, you will serve as the official representative of IMUN II within your institution. This is a role of utmost prestige and responsibility, ensuring strong engagement from your campus.
                                    </p>
                                    <p className="font-secondary text-[#c0c0c0] leading-relaxed text-xl italic border-l-2 border-[#f2c45f] pl-6 mt-8 opacity-80">
                                        Active involvement and timely coordination are essential for successfully fulfilling this diplomatic role.
                                    </p>
                                </motion.div>

                                <motion.div 
                                    whileHover={{ y: -5 }}
                                    className="bg-gradient-to-br from-[#363636]/60 to-[#111111] p-12 rounded-3xl border border-[#f2c45f]/15 hover:border-[#f2c45f]/50 transition-colors shadow-xl group"
                                >
                                    <h3 className="font-primary text-2xl text-white mb-6 tracking-wide uppercase border-b border-[#f2c45f]/20 pb-4 group-hover:border-[#f2c45f]/60 transition-colors">Key Responsibilities</h3>
                                    <ul className="space-y-6 font-secondary text-[#c0c0c0] text-xl">
                                        <li className="flex gap-6 items-start"><span className="text-[#f2c45f] font-primary text-2xl">I.</span> <span>Actively promote IMUN II within your campus and networks.</span></li>
                                        <li className="flex gap-6 items-start"><span className="text-[#f2c45f] font-primary text-2xl">II.</span> <span>Serve as a direct liaison between participants and the Secretariat.</span></li>
                                        <li className="flex gap-6 items-start"><span className="text-[#f2c45f] font-primary text-2xl">III.</span> <span>Guide and engage potential delegates throughout the entire process.</span></li>
                                        <li className="flex gap-6 items-start"><span className="text-[#f2c45f] font-primary text-2xl">IV.</span> <span>Represent the Imperial MUN brand with unmatched professionalism.</span></li>
                                    </ul>
                                </motion.div>
                            </div>
                        </section>
                    </Reveal>

                    {/* Registration Details (Shimmering Golden Banner) */}
                    <Reveal delay={0.2} width="100%">
                        <div className="relative group overflow-hidden rounded-[2.5rem]">
                            <motion.div 
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[200%] z-20 pointer-events-none"
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                            <section className="bg-[linear-gradient(110deg,#c99c33,45%,#f2c45f,55%,#c99c33)] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite] p-12 md:p-16 relative shadow-[0_20px_50px_rgba(242,196,95,0.2)] text-[#111111]">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[40px] md:blur-[100px] pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/always-grey.png')] opacity-10 pointer-events-none hidden md:block mix-blend-overlay" />
                                
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <Sparkles className="w-5 h-5 text-[#111111]" />
                                            <span className="font-primary text-[#111111] font-bold tracking-[0.3em] uppercase text-sm">Action Required</span>
                                        </div>
                                        <h2 className="font-primary text-4xl md:text-5xl uppercase tracking-widest font-black mb-4 drop-shadow-sm">Investment Details</h2>
                                        <p className="font-secondary text-xl md:text-2xl font-bold opacity-80 mb-6 drop-shadow-sm">Securing your seat at the conference</p>
                                    </div>
                                    <div className="bg-[#111111] p-10 rounded-[2rem] min-w-[320px] shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,196,95,0.15)_0%,transparent_60%)]" />
                                        <div className="relative z-10">
                                            <div className="font-primary text-xs text-[#f2c45f] tracking-[0.3em] uppercase mb-4 opacity-80">Campus Ambassador Fee</div>
                                            <div className="font-primary text-5xl text-[#f2c45f] font-bold mb-6 drop-shadow-[0_0_10px_rgba(242,196,95,0.5)]">4,080 BDT</div>
                                            <p className="font-secondary text-[#dadada] text-base italic border-t border-[#363636] pt-6 opacity-90">
                                                Note: This fee includes your full Delegate participation. <strong className="text-[#f2c45f] font-normal">No separate registration is required.</strong>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </Reveal>

                    {/* Instagram Call to Action */}
                    <Reveal delay={0.3} width="100%">
                        <div className="flex justify-center py-12 relative">
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#f2c45f]/20 to-transparent -translate-y-1/2" />
                            <a 
                                href={LINKS.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group relative bg-[#111111] px-10 py-5 flex items-center gap-6 border border-[#f2c45f]/30 rounded-full hover:border-[#f2c45f] hover:shadow-[0_0_30px_rgba(242,196,95,0.15)] transition-all overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[#f2c45f]/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                                <span className="font-primary text-[#f2c45f] text-xl md:text-2xl tracking-[0.2em] relative z-10">THE SECRETARIAT</span>
                                <ExternalLink className="w-6 h-6 text-[#f2c45f] transform group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform relative z-10" />
                            </a>
                        </div>
                    </Reveal>
                </div>

                {/* --- 4. FAQS --- */}
                <Reveal delay={0.4} width="100%">
                    <section className="mt-32 max-w-4xl mx-auto pb-20">
                        <div className="text-center mb-20 relative">
                            <h2 className="font-primary text-5xl text-white uppercase tracking-[0.15em] mb-6 drop-shadow-md">Inquiries</h2>
                            <p className="font-decorative text-3xl text-[#f2c45f]">Frequently Asked Questions</p>
                        </div>
                        
                        <div className="space-y-2">
                            {faqs.map((faq, index) => (
                                <div 
                                    key={index}
                                    className="bg-[#363636]/20 border border-[#f2c45f]/10 rounded-[1.5rem] overflow-hidden transition-all duration-300 hover:border-[#f2c45f]/40 hover:bg-[#363636]/40"
                                >
                                    <button 
                                        className="w-full text-left px-8 py-8 flex items-start justify-between gap-8 focus:outline-none"
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    >
                                        <span className={`font-primary text-xl tracking-wide leading-tight transition-colors duration-300 ${openFaq === index ? "text-[#f2c45f]" : "text-[#dadada]"}`}>
                                            {faq.q}
                                        </span>
                                        <div className={`shrink-0 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-500 ${openFaq === index ? "border-[#f2c45f] bg-[#f2c45f]/10" : "border-[#f2c45f]/20"}`}>
                                            <ChevronDown 
                                                className={`w-5 h-5 transition-transform duration-700 ease-[cubic-bezier(0.87,0,0.13,1)] ${openFaq === index ? "rotate-180 text-[#f2c45f]" : "text-[#f2c45f]/60"}`} 
                                            />
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === index && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                                            >
                                                <div className="px-8 pb-8 pt-2">
                                                    <div className="w-12 h-[1px] bg-[#f2c45f]/30 mb-6" />
                                                    <p className="font-secondary text-[#c0c0c0] leading-relaxed text-xl pr-4 md:pr-12">
                                                        {faq.a}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </section>
                </Reveal>
            </div>
        </main>
    );
}
