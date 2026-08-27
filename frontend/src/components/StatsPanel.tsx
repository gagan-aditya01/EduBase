import { useEffect, useState, useRef } from 'react';
import { Users, Calendar, Network } from 'lucide-react';

interface StatsPanelProps {
  students: Array<{
    age: number;
    department: string;
  }>;
  theme?: 'light' | 'dark';
}

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 600; // Counter animation duration in ms
    const startValue = prevValue.current;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function (easeOutQuad)
      const easeProgress = progress * (2 - progress);
      
      const currentVal = Math.round(startValue + easeProgress * (endValue - startValue));
      setCount(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        prevValue.current = endValue;
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return <>{count}</>;
}

export function StatsPanel({ students, theme = 'dark' }: StatsPanelProps) {
  // Calculations
  const totalStudents = students.length;
  
  const avgAge = totalStudents > 0 
    ? Math.round(students.reduce((sum, s) => sum + s.age, 0) / totalStudents)
    : 0;

  const departments = new Set(students.map(s => s.department.toLowerCase().trim()));
  const activeDeps = totalStudents > 0 ? departments.size : 0;

  const isDark = theme === 'dark';

  const cardClass = `border p-5 rounded-2xl flex items-center gap-4 backdrop-blur-sm transition-all duration-300 ${
    isDark
      ? 'bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-800'
      : 'bg-[#f5f2eb] border-[#e5e2d9] hover:border-zinc-300 shadow-sm'
  }`;

  const iconClass = `border p-3 rounded-xl transition-colors duration-300 ${
    isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-[#cc5a37]/5 border-[#cc5a37]/20 text-[#cc5a37]'
  }`;

  const titleClass = `block text-xs font-semibold uppercase tracking-wider ${
    isDark ? 'text-zinc-500' : 'text-[#cc5a37]'
  }`;

  const numClass = `text-2xl font-bold tracking-tight transition-colors duration-300 ${
    isDark ? 'text-zinc-100' : 'text-[#191919]'
  }`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Students Card */}
      <div className={cardClass}>
        <div className={iconClass}>
          <Users size={20} />
        </div>
        <div>
          <span className={titleClass}>
            Total Students
          </span>
          <span className={numClass}>
            <AnimatedCounter value={totalStudents} />
          </span>
        </div>
      </div>

      {/* Average Age Card */}
      <div className={cardClass}>
        <div className={iconClass}>
          <Calendar size={20} />
        </div>
        <div>
          <span className={titleClass}>
            Average Age
          </span>
          <span className={numClass}>
            <AnimatedCounter value={avgAge} /> y/o
          </span>
        </div>
      </div>

      {/* Active Departments Card */}
      <div className={cardClass}>
        <div className={iconClass}>
          <Network size={20} />
        </div>
        <div>
          <span className={titleClass}>
            Active Departments
          </span>
          <span className={numClass}>
            <AnimatedCounter value={activeDeps} />
          </span>
        </div>
      </div>
    </div>
  );
}
