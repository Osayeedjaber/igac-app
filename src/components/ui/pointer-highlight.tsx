"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useRef, useEffect, useState } from "react";

export function PointerHighlight({
  children,
  rectangleClassName,
  pointerClassName,
  containerClassName,
}: {
  children: React.ReactNode;
  rectangleClassName?: string;
  pointerClassName?: string;
  containerClassName?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      className={cn("relative w-full p-20 md:p-32", containerClassName)}
      ref={containerRef}
    >
      {children}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 overflow-visible"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Highlight Rectangle */}
          <motion.div
            className={cn(
              "absolute border border-primary/40 rounded-xl bg-primary/5 shadow-[0_0_30px_rgba(212,175,55,0.1)]",
              rectangleClassName,
            )}
            style={{
              top: 80,
              left: 80,
              width: dimensions.width - 160,
              height: dimensions.height - 160,
            }}
            initial={{ width: 0, height: 0, opacity: 0 }}
            whileInView={{
              width: dimensions.width - 160,
              height: dimensions.height - 160,
              opacity: 1
            }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Target Pointer */}
          <motion.div
            className="pointer-events-none absolute"
            initial={{ opacity: 0, x: 0, y: 0 }}
            whileInView={{
              opacity: 1,
              x: dimensions.width - 88,
              y: dimensions.height - 88,
            }}
            viewport={{ once: true }}
            style={{ rotate: -90 }}
            transition={{
              opacity: { duration: 0.5 },
              x: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 blur-[15px] rounded-full animate-pulse" />
              <Pointer
                className={cn("h-8 w-8 text-primary drop-shadow-[0_0_15px_rgba(212,175,55,0.7)] relative z-10", pointerClassName)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="absolute -top-10 -right-24 bg-primary/10 backdrop-blur-md border border-primary/20 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest text-primary font-bold whitespace-nowrap"
              >
                Curating Excellence
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

const Pointer = ({ ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 16 16"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"></path>
    </svg>
  );
};
