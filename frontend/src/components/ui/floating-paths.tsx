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
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.8 + i * 0.04,
  }));

  return (
    <div className={cn("w-full relative min-h-screen", className)}>
      {/* Fixed Background SVG Flow Lines - Pinned to Viewport across all scrolling */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <svg
          className="w-full h-full text-zinc-500/50 dark:text-zinc-400/40"
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
              strokeOpacity={0.35 + path.id * 0.015}
              initial={{ pathLength: 0.4, opacity: 0.7 }}
              animate={{
                pathLength: 1,
                opacity: [0.4, 0.85, 0.4],
                pathOffset: [0, 1, 0],
              }}
              transition={{
                duration: 18 + (path.id % 6) * 2,
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
