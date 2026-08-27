import { FloatingPathsBackground } from './ui/floating-paths';
import { LiquidMetalButton } from './ui/liquid-metal-button';
import { HelpCircle } from 'lucide-react';

interface NotFoundProps {
  onGoHome: () => void;
  theme?: 'light' | 'dark';
}

export function NotFound({ onGoHome, theme = 'dark' }: NotFoundProps) {
  const isDark = theme === 'dark';

  return (
    <FloatingPathsBackground
      position={-1}
      className={`min-h-screen flex flex-col font-sans selection:bg-zinc-800 selection:text-white transition-colors duration-300 ${
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-[#fbfaf7] text-zinc-900'
      }`}
    >
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-6">
        <div className="relative">
          {/* Glowing pulse ring */}
          <div className={`absolute inset-0 rounded-full blur-xl animate-pulse ${
            isDark ? 'bg-zinc-500/10' : 'bg-[#cc5a37]/10'
          }`}></div>
          <div className={`relative border p-5 rounded-3xl inline-flex items-center justify-center shadow-2xl ${
            isDark ? 'bg-zinc-900 border-zinc-800 shadow-black/40' : 'bg-[#f5f2eb] border-[#e5e2d9] shadow-zinc-200/50'
          }`}>
            <HelpCircle size={48} className={isDark ? 'text-zinc-400' : 'text-[#cc5a37]'} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className={`text-5xl font-extrabold tracking-tight bg-clip-text text-transparent ${
            isDark ? 'bg-gradient-to-b from-white to-zinc-500' : 'bg-gradient-to-b from-[#cc5a37] to-[#e05a47]'
          }`}>
            404
          </h1>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
            Page Not Found
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-4">
          <LiquidMetalButton
            label="Go Back Home"
            onClick={onGoHome}
            theme={theme}
          />
        </div>
      </div>
    </FloatingPathsBackground>
  );
}
