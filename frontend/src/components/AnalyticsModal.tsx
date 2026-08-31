import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, BarChart3, Users, PieChart as PieChartIcon, Activity, RefreshCw, Trash2, Award } from 'lucide-react';
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

interface AnalyticsModalProps {
  currentUser: { token: string; username: string; role: 'admin' | 'guest' | 'faculty' };
  onClose: () => void;
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

export function AnalyticsModal({ currentUser, onClose, theme = 'dark' }: AnalyticsModalProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDark = theme === 'dark';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* Analytics Modal Card */}
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className={`w-full max-w-5xl h-[85vh] max-h-[740px] min-h-[520px] p-6 md:p-8 rounded-[36px] border shadow-2xl overflow-hidden flex flex-col z-10 relative ${
          isDark
            ? 'bg-zinc-950/90 border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] text-zinc-100 backdrop-blur-3xl'
            : 'bg-[#fbfaf7] border-[#e5e2d9] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] text-[#191919] backdrop-blur-3xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b shrink-0 ${isDark ? 'border-zinc-800/40' : 'border-[#e5e2d9]'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800 text-amber-400' : 'bg-[#cc5a37]/10 border-[#cc5a37]/20 text-[#cc5a37]'}`}>
              <BarChart3 size={22} />
            </div>
            <div>
              <h3 className="font-bold text-lg tracking-tight">Enterprise Analytics Engine</h3>
              <p className="text-xs text-zinc-500">MongoDB Aggregation Pipeline ($facet & $bucket metrics)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className={`p-2.5 rounded-2xl border cursor-pointer transition-colors ${
                isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400' : 'border-[#e5e2d9] hover:bg-[#e5e2d9] text-zinc-650'
              }`}
              title="Refresh Analytics"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={onClose}
              className={`p-2.5 rounded-2xl border cursor-pointer transition-colors ${
                isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400' : 'border-[#e5e2d9] hover:bg-[#e5e2d9] text-zinc-650'
              }`}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-xs my-3">
            {error}
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pt-4 pr-1">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
              isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
            }`}>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} /> Total Active
              </span>
              <span className="text-2xl font-extrabold mt-2 tracking-tight">
                {overall.totalStudents}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
              isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
            }`}>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={14} /> Average Age
              </span>
              <span className="text-2xl font-extrabold mt-2 tracking-tight">
                {overall.avgAge ? overall.avgAge.toFixed(1) : '0'} <span className="text-xs font-normal text-zinc-500">yrs</span>
              </span>
            </div>

            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
              isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
            }`}>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} /> Departments
              </span>
              <span className="text-2xl font-extrabold mt-2 tracking-tight">
                {deptChartData.length}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
              isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
            }`}>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Trash2 size={14} /> Soft-Deleted
              </span>
              <span className="text-2xl font-extrabold mt-2 tracking-tight text-amber-500">
                {data?.totalTrash || 0}
              </span>
            </div>
          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Department Distribution BarChart */}
            <div className={`p-5 rounded-2xl border flex flex-col ${
              isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
            }`}>
              <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                <BarChart3 size={16} className={isDark ? 'text-zinc-400' : 'text-[#cc5a37]'} />
                Department Student Breakdown ($group)
              </h4>
              <div className="h-60 w-full">
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
                    <Bar dataKey="count" fill={isDark ? '#52525b' : '#cc5a37'} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Age Demographics PieChart */}
            <div className={`p-5 rounded-2xl border flex flex-col ${
              isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
            }`}>
              <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                <PieChartIcon size={16} className={isDark ? 'text-zinc-400' : 'text-[#cc5a37]'} />
                Age Demographic Buckets ($bucket)
              </h4>
              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ageChartData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
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
      </motion.div>
    </div>
  );
}
