"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useEffect, ReactNode } from "react";

interface SpotlightEffectProps {
    children: ReactNode;
    className?: string;
}

export function SpotlightEffect({ children, className = "" }: SpotlightEffectProps) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
            mouseX.set(clientX);
            mouseY.set(clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className={`relative ${className}`}>
            {/* Background Spotlight Layer (Fixed) */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Lighter, Subtler Moving Spotlight */}
                <motion.div
                    className="absolute inset-0 opacity-100"
                    style={{
                        background: useMotionTemplate`
              radial-gradient(
                950px circle at ${mouseX}px ${mouseY}px,
                rgba(16, 185, 129, 0.12),
                rgba(212, 175, 55, 0.05) 35%,
                transparent 80%
              )
            `,
                    }}
                />
            </div>

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
