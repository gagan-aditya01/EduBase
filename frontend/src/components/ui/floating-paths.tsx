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
  // Generate 32 ultra-smooth, silky organic curved paths fanned out gracefully across the screen
  const paths = Array.from({ length: 32 }, (_, i) => {
    const offset = i * 14 * position;
    const verticalOffset = i * 12;
    return {
      id: i,
      // Ultra-smooth continuous cubic bezier curves
      d: `M -${300 - offset} -${150 + verticalOffset} C -${100 - offset} ${100 + verticalOffset}, ${200 + offset} ${350 + verticalOffset}, ${500 + offset} ${450 + verticalOffset} S ${900 + offset} ${750 + verticalOffset}, ${1300 + offset} ${950 + verticalOffset}`,
      width: 0.8 + (i % 4) * 0.35,
      duration: 6 + (i % 6) * 1.5, // Faster recurring animation speed
      delay: (i % 8) * 0.3,
    };
  });

  return (
    <div className={cn("w-full relative min-h-screen", className)}>
      {/* Fixed Background SVG Flow Lines - Pinned to Viewport across all scrolling */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <svg
          className="w-full h-full text-zinc-500/45 dark:text-zinc-400/40"
          viewBox="0 0 1000 600"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          {paths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={0.3 + (path.id % 6) * 0.05}
              initial={{ pathLength: 0.35, opacity: 0.5 }}
              animate={{
                pathLength: [0.35, 1, 0.35],
                opacity: [0.35, 0.8, 0.35],
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
