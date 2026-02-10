import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { slugify, cn } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink, Facebook, Instagram } from "lucide-react";

interface ProfileCardProps {
    name: string;
    role: string;
    image: string;
    department?: string | null;
    quote?: string | null;
    socials?: Record<string, string> | {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        email?: string;
    };
    delay?: number;
    opacity?: number;
    imageClassName?: string;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    [key: string]: unknown;
}

export function ProfileCard({ name, role, department, image, quote, socials, delay = 0, opacity = 1, imageClassName, onMouseEnter, onMouseLeave }: ProfileCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);
    const slug = slugify(name || '');

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        onMouseLeave?.();
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: delay, ease: "easeOut" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className="group relative h-[650px] w-full rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 select-none hover:border-primary/50 transition-colors duration-500 bg-slate-900 cursor-pointer"
        >
            {/* Link wrapper for the whole card? Or just a button? Let's add a button top right */}
            {slug && (
                <Link href={`/team/${slug}`} className="absolute top-6 right-6 z-40 p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white/70 hover:text-primary hover:bg-black/60 transition-colors" title="View Profile">
                     <ExternalLink size={20} />
                </Link>
            )}

            {/* Shimmer Effect */}
            <div className="absolute inset-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-[-100%] bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            </div>

            {/* Full Height Image */}
            <div className="absolute inset-0" style={{ transform: "translateZ(-20px)" }}>
                <Image
                    src={image || "/logo.png"}
                    alt={name || 'Team Member'}
                    fill
                    className={cn("object-cover object-top transition-transform duration-1000 group-hover:scale-110", imageClassName)}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={delay < 0.2}
                />
            </div>

            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700 z-10" />

            {/* Content Container */}
            <div className="absolute bottom-0 left-0 right-0 p-10 z-20" style={{ transform: "translateZ(50px)" }}>
                <div className="flex flex-col items-start text-left">
                    {/* Role Tag */}
                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em] block mb-4 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-primary/30">
                        {role || 'Team Member'}
                    </span>

                    {department && (
                        <span className="text-white/40 text-[9px] uppercase font-bold tracking-[0.3em] block mb-2 px-1">
                            {department}
                        </span>
                    )}

                    {/* Name - Sharp Serif */}
                    <h3 className="text-4xl font-serif font-black text-white leading-none mb-4 group-hover:text-primary transition-colors duration-500 [text-shadow:0_4px_12px_rgba(0,0,0,0.8)]">
                        {name || 'Team Member'}
                    </h3>

                    {/* Horizontal Divider */}
                    <div className="w-12 h-0.5 bg-primary/40 mb-6 group-hover:w-24 transition-all duration-700" />

                    {/* Quote */}
                    {quote && (
                        <p className="text-white/70 text-sm italic font-medium leading-relaxed mb-8 line-clamp-3">
                            "{quote}"
                        </p>
                    )}

                    {/* Socials */}
                    {socials && Object.keys(socials).length > 0 && (
                        <div className="flex items-center gap-5">
                            {socials.facebook && (
                                <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-primary transition-all duration-300 hover:scale-110"><Facebook size={18} /></a>
                            )}
                            {socials.instagram && (
                                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-primary transition-all duration-300 hover:scale-110"><Instagram size={18} /></a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
