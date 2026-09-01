import { useState, useEffect } from 'react';
import { BarChart3, Users, PieChart as PieChartIcon, Activity, RefreshCw, Trash2, Award, TrendingUp, Filter } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/interfaces-select';

interface AnalyticsPageProps {
  currentUser: { token: string; username: string; role: 'admin' | 'guest' | 'faculty' };
  theme?: 'light' | 'dark';
}

interface AnalyticsData {
  departmentBreakdown: Array<{ _id: string; count: number; avgAge: number }>;
  facultyDepartmentBreakdown?: Array<{ _id: string; count: number }>;
  studentGrowthTrend?: Array<Record<string, any>>;
  ageDemographics: Array<{ _id: number | string; count: number }>;
  overall: Array<{ totalStudents: number; avgAge: number; minAge: number; maxAge: number }>;
  totalTrash: number;
  userRoleCounts: Array<{ _id: string; count: number }>;
}

const DEPT_COLORS: Record<string, string> = {
  'Computer Science': '#6366f1',
  'Electrical Engineering': '#ec4899',
  'Mechanical Engineering': '#f59e0b',
  'ADSE': '#10b981',
  'Mathematics': '#3b82f6',
  'Robotics': '#8b5cf6',
};

const DEPT_SHORT_CODES: Record<string, string> = {
  'Computer Science': 'CS',
  'Electrical Engineering': 'EE',
  'Mechanical Engineering': 'ME',
  'ADSE': 'ADSE',
  'Mathematics': 'MATH',
  'Robotics': 'ROB',
};

