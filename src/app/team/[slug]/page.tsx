import { teamData } from "@/config/site-data";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button-premium";
import { ArrowLeft, Facebook, Instagram, Linkedin, Mail, Quote } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import ShinyText from "@/components/ShinyText";
import { motion } from "motion/react";

// Helper to find member by slug
function getMemberBySlug(slug: string) {
    const allMembers = [
        ...teamData.governingBody,
        ...teamData.corePanel,
        ...teamData.heads,
        ...teamData.deputies,
        // Add regional members if needed
        ...(teamData.regions.ctg.corePanel || []),
        ...(teamData.regions.ctg.heads || []),
        ...(teamData.regions.ctg.deputies || []),
        // Don't forget the Regional Head if they are structurally different
        (teamData.regions.ctg.head ? [teamData.regions.ctg.head] : [])
    ].flat();

    return allMembers.find(member => slugify(member.name) === slug);
}

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const member = getMemberBySlug(slug) as any;

    if (!member) {
        return {
            title: "Member Not Found | IGAC",
        };
    }

    return {
        title: `${member.name} - ${member.role} | IGAC Team`,
        description: `Meet ${member.name}, the ${member.role} at International Global Affairs Council.`,
        openGraph: {
            title: `${member.name} | IGAC Team`,
            description: `Meet ${member.name}, the ${member.role} at International Global Affairs Council.`,
            images: [
                {
                    url: member.image || "/logo.png",
                    width: 800,
                    height: 800,
                    alt: member.name,
                },
            ],
        },
    };
}

export default async function TeamMemberPage({ params }: Props) {
    const { slug } = await params
    const member = getMemberBySlug(slug) as any;

    if (!member) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center py-32 font-sans">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#d4af37]/10 blur-[120px] rounded-full mix-blend-screen" />
                
                {/* Floating Elements */}
                <div className="absolute top-20 right-20 w-32 h-32 border border-white/5 rounded-full animate-float opacity-30" />
                <div className="absolute bottom-40 left-20 w-24 h-24 border border-primary/10 rounded-full animate-float-delayed opacity-30" />
                <div className="absolute top-1/2 left-10 w-2 h-2 bg-primary rounded-full animate-pulse" />
                <div className="absolute bottom-1/3 right-10 w-1 h-1 bg-white rounded-full animate-ping" />
            </div>

            {/* Giant Watermark Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[90vw] -z-10 opacity-20 pointer-events-none">
                <TextHoverEffect text="IGAC" automatic={true} />
            </div>

            <div className="container relative z-10 mx-auto px-6 max-w-7xl">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center">
                    
                    {/* Visual Column (Image) */}
                    <div className="lg:col-span-5 relative group perspective-1000">
                        {/* Decorative Frames */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-[#d4af37] rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                        <div className="absolute -inset-1 bg-gradient-to-br from-white/10 to-transparent rounded-[2.2rem] border border-white/10" />
                        
                        <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl bg-black/40 backdrop-blur-sm border border-white/10">
                            <Image
                                src={member.image || "/logo.png"}
                                alt={member.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                            
                            {/* Overlay Gradient for Text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
                            
                            <div className="absolute bottom-8 left-8 right-8">
                                <p className="text-white/80 font-serif italic text-lg tracking-wide max-w-[80%]">
                                    {member.department || "International Global Affairs Council"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info Column */}
                    <div className="lg:col-span-7 space-y-12">
                        <div>
                            <Reveal>
                                <Link 
                                    href="/team" 
                                    className="group inline-flex items-center text-sm font-medium text-muted-foreground hover:text-white mb-8 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center mr-3 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
                                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                    </div>
                                    Back to Team
                                </Link>
                            </Reveal>

                            <Reveal delay={0.1} className="relative">
                                
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black leading-[1.1] tracking-tight mb-8 relative z-10 pb-2">
                                    <ShinyText 
                                        text={member.name} 
                                        disabled={false} 
                                        speed={6} 
                                        className="inline-block"
                                        color="#ffffff" 
                                        shineColor="#d4af37"
                                        spread={50}
                                    />
                                </h1>
                            </Reveal>

                            <Reveal delay={0.2}>
                                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                    <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
                                    <span className="text-lg font-medium text-white/90 tracking-wide">
                                        {member.role}
                                    </span>
                                </div>
                            </Reveal>
                        </div>

                        {member.quote && (
                            <Reveal delay={0.3}>
                                <div className="relative pl-12 pt-8 border-l border-white/10">
                                    <Quote className="absolute top-8 left-0 w-8 h-8 text-primary/40 -scale-x-100" />
                                    <blockquote className="text-2xl md:text-3xl font-light text-muted-foreground leading-relaxed italic">
                                        "{member.quote}"
                                    </blockquote>
                                </div>
                            </Reveal>
                        )}

                        <Reveal delay={0.4}>
                            <div className="pt-12 border-t border-white/5">
                                <h3 className="text-sm text-muted-foreground font-bold uppercase tracking-widest mb-6">Connect & Network</h3>
                                <div className="flex flex-wrap gap-4">
                                    {member.socials?.facebook && (
                                        <a href={member.socials.facebook} target="_blank" rel="noopener noreferrer" 
                                           className="group flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 hover:bg-blue-600/20 hover:border-blue-500/50 transition-all duration-300">
                                            <Facebook className="w-6 h-6 text-white/60 group-hover:text-blue-400 transition-colors" />
                                        </a>
                                    )}
                                    {member.socials?.instagram && (
                                        <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer" 
                                           className="group flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 hover:bg-pink-600/20 hover:border-pink-500/50 transition-all duration-300">
                                            <Instagram className="w-6 h-6 text-white/60 group-hover:text-pink-400 transition-colors" />
                                        </a>
                                    )}
                                    {member.socials?.linkedin && (
                                        <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" 
                                           className="group flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 hover:bg-blue-700/20 hover:border-blue-600/50 transition-all duration-300">
                                            <Linkedin className="w-6 h-6 text-white/60 group-hover:text-blue-400 transition-colors" />
                                        </a>
                                    )}
                                    {member.email && (
                                        <a href={`mailto:${member.email}`}
                                           className="group flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 hover:bg-emerald-600/20 hover:border-emerald-500/50 transition-all duration-300">
                                            <Mail className="w-6 h-6 text-white/60 group-hover:text-emerald-400 transition-colors" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </main>
    );
}
