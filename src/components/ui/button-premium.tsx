"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline" | "ghost" | "shimmer" | "magic";
    size?: "sm" | "md" | "lg";
    withArrow?: boolean;
}

export function Button({
    className,
    variant = "primary",
    size = "md",
    withArrow = false,
    children,
    ...props
}: ButtonProps) {
    const variants = {
        primary: "bg-[#d4af37] text-[#051b11] shadow-[0_4px_20px_rgba(212,175,55,0.15)] hover:bg-[#eac55a] hover:shadow-[0_8px_40px_rgba(212,175,55,0.4)]",
        outline: "border border-white/20 text-white hover:border-[#d4af37] hover:bg-white/5",
        ghost: "text-[#d4af37] hover:bg-[#d4af37]/10",
        shimmer: "animate-shimmer border border-white/10 bg-[linear-gradient(110deg,#051b11,45%,#0a2e1d,55%,#051b11)] bg-[length:200%_100%] text-white hover:border-[#d4af37]/50 transition-colors",
        magic: "bg-transparent p-0 overflow-hidden"
    };

    const sizes = {
        sm: "px-6 py-2.5 text-[10px]",
        md: "px-9 py-4 text-xs",
        lg: "px-11 py-5 text-sm"
    };

    if (variant === "magic") {
        return (
            <motion.div
                whileTap={{ scale: 0.98 }}
                className={cn("relative inline-flex overflow-hidden rounded-full p-[1.5px] focus:outline-none focus:ring-2 focus:ring-primary/50", className)}
            >
                <span className="absolute inset-[-1000%] animate-spin-slow bg-[conic-gradient(from_90deg_at_50%_50%,#051b11_0%,#d4af37_50%,#051b11_100%)]" />
                <span className={cn(
                    "inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-[#051b11] font-bold uppercase tracking-[0.25em] text-white backdrop-blur-3xl transition-all duration-300",
                    sizes[size]
                )}>
                    <span className="relative z-10 flex items-center gap-3">
                        {children}
                        {withArrow && <ArrowRight className="w-4 h-4 transition-transform duration-500 hover:translate-x-1.5" />}
                    </span>
                </span>
            </motion.div>
        );
    }

    return (
        <motion.div
            whileTap={{ scale: 0.98 }}
            className="inline-block relative z-10"
        >
            <button
                style={{ WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}
                className={cn(
                    "relative inline-flex items-center justify-center gap-3 font-bold uppercase tracking-[0.25em] rounded-full transition-all duration-500 select-none overflow-hidden group transform-gpu",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {variant !== "shimmer" && (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none z-0" />
                )}

                <span className="relative z-10 flex items-center gap-3">
                    {children}
                    {withArrow && <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1.5" />}
                </span>
            </button>
        </motion.div>
    );
}
