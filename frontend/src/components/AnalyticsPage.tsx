import { useState, useEffect } from 'react';
import { BarChart3, Users, PieChart as PieChartIcon, Activity, RefreshCw, Trash2, Award, TrendingUp, Filter, BookOpen, Layers } from 'lucide-react';
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
  Sector,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/interfaces-select';

interface AnalyticsPageProps {
  currentUser: { token: string; username: string; role: 'admin' | 'guest' | 'faculty'; assignedDepartment?: string };
  theme?: 'light' | 'dark';
}

interface AnalyticsData {
  departmentBreakdown: Array<{ _id: string; count: number; avgAge: number }>;
  sectionBreakdown?: Array<{ _id: string; count: number }>;
  academicYearBreakdown?: Array<{ _id: string; count: number }>;
  facultyDepartmentBreakdown?: Array<{ _id: string; count: number }>;
  studentGrowthTrend?: Array<Record<string, any>>;
  ageDemographics: Array<{ _id: number | string; count: number }>;
  overall: Array<{ totalStudents: number; avgAge: number; minAge: number; maxAge: number }>;
  totalTrash: number;
  userRoleCounts: Array<{ _id: string; count: number }>;
  isFacultyScoped?: boolean;
  assignedDepartment?: string;
}

const DEPT_COLORS: Record<string, string> = {
  'Computer Science': '#6366f1',
  'Electrical Engineering': '#ec4899',
  'Mechanical Engineering': '#f59e0b',
  'ADSE': '#10b981',
  'Mathematics': '#3b82f6',
  'Robotics': '#8b5cf6',
};

const PIE_SLICE_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#34d399', '#f43f5e'];

const DEPT_SHORT_CODES: Record<string, string> = {
  'Computer Science': 'CS',
  'Electrical Engineering': 'EE',
  'Mechanical Engineering': 'ME',
  'ADSE': 'ADSE',
  'Mathematics': 'MATH',
  'Robotics': 'ROB',
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 14}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: 'drop-shadow(0px 8px 18px rgba(0, 0, 0, 0.45))',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
    </g>
  );
};

