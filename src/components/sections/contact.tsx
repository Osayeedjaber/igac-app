"use client";

import { Reveal } from "@/components/motion/reveal";

export function Contact() {
    return (
        <section id="contact" className="py-24 bg-background border-t border-white/5 relative overflow-hidden">
            <div className="container mx-auto px-6 text-center">
                <Reveal>
                    <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block">Get Involved</span>
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-8">
                        Ready to Shape the Future?
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
                        Join the biggest Model United Nations conference in South East Asia.
                        Applications for IGACMUN Session III are now open.
                    </p>
                </Reveal>

                <Reveal delay={0.2}>
                    <a
                        href="https://igacmun.vercel.app/registration"
                        className="inline-block px-10 py-4 bg-primary text-primary-foreground font-bold tracking-wide rounded-sm hover:bg-white hover:text-background transition-all duration-300 transform hover:scale-105"
                    >
                        Register Now
                    </a>
                </Reveal>

                <div className="mt-24 grid md:grid-cols-2 gap-12 text-left max-w-4xl mx-auto">
                    <Reveal delay={0.3} width="100%">
                        <div className="p-6 border border-white/5 rounded-sm bg-white/[0.02]">
                            <h3 className="text-xl font-bold text-foreground mb-2">Venue</h3>
                            <p className="text-muted-foreground">
                                American International University-Bangladesh (AIUB)<br />
                                Kuratoli Road, Dhaka 1229
                            </p>
                        </div>
                    </Reveal>
                    <Reveal delay={0.4} width="100%">
                        <div className="p-6 border border-white/5 rounded-sm bg-white/[0.02]">
                            <h3 className="text-xl font-bold text-foreground mb-2">Contact</h3>
                            <p className="text-muted-foreground">
                                Email: info@igac.org<br />
                                Phone: +880 1234 567890
                            </p>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
