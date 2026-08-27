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
  // Layer 1: 36 primary sweeping flow paths
  const layer1 = Array.from({ length: 36 }, (_, i) => {
    const offset = i * 18 * position;
    const verticalOffset = i * 16;
    return {
      id: `l1-${i}`,
      d: `M -${500 - offset} -${250 + verticalOffset} C -${200 - offset} ${200 + verticalOffset}, ${350 + offset} ${500 - i * 10}, ${800 + offset} ${750 + verticalOffset} S ${1300 + offset} ${1050 + verticalOffset}, ${1700 + offset} ${1300 + verticalOffset}`,
      width: 0.9 + (i % 5) * 0.45,
      strokeOpacity: 0.4 + (i % 6) * 0.08,
      duration: 4.5 + (i % 7) * 1.1,
      delay: (i % 8) * 0.2,
    };
  });

  // Layer 2: 30 counter-sweeping flow paths for high-density 3D depth
  const layer2 = Array.from({ length: 30 }, (_, i) => {
    const offset = i * 20 * position;
    const verticalOffset = i * 18;
    return {
      id: `l2-${i}`,
      d: `M ${1600 + offset} -${200 - verticalOffset} C ${1200 + offset} ${300 + verticalOffset}, ${700 - offset} ${650 - i * 12}, ${200 - offset} ${900 + verticalOffset} S -${300 + offset} ${1150 + verticalOffset}, -${800 + offset} ${1400 + verticalOffset}`,
      width: 0.8 + (i % 4) * 0.4,
      strokeOpacity: 0.35 + (i % 5) * 0.07,
      duration: 5.2 + (i % 6) * 1.2,
      delay: (i % 7) * 0.25,
    };
  });

  return (
    <div className={cn("w-full relative min-h-screen", className)}>
      {/* Fixed Background SVG Flow Lines - High Density Multi-Layer Stream Field */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <svg
          className="w-full h-full text-zinc-600/75 dark:text-zinc-300/70"
          viewBox="0 0 1000 600"
          fill="none"
          preserveAspectRatio="none"
        >
          {layer1.map((path) => (
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
                pathLength: [0.45, 1, 0.45],
                opacity: [0.55, 0.95, 0.55],
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
          {layer2.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={path.strokeOpacity}
              initial={{ pathLength: 0.35, opacity: 0.5 }}
              animate={{
                pathLength: [0.4, 0.95, 0.4],
                opacity: [0.45, 0.88, 0.45],
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
