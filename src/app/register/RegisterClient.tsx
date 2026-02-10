"use client";

import { Reveal } from "@/components/motion/reveal";
import { XCircle } from "lucide-react";

interface RegisterPageProps {
    registrationOpen: boolean;
    registerUrl: string;
}

export default function RegisterClient({ registrationOpen, registerUrl }: RegisterPageProps) {
    return (
        <main className="min-h-screen bg-background flex flex-col pt-20">
            <section className="pt-20 pb-20 text-center relative overflow-hidden flex-1">
                <Reveal className="flex flex-col items-center w-full">
                    <span className="text-primary text-sm font-bold tracking-[0.3em] uppercase mb-4 block">IGACMUN Session III</span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-8">
                        Register for the Conference
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
                        Secure your delegation at South East Asia&apos;s premier Model United Nations conference.
                        Engage in 12 dynamic committees and compete for the Best Delegate award.
                    </p>

                    {registrationOpen ? (
                        <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-lg mb-20">
                            {registerUrl ? (
                                <a href={registerUrl} target="_blank" rel="noopener noreferrer" className="px-10 py-5 bg-primary text-primary-foreground font-bold uppercase tracking-widest rounded-full hover:bg-primary/90 transition-all hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.3)] w-full md:w-auto text-center">
                                    Delegate Registration
                                </a>
                            ) : (
                                <button className="px-10 py-5 bg-primary text-primary-foreground font-bold uppercase tracking-widest rounded-full hover:bg-primary/90 transition-all hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.3)] w-full md:w-auto">
                                    Delegate Registration
                                </button>
                            )}
                            <button className="px-10 py-5 border border-white/20 text-foreground font-bold uppercase tracking-widest rounded-full hover:bg-white/5 transition-colors w-full md:w-auto">
                                View Committees
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 mb-20">
                            <button disabled className="px-10 py-5 bg-primary/30 text-primary-foreground/50 font-bold uppercase tracking-widest rounded-full w-full md:w-auto max-w-md cursor-not-allowed opacity-60">
                                Registration Closed
                            </button>
                            <div className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-full">
                                <XCircle className="w-4 h-4 text-red-400" />
                                <span className="text-sm text-red-300 font-medium">Registration is currently closed. Check back later.</span>
                            </div>
                        </div>
                    )}
                </Reveal>
            </section>

            {/* Registration Phases */}
            <section className="py-20 bg-secondary/20 border-y border-white/5">
                <div className="container mx-auto px-6 max-w-5xl">
                    <Reveal>
                        <h2 className="text-3xl font-serif font-bold text-center mb-12">Registration Phases</h2>
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div className="p-8 border border-white/10 rounded-xl bg-background/50">
                                <span className="block text-primary text-sm font-bold uppercase tracking-widest mb-2">Phase 1</span>
                                <h3 className="text-2xl font-bold mb-4">Early Bird</h3>
                                <p className="text-muted-foreground">Limited slots available at discounted rates.</p>
                            </div>
                            <div className="p-8 border border-primary/30 rounded-xl bg-primary/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1">OPEN</div>
                                <span className="block text-primary text-sm font-bold uppercase tracking-widest mb-2">Phase 2</span>
                                <h3 className="text-2xl font-bold mb-4">Regular</h3>
                                <p className="text-muted-foreground">Standard registration for all delegates.</p>
                            </div>
                            <div className="p-8 border border-white/10 rounded-xl bg-background/50 opacity-60">
                                <span className="block text-primary text-sm font-bold uppercase tracking-widest mb-2">Phase 3</span>
                                <h3 className="text-2xl font-bold mb-4">Late</h3>
                                <p className="text-muted-foreground">Last chance registration.</p>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
        </main>
    );
}
