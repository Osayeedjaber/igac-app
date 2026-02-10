import { getTeamMemberBySlug, getAllTeamSlugs } from "@/lib/data";
import { ArrowLeft, Facebook, Instagram, Linkedin, Quote } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import ShinyText from "@/components/ShinyText";

type Props = {
    params: Promise<{ slug: string }>
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const member = await getTeamMemberBySlug(slug);

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
    const { slug } = await params;
    const member = await getTeamMemberBySlug(slug);

    if (!member) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center py-20">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 blur-[180px] rounded-full -translate-y-1/2 translate-x-1/4 opacity-60" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full translate-y-1/4 -translate-x-1/4 opacity-40" />
            </div>

            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[90vw] opacity-[0.02] pointer-events-none">
                <TextHoverEffect text="IGAC" automatic={true} />
            </div>

            <div className="container relative z-10 mx-auto px-6 max-w-[1400px]">
                {/* Back Button */}
                <div className="mb-8">
                    <Reveal>
                        <Link
                            href="/team"
                            className="group inline-flex items-center text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                        >
                            <div className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center mr-3 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            </div>
                            Back to Team
                        </Link>
                    </Reveal>
                </div>

                {/* Main Grid - 40/60 split */}
                <div className="grid lg:grid-cols-[40%_60%] gap-12 items-center">

                    {/* Left Column - Image */}
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-emerald-500/20 rounded-[2.5rem] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-700" />

                        <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl bg-black/40 backdrop-blur-sm border border-white/10">
                            <Image
                                src={member.image || "/logo.png"}
                                alt={member.name}
                                fill
                                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                priority
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Department Badge */}
                            {member.department && (
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
                                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-white/90 text-sm font-medium">
                                            {member.department}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Info */}
                    <div className="space-y-6 flex flex-col justify-center">
                        {/* Name */}
                        <Reveal delay={0.1}>
                            <h1 className="text-5xl md:text-7xl font-serif font-black leading-[1.05] tracking-tight">
                                <ShinyText
                                    text={member.name}
                                    disabled={false}
                                    speed={5}
                                    className="inline-block"
                                    color="#ffffff"
                                    shineColor="#d4af37"
                                    spread={50}
                                />
                            </h1>
                        </Reveal>

                        {/* Role Badge */}
                        <Reveal delay={0.2}>
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md w-fit">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-lg font-medium text-white/90">
                                    {member.role}
                                </span>
                            </div>
                        </Reveal>

                        {/* Quote - Compact */}
                        {member.quote && (
                            <Reveal delay={0.25}>
                                <div className="relative pl-6 py-4 border-l-2 border-primary/30">
                                    <Quote className="absolute top-4 -left-1 w-5 h-5 text-primary/50" />
                                    <blockquote className="text-lg md:text-xl font-light text-white/70 leading-relaxed italic">
                                        &ldquo;{member.quote}&rdquo;
                                    </blockquote>
                                </div>
                            </Reveal>
                        )}

                        {/* About */}
                        {member.description && (
                            <Reveal delay={0.3}>
                                <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-[2px] bg-primary" />
                                        <h3 className="text-xs text-primary font-bold uppercase tracking-[0.3em]">About</h3>
                                    </div>
                                    <p className="text-base text-white/70 leading-relaxed">
                                        {member.description}
                                    </p>
                                </div>
                            </Reveal>
                        )}

                        {/* Connect */}
                        <Reveal delay={0.35}>
                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <h3 className="text-xs text-muted-foreground font-bold uppercase tracking-[0.3em]">Connect</h3>
                                <div className="flex flex-wrap gap-3">
                                    {member.socials?.facebook && (
                                        <a href={member.socials.facebook} target="_blank" rel="noopener noreferrer"
                                           className="group flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-600/20 hover:border-blue-500/50 hover:scale-110 transition-all duration-300">
                                            <Facebook className="w-5 h-5 text-white/60 group-hover:text-blue-400 transition-colors" />
                                        </a>
                                    )}
                                    {member.socials?.instagram && (
                                        <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer"
                                           className="group flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-pink-600/20 hover:border-pink-500/50 hover:scale-110 transition-all duration-300">
                                            <Instagram className="w-5 h-5 text-white/60 group-hover:text-pink-400 transition-colors" />
                                        </a>
                                    )}
                                    {member.socials?.linkedin && (
                                        <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer"
                                           className="group flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-700/20 hover:border-blue-600/50 hover:scale-110 transition-all duration-300">
                                            <Linkedin className="w-5 h-5 text-white/60 group-hover:text-blue-400 transition-colors" />
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

export async function generateStaticParams() {
    const slugs = await getAllTeamSlugs();
    return slugs.map((slug) => ({ slug }));
}
