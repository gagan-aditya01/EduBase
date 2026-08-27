import { motion } from 'framer-motion';

interface Student {
  age: number;
  department: string;
}

interface DepartmentChartProps {
  students: Student[];
  theme?: 'light' | 'dark';
}

export function DepartmentChart({ students, theme = 'dark' }: DepartmentChartProps) {
  // Aggregate department counts
  const departmentCounts: Record<string, number> = {};
  students.forEach((s) => {
    const dept = s.department.trim() || 'General';
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
  });

  const chartData = Object.entries(departmentCounts).map(([name, count]) => ({
    name,
    count,
  }));

  const maxCount = chartData.length > 0 ? Math.max(...chartData.map((d) => d.count)) : 1;
  const isDark = theme === 'dark';

  return (
    <div className={`p-6 rounded-2xl backdrop-blur-sm space-y-4 border transition-colors duration-300 ${
      isDark ? 'bg-zinc-900/30 border-zinc-800/80' : 'bg-white border-[#e5e2d9] shadow-sm'
    }`}>
      <div>
        <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
          Department Distribution
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Visualizing record distribution across active programs.
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">
          No department data available.
        </div>
      ) : (
        <div className="overflow-x-auto pb-1.5 scrollbar-thin">
          <div 
            className="flex items-end pt-4 gap-4 h-48"
            style={{ 
              minWidth: `${Math.max(chartData.length * 68, 260)}px`,
              justifyContent: chartData.length <= 4 ? 'space-around' : 'flex-start'
            }}
          >
            {chartData.map((data, index) => {
              const pct = (data.count / maxCount) * 100;
              return (
                <div key={data.name} className="flex flex-col items-center flex-1 h-full justify-end group relative min-w-[56px]">
                  {/* Tooltip value */}
                  <div className={`absolute -top-6 border px-2 py-0.5 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap ${
                    isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-white border-[#e5e2d9] text-[#191919] shadow-sm'
                  }`}>
                    {data.count} {data.count === 1 ? 'student' : 'students'}
                  </div>

                  {/* Bar */}
                  <motion.div
                    className={`w-full max-w-[42px] rounded-t-lg border-x border-t transition-colors ${
                      isDark
                        ? 'bg-gradient-to-t from-zinc-900 to-zinc-700 border-zinc-800 group-hover:from-zinc-700 group-hover:to-zinc-500'
                        : 'bg-gradient-to-t from-[#e05a47] to-[#cc5a37] border-[#cc5a37]/20 group-hover:from-[#f06e5b] group-hover:to-[#e05a47]'
                    }`}
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 15, delay: index * 0.05 }}
                  />

                  {/* Label */}
                  <span className="block mt-2 text-[10px] font-mono text-zinc-500 truncate w-full text-center tracking-tight" title={data.name}>
                    {data.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
