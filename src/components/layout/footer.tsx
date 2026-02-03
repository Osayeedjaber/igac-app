import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site-data";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { Reveal } from "@/components/motion/reveal";
import { motion } from "framer-motion";
import ShinyText from "@/components/ShinyText";

export function Footer() {
    return (
        <footer className="relative border-t border-white/5 pt-20 pb-10 overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid gap-16 md:grid-cols-12 mb-20">
                    <div className="md:col-span-5">
                        <Reveal>
                            <Link href="/" className="inline-block mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-12 h-12">
                                        <Image
                                            src="/logo.png"
                                            alt="IGAC Logo"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <span className="text-3xl font-bold tracking-tighter text-foreground font-sans">
                                        IGAC<span className="text-primary">.</span>
                                    </span>
                                </div>
                            </Link>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <p className="text-xl text-muted-foreground/80 leading-relaxed font-light max-w-md mb-8 italic">
                                "Forging the diplomats, leaders, and changemakers of tomorrow."
                            </p>
                        </Reveal>
                        <div className="flex gap-6">
                            {[
                                { name: "Facebook", href: siteConfig.socials.facebook },
                                { name: "Instagram", href: siteConfig.socials.instagram },
                                { name: "LinkedIn", href: siteConfig.socials.linkedin }
                            ].map((social, i) => (
                                <Reveal key={social.name} delay={0.2 + i * 0.1}>
                                    <Link
                                        href={social.href}
                                        className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors duration-300"
                                    >
                                        {social.name}
                                    </Link>
                                </Reveal>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <Reveal delay={0.3}>
                            <h4 className="font-serif font-bold text-2xl mb-8 text-foreground">Explore</h4>
                        </Reveal>
                        <ul className="space-y-4">
                            {[
                                { name: "About Organization", href: "/about" },
                                { name: "Our Legacy Events", href: "/events" },
                                { name: "The Team", href: "/team" },
                                { name: "Join the Family", href: "/join" }
                            ].map((item, i) => (
                                <Reveal key={item.name} delay={0.4 + i * 0.1}>
                                    <li>
                                        <Link href={item.href} className="text-muted-foreground hover:text-white transition-colors flex items-center group">
                                            <span className="w-0 group-hover:w-4 transition-all duration-300 h-[1px] bg-primary mr-0 group-hover:mr-2"></span>
                                            {item.name}
                                        </Link>
                                    </li>
                                </Reveal>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-4">
                        <Reveal delay={0.5}>
                            <h4 className="font-serif font-bold text-2xl mb-8 text-foreground">Contact Us</h4>
                        </Reveal>
                        <Reveal delay={0.6}>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                Have questions? Reach out to us and start your journey today.
                            </p>
                        </Reveal>
                        <Reveal delay={0.7}>
                            <Link
                                href="/contact"
                                className="inline-block px-8 py-4 border border-white/10 rounded-full text-foreground font-bold uppercase tracking-widest hover:bg-white hover:text-background transition-all duration-300"
                            >
                                Get in Touch
                            </Link>
                        </Reveal>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <Reveal delay={0.8}>
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground/50">
                            &copy; {new Date().getFullYear()} INTERNATIONAL GLOBAL AFFAIRS COUNCIL
                        </div>
                    </Reveal>
                    <Reveal delay={0.9}>
                        <div className="flex flex-col items-end gap-1">
                            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30 mb-1">
                                Developed by
                            </div>
                            <ShinyText
                                text="Osayeed Zaber"
                                speed={3}
                                className="text-sm font-bold tracking-[0.2em] uppercase"
                                shineColor="#d4af37"
                            />
                        </div>
                    </Reveal>
                </div>
            </div>

            <div className="mt-16 opacity-[0.07] hover:opacity-20 transition-opacity duration-1000">
                <TextHoverEffect text="IGAC" />
            </div>
        </footer>
    );
}
