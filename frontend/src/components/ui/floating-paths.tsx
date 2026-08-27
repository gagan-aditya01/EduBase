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
  // Generate 44 high-volume, vibrant curved paths sweeping across the viewport
  const paths = Array.from({ length: 44 }, (_, i) => {
    const offset = i * 16 * position;
    const verticalOffset = i * 14;
    return {
      id: i,
      // High-amplitude sweeping cubic bezier curves for rich volume
      d: `M -${400 - offset} -${200 + verticalOffset} C -${150 - offset} ${200 + verticalOffset}, ${300 + offset} ${550 + verticalOffset}, ${700 + offset} ${650 + verticalOffset} S ${1100 + offset} ${950 + verticalOffset}, ${1500 + offset} ${1200 + verticalOffset}`,
      width: 1.2 + (i % 4) * 0.5, // Thicker strokes for higher visibility
      strokeOpacity: 0.45 + (i % 6) * 0.07, // Higher opacity
      duration: 5.5 + (i % 7) * 1.2, // Fast lively flow
      delay: (i % 8) * 0.25,
    };
  });

  return (
    <div className={cn("w-full relative min-h-screen", className)}>
      {/* Fixed Background SVG Flow Lines - Pinned to Viewport across all scrolling */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <svg
          className="w-full h-full text-zinc-600/70 dark:text-zinc-300/65"
          viewBox="0 0 1000 600"
          fill="none"
          preserveAspectRatio="none"
        >
          {paths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={path.strokeOpacity}
              initial={{ pathLength: 0.4, opacity: 0.6 }}
              animate={{
                pathLength: [0.4, 1, 0.4],
                opacity: [0.5, 0.95, 0.5],
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
