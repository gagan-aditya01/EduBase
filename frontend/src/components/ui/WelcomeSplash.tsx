import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppleHelloEnglishEffect } from './apple-hello-effect';

interface WelcomeSplashProps {
  username: string;
  role: 'admin' | 'guest' | 'faculty' | 'student';
  onComplete: () => void;
  theme?: 'dark' | 'light';
}

export function WelcomeSplash({ username, role, onComplete, theme = 'dark' }: WelcomeSplashProps) {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Show personalized name subtext after stroke animation starts
    const timer = setTimeout(() => {
      setShowText(true);
    }, 1000);

    // Auto dismiss welcome screen after 3.2 seconds
    const dismissTimer = setTimeout(() => {
      onComplete();
    }, 3300);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [onComplete]);

  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
      onClick={onComplete}
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center cursor-pointer select-none backdrop-blur-3xl transition-colors duration-500 ${
        isDark ? 'bg-zinc-950/95 text-white' : 'bg-[#fbfaf7]/95 text-zinc-900'
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-6 text-center p-6">
        {/* Apple style stroke animation */}
        <AppleHelloEnglishEffect speed={0.9} className="h-28 md:h-36 text-current drop-shadow-xl" />

        {/* Dynamic User Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 15 }}
          transition={{ type: 'spring', stiffness: 280, damping: 25 }}
          className="flex flex-col items-center gap-1.5"
        >
          <h2 className="text-xl md:text-2xl font-bold tracking-tight gradient-text">
            Welcome back, {username}!
          </h2>
          <span className="text-xs text-zinc-500 font-medium tracking-wide uppercase">
            {role === 'admin' ? 'Administrator Directory Access' : 'Guest Account Portal'}
          </span>
        </motion.div>

        {/* Soft tap to skip hint */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: showText ? 0.5 : 0 }}
          className="text-[10px] text-zinc-500 tracking-wider font-mono mt-8"
        >
          Tap anywhere to skip
        </motion.span>
      </div>
    </motion.div>
  );
}