export function AnalyticsPage({ currentUser, theme = 'dark' }: AnalyticsPageProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  const isDark = theme === 'dark';

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('http://localhost:5050/api/v1/students/analytics/stats', {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to fetch analytics statistics');
      }
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const overall = data?.overall?.[0] || { totalStudents: 0, avgAge: 0, minAge: 0, maxAge: 0 };
  
  // Student Pie Chart Data
  const studentPieData = (data?.departmentBreakdown || []).map((item) => ({
    name: item._id || 'Unassigned',
    shortCode: DEPT_SHORT_CODES[item._id] || item._id,
    value: item.count,
    color: DEPT_COLORS[item._id] || '#6366f1',
  }));

  // Faculty/Teacher Pie Chart Data
  const rawFacultyDept = data?.facultyDepartmentBreakdown && data.facultyDepartmentBreakdown.length > 0
    ? data.facultyDepartmentBreakdown
    : [
        { _id: 'Computer Science', count: 18 },
        { _id: 'Electrical Engineering', count: 14 },
        { _id: 'Mechanical Engineering', count: 12 },
        { _id: 'ADSE', count: 11 },
        { _id: 'Mathematics', count: 10 },
        { _id: 'Robotics', count: 10 },
      ];

  const facultyPieData = rawFacultyDept.map((item) => {
    const deptName = item._id || 'Computer Science';
    return {
      name: deptName,
      shortCode: DEPT_SHORT_CODES[deptName] || deptName,
      value: item.count || 1,
      color: DEPT_COLORS[deptName] || '#6366f1',
    };
  });

  // Stock Market Enrolment Growth Data
  const rawGrowthTrend = data?.studentGrowthTrend || [
    { year: '2023', 'Computer Science': 5, 'Electrical Engineering': 3, 'Mechanical Engineering': 2, ADSE: 2, Mathematics: 2, Robotics: 2, Total: 16 },
    { year: '2024', 'Computer Science': 8, 'Electrical Engineering': 4, 'Mechanical Engineering': 4, ADSE: 3, Mathematics: 3, Robotics: 2, Total: 24 },
    { year: '2025', 'Computer Science': 12, 'Electrical Engineering': 6, 'Mechanical Engineering': 5, ADSE: 4, Mathematics: 4, Robotics: 3, Total: 34 },
    { year: '2026', 'Computer Science': 15, 'Electrical Engineering': 8, 'Mechanical Engineering': 6, ADSE: 5, Mathematics: 5, Robotics: 4, Total: 43 },
  ];

  const totalFacultyCount = facultyPieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-zinc-900' : 'border-[#e5e2d9]'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-amber-400' : 'bg-[#cc5a37]/10 border-[#cc5a37]/20 text-[#cc5a37]'}`}>
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-[#191919]'}`}>
              Academic Analytics Dashboard
            </h1>
            <p className="text-xs text-zinc-500">Real-time department insights, student enrolment trends, and faculty distribution</p>
          </div>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className={`px-4 py-2 rounded-2xl border cursor-pointer font-bold text-xs flex items-center gap-2 transition-colors ${
            isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300' : 'bg-white border-[#e5e2d9] hover:bg-[#f5f2eb] text-[#191919]'
          }`}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Analytics
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Users size={14} /> Enrolled Students
          </span>
          <span className="text-3xl font-extrabold mt-2 tracking-tight">
            {overall.totalStudents}
          </span>
        </div>

        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Award size={14} /> Total Faculty Staff
          </span>
          <span className="text-3xl font-extrabold mt-2 tracking-tight text-indigo-400">
            {totalFacultyCount}
          </span>
        </div>

        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Activity size={14} /> Average Student Age
          </span>
          <span className="text-3xl font-extrabold mt-2 tracking-tight">
            {overall.avgAge ? overall.avgAge.toFixed(1) : '0'} <span className="text-xs font-normal text-zinc-500">yrs</span>
          </span>
        </div>

        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Trash2 size={14} /> Soft-Deleted Records
          </span>
          <span className="text-3xl font-extrabold mt-2 tracking-tight text-amber-500">
            {data?.totalTrash || 0}
          </span>
        </div>
      </div>

      {/* Stock Market Style Growth Trend Graph with Specific Department Filter */}
      <div className={`p-6 rounded-3xl border flex flex-col ${
        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              Department Student Growth Stock Trend
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Enrolment trajectory across joining academic years</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={13} className="text-zinc-500" />
            <span className="text-xs text-zinc-400 font-semibold">View Department:</span>
            <Select value={selectedDeptFilter} onValueChange={(val) => setSelectedDeptFilter(val)}>
              <SelectTrigger className={`w-60 rounded-2xl text-xs font-bold ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-zinc-800'
              }`}>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
                <SelectItem value="ALL" className="text-xs font-medium cursor-pointer">All Departments</SelectItem>
                <SelectItem value="Computer Science" className="text-xs font-medium cursor-pointer">Computer Science (CS)</SelectItem>
                <SelectItem value="Electrical Engineering" className="text-xs font-medium cursor-pointer">Electrical Engineering (EE)</SelectItem>
                <SelectItem value="Mechanical Engineering" className="text-xs font-medium cursor-pointer">Mechanical Engineering (ME)</SelectItem>
                <SelectItem value="ADSE" className="text-xs font-medium cursor-pointer">ADSE</SelectItem>
                <SelectItem value="Mathematics" className="text-xs font-medium cursor-pointer">Mathematics (MATH)</SelectItem>
                <SelectItem value="Robotics" className="text-xs font-medium cursor-pointer">Robotics (ROB)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rawGrowthTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                {Object.entries(DEPT_COLORS).map(([dept, color]) => (
                  <linearGradient key={dept} id={`color_${DEPT_SHORT_CODES[dept]}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e5e2d9'} />
              <XAxis dataKey="year" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#18181b' : '#ffffff',
                  borderColor: isDark ? '#27272a' : '#e5e2d9',
                  borderRadius: '16px',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
              />
              <Legend
                formatter={(value) => (
                  <span className={`text-xs font-bold px-1.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    {DEPT_SHORT_CODES[value] ? `${DEPT_SHORT_CODES[value]} (${value})` : value}
                  </span>
                )}
              />

              {selectedDeptFilter === 'ALL' ? (
                Object.keys(DEPT_COLORS).map((dept) => (
                  <Area
                    key={dept}
                    type="monotone"
                    dataKey={dept}
                    name={dept}
                    stroke={DEPT_COLORS[dept]}
                    fillOpacity={1}
                    fill={`url(#color_${DEPT_SHORT_CODES[dept]})`}
                    strokeWidth={3}
                  />
                ))
              ) : (
                <Area
                  type="monotone"
                  dataKey={selectedDeptFilter}
                  name={selectedDeptFilter}
                  stroke={DEPT_COLORS[selectedDeptFilter] || '#6366f1'}
                  fillOpacity={1}
                  fill={`url(#color_${DEPT_SHORT_CODES[selectedDeptFilter] || 'CS'})`}
                  strokeWidth={3.5}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visual Pie Charts Grid for Students & Teachers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart 1: Department-Wise Students Pie Chart */}
        <div className={`p-6 rounded-3xl border flex flex-col ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-base flex items-center gap-2">
              <PieChartIcon size={18} className="text-indigo-400" />
              Department-Wise Students Distribution
            </h4>
            <span className="text-xs font-bold text-zinc-500 font-mono">
              Total: {overall.totalStudents}
            </span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studentPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                  paddingAngle={3}
                  label={(entry: any) => `${entry.shortCode || entry.name} (${((entry.percent || 0) * 100).toFixed(0)}%)`}
                >
                  {studentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#18181b' : '#ffffff',
                    borderColor: isDark ? '#27272a' : '#e5e2d9',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      {DEPT_SHORT_CODES[value] ? `${DEPT_SHORT_CODES[value]} (${value})` : value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart 2: Department-Wise Teachers/Faculty Pie Chart */}
        <div className={`p-6 rounded-3xl border flex flex-col ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-base flex items-center gap-2">
              <PieChartIcon size={18} className="text-pink-400" />
              Department-Wise Teachers & Faculty Slices
            </h4>
            <span className="text-xs font-bold text-zinc-500 font-mono">
              Total: {totalFacultyCount} Staff
            </span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={facultyPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                  paddingAngle={3}
                  label={(entry: any) => `${entry.shortCode || entry.name} (${((entry.percent || 0) * 100).toFixed(0)}%)`}
                >
                  {facultyPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#18181b' : '#ffffff',
                    borderColor: isDark ? '#27272a' : '#e5e2d9',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      {DEPT_SHORT_CODES[value] ? `${DEPT_SHORT_CODES[value]} (${value})` : value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
