"use client";

import Link from "next/link";
import { ChevronLeft, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Image from "next/image";

const NAV_LINKS = [
    { name: "Home", href: "/imun" },
    { name: "About", href: "/imun/about" },
    { name: "Secretariat", href: "/imun/secretariat" },
    { name: "Committees", href: "/imun/committees" },
    { name: "Schedule", href: "/imun/schedule" },
    { name: "Campus Ambassadors", href: "/imun/campus-ambassadors" },
    { name: "Awardees", href: "/imun/awardees" },
];

export function ImunNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <>
            <header 
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
                    isScrolled 
                        ? "bg-[#111111]/90 backdrop-blur-xl border-b border-[#f2c45f]/20 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
                        : "bg-transparent border-b border-transparent py-6"
                }`}
            >
                <div className="container mx-auto px-6 flex flex-row items-center justify-between">
                    
                    {/* Left: Branding */}
                    <div className="flex items-center">
                        <Link href="/imun" className="flex items-center gap-3 group">
                            <div className="relative w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:scale-105">
                                <Image src="/Imun/Logo/Golden.png" alt="IMUN Logo" fill className="object-contain drop-shadow-[0_0_10px_rgba(242,196,95,0.4)]" />
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="font-primary text-[#f2c45f] text-sm md:text-lg tracking-[0.2em] font-bold leading-none">
                                    IMUN II
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Center: Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8 bg-[#151515]/60 backdrop-blur-md px-8 py-3 rounded-full border border-white/5">
                        {NAV_LINKS.map((link) => (
                            <Link 
                                key={link.name} 
                                href={link.href}
                                className={`font-primary text-xs uppercase tracking-widest transition-all duration-300 hover:text-[#f2c45f] ${
                                    pathname === link.href ? "text-[#f2c45f] font-bold" : "text-neutral-400"
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: CTA & Mobile Toggle */}
                    <div className="flex items-center justify-end gap-3 md:gap-6">
                        <Link 
                            href="/"
                            className="hidden xl:flex items-center gap-2 text-neutral-500 hover:text-[#f2c45f] transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="font-primary text-[10px] uppercase tracking-widest font-bold">
                                IGAC Home
                            </span>
                        </Link>

                        <Link 
                            href="/imun/register" 
                            className="hidden sm:inline-flex items-center justify-center bg-[#f2c45f] text-black border border-[#f2c45f]/30 px-6 py-2.5 rounded-full font-primary text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(242,196,95,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:-translate-y-0.5"
                        >
                            Register
                        </Link>
                        
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#151515] border border-white/10 hover:border-[#f2c45f]/50 transition-colors text-white"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#111111]/95 backdrop-blur-2xl flex flex-col"
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                            <Link href="/imun" className="flex items-center gap-3">
                                <div className="relative w-8 h-8">
                                    <Image src="/Imun/Logo/Golden.png" alt="IMUN Logo" fill className="object-contain" />
                                </div>
                                <span className="font-primary text-[#f2c45f] text-sm tracking-[0.2em] font-bold">
                                    IMUN II
                                </span>
                            </Link>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-[#f2c45f] hover:text-black transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
                            {NAV_LINKS.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link 
                                        href={link.href}
                                        className={`font-primary text-2xl uppercase tracking-widest ${
                                            pathname === link.href ? "text-[#f2c45f]" : "text-white"
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                            
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="pt-8 w-full max-w-sm border-t border-white/10"
                            >
                                <Link 
                                    href="/imun/register" 
                                    className="flex w-full items-center justify-center bg-[#f2c45f] text-black px-6 py-4 rounded-full font-primary text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors"
                                >
                                    Secure Registration
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export function ImunFooter() {
    return (
        <footer className="bg-[#0a0a0a] border-t border-[#f2c45f]/10 pt-20 pb-10 relative z-20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#f2c45f]/5 via-[#0a0a0a] to-[#0a0a0a] opacity-50" />
            
            <div className="container mx-auto px-8 relative z-10 w-full max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20 text-center md:text-left">
                    
                    <div className="md:col-span-5 flex flex-col items-center md:items-start">
                        <Link href="/imun" className="flex items-center justify-center md:justify-start gap-4 mb-8">
                            <div className="relative w-16 h-16 drop-shadow-[0_0_15px_rgba(242,196,95,0.4)]">
                                <Image src="/Imun/Logo/Golden.png" alt="IMUN Logo" fill className="object-contain" />
                            </div>
                            <div className="flex flex-col text-left">
                                <h3 className="font-primary text-[#f2c45f] text-2xl tracking-[0.2em] font-bold">IMUN</h3>
                                <span className="font-secondary text-neutral-400 text-sm italic">Session II</span>
                            </div>
                        </Link>
                        <p className="font-secondary text-neutral-400 text-lg italic max-w-md leading-relaxed mb-8">
                            An arena engineered to test intellectual endurance and diplomatic limits. Organized by IGAC.
                        </p>
                        <div className="flex items-center gap-6 justify-center md:justify-start">
                            <a href="https://www.instagram.com/igac.official_/" target="_blank" rel="noopener noreferrer" className="font-primary text-xs text-[#f2c45f]/60 hover:text-[#f2c45f] uppercase tracking-widest transition-colors font-bold">Instagram</a>
                            <a href="#" target="_blank" rel="noopener noreferrer" className="font-primary text-xs text-[#f2c45f]/60 hover:text-[#f2c45f] uppercase tracking-widest transition-colors font-bold">Facebook</a>
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <h4 className="font-primary font-bold text-lg tracking-widest uppercase mb-8 text-[#f2c45f]">Explore</h4>
                        <ul className="space-y-4">
                            {NAV_LINKS.map(link => (
                                <li key={link.name}>
                                    <Link href={link.href} className="font-secondary text-neutral-400 hover:text-[#f2c45f] transition-colors">{link.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-4">
                        <h4 className="font-primary font-bold text-lg tracking-widest uppercase mb-8 text-[#f2c45f]">Contact Support</h4>
                        <p className="text-neutral-400 font-secondary mb-8 leading-relaxed">
                            Questions? Reach out to our organizing committee for clarification.
                        </p>
                        <Link 
                            href="/contact" 
                            className="inline-block px-8 py-3 border border-[#f2c45f]/30 rounded-full text-[#f2c45f] font-primary font-bold text-xs uppercase tracking-widest hover:bg-[#f2c45f] hover:text-black transition-all shadow-[0_0_15px_rgba(242,196,95,0.1)] hover:shadow-[0_0_25px_rgba(242,196,95,0.3)]"
                        >
                            Get in Touch
                        </Link>
                    </div>

                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-neutral-600 font-primary text-[10px] sm:text-xs tracking-[0.2em] font-bold">
                        &copy; 2026 IGAC. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex flex-col items-center md:items-end gap-1">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 font-primary font-bold mb-1">
                            Developed by
                        </span>
                        <a href="https://www.instagram.com/z3ber._/" target="_blank" rel="noreferrer" className="text-sm font-primary font-bold text-[#f2c45f] uppercase tracking-[0.2em] hover:text-white transition-colors">
                            Osayeed Zaber
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
