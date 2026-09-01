import React, { useState } from 'react';
import {
  Ripple,
  TechOrbitDisplay,
  AnimatedForm,
} from './ui/modern-animated-sign-in';

interface AuthPageProps {
  onAuthSuccess: (
    token: string,
    username: string,
    role: 'admin' | 'guest' | 'faculty' | 'student',
    assignedDepartment?: string,
    facultyId?: string,
    assignedSubjects?: string[],
    name?: string,
    studentId?: string,
    department?: string,
    year?: string,
    section?: string
  ) => void;
  theme?: 'light' | 'dark';
}

// Official Technology Stack Brand Vector SVGs (Embedded Direct-in-Code, Pure Floating Vectors)
const iconsArray = [
  // Ring 1 (Radius 110px - Clears EduBase center text)
  {
    // React 18 Official Logo
    component: () => (
      <svg className="w-8 h-8 filter drop-shadow-md" viewBox="-11.5 -10.23174 23 20.46348">
        <circle r="2.05" fill="#61dafb" />
        <g stroke="#61dafb" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
    duration: 18,
    radius: 110,
    reverse: false,
  },
  {
    // TypeScript Official Logo
    component: () => (
      <svg className="w-8 h-8 rounded-md filter drop-shadow-md" viewBox="0 0 128 128">
        <rect width="128" height="128" rx="16" fill="#3178c6" />
        <path fill="#ffffff" d="M 68.7 109.8 C 70.8 112 75 113.6 80 113.6 C 88.5 113.6 93.3 109.4 93.3 102.7 C 93.3 93.3 80.9 90.7 80.9 83.2 C 80.9 79.5 84 77.2 88.9 77.2 C 92.9 77.2 96.2 78.4 98.4 79.9 L 101.4 70.3 C 98.6 68.7 94.2 67.6 88.7 67.6 C 79.9 67.6 71 72.3 71 83.3 C 71 92.4 83.7 94.8 83.7 102.2 C 83.7 106.3 80.1 108.5 74.8 108.5 C 70.4 108.5 66.3 106.8 63.8 105 L 68.7 109.8 Z M 23.3 69.1 H 59.8 V 78.2 H 46.4 V 112.5 H 36.7 V 78.2 H 23.3 V 69.1 Z" />
      </svg>
    ),
    duration: 18,
    radius: 110,
    reverse: false,
  },

  // Ring 2 (Radius 170px)
  {
    // Node.js Official Logo
    component: () => (
      <svg className="w-8 h-8 filter drop-shadow-md" viewBox="0 0 128 128">
        <path fill="#539e43" d="M64 12.8L16 40.5v55.5l48 27.7 48-27.7V40.5L64 12.8z" />
        <path fill="#ffffff" d="M64 34.1c-1.6 0-3.1.4-4.5 1.2L34.1 49.8c-2.8 1.6-4.5 4.6-4.5 7.8v29c0 3.2 1.7 6.2 4.5 7.8l25.4 14.5c1.4.8 2.9 1.2 4.5 1.2s3.1-.4 4.5-1.2l25.4-14.5c2.8-1.6 4.5-4.6 4.5-7.8v-29c0-3.2-1.7-6.2-4.5-7.8L68.5 35.3c-1.4-.8-2.9-1.2-4.5-1.2z" />
      </svg>
    ),
    duration: 22,
    radius: 170,
    reverse: true,
  },
  {
    // Express.js Sleek Pill Badge
    component: () => (
      <span className="px-2 py-0.5 bg-white text-zinc-900 border border-zinc-300 font-extrabold text-[10px] rounded-xs shadow-md font-mono tracking-tight">
        EXPRESS
      </span>
    ),
    duration: 22,
    radius: 170,
    reverse: true,
  },
  {
    // Vite Official Logo
    component: () => (
      <svg className="w-8 h-8 filter drop-shadow-md" viewBox="0 0 256 257">
        <defs>
          <linearGradient id="viteA" x1="98.6%" y1="0%" x2="0%" y2="100%">
            <stop stopColor="#41D1FF" offset="0%" />
            <stop stopColor="#BD34FE" offset="100%" />
          </linearGradient>
          <linearGradient id="viteB" x1="23.2%" y1="0%" x2="84.4%" y2="100%">
            <stop stopColor="#FFEA83" offset="0%" />
            <stop stopColor="#FFDD35" offset="8%" />
            <stop stopColor="#FFA800" offset="100%" />
          </linearGradient>
        </defs>
        <path fill="url(#viteA)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-3.106-5.434 1.758-12.06 7.863-10.74l120.73 26.064a6.55 6.55 0 002.785 0l115.037-26.064c6.105-1.32 10.969 5.306 7.863 10.74z" />
        <path fill="url(#viteB)" d="M185.432 0L96.442 17.514a3.275 3.275 0 00-2.634 3.014l-8.91 106.634a3.275 3.275 0 004.343 3.328l25.864-8.89a3.275 3.275 0 014.28 3.518l-9.155 58.74c-.655 4.2 4.542 6.942 7.747 4.08l78.892-70.478a3.275 3.275 0 00-1.258-5.454l-25.755-8.381a3.275 3.275 0 01-2.185-3.666l10.842-57.915C203.43 1.83 191.077-1.11 185.432 0z" />
      </svg>
    ),
    duration: 22,
    radius: 170,
    reverse: true,
  },

  // Ring 3 (Radius 230px)
  {
    // MongoDB Official Logo
    component: () => (
      <svg className="w-8 h-8 filter drop-shadow-md" viewBox="0 0 128 128">
        <path fill="#47A248" d="M63.8 2.2c-.4.4-6.4 12.3-9.5 18.6C44.7 40 37.5 61.2 37.5 76c0 15 6 27 16.5 35.8 3.5 2.9 8.6 6.3 9.4 6.3.3 0 1-2.7 1.5-6 .7-4.4 1.5-22 1.5-31.5v-27l-2.6-1.5c-2.3-1.3-2.6-2.1-2.6-6.1 0-4.1.3-4.8 2.6-6.1l2.6-1.5V2.2zm.4 0v35.7l2.6 1.5c2.3 1.3 2.6 2.1 2.6 6.1 0 4.1-.3 4.8-2.6 6.1l-2.6 1.5V118c.8 0 5.9-3.4 9.4-6.3 10.5-8.8 16.5-20.8 16.5-35.8 0-14.8-7.2-36-16.8-55.2-3.1-6.3-9.1-18.2-9.5-18.5z" />
      </svg>
    ),
    duration: 26,
    radius: 230,
    reverse: false,
  },
  {
    // Tailwind CSS Official Logo
    component: () => (
      <svg className="w-8 h-8 filter drop-shadow-md" viewBox="0 0 128 128">
        <path fill="#38BDF8" d="M37.3 26.7C20 26.7 9.3 35.3 5.3 52.7c6.7-9.3 14.7-12 24-8 5.3 2.3 9.1 6.2 13.3 10.5C49.5 62 57.5 70 77.3 70c17.3 0 28-8.7 32-26-6.7 9.3-14.7 12-24 8-5.3-2.3-9.1-6.2-13.3-10.5C65.2 34.7 57.2 26.7 37.3 26.7zm-32 43.3C-12 70-22.7 78.7-26.7 96c6.7-9.3 14.7-12 24-8 5.3 2.3 9.1 6.2 13.3 10.5 6.9 6.8 14.9 14.8 34.7 14.8 17.3 0 28-8.7 32-26-6.7 9.3-14.7 12-24 8-5.3-2.3-9.1-6.2-13.3-10.5C33.2 78 25.2 70 5.3 70z" />
      </svg>
    ),
    duration: 26,
    radius: 230,
    reverse: false,
  },
  {
    // Jest Official Logo
    component: () => (
      <svg className="w-8 h-8 filter drop-shadow-md" viewBox="0 0 128 128">
        <path fill="#C21325" d="M110 18c-12-12-32-12-44 0L24 60c-12 12-12 32 0 44s32 12 44 0l42-42c12-12 12-32 0-44z" />
        <circle cx="48" cy="48" r="8" fill="#FFF" />
      </svg>
    ),
    duration: 26,
    radius: 230,
    reverse: false,
  },

  // Ring 4 (Radius 290px)
  {
    // Docker Official Logo
    component: () => (
      <svg className="w-8 h-8 filter drop-shadow-md" viewBox="0 0 128 128">
        <path fill="#2496ED" d="M124.9 57.1c-3.1-2.2-9.8-3.1-15.6-1.5-1.5-6.5-6.2-10.7-12.7-10.7-4.1 0-7.8 1.8-10.3 4.6-4.5-2.9-10.1-4.2-16.1-3.6V33.6h11.7V20.2H68.8V6.7H55.4v13.5H42.1v13.4h13.3v12.3c-2.3.3-4.6.9-6.8 1.8H6.7v37.8c0 14.6 11.9 26.5 26.5 26.5h57.6c19.3 0 34.6-13.5 35.8-31.5 2.6.2 5.1-.2 7.3-1.2 3.8-1.7 6.4-4.8 6.4-8.8 0-4.6-3.8-7.9-9.4-13.4z" />
      </svg>
    ),
    duration: 30,
    radius: 290,
    reverse: true,
  },
  {
    // Git Official Logo
    component: () => (
      <svg className="w-8 h-8 filter drop-shadow-md" viewBox="0 0 128 128">
        <path fill="#F05032" d="M122.7 57.6L70.4 5.3c-3.8-3.8-10-3.8-13.8 0L42.2 19.7l17.5 17.5c3.5-1.2 7.6-.4 10.4 2.4 2.8 2.8 3.6 6.9 2.4 10.4l16.8 16.8c3.5-1.2 7.6-.4 10.4 2.4 3.9 3.9 3.9 10.2 0 14.1-3.9 3.9-10.2 3.9-14.1 0-2.9-2.9-3.7-7-2.4-10.5L61.3 56c-1.2.4-2.5.6-3.8.6-2.5 0-4.9-1-6.7-2.8-2.7-2.7-3.5-6.6-2.4-10.1L31.2 26.5 5.3 52.4c-3.8 3.8-3.8 10 0 13.8l52.3 52.3c3.8 3.8 10 3.8 13.8 0l51.3-51.3c3.8-3.7 3.8-9.9 0-13.6z" />
      </svg>
    ),
    duration: 30,
    radius: 290,
    reverse: true,
  },
  {
    // HTML5 Official Logo
    component: () => (
      <svg className="w-8 h-8 filter drop-shadow-md" viewBox="0 0 128 128">
        <path fill="#E34F26" d="M19.2 116.8L9.6 9h108.8l-9.6 107.8-44.8 12.4z" />
        <path fill="#EF652A" d="M64 116.8l36.5-10.1 8.3-93.5H64z" />
        <path fill="#FFF" d="M64 54.3H43.9l-1.4-15.7H64V23.7H25.7l4.1 46.3H64zm0 35.8l-.2.1-16.7-4.5-1.1-12.1H30.2l2.1 23.9 31.7 8.8.2-.1z" />
        <path fill="#EEE" d="M64 54.3v14.9h18.6l-1.8 19.7-16.8 4.5v15.6l31.7-8.8 3.5-39.2c.5-2.1.2-6.7.2-6.7H64zm0-30.6v14.9h39.7l1.3-14.9z" />
      </svg>
    ),
    duration: 30,
    radius: 290,
    reverse: true,
  },

  // Ring 5 (Outer - Radius 350px)
  {
    // CSS3 Official Logo
    component: () => (
      <svg className="w-8 h-8 filter drop-shadow-md" viewBox="0 0 128 128">
        <path fill="#1572B6" d="M19.2 116.8L9.6 9h108.8l-9.6 107.8-44.8 12.4z" />
        <path fill="#33A9DC" d="M64 116.8l36.5-10.1 8.3-93.5H64z" />
        <path fill="#FFF" d="M64 54.3H43.9l-1.4-15.7H64V23.7H25.7l4.1 46.3H64zm0 35.8l-.2.1-16.7-4.5-1.1-12.1H30.2l2.1 23.9 31.7 8.8.2-.1z" />
        <path fill="#EEE" d="M64 54.3v14.9h18.6l-1.8 19.7-16.8 4.5v15.6l31.7-8.8 3.5-39.2c.5-2.1.2-6.7.2-6.7H64zm0-30.6v14.9h39.7l1.3-14.9z" />
      </svg>
    ),
    duration: 34,
    radius: 350,
    reverse: false,
  },
  {
    // JavaScript Official Logo
    component: () => (
      <svg className="w-8 h-8 rounded-md filter drop-shadow-md" viewBox="0 0 128 128">
        <rect width="128" height="128" rx="16" fill="#F7DF1E" />
        <path fill="#000000" d="M67.3 104c3.3 5.4 8.5 8.9 16.7 8.9 7.1 0 11.6-3.5 11.6-8.6 0-5.8-4.6-7.9-12.3-11.2l-4.3-1.9c-12.4-5.3-20.6-11.8-20.6-25.7 0-14 10.9-24.5 28-24.5 12.2 0 20.3 4.3 25.7 13.9l-12.9 8.3c-2.8-4.9-6.5-7.3-12.5-7.3-5.3 0-8.8 2.7-8.8 6.5 0 4.6 3.4 6.7 10.4 9.7l4.3 1.9c14.6 6.3 22.8 12.5 22.8 26.6 0 15.3-11.8 25.7-30.4 25.7-15.6 0-25.2-6.4-30.1-16.5l12.4-7.8zM24.7 104c2.8 4.9 6.8 7.9 13 7.9 6.1 0 10-2.4 10-11.7V42h16.2v58.8c0 18.2-10.4 25.6-25.7 25.6-12.5 0-21.4-6.3-25.7-15.5l12.2-6.9z" />
      </svg>
    ),
    duration: 34,
    radius: 350,
    reverse: false,
  },
  {
    // Nginx Official Logo
    component: () => (
      <svg className="w-8 h-8 filter drop-shadow-md" viewBox="0 0 128 128">
        <path fill="#009639" d="M64 8L8 40v48l56 32 56-32V40L64 8zm24 72l-16-24v24H56V48h16l16 24V48h16v32H88z" />
      </svg>
    ),
    duration: 34,
    radius: 350,
    reverse: false,
  },
];

export function AuthPage({ onAuthSuccess, theme = 'dark' }: AuthPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

    try {
      const response = await fetch('http://localhost:5050/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onAuthSuccess(
        data.token,
        data.username,
        data.role,
        data.assignedDepartment,
        data.facultyId,
        data.assignedSubjects,
        data.name,
        data.studentId,
        data.department,
        data.year,
        data.section
      );
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
        <Ripple mainCircleSize={120} numCircles={12} />
        <TechOrbitDisplay iconsArray={iconsArray} text="EduBase" />
      </div>

      {/* Right Column: Animated Login Form */}
      <div className="w-full lg:w-1/2 h-[100vh] flex flex-col justify-center items-center px-6 lg:px-12 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md">
          <AnimatedForm
            header="EduBase Portal"
            subHeader="Enter your Admin, Faculty, or Student Registration ID"
            fields={formFields}
            submitButton={loading ? 'Authenticating...' : 'Sign In to Portal'}
            errorField={error}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </section>
  );
}
