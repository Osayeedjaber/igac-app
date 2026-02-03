"use client";

import { Reveal } from "@/components/motion/reveal";
import { PointerHighlight } from "@/components/ui/pointer-highlight";

export function Visionaries() {
    return (
        <section className="py-32 md:py-48 relative overflow-hidden flex flex-col items-center">
            <div className="container mx-auto px-6 max-w-6xl text-center">
                <PointerHighlight containerClassName="py-20 px-12 md:px-24">
                    <Reveal>
                        <h2 className="text-6xl md:text-8xl font-serif font-bold text-foreground mb-8 leading-none tracking-tight">
                            Built by <span className="text-primary">Visionaries.</span>
                        </h2>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <h3 className="text-4xl md:text-6xl font-serif font-medium text-muted-foreground/80 italic">
                            Controlled by <span className="text-primary">You.</span>
                        </h3>
                    </Reveal>
                </PointerHighlight>
            </div>
        </section>
    );
}
