import React, { useState } from 'react';
import { Sparkles, GraduationCap, ArrowRight, User as UserIcon, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthPageProps {
  onAuthSuccess: (token: string, username: string, role: 'admin' | 'guest') => void;
  theme?: 'light' | 'dark';
}

export function AuthPage({ onAuthSuccess, theme = 'dark' }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'guest'>('guest');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { username, password }
      : { username, password, role };

    try {
      const response = await fetch(`http://localhost:5050${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onAuthSuccess(data.token, data.username, data.role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Interactive Floating background effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-72 h-72 rounded-full filter blur-[80px] opacity-20 ${
          isDark ? 'bg-zinc-800' : 'bg-[#e05a47]/30'
        }`} />
        <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full filter blur-[90px] opacity-20 ${
          isDark ? 'bg-zinc-900' : 'bg-[#cc5a37]/20'
        }`} />
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={`w-full max-w-md border p-8 rounded-3xl shadow-2xl relative z-10 backdrop-blur-md transition-colors duration-300 ${
          isDark ? 'bg-zinc-900/35 border-zinc-800/80 text-zinc-100' : 'bg-[#fbfaf7]/85 border-[#e5e2d9] text-[#191919]'
        }`}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-3 pb-6">
          <div className={`p-3 rounded-2xl border transition-colors ${
            isDark ? 'bg-zinc-950 border-zinc-850 text-zinc-400' : 'bg-[#cc5a37]/5 border-[#cc5a37]/20 text-[#cc5a37]'
          }`}>
            <GraduationCap size={32} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold tracking-tight flex items-center justify-center gap-1.5 ${
              isDark ? 'text-zinc-100' : 'text-[#191919]'
            }`}>
              {isLogin ? 'Welcome Back' : 'Join EduBase'}
              <Sparkles size={16} className={isDark ? 'text-zinc-500' : 'text-[#cc5a37]'} />
            </h2>
            <p className={`text-xs mt-1 font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
              {isLogin ? 'Sign in to access your student directory' : 'Create an account to manage database registers'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
              Username
            </label>
            <div className="relative">
              <UserIcon size={14} className="absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Enter username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full rounded-xl pl-9 pr-4 py-2.5 text-sm transition-colors focus:outline-none border ${
                  isDark
                    ? 'bg-zinc-950 border-zinc-850 text-zinc-100 placeholder-zinc-700 focus:border-zinc-700'
                    : 'bg-white border-[#e5e2d9] text-[#191919] placeholder-zinc-400 focus:border-zinc-400'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
              Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3 text-zinc-500" />
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-xl pl-9 pr-4 py-2.5 text-sm transition-colors focus:outline-none border ${
                  isDark
                    ? 'bg-zinc-950 border-zinc-850 text-zinc-100 placeholder-zinc-700 focus:border-zinc-700'
                    : 'bg-white border-[#e5e2d9] text-[#191919] placeholder-zinc-400 focus:border-zinc-400'
                }`}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <label className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                Select Account Role
              </label>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setRole('guest')}
                  className={`py-2 border text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    role === 'guest'
                      ? isDark
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                        : 'bg-[#cc5a37]/10 border-[#cc5a37] text-[#cc5a37]'
                      : isDark
                      ? 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-350'
                      : 'bg-white border-[#e5e2d9] text-zinc-550 hover:text-zinc-800'
                  }`}
                >
                  Guest (Read-Only)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 border text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    role === 'admin'
                      ? isDark
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                        : 'bg-[#cc5a37]/10 border-[#cc5a37] text-[#cc5a37]'
                      : isDark
                      ? 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-350'
                      : 'bg-white border-[#e5e2d9] text-zinc-550 hover:text-zinc-800'
                  }`}
                >
                  Admin (Full Access)
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-bold text-sm tracking-wide text-white border flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg disabled:opacity-50 ${
              isDark
                ? 'bg-zinc-850 hover:bg-zinc-800 border-zinc-750'
                : 'bg-gradient-to-r from-[#e05a47] to-[#cc5a37] border-red-500/15'
            }`}
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="pt-6 border-t border-zinc-850/10 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className={`text-xs font-semibold hover:underline cursor-pointer ${
              isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-[#cc5a37]'
            }`}
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : 'Already registered? Log In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
