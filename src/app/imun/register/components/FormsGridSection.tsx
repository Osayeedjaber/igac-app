"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Globe, Briefcase, ArrowRight, Lock, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { SiteSettingsPublic } from "@/lib/data";

type RegistrationStatus = "open" | "closed" | "soon";

// Base unconfigured roles
const BASE_ROLES = [
    {
        id: "eb",
        title: "Executive Board",
        desc: "Guide the debate and maintain diplomatic protocol as a respected chair member.",
        icon: Briefcase,
        slug: "/imun/register/eb",
        theme: "dark"
    },
    {
        id: "del",
        title: "Single Delegation",
        desc: "Secure your elite position in the assembly. Debate, lobby, and pass resolutions individually.",
        icon: Globe,
        slug: "/imun/register/del",
        theme: "dark"
    },
    {
        id: "ddel",
        title: "Double Delegation",
        desc: "Partner up with another delegate to represent a nation in joint committees.",
        icon: Users, // Using Users icon for Double Delegation
        slug: "/imun/register/ddel",
        theme: "dark"
    },
    {
        id: "ca",
        title: "Campus Ambassador",
        desc: "Lead your university delegation and secure VIP networking benefits.",
        icon: Users,
        slug: "/imun/register/ca",
        theme: "dark"
    }
];

// Combine base roles with dynamic settings
function getConfiguredRoles(settings: SiteSettingsPublic) {
    const roles = [
        {
            ...BASE_ROLES[0],
            status: (settings.imun_eb_open ? "open" : "soon") as RegistrationStatus,
            form: settings.imun_eb_url || "#"
        },
        {
            ...BASE_ROLES[1],
            status: (settings.imun_del_open ? "open" : "soon") as RegistrationStatus,
            form: settings.imun_del_url || "#"
        },
        {
            ...BASE_ROLES[2],
            status: (settings.imun_ddel_open ? "open" : "soon") as RegistrationStatus,
            form: settings.imun_ddel_url || "#"
        },
        {
            ...BASE_ROLES[3],
            status: (settings.imun_ca_open ? "open" : "soon") as RegistrationStatus,
            form: settings.imun_ca_url || "#"
        }
    ];
    
    // Reorder roles dynamically so 'open' roles appear first
    const openRoles = roles.filter(r => r.status === "open");
    const otherRoles = roles.filter(r => r.status !== "open");
    
    return [
        openRoles.find(r => r.id === "ca"),
        openRoles.find(r => r.id === "ddel"),
        openRoles.find(r => r.id === "del"),
        openRoles.find(r => r.id === "eb"),
        otherRoles.find(r => r.id === "ca"),
        otherRoles.find(r => r.id === "ddel"),
        otherRoles.find(r => r.id === "del"),
        otherRoles.find(r => r.id === "eb")
    ].filter(Boolean) as typeof roles;
}

