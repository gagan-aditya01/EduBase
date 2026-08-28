import React, { useState } from 'react';
import {
  Atom,
  FileCode,
  Server,
  Zap,
  Gauge,
  Database,
  Palette,
  ShieldCheck,
  Boxes,
  GitBranch,
  Globe,
  Code,
  Terminal,
  Cpu,
} from 'lucide-react';
import {
  Ripple,
  TechOrbitDisplay,
  AnimatedForm,
} from './ui/modern-animated-sign-in';

interface AuthPageProps {
  onAuthSuccess: (token: string, username: string, role: 'admin' | 'guest') => void;
  theme?: 'light' | 'dark';
}

const iconsArray = [
  // Ring 1 (Inner - Radius 90px)
  {
    component: () => (
      <Atom className="w-5 h-5 text-cyan-400" />
    ),
    duration: 18,
    radius: 90,
    reverse: false,
  },
  {
    component: () => (
      <FileCode className="w-5 h-5 text-blue-400" />
    ),
    duration: 18,
    radius: 90,
    reverse: false,
  },

  // Ring 2 (Radius 150px)
  {
    component: () => (
      <Server className="w-5 h-5 text-emerald-400" />
    ),
    duration: 22,
    radius: 150,
    reverse: true,
  },
  {
    component: () => (
      <Zap className="w-5 h-5 text-amber-400" />
    ),
    duration: 22,
    radius: 150,
    reverse: true,
  },
  {
    component: () => (
      <Gauge className="w-5 h-5 text-purple-400" />
    ),
    duration: 22,
    radius: 150,
    reverse: true,
  },

  // Ring 3 (Radius 210px)
  {
    component: () => (
      <Database className="w-5 h-5 text-green-500" />
    ),
    duration: 26,
    radius: 210,
    reverse: false,
  },
  {
    component: () => (
      <Palette className="w-5 h-5 text-teal-400" />
    ),
    duration: 26,
    radius: 210,
    reverse: false,
  },
  {
    component: () => (
      <ShieldCheck className="w-5 h-5 text-rose-400" />
    ),
    duration: 26,
    radius: 210,
    reverse: false,
  },

  // Ring 4 (Radius 270px)
  {
    component: () => (
      <Boxes className="w-5 h-5 text-sky-400" />
    ),
    duration: 30,
    radius: 270,
    reverse: true,
  },
  {
    component: () => (
      <GitBranch className="w-5 h-5 text-orange-500" />
    ),
    duration: 30,
    radius: 270,
    reverse: true,
  },
  {
    component: () => (
      <Globe className="w-5 h-5 text-orange-400" />
    ),
    duration: 30,
    radius: 270,
    reverse: true,
  },

  // Ring 5 (Outer - Radius 330px)
  {
    component: () => (
      <Code className="w-5 h-5 text-blue-500" />
    ),
    duration: 34,
    radius: 330,
    reverse: false,
  },
  {
    component: () => (
      <Terminal className="w-5 h-5 text-yellow-400" />
    ),
    duration: 34,
    radius: 330,
    reverse: false,
  },
  {
    component: () => (
      <Cpu className="w-5 h-5 text-emerald-300" />
    ),
    duration: 34,
    radius: 330,
    reverse: false,
  },
];

export function AuthPage({ onAuthSuccess, theme = 'dark' }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const role = 'guest';
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

  const handleSocialLogin = async (provider: 'Google' | 'GitHub') => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5050/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          username: `${provider.toLowerCase()}_user_${Math.floor(1000 + Math.random() * 9000)}`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Social login failed');
      }

      onAuthSuccess(data.token, data.username, data.role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      label: 'Username',
      required: true,
      type: 'text',
      placeholder: 'Enter your username',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value),
    },
    {
      label: 'Password',
      required: true,
      type: 'password',
      placeholder: 'Enter your password',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
    },
  ];

  return (
    <section className={`flex min-h-screen w-full relative overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-[#fbfaf7] text-[#191919]'
    }`}>
      {/* Left Column: Multi-Ring Tech Orbit & Animated Ripple Display (Hidden on Mobile) */}
      <div className={`relative hidden lg:flex w-1/2 items-center justify-center border-r backdrop-blur-xl overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-zinc-950/60 border-zinc-800/60' : 'bg-[#f5f2eb]/90 border-[#e5e2d9]'
      }`}>
        <Ripple mainCircleSize={90} numCircles={12} />
        <TechOrbitDisplay iconsArray={iconsArray} text="EduBase" />
      </div>

      {/* Right Column: Animated Login Form */}
      <div className="w-full lg:w-1/2 h-[100vh] flex flex-col justify-center items-center px-6 lg:px-12 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md">
          <AnimatedForm
            header={isLogin ? 'Welcome Back' : 'Join EduBase'}
            subHeader={
              isLogin
                ? 'Sign in to access your student directory'
                : 'Create an account to manage student database registers'
            }
            fields={formFields}
            submitButton={loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
            errorField={error}
            onSubmit={handleSubmit}
            onGoogleClick={() => handleSocialLogin('Google')}
            onGithubClick={() => handleSocialLogin('GitHub')}
            textVariantButton={
              isLogin
                ? "Don't have an account? Sign Up"
                : 'Already registered? Log In'
            }
            goTo={(e) => {
              e.preventDefault();
              setIsLogin(!isLogin);
              setError('');
            }}
          />
        </div>
      </div>
    </section>
  );
}
