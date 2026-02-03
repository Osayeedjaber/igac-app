"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CountUp } from "@/components/motion/count-up";

interface Stat {
    value: number;
    suffix: string;
    label: string;
}

interface StatsRotatorProps {
    stats: Stat[];
    interval?: number;
}

export function StatsRotator({ stats, interval = 3000 }: StatsRotatorProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % stats.length);
        }, interval);

        return () => clearInterval(timer);
    }, [stats.length, interval]);

    return (
        <div className="h-24 flex items-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col"
                >
                    <div className="flex items-baseline text-4xl md:text-5xl font-serif text-primary mb-1">
                        <CountUp value={stats[currentIndex].value} suffix={stats[currentIndex].suffix} />
                    </div>
                    <span className="text-sm uppercase tracking-wider text-muted-foreground/80">
                        {stats[currentIndex].label}
                    </span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
