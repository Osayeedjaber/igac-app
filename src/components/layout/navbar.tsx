"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

import { navLinks } from "@/config/site-data";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <>
            <header
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
                    // Base state: No border at all
                    "border-b-0",
                    isScrolled
                        ? "bg-background/70 backdrop-blur-xl py-3 shadow-sm"
                        : "bg-transparent py-6",
                    // Apply border ONLY on hover when scrolled, or globally if desired
                    // The user wants "when we hover then the line shows"
                    isHovered && "border-b border-white/10"
                )}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="relative z-50 flex items-center gap-3 group/logo">
                        <div className="relative w-10 h-10 md:w-11 md:h-11 transition-transform group-hover/logo:scale-110 duration-300">
                            <Image
                                src="/logo.png"
                                alt="IGAC Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="text-3xl md:text-2xl font-bold tracking-tighter text-foreground font-sans block">
                            IGAC<span className="text-primary transition-all duration-300 group-hover/logo:ml-1">.</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={cn(
                                        "text-sm font-medium transition-all duration-300 relative py-1",
                                        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {link.name}
                                    {/* Link Underline Animation */}
                                    <motion.span
                                        initial={false}
                                        animate={{ width: isActive ? "100%" : "0%" }}
                                        whileHover={{ width: "100%" }}
                                        className="absolute -bottom-0.5 left-0 h-[1.5px] bg-primary rounded-full transition-all duration-300"
                                    />
                                </Link>
                            );
                        })}
                        <Link
                            href="/join"
                            className="ml-2 px-6 py-2.5 text-sm font-bold tracking-wider uppercase text-primary-foreground bg-primary rounded-full transition-all duration-300 hover:bg-white hover:text-background hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95"
                        >
                            Join Us
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden relative z-50 p-2 text-foreground hover:bg-white/5 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Nav Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-background/98 backdrop-blur-2xl md:hidden"
                    >
                        <div className="flex flex-col h-full pt-32 px-8 gap-8">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + i * 0.1, type: "spring", stiffness: 100 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "text-4xl font-sans font-bold transition-colors",
                                            pathname === link.href ? "text-primary" : "text-foreground hover:text-primary"
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mt-8"
                            >
                                <Link
                                    href="/join"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full text-center block px-8 py-4 text-xl font-bold uppercase tracking-widest text-primary-foreground bg-primary rounded-xl"
                                >
                                    Join Us
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
