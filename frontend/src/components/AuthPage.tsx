import React, { useState } from 'react';
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
  // Ring 1 (Radius 90px)
  {
    component: () => (
      <img
        className="w-7 h-7 filter drop-shadow-md transition-transform hover:scale-125"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg"
        alt="React 18"
      />
    ),
    className: 'size-[36px] border-none bg-transparent',
    duration: 18,
    delay: 0,
    radius: 90,
    path: true,
    reverse: false,
  },
  {
    component: () => (
      <img
        className="w-7 h-7 filter drop-shadow-md transition-transform hover:scale-125"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg"
        alt="TypeScript"
      />
    ),
    className: 'size-[36px] border-none bg-transparent',
    duration: 18,
    delay: 9,
    radius: 90,
    path: true,
    reverse: false,
  },

  // Ring 2 (Radius 150px)
  {
    component: () => (
      <img
        className="w-7 h-7 filter drop-shadow-md transition-transform hover:scale-125"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg"
        alt="Node.js"
      />
    ),
    className: 'size-[40px] border-none bg-transparent',
    duration: 22,
    delay: 0,
    radius: 150,
    path: true,
    reverse: true,
  },
  {
    component: () => (
      <img
        className="w-7 h-7 filter drop-shadow-md transition-transform hover:scale-125"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg"
        alt="Express 5"
      />
    ),
    className: 'size-[40px] border-none bg-transparent',
    duration: 22,
    delay: 7,
    radius: 150,
    path: true,
    reverse: true,
  },
  {
    component: () => (
      <img
        className="w-7 h-7 filter drop-shadow-md transition-transform hover:scale-125"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg"
        alt="Vite"
      />
    ),
    className: 'size-[40px] border-none bg-transparent',
    duration: 22,
    delay: 14,
    radius: 150,
    path: true,
    reverse: true,
  },

  // Ring 3 (Radius 210px)
  {
    component: () => (
      <img
        className="w-8 h-8 filter drop-shadow-md transition-transform hover:scale-125"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg"
        alt="MongoDB Atlas"
      />
    ),
    className: 'size-[44px] border-none bg-transparent',
    duration: 26,
    delay: 0,
    radius: 210,
    path: true,
    reverse: false,
  },
  {
    component: () => (
      <img
        className="w-8 h-8 filter drop-shadow-md transition-transform hover:scale-125"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg"
        alt="Tailwind CSS"
      />
    ),
    className: 'size-[44px] border-none bg-transparent',
    duration: 26,
    delay: 9,
    radius: 210,
    path: true,
    reverse: false,
  },
  {
    component: () => (
      <img
        className="w-8 h-8 filter drop-shadow-md transition-transform hover:scale-125"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jest/jest-plain.svg"
        alt="Jest Testing"
      />
    ),
    className: 'size-[44px] border-none bg-transparent',
    duration: 26,
    delay: 17,
    radius: 210,
    path: true,
    reverse: false,
  },

  // Ring 4 (Radius 270px)
  {
    component: () => (
      <img
        className="w-8 h-8 filter drop-shadow-md transition-transform hover:scale-125"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg"
        alt="Docker"
      />
    ),
    className: 'size-[48px] border-none bg-transparent',
    duration: 30,
    delay: 0,
    radius: 270,
    path: true,
    reverse: true,
  },
  {
    component: () => (
      <img
        className="w-8 h-8 filter drop-shadow-md transition-transform hover:scale-125"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg"
        alt="Git Version Control"
      />
    ),
    className: 'size-[48px] border-none bg-transparent',
    duration: 30,
    delay: 10,
    radius: 270,
    path: true,
    reverse: true,
  },
  {
    component: () => (
      <img
        className="w-8 h-8 filter drop-shadow-md transition-transform hover:scale-125"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg"
        alt="HTML5"
      />
    ),
    className: 'size-[48px] border-none bg-transparent',
    duration: 30,
    delay: 20,
    radius: 270,
    path: true,
    reverse: true,
  },

  // Ring 5 (Radius 330px)
  {
    component: () => (
      <img
        className="w-8 h-8 filter drop-shadow-md transition-transform hover:scale-125"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg"
        alt="CSS3"
      />
    ),
    className: 'size-[52px] border-none bg-transparent',
    duration: 34,
    delay: 0,
    radius: 330,
    path: true,
    reverse: false,
  },
  {
    component: () => (
      <img
        className="w-8 h-8 filter drop-shadow-md transition-transform hover:scale-125"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg"
        alt="JavaScript ES6"
      />
    ),
    className: 'size-[52px] border-none bg-transparent',
    duration: 34,
    delay: 11,
    radius: 330,
    path: true,
    reverse: false,
  },
  {
    component: () => (
      <img
        className="w-8 h-8 filter drop-shadow-md transition-transform hover:scale-125"
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nginx/nginx-original.svg"
        alt="Nginx Proxy"
      />
    ),
    className: 'size-[52px] border-none bg-transparent',
    duration: 34,
    delay: 22,
    radius: 330,
    path: true,
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
