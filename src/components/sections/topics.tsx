"use client";

import { Reveal } from "@/components/motion/reveal";
import { homeContent } from "@/config/site-data";
import { Globe, Award, MessageSquare, Users, BookOpen, Scaling } from "lucide-react";

const icons: Record<string, any> = {
    Globe: <Globe className="w-10 h-10" />,
    Award: <Award className="w-10 h-10" />,
    MessageSquare: <MessageSquare className="w-10 h-10" />,
    Users: <Users className="w-10 h-10" />,
};

export function Topics() {
    const { whyJoin } = homeContent;

    return (
        <section className="py-24 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 max-w-6xl relative z-10 flex flex-col items-center">
                <Reveal className="text-center mb-16 flex flex-col items-center">
                    <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Our Focus</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-foreground">{whyJoin.title}</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-center">{whyJoin.description}</p>
                </Reveal>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {whyJoin.reasons.map((reason, index) => (
                        <Reveal key={index} delay={index * 0.1}>
                            <div className="group h-full p-8 rounded-3xl bg-secondary/10 border border-white/5 hover:border-primary/20 hover:bg-secondary/20 transition-all duration-500 flex flex-col items-center text-center">
                                <div className="mb-6 p-4 rounded-2xl bg-background border border-white/5 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-lg shadow-black/20">
                                    {icons[reason.icon]}
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">{reason.title}</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    {reason.description}
                                </p>
                            </div>
                        </Reveal>
                    ))}
                </div>

                {/* Additional Topics Grid */}
                <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <Reveal delay={0.4}>
                        <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left h-full group hover:bg-emerald-500/10 transition-colors duration-500">
                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform duration-500">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-foreground mb-2">Diplomatic Administration</h4>
                                <p className="text-muted-foreground text-sm leading-relaxed">Master the inner workings of international organizations by managing committee affairs, academic standards, and institutional relations.</p>
                            </div>
                        </div>
                    </Reveal>
                    <Reveal delay={0.5}>
                        <div className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left h-full group hover:bg-blue-500/10 transition-colors duration-500">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0 group-hover:scale-110 transition-transform duration-500">
                                <Scaling className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-foreground mb-2">Strategic Logistics</h4>
                                <p className="text-muted-foreground text-sm leading-relaxed">Develop high-level operational skills by spearheading conference logistics, financial planning, and large-scale event execution.</p>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
