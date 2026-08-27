import { FloatingPathsBackground } from './ui/floating-paths';
import { LiquidMetalButton } from './ui/liquid-metal-button';
import { HelpCircle } from 'lucide-react';

interface NotFoundProps {
  onGoHome: () => void;
}

export function NotFound({ onGoHome }: NotFoundProps) {
  return (
    <FloatingPathsBackground
      position={-1}
      className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-6">
        <div className="relative">
          {/* Glowing pulse ring */}
          <div className="absolute inset-0 bg-zinc-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="relative bg-zinc-900 border border-zinc-800 p-5 rounded-3xl inline-flex items-center justify-center shadow-2xl">
            <HelpCircle size={48} className="text-zinc-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl font-semibold text-zinc-200">
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
          />
        </div>
      </div>
    </FloatingPathsBackground>
  );
}
