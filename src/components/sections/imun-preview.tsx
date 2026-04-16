"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button-premium";
import Link from "next/link";
import Image from "next/image";

export function ImunPreview() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const logoY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  
  return (
    <section 
      ref={containerRef}
      className="relative py-32 overflow-hidden border-y border-white/5 bg-[#0a0a0a]"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      
      {/* Golden accent lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#f2c45f]/20 to-transparent" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#f2c45f]/20 to-transparent" />

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
        <Reveal className="flex flex-col items-center w-full text-center mb-12">
          <span className="text-[#f2c45f] text-sm font-bold tracking-[0.3em] uppercase mb-4 block drop-shadow-[0_0_10px_rgba(242,196,95,0.3)]">
            Flagship Event
          </span>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
            Imperial Model United Nations
          </h2>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto italic">
            Experience diplomatic grandeur and high-stakes negotiation at South East Asia’s most prestigious conference.
          </p>
        </Reveal>

        <Reveal delay={0.2} className="relative w-full max-w-4xl rounded-2xl overflow-hidden border-2 border-[#f2c45f]/50 shadow-[0_0_80px_rgba(242,196,95,0.3)] group cursor-pointer hover:shadow-[0_0_120px_rgba(242,196,95,0.6)] transition-all duration-700">
          <Link href="/imun" className="block w-full h-full relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111111]/90 z-10" />
            
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full block">
              <Image 
                src="/past-events/igacmuns2bannerjpg.jpg" 
                alt="Imperial Model United Nations"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
              />
              
              {/* Centerpiece Golden Logo */}
              <motion.div 
                style={{ y: logoY }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-32 h-32 md:w-56 md:h-56 drop-shadow-[0_0_40px_rgba(242,196,95,0.8)]"
              >
                <Image
                  src="/Imun/Logo/Golden.png"
                  alt="IMUN Golden Logo"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </motion.div>

              {/* Action Area */}
              <div className="absolute bottom-8 left-0 w-full flex justify-center z-20 px-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-black/60 backdrop-blur-md px-10 py-5 rounded-3xl border border-[#f2c45f]/30">
                  <div className="text-center sm:text-left">
                    <p className="text-white font-serif font-bold tracking-[0.2em] uppercase text-sm md:text-base mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                      Portal is Now Open
                    </p>
                    <p className="text-[#f2c45f] text-xs md:text-sm font-bold tracking-[0.3em] uppercase">
                      Session II • The Prophecy Begins
                    </p>
                  </div>
                  <div className="hidden sm:block w-px h-12 bg-[#f2c45f]/30" />
                  <button className="relative px-10 py-4 bg-gradient-to-r from-yellow-300 via-[#f2c45f] to-amber-500 hover:from-white hover:to-white text-black font-extrabold uppercase tracking-[0.3em] text-sm md:text-base rounded-full transition-all duration-300 shadow-[0_0_40px_rgba(242,196,95,0.8)] hover:scale-110 active:scale-95 animate-pulse group-hover:animate-none overflow-hidden">
                    <div className="absolute inset-0 bg-white/40 -translate-x-full group-hover:animate-[shimmer_1s_infinite] skew-x-12" />
                    <span className="relative z-10">ENTER PORTAL</span>
                  </button>
                </div>
              </div>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
