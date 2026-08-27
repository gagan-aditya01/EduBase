import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function FloatingPathsBackground({
  position,
  children,
  className,
}: {
  position: number;
  className?: string;
  children: React.ReactNode;
}) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(15,23,42,${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className={cn("w-full relative", className)}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <svg
          className="text-zinc-500/60"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          viewBox="0 0 696 316"
          fill="none"
          preserveAspectRatio="none"
        >
          {paths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeOpacity={0.25 + path.id * 0.02}
              initial={{ pathLength: 0.3, opacity: 0.6 }}
              animate={{
                pathLength: 1,
                opacity: [0.3, 0.7, 0.3],
                pathOffset: [0, 1, 0],
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          ))}
        </svg>
      </div>
      <div className="relative z-10 w-full flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
