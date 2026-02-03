"use client";

import { Reveal } from "@/components/motion/reveal";
import { aboutPageContent } from "@/config/site-data";
import { Sparkles, Flag, TrendingUp, Globe } from "lucide-react";

const icons: Record<string, any> = {
    Sparkles: <Sparkles className="w-5 h-5" />,
    Flag: <Flag className="w-5 h-5" />,
    TrendingUp: <TrendingUp className="w-5 h-5" />,
    Globe: <Globe className="w-5 h-5" />,
};

export function Journey() {
    const { journey } = aboutPageContent;

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-5xl">
                <Reveal width="100%" className="flex justify-center mb-16">
                    <div className="text-center flex flex-col items-center w-full max-w-3xl mx-auto">
                        <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Our Path</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-foreground">{journey.title}</h2>
                        <p className="text-muted-foreground text-lg text-center leading-relaxed">{journey.description}</p>
                    </div>
                </Reveal>

                <div className="relative">
                    {/* Vertical Line - Hidden on small, centered on md+ */}
                    <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/10 to-transparent" />

                    <div className="space-y-12 md:space-y-24">
                        {journey.milestones.map((milestone, index) => (
                            <div key={index} className="relative flex flex-col md:flex-row items-start md:items-center">
                                {/* Dot/Icon Container */}
                                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center z-10">
                                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                                        {icons[milestone.icon]}
                                    </div>
                                </div>

                                {/* Content Side */}
                                <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:ml-auto md:pl-16 md:text-left'}`}>
                                    <Reveal delay={index * 0.1}>
                                        <div className="p-8 rounded-3xl bg-secondary/10 border border-white/5 backdrop-blur-md hover:border-primary/30 transition-all duration-500 group">
                                            <span className="text-primary font-serif font-bold text-2xl block mb-2">{milestone.year}</span>
                                            <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{milestone.title}</h3>
                                            <p className="text-muted-foreground leading-relaxed">{milestone.description}</p>
                                        </div>
                                    </Reveal>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
