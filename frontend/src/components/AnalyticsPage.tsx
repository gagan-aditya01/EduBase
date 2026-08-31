import { useState, useEffect } from 'react';
import { BarChart3, Users, PieChart as PieChartIcon, Activity, RefreshCw, Trash2, Award } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

interface AnalyticsPageProps {
  currentUser: { token: string; username: string; role: 'admin' | 'guest' | 'faculty' };
  theme?: 'light' | 'dark';
}

interface AnalyticsData {
  departmentBreakdown: Array<{ _id: string; count: number; avgAge: number }>;
  ageDemographics: Array<{ _id: number | string; count: number }>;
  overall: Array<{ totalStudents: number; avgAge: number; minAge: number; maxAge: number }>;
  totalTrash: number;
  userRoleCounts: Array<{ _id: string; count: number }>;
}

const AGE_RANGE_LABELS: Record<string | number, string> = {
  16: '16–20 yrs',
  21: '21–25 yrs',
  26: '26–30 yrs',
  31: '31–40 yrs',
  41: '40+ yrs',
};

const PIE_COLORS = ['#36b37e', '#ffab00', '#ff5630', '#00b8d9', '#6554c0'];

export function AnalyticsPage({ currentUser, theme = 'dark' }: AnalyticsPageProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
  const deptChartData = (data?.departmentBreakdown || []).map((item) => ({
    name: item._id || 'Unassigned',
    count: item.count,
    avgAge: Math.round((item.avgAge || 0) * 10) / 10,
  }));

  const ageChartData = (data?.ageDemographics || []).map((item) => ({
    name: AGE_RANGE_LABELS[item._id] || `Group ${item._id}`,
    count: item.count,
  }));

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
              Enterprise Analytics Engine
            </h1>
            <p className="text-xs text-zinc-500">MongoDB Aggregation Pipeline ($facet & $bucket metrics)</p>
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
          Refresh Stats
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
            <Users size={14} /> Total Active
          </span>
          <span className="text-3xl font-extrabold mt-2 tracking-tight">
            {overall.totalStudents}
          </span>
        </div>

        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Activity size={14} /> Average Age
          </span>
          <span className="text-3xl font-extrabold mt-2 tracking-tight">
            {overall.avgAge ? overall.avgAge.toFixed(1) : '0'} <span className="text-xs font-normal text-zinc-500">yrs</span>
          </span>
        </div>

        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Award size={14} /> Departments
          </span>
          <span className="text-3xl font-extrabold mt-2 tracking-tight">
            {deptChartData.length}
          </span>
        </div>

        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Trash2 size={14} /> Soft-Deleted
          </span>
          <span className="text-3xl font-extrabold mt-2 tracking-tight text-amber-500">
            {data?.totalTrash || 0}
          </span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Department Distribution BarChart */}
        <div className={`p-6 rounded-3xl border flex flex-col ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
            <BarChart3 size={18} className={isDark ? 'text-zinc-400' : 'text-[#cc5a37]'} />
            Department Student Breakdown ($group)
          </h4>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e5e2d9'} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#18181b' : '#ffffff',
                    borderColor: isDark ? '#27272a' : '#e5e2d9',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: isDark ? '#f4f4f5' : '#18181b',
                  }}
                />
                <Bar dataKey="count" fill={isDark ? '#52525b' : '#cc5a37'} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Age Demographics PieChart */}
        <div className={`p-6 rounded-3xl border flex flex-col ${
          isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
        }`}>
          <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
            <PieChartIcon size={18} className={isDark ? 'text-zinc-400' : 'text-[#cc5a37]'} />
            Age Demographic Buckets ($bucket)
          </h4>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageChartData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {ageChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
