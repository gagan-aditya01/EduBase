import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Save, Users, Sparkles, Filter } from 'lucide-react';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  department: string;
}

interface User {
  token: string;
  username: string;
  role: 'admin' | 'guest' | 'faculty' | 'student';
  assignedDepartment?: string;
}

interface FacultyAttendancePageProps {
  user: User;
  theme?: 'dark' | 'light';
  addToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
];

const TIME_SLOTS = [
  { value: '10-11', label: '10:00 AM - 11:00 AM (Morning Period 1 - 1 Hr)', hours: 1, session: 'morning' },
  { value: '11-12', label: '11:00 AM - 12:00 PM (Morning Period 2 - 1 Hr)', hours: 1, session: 'morning' },
  { value: '10-12', label: '10:00 AM - 12:00 PM (Continuous Block - 2 Hrs)', hours: 2, session: 'morning-block' },
  { value: '2-3', label: '02:00 PM - 03:00 PM (Afternoon Period 1 - 1 Hr)', hours: 1, session: 'afternoon' },
  { value: '3-4', label: '03:00 PM - 04:00 PM (Afternoon Period 2 - 1 Hr)', hours: 1, session: 'afternoon' },
  { value: '2-4', label: '02:00 PM - 04:00 PM (Continuous Block - 2 Hrs)', hours: 2, session: 'afternoon-block' },
];

