"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X, ArrowRight } from "lucide-react";

import { navLinks } from "@/config/site-data";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn(
                    "fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 transition-all duration-500 rounded-[2rem]",
                    isScrolled
                        ? "bg-[#111111]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] py-3"
                        : "bg-transparent border border-transparent py-4"
                )}
            >
                <div className="px-6 md:px-8 flex items-center justify-between">
                    
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-3 group relative z-50">
                        <div className="relative w-10 h-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                            <Image
                                src="/logo.png"
                                alt="IGAC Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="text-xl md:text-2xl font-primary font-bold tracking-widest text-white uppercase hidden sm:block">
                            IGAC<span className="text-[#f2c45f] animate-pulse">.</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center justify-center gap-1">
                        {navLinks.filter(link => link.name !== "Join Us").map((link) => {
                            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="relative px-4 py-2 group"
                                >
                                    <span className={cn(
                                        "relative z-10 font-primary text-xs uppercase tracking-widest transition-colors duration-300",
                                        isActive ? "text-[#f2c45f] font-bold" : "text-neutral-400 group-hover:text-white"
                                    )}>
                                        {link.name}
                                    </span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute inset-0 bg-white/5 border border-white/10 rounded-full"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* CTA & Mobile Toggle */}
                    <div className="flex items-center gap-4 relative z-50">
                        <Link
                            href="/imun"
                            className="hidden md:inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#f2c45f] text-black rounded-full font-primary text-xs uppercase tracking-widest font-bold hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(242,196,95,0.2)] hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] group"
                        >
                            IMUN
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <button
                            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-[#f2c45f] hover:text-black transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-40 bg-[#111111]/95 md:hidden"
                    >
                        <div className="flex flex-col h-full items-center justify-center gap-8 px-6 pb-20">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.1, type: "spring", stiffness: 100 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "font-primary text-3xl uppercase tracking-widest transition-colors block text-center",
                                            pathname === link.href ? "text-[#f2c45f]" : "text-white hover:text-[#f2c45f]"
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
