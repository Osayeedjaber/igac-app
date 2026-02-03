"use client";

import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    width?: "fit-content" | "100%";
    yOffset?: number;
    overflowVisible?: boolean;
}

export const Reveal = ({
    children,
    className,
    delay = 0.25,
    duration = 0.5,
    width = "fit-content",
    yOffset = 20,
    overflowVisible = false,
}: RevealProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const mainControls = useAnimation();

    useEffect(() => {
        if (isInView) {
            mainControls.start("visible");
        }
    }, [isInView, mainControls]);

    return (
        <div
            ref={ref}
            style={{ width, overflow: overflowVisible ? "visible" : "hidden" }}
            className={cn("relative", className)}
        >
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: yOffset },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate={mainControls}
                transition={{ duration, delay, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </div>
    );
};