export function FacultyAttendancePage({ user, theme = 'dark', addToast }: FacultyAttendancePageProps) {
  const isDark = theme === 'dark';

  const defaultDept = user.role === 'faculty' && user.assignedDepartment
    ? user.assignedDepartment
    : DEPARTMENTS[0];

  const todayStr = new Date().toISOString().split('T')[0];

  const selectedDate = todayStr;
  const [selectedDept, setSelectedDept] = useState(defaultDept);
  const [selectedSlot, setSelectedSlot] = useState('10-11');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Lock department selection for Faculty role
  const isDeptLocked = user.role === 'faculty' && !!user.assignedDepartment;

  // 1. Fetch roster & existing attendance
  useEffect(() => {
    const fetchRosterAndExistingRecord = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch Department Roster
        const rosterRes = await fetch(`http://localhost:5050/api/v1/attendance/students/${encodeURIComponent(selectedDept)}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (!rosterRes.ok) {
          const data = await rosterRes.json();
          throw new Error(data.error || 'Failed to fetch department roster');
        }

        const rosterData: Student[] = await rosterRes.json();
        setStudents(rosterData);

        // Default all to Present
        const initialMap: Record<string, 'Present' | 'Absent' | 'Late'> = {};
        rosterData.forEach((s) => {
          initialMap[s.studentId] = 'Present';
        });

        // Check if attendance already exists for this Date + Dept + Slot
        const existingRes = await fetch(
          `http://localhost:5050/api/v1/attendance/records?date=${selectedDate}&department=${encodeURIComponent(selectedDept)}&slot=${selectedSlot}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        if (existingRes.ok) {
          const recordsData = await existingRes.json();
          if (recordsData.length > 0 && recordsData[0].records) {
            recordsData[0].records.forEach((r: { studentId: string; status: 'Present' | 'Absent' | 'Late' }) => {
              initialMap[r.studentId] = r.status;
            });
          }
        }

        setAttendanceMap(initialMap);
      } catch (err: any) {
        setError(err.message || 'Error loading roster');
      } finally {
        setLoading(false);
      }
    };

    fetchRosterAndExistingRecord();
  }, [selectedDate, selectedDept, selectedSlot, user]);

  const toggleStatus = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: 'Present' | 'Absent') => {
    const updated: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    students.forEach((s) => {
      updated[s.studentId] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) {
      if (addToast) addToast('error', 'No students in roster to mark attendance');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const recordsPayload = students.map((s) => ({
        studentId: s.studentId,
        studentName: s.name,
        status: attendanceMap[s.studentId] || 'Present',
      }));

      const res = await fetch('http://localhost:5050/api/v1/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          department: selectedDept,
          slot: selectedSlot,
          records: recordsPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit attendance');
      }

      if (addToast) addToast('success', `Attendance successfully recorded for ${selectedDept} (${selectedSlot})`);
    } catch (err: any) {
      setError(err.message);
      if (addToast) addToast('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentSlotInfo = TIME_SLOTS.find((s) => s.value === selectedSlot);
  const presentCount = Object.values(attendanceMap).filter((s) => s === 'Present' || s === 'Late').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'Absent').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border backdrop-blur-xl transition-all ${
        isDark ? 'bg-zinc-950/70 border-zinc-800 text-zinc-100 shadow-xl' : 'bg-white/80 border-[#e5e2d9] text-zinc-900 shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-[#cc5a37]" />
              <h1 className="text-2xl font-bold tracking-tight">Faculty Attendance Console</h1>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Mark period-wise daily attendance for department rosters with continuous block validation.
            </p>
          </div>
          {isDeptLocked && (
            <div className="px-3.5 py-1.5 rounded-full border border-[#cc5a37]/30 bg-[#cc5a37]/10 text-[#cc5a37] text-xs font-bold flex items-center gap-2 shrink-0">
              <Filter size={14} />
              <span>Restricted Scope: {user.assignedDepartment}</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel: Date, Department, Slot Selectors */}
      <div className={`p-6 rounded-3xl border backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-5 ${
        isDark ? 'bg-zinc-950/50 border-zinc-850' : 'bg-white/60 border-[#e5e2d9]'
      }`}>
        {/* Today's Auto-Synced Date Badge */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Calendar size={12} />
            Today's Date (Auto-Synced)
          </label>
          <div className={`w-full px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-[#e5e2d9] text-zinc-900'
          }`}>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Department Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Users size={12} />
            Department Roster
          </label>
          <select
            value={selectedDept}
            disabled={isDeptLocked}
            onChange={(e) => setSelectedDept(e.target.value)}
            className={`w-full px-3.5 py-2 rounded-2xl border text-xs font-semibold focus:outline-none transition-colors disabled:opacity-75 ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-[#e5e2d9] text-zinc-900'
            }`}
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Slot / Continuous Block Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Clock size={12} />
            Time Slot / Block
          </label>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className={`w-full px-3.5 py-2 rounded-2xl border text-xs font-semibold focus:outline-none transition-colors ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-zinc-700' : 'bg-white border-[#e5e2d9] text-zinc-900'
            }`}
          >
            {TIME_SLOTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Roster Workspace */}
      <div className={`p-6 rounded-3xl border backdrop-blur-xl space-y-6 ${
        isDark ? 'bg-zinc-950/70 border-zinc-850' : 'bg-white/80 border-[#e5e2d9]'
      }`}>
        {/* Roster Controls & Counters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/10 dark:border-zinc-850">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tracking-tight">Roster Status ({students.length} Students)</span>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                Present: {presentCount}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                Absent: {absentCount}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Hours: {currentSlotInfo?.hours}h
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMarkAll('Present')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border-[#e5e2d9] text-zinc-700 hover:text-zinc-900'
              }`}
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('Absent')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border-[#e5e2d9] text-zinc-700 hover:text-zinc-900'
              }`}
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500 font-mono">
            Loading department roster...
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500 font-mono">
            No students found in {selectedDept}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[10px] uppercase font-bold tracking-wider ${
                  isDark ? 'border-zinc-850 text-zinc-500' : 'border-[#e5e2d9] text-zinc-600'
                }`}>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/10 dark:divide-zinc-850/60">
                {students.map((student) => {
                  const status = attendanceMap[student.studentId] || 'Present';
                  return (
                    <tr key={student._id} className="hover:bg-zinc-500/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold">{student.studentId}</td>
                      <td className="py-3.5 px-4 font-semibold">{student.name}</td>
                      <td className="py-3.5 px-4 text-zinc-500">{student.department}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl border bg-zinc-900/40 border-zinc-800">
                          <button
                            onClick={() => toggleStatus(student.studentId, 'Present')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
                              status === 'Present'
                                ? 'bg-green-500 text-white shadow-md'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            <CheckCircle2 size={12} />
                            Present
                          </button>
                          <button
                            onClick={() => toggleStatus(student.studentId, 'Late')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
                              status === 'Late'
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            <AlertCircle size={12} />
                            Late
                          </button>
                          <button
                            onClick={() => toggleStatus(student.studentId, 'Absent')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
                              status === 'Absent'
                                ? 'bg-red-500 text-white shadow-md'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            <XCircle size={12} />
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Submit Attendance Button */}
        <div className="pt-4 border-t border-zinc-800/10 dark:border-zinc-850 flex justify-end">
          <button
            onClick={handleSaveAttendance}
            disabled={saving || loading || students.length === 0}
            className={`px-6 py-2.5 rounded-full text-xs font-bold text-white flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 transition-all ${
              isDark ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500' : 'bg-[#cc5a37] hover:bg-[#e05a47]'
            }`}
          >
            <Save size={14} />
            <span>{saving ? 'Submitting...' : `Save Attendance (${selectedSlot})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