// --- 3D TILT & SPOTLIGHT CARD COMPONENT ---
function ImperialCard({ 
    children, 
    className, 
    delay = 0,
    status = "open"
}: { 
    children: React.ReactNode, 
    className?: string, 
    delay?: number,
    status?: RegistrationStatus
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <motion.div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`block relative flex-1 group ${status !== 'open' ? "opacity-80" : ""} rounded-[2.5rem] will-change-transform ${className}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.6, delay: delay > 0.5 ? 0 : delay }}
            whileHover={status === 'open' ? { y: -5 } : {}}
        >
            <div className="h-full relative overflow-hidden rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-500 bg-[#151515] transform-gpu">
                {children}
                <AnimatePresence>
                    {isHovered && status === 'open' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 pointer-events-none mix-blend-overlay hidden md:block" // Disabled hover effect on phone for performance
                            style={{
                                background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(242,196,95,0.15), transparent 40%)`
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

function StatusBadge({ status }: { status: RegistrationStatus }) {
    if (status === "open") {
        return (
            <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full mb-6">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span className="font-secondary text-[10px] uppercase tracking-widest font-bold text-green-500">Registration Open</span>
            </div>
        );
    }
    if (status === "closed") {
        return (
            <div className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full mb-6">
                <Lock className="w-3.5 h-3.5 text-red-500" />
                <span className="font-secondary text-[10px] uppercase tracking-widest font-bold text-red-500">Applications Closed</span>
            </div>
        );
    }
    return (
        <div className="inline-flex items-center gap-1.5 bg-[#f2c45f]/10 border border-[#f2c45f]/30 px-3 py-1 rounded-full mb-6">
            <Clock className="w-3.5 h-3.5 text-[#f2c45f]" />
            <span className="font-secondary text-[10px] uppercase tracking-widest font-bold text-[#f2c45f]">Opening Soon</span>
        </div>
    );
}

export default function FormsGridSection({ settings }: { settings: SiteSettingsPublic }) {
    const orderedRoles = getConfiguredRoles(settings);

    return (
        <section className="relative z-10 py-12 container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                
                {orderedRoles.map((role, i) => {
                    const Icon = role.icon;
                    const isGold = role.theme === "gold";

                    return (
                        <ImperialCard 
                            key={role.id} 
                            delay={0.1 * (i + 1)} 
                            status={role.status} 
                            className={
                                isGold 
                                    ? "bg-gradient-to-br from-[#f2c45f] via-[#dca943] to-[#b38e36] border border-white/20 lg:-translate-y-4 z-20 shadow-[0_20px_60px_rgba(242,196,95,0.3)] !bg-transparent group"
                                    : "bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-[#f2c45f]/20 hover:border-[#f2c45f]/60"
                            }
                        >
                            {isGold ? (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#f2c45f] via-[#dca943] to-[#b38e36] opacity-100 z-0 transition-opacity duration-300 group-hover:opacity-90" />
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/30 to-transparent opacity-60 z-0 pointer-events-none" />
                                </>
                            ) : (
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none" />
                            )}
                            
                            <div className="p-10 z-10 flex flex-col items-center h-full w-full justify-between relative">
                                <div className="flex flex-col items-center w-full relative z-20">
                                    
                                    <StatusBadge status={role.status} />

                                    <Link href={role.slug} className="group/icon">
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 relative overflow-hidden transition-transform duration-500 group-hover/icon:scale-110 cursor-pointer ${isGold ? 'bg-[#111111] shadow-xl' : 'bg-[#111111] border border-[#f2c45f]/30 shadow-inner'}`}>
                                            <div className={`absolute inset-0 opacity-10 ${isGold ? 'bg-[#f2c45f]' : 'bg-[#f2c45f] inner-glow'}`} />
                                            <Icon className={`w-10 h-10 ${isGold ? 'text-[#f2c45f]' : role.status === 'closed' ? 'text-neutral-500' : 'text-[#f2c45f]'}`} />
                                        </div>
                                    </Link>

                                    <h3 className={`font-primary font-bold uppercase tracking-widest mb-4 text-center ${isGold ? 'text-2xl md:text-4xl text-black filter drop-shadow-sm' : 'text-xl md:text-2xl text-white'}`}>
                                        {role.title}
                                    </h3>
                                    
                                    <p className={`font-secondary font-semibold mb-8 text-sm leading-relaxed max-w-[240px] text-center ${isGold ? 'text-black/80' : 'text-neutral-400'}`}>
                                        {role.desc}
                                    </p>
                                </div>
                                
                                <div className="mt-4 flex flex-col w-full relative z-20">
                                    {role.status === 'open' ? (
                                        <a 
                                            href={role.form} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className={`flex items-center justify-center gap-2 w-full font-primary text-sm uppercase tracking-widest px-8 py-4 rounded-full transition-all shadow-lg font-bold group/btn ${isGold ? 'bg-[#111111] text-[#f2c45f] hover:bg-black hover:shadow-[0_0_20px_rgba(17,17,17,0.4)]' : 'bg-[#f2c45f] text-black hover:bg-white'}`}
                                        >
                                            Register Now <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                        </a>
                                    ) : (
                                        <span className="inline-block w-full py-3 font-primary text-xs uppercase tracking-widest text-[#f2c45f]/70 border border-[#f2c45f]/20 bg-[#f2c45f]/5 rounded-full text-center">
                                            Opening Soon
                                        </span>
                                    )}
                                </div>
                            </div>
                        </ImperialCard>
                    );
                })}

            </div>
        </section>
    );
}