import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function FloatingPathsBackground({
  position = 1,
  children,
  className,
}: {
  position?: number;
  className?: string;
  children: React.ReactNode;
}) {
  // Generate sweeping organic bezier paths across a 1200x1200 coordinate space
  const paths1 = Array.from({ length: 24 }, (_, i) => ({
    id: `p1-${i}`,
    d: `M-${200 - i * 15 * position} -${100 + i * 20} C${100 - i * 10} ${300 + i * 25}, ${400 + i * 20} ${500 - i * 15}, ${900 + i * 25} ${1200 + i * 10}`,
    width: 0.8 + (i % 3) * 0.4,
    duration: 18 + (i % 7) * 3,
    delay: (i % 5) * 0.8,
  }));

  const paths2 = Array.from({ length: 20 }, (_, i) => ({
    id: `p2-${i}`,
    d: `M${1400 + i * 15 * position} -${50 + i * 25} C${1000 - i * 20} ${400 + i * 15}, ${600 - i * 15} ${800 - i * 20}, -${100 + i * 20} ${1300 + i * 15}`,
    width: 0.6 + (i % 3) * 0.4,
    duration: 22 + (i % 6) * 3,
    delay: (i % 4) * 0.9,
  }));

  return (
    <div className={cn("w-full relative min-h-screen", className)}>
      {/* Background SVG Flow Lines Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <svg
          className="w-full h-full text-zinc-500/25 dark:text-zinc-400/20"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          viewBox="0 0 1200 1200"
          fill="none"
          preserveAspectRatio="xMidYMin slice"
        >
          {paths1.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeLinecap="round"
              initial={{ pathLength: 0.2, opacity: 0.2 }}
              animate={{
                pathLength: [0.3, 0.95, 0.3],
                opacity: [0.2, 0.55, 0.2],
                pathOffset: [0, 1, 0],
              }}
              transition={{
                duration: path.duration,
                delay: path.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          ))}
          {paths2.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeLinecap="round"
              initial={{ pathLength: 0.2, opacity: 0.15 }}
              animate={{
                pathLength: [0.25, 0.9, 0.25],
                opacity: [0.15, 0.45, 0.15],
                pathOffset: [0, 1, 0],
              }}
              transition={{
                duration: path.duration,
                delay: path.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          ))}
        </svg>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
