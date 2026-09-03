import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Calendar, Clock, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

interface User {
  token: string;
  username: string;
  role: 'admin' | 'guest' | 'faculty' | 'student';
}

interface DailyLogItem {
  id: string;
  date: string;
  slot: string;
  slotHours: number;
  department: string;
  recordedBy: string;
  status: 'Present' | 'Absent' | 'Late';
}

interface AttendanceSummary {
  studentId: string;
  overallPercentage: number;
  isExamEligible: boolean;
  totalConductedHours: number;
  totalPresentHours: number;
  totalAbsentHours: number;
  totalLateHours: number;
  dailyLog: DailyLogItem[];
}

interface StudentAttendancePageProps {
  user: User;
  theme?: 'dark' | 'light';
}

export function StudentAttendancePage({ user, theme = 'dark' }: StudentAttendancePageProps) {
  const isDark = theme === 'dark';

  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`http://localhost:5050/api/v1/attendance/my-summary`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to load attendance summary');
        }

        const data: AttendanceSummary = await res.json();
        setSummary(data);
      } catch (err: any) {
        setError(err.message || 'Error loading attendance');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user]);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-zinc-500 font-mono">
        Loading attendance history...
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold max-w-xl mx-auto text-center">
        {error || 'Unable to load student attendance summary'}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Banner */}
      <div className={`p-6 rounded-3xl border backdrop-blur-xl transition-all ${
        isDark ? 'bg-zinc-950/70 border-zinc-800 text-zinc-100 shadow-xl' : 'bg-white/80 border-[#e5e2d9] text-zinc-900 shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-[#cc5a37]" />
              <h1 className="text-2xl font-bold tracking-tight">My Attendance Ledger</h1>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Real-time breakdown of your conducted hours, present hours, and exam eligibility status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {summary.isExamEligible ? (
              <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-bold flex items-center gap-2">
                <ShieldCheck size={16} />
                <span>Exam Eligible (≥ 75%)</span>
              </div>
            ) : (
              <div className="px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>Attendance Shortage (&lt; 75%)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Overall Percentage Card */}
        <div className={`p-6 rounded-3xl border backdrop-blur-md flex flex-col justify-between ${
          isDark ? 'bg-zinc-950/50 border-zinc-850' : 'bg-white/60 border-[#e5e2d9]'
        }`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Overall Attendance</span>
          <div className="my-3 flex items-baseline gap-2">
            <span className={`text-4xl font-extrabold tracking-tight ${
              summary.overallPercentage >= 75 ? 'text-green-500' : 'text-red-500'
            }`}>
              {summary.overallPercentage}%
            </span>
          </div>
          <div className="w-full bg-zinc-800/40 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                summary.overallPercentage >= 75 ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, summary.overallPercentage)}%` }}
            />
          </div>
        </div>

        {/* Conducted Hours Card */}
        <div className={`p-6 rounded-3xl border backdrop-blur-md flex flex-col justify-between ${
          isDark ? 'bg-zinc-950/50 border-zinc-850' : 'bg-white/60 border-[#e5e2d9]'
        }`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Conducted Hours</span>
          <div className="my-3 flex items-center gap-2">
            <BookOpen size={24} className="text-blue-400" />
            <span className="text-3xl font-extrabold tracking-tight">{summary.totalConductedHours}h</span>
          </div>
          <span className="text-[10px] text-zinc-500">Includes single & block periods</span>
        </div>

        {/* Present Hours Card */}
        <div className={`p-6 rounded-3xl border backdrop-blur-md flex flex-col justify-between ${
          isDark ? 'bg-zinc-950/50 border-zinc-850' : 'bg-white/60 border-[#e5e2d9]'
        }`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Attended Hours</span>
          <div className="my-3 flex items-center gap-2">
            <CheckCircle2 size={24} className="text-green-500" />
            <span className="text-3xl font-extrabold tracking-tight text-green-500">{summary.totalPresentHours}h</span>
          </div>
          <span className="text-[10px] text-zinc-500">Present + Late entries</span>
        </div>

        {/* Absent Hours Card */}
        <div className={`p-6 rounded-3xl border backdrop-blur-md flex flex-col justify-between ${
          isDark ? 'bg-zinc-950/50 border-zinc-850' : 'bg-white/60 border-[#e5e2d9]'
        }`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Absent Hours</span>
          <div className="my-3 flex items-center gap-2">
            <XCircle size={24} className="text-red-500" />
            <span className="text-3xl font-extrabold tracking-tight text-red-500">{summary.totalAbsentHours}h</span>
          </div>
          <span className="text-[10px] text-zinc-500">Missed periods</span>
        </div>
      </div>

      {/* Daily Attendance Timeline Log */}
      <div className={`p-6 rounded-3xl border backdrop-blur-xl space-y-4 ${
        isDark ? 'bg-zinc-950/70 border-zinc-850' : 'bg-white/80 border-[#e5e2d9]'
      }`}>
        <div className="flex items-center justify-between border-b border-zinc-800/10 dark:border-zinc-850 pb-4">
          <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
            <Calendar size={16} className="text-[#cc5a37]" />
            Daily Period Attendance History ({summary.dailyLog.length} Entries)
          </h2>
        </div>

        {summary.dailyLog.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500 font-mono">
            No attendance records found for your ID ({summary.studentId}).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[10px] uppercase font-bold tracking-wider ${
                  isDark ? 'border-zinc-850 text-zinc-500' : 'border-[#e5e2d9] text-zinc-600'
                }`}>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Faculty</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/10 dark:divide-zinc-850/60">
                {summary.dailyLog.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-500/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold">{log.date}</td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="inline-flex items-center gap-1">
                        <Clock size={12} className="text-zinc-500" />
                        <span>{log.slot}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold">{log.slotHours}h</td>
                    <td className="py-3.5 px-4 text-zinc-500">{log.department}</td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400">{log.recordedBy}</td>
                    <td className="py-3.5 px-4 text-right">
                      {log.status === 'Present' && (
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-[11px] font-bold">
                          Present
                        </span>
                      )}
                      {log.status === 'Late' && (
                        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[11px] font-bold">
                          Late
                        </span>
                      )}
                      {log.status === 'Absent' && (
                        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[11px] font-bold">
                          Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