export function AnalyticsPage({ currentUser, theme = 'dark' }: AnalyticsPageProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [activeStudentIndex, setActiveStudentIndex] = useState<number>(-1);
  const [activeFacultyIndex, setActiveFacultyIndex] = useState<number>(-1);

  const isDark = theme === 'dark';
  const isFaculty = currentUser.role === 'faculty' || data?.isFacultyScoped;
  const facultyDept = data?.assignedDepartment || currentUser.assignedDepartment || 'Computer Science';

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
  
  // Student Pie Chart Data (Global vs Faculty Department Scoped)
  const studentPieData = (data?.departmentBreakdown || [])
    .filter((item) => item._id && (DEPT_SHORT_CODES[item._id] || isFaculty))
    .map((item) => ({
      name: item._id,
      shortCode: DEPT_SHORT_CODES[item._id] || item._id,
      value: item.count,
      color: DEPT_COLORS[item._id] || '#6366f1',
    }));

  // Faculty Section Pie Data for Faculty Scoped Portal
  const sectionPieData = (data?.sectionBreakdown || []).map((item, idx) => ({
    name: item._id || `Section ${idx + 1}`,
    shortCode: item._id || `Sec ${idx + 1}`,
    value: item.count,
    color: PIE_SLICE_COLORS[idx % PIE_SLICE_COLORS.length],
  }));

  // Department Age Demographics Bucket Pie Data for Faculty Scoped Portal
  const ageDemographicsPieData = (data?.ageDemographics || []).map((item, idx) => {
    const rangeLabel = item._id === 16 ? '16-20 yrs' : item._id === 21 ? '21-25 yrs' : item._id === 26 ? '26-30 yrs' : `${item._id}+ yrs`;
    return {
      name: rangeLabel,
      shortCode: rangeLabel,
      value: item.count,
      color: PIE_SLICE_COLORS[(idx + 2) % PIE_SLICE_COLORS.length],
    };
  });

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
    { year: '2023', 'Computer Science': 5, Total: 16 },
    { year: '2024', 'Computer Science': 8, Total: 24 },
    { year: '2025', 'Computer Science': 12, Total: 34 },
    { year: '2026', 'Computer Science': 15, Total: 43 },
  ];

  const totalFacultyCount = facultyPieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-zinc-900' : 'border-[#e5e2d9]'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl border ${
            isFaculty
              ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
              : isDark ? 'bg-zinc-900 border-zinc-800 text-amber-400' : 'bg-[#cc5a37]/10 border-[#cc5a37]/20 text-[#cc5a37]'
          }`}>
            {isFaculty ? <BookOpen size={24} /> : <BarChart3 size={24} />}
          </div>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-[#191919]'}`}>
              {isFaculty ? `${facultyDept} Department Analytics` : 'Academic Analytics Dashboard'}
            </h1>
            <p className="text-xs text-zinc-500">
              {isFaculty
                ? `Department-scoped workspace • Managing enrolled ${facultyDept} students`
                : 'Real-time department insights, student enrolment trends, and faculty distribution'}
            </p>
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
            <Users size={14} /> {isFaculty ? 'Department Students' : 'Enrolled Students'}
          </span>
          <span className="text-3xl font-extrabold mt-2 tracking-tight">
            {overall.totalStudents}
          </span>
        </div>

        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Award size={14} /> {isFaculty ? 'Department Faculty' : 'Total Faculty Staff'}
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
            {isFaculty ? <Layers size={14} /> : <Trash2 size={14} />}
            {isFaculty ? 'Active Sections' : 'Soft-Deleted Records'}
          </span>
          <span className={`text-3xl font-extrabold mt-2 tracking-tight ${isFaculty ? 'text-emerald-400' : 'text-amber-500'}`}>
            {isFaculty ? (sectionPieData.length || 4) : (data?.totalTrash || 0)}
          </span>
        </div>
      </div>

      {/* Growth Trend Graph */}
      <div className={`p-6 rounded-3xl border flex flex-col ${
        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              {isFaculty ? `${facultyDept} Student Growth Trend` : 'Department Student Growth Stock Trend'}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Enrolment trajectory across joining academic years</p>
          </div>

          {!isFaculty && (
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
          )}
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rawGrowthTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                {Object.entries(DEPT_COLORS).map(([dept, color]) => (
                  <linearGradient key={dept} id={`color_${DEPT_SHORT_CODES[dept] || 'CS'}`} x1="0" y1="0" x2="0" y2="1">
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
              {!isFaculty && (
                <Legend
                  formatter={(value) => (
                    <span className={`text-xs font-semibold px-1.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      {DEPT_SHORT_CODES[value] ? `${DEPT_SHORT_CODES[value]}` : value}
                    </span>
                  )}
                />
              )}

              {isFaculty ? (
                <Area
                  type="monotone"
                  dataKey={facultyDept}
                  name={facultyDept}
                  stroke={DEPT_COLORS[facultyDept] || '#6366f1'}
                  fillOpacity={1}
                  fill={`url(#color_${DEPT_SHORT_CODES[facultyDept] || 'CS'})`}
                  strokeWidth={3.5}
                />
              ) : selectedDeptFilter === 'ALL' ? (
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

      {/* Visual Pie Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart 1: Section Breakdown (Faculty Scoped) OR Department Student Distribution (Global) */}
        <div className={`p-6 rounded-3xl border flex flex-col ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-base flex items-center gap-2">
              <PieChartIcon size={18} className="text-indigo-400" />
              {isFaculty ? `${facultyDept} Section Distribution` : 'Department-Wise Students Distribution'}
            </h4>
            <span className="text-xs font-bold text-zinc-500 font-mono">
              Total: {overall.totalStudents}
            </span>
          </div>

          <div className="h-96 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {(Pie as any)({
                  activeIndex: activeStudentIndex >= 0 ? activeStudentIndex : undefined,
                  activeShape: renderActiveShape,
                  data: isFaculty ? sectionPieData : studentPieData,
                  dataKey: 'value',
                  nameKey: 'name',
                  cx: '50%',
                  cy: '50%',
                  outerRadius: 105,
                  innerRadius: 55,
                  paddingAngle: 4,
                  isAnimationActive: false,
                  labelLine: { stroke: isDark ? '#71717a' : '#a1a1aa', strokeWidth: 1.5 },
                  label: (entry: any) => `${entry.shortCode || entry.name} (${((entry.percent || 0) * 100).toFixed(0)}%)`,
                  onMouseEnter: (_: any, index: number) => setActiveStudentIndex(index),
                  onMouseLeave: () => setActiveStudentIndex(-1),
                  children: (isFaculty ? sectionPieData : studentPieData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  )),
                })}
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#18181b' : '#ffffff',
                    borderColor: isDark ? '#27272a' : '#e5e2d9',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart 2: Age Demographics (Faculty Scoped) OR Faculty Staff Slices (Global) */}
        <div className={`p-6 rounded-3xl border flex flex-col ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-base flex items-center gap-2">
              <PieChartIcon size={18} className="text-pink-400" />
              {isFaculty ? `${facultyDept} Student Age Demographics` : 'Department-Wise Teachers & Faculty Slices'}
            </h4>
            <span className="text-xs font-bold text-zinc-500 font-mono">
              Total: {isFaculty ? overall.totalStudents : totalFacultyCount} {isFaculty ? 'Students' : 'Staff'}
            </span>
          </div>

          <div className="h-96 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {(Pie as any)({
                  activeIndex: activeFacultyIndex >= 0 ? activeFacultyIndex : undefined,
                  activeShape: renderActiveShape,
                  data: isFaculty ? ageDemographicsPieData : facultyPieData,
                  dataKey: 'value',
                  nameKey: 'name',
                  cx: '50%',
                  cy: '50%',
                  outerRadius: 105,
                  innerRadius: 55,
                  paddingAngle: 4,
                  isAnimationActive: false,
                  labelLine: { stroke: isDark ? '#71717a' : '#a1a1aa', strokeWidth: 1.5 },
                  label: (entry: any) => `${entry.shortCode || entry.name} (${((entry.percent || 0) * 100).toFixed(0)}%)`,
                  onMouseEnter: (_: any, index: number) => setActiveFacultyIndex(index),
                  onMouseLeave: () => setActiveFacultyIndex(-1),
                  children: (isFaculty ? ageDemographicsPieData : facultyPieData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  )),
                })}
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#18181b' : '#ffffff',
                    borderColor: isDark ? '#27272a' : '#e5e2d9',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
