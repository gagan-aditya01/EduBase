import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onToggle}
      className="relative flex items-center justify-between w-20 h-10 p-1 bg-zinc-950 dark:bg-zinc-900 border border-zinc-800/80 rounded-full cursor-pointer overflow-hidden focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-colors"
      aria-label="Toggle Theme"
    >
      {/* Sliding active pill indicator */}
      <motion.div
        className="absolute top-1 bottom-1 w-8 rounded-full bg-zinc-800 border border-zinc-700/50 shadow-md"
        animate={{
          left: isDark ? '4px' : '44px',
        }}
        transition={{
          type: 'spring',
          stiffness: 380,
          damping: 24,
        }}
      />

      {/* Icons */}
      <div className="z-10 flex items-center justify-center w-8 h-8">
        <Moon
          size={16}
          className={`${isDark ? 'text-zinc-100' : 'text-zinc-600'} transition-colors`}
        />
      </div>

      <div className="z-10 flex items-center justify-center w-8 h-8">
        <Sun
          size={16}
          className={`${!isDark ? 'text-zinc-100' : 'text-zinc-600'} transition-colors`}
        />
      </div>
    </button>
  );
}
