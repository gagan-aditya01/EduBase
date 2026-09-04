import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Save, Layers, Sparkles, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/interfaces-select';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  department: string;
  section?: string;
  overallPercentage?: number;
  isExamEligible?: boolean;
  totalConductedHours?: number;
  totalPresentHours?: number;
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

// Department to Section Map
const DEPARTMENT_SECTIONS: Record<string, string[]> = {
  'Computer Science': ['1CS', '2CS', '3CS', '4CS'],
  'ADSE': ['1ADSE', '2ADSE', '3ADSE', '4ADSE'],
  'Mathematics': ['1MATH', '2MATH', '3MATH', '4MATH'],
  'Electrical Engineering': ['1EE', '2EE', '3EE', '4EE'],
  'Mechanical Engineering': ['1ME', '2ME', '3ME', '4ME'],
  'Robotics': ['1ROB', '2ROB', '3ROB', '4ROB'],
};

const TIME_SLOTS = [
  { value: '10-11', label: '10:00 AM - 11:00 AM', detail: 'Morning Period 1 (1 Hr)', hours: 1 },
  { value: '11-12', label: '11:00 AM - 12:00 PM', detail: 'Morning Period 2 (1 Hr)', hours: 1 },
  { value: '10-12', label: '10:00 AM - 12:00 PM', detail: 'Continuous Morning Block (2 Hrs)', hours: 2 },
  { value: '2-3', label: '02:00 PM - 03:00 PM', detail: 'Afternoon Period 1 (1 Hr)', hours: 1 },
  { value: '3-4', label: '03:00 PM - 04:00 PM', detail: 'Afternoon Period 2 (1 Hr)', hours: 1 },
  { value: '2-4', label: '02:00 PM - 04:00 PM', detail: 'Continuous Afternoon Block (2 Hrs)', hours: 2 },
];

export function FacultyAttendancePage({ user, theme = 'dark', addToast }: FacultyAttendancePageProps) {
  const isDark = theme === 'dark';
  const isAdmin = user.role === 'admin';

  const [selectedDept, setSelectedDept] = useState(user.assignedDepartment || 'Computer Science');

  const availableSections = user.role === 'faculty' && user.assignedDepartment
    ? (DEPARTMENT_SECTIONS[user.assignedDepartment] || ['1CS', '2CS', '3CS', '4CS'])
    : (DEPARTMENT_SECTIONS[selectedDept] || ['1CS', '2CS', '3CS', '4CS']);

  const todayStr = new Date().toISOString().split('T')[0];

  const selectedDate = todayStr;
  const [selectedSection, setSelectedSection] = useState(availableSections[0] || '1CS');
  const [selectedSlot, setSelectedSlot] = useState('10-11');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present' | 'Absent'>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Update selectedSection if department changes
  useEffect(() => {
    const newSecs = DEPARTMENT_SECTIONS[selectedDept] || ['1CS', '2CS', '3CS', '4CS'];
    if (!newSecs.includes(selectedSection)) {
      setSelectedSection(newSecs[0]);
    }
  }, [selectedDept]);

  // 1. Fetch roster & existing attendance
  useEffect(() => {
    const fetchRosterAndExistingRecord = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch Roster by Department
        const rosterRes = await fetch(`http://localhost:5050/api/v1/attendance/students/${encodeURIComponent(selectedDept)}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (!rosterRes.ok) {
          const data = await rosterRes.json();
          throw new Error(data.error || 'Failed to fetch department roster');
        }

        const allDeptStudents: Student[] = await rosterRes.json();

        // Filter by section if available
        const sectionStudents = allDeptStudents.filter((s) => {
          if (s.section) {
            return s.section.toLowerCase() === selectedSection.toLowerCase();
          }
          return true;
        });

        setStudents(sectionStudents);

        // Default all to Present
        const initialMap: Record<string, 'Present' | 'Absent'> = {};
        sectionStudents.forEach((s) => {
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
            recordsData[0].records.forEach((r: { studentId: string; status: 'Present' | 'Absent' }) => {
              if (initialMap[r.studentId] !== undefined) {
                initialMap[r.studentId] = r.status === 'Absent' ? 'Absent' : 'Present';
              }
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
  }, [selectedDate, selectedDept, selectedSection, selectedSlot, user]);

  const toggleStatus = (studentId: string, status: 'Present' | 'Absent') => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: 'Present' | 'Absent') => {
    const updated: Record<string, 'Present' | 'Absent'> = {};
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

      if (addToast) addToast('success', `Attendance successfully recorded for Section ${selectedSection} (${selectedSlot})`);
    } catch (err: any) {
      setError(err.message);
      if (addToast) addToast('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentSlotInfo = TIME_SLOTS.find((s) => s.value === selectedSlot);
  const presentCount = Object.values(attendanceMap).filter((s) => s === 'Present').length;
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
              <h1 className="text-2xl font-bold tracking-tight">
                {isAdmin ? 'System Attendance Inspector' : 'Faculty Attendance Console'}
              </h1>
            </div>
          </div>
          {!isAdmin && (
            <div className="px-3.5 py-1.5 rounded-full border border-[#cc5a37]/30 bg-[#cc5a37]/10 text-[#cc5a37] text-xs font-bold flex items-center gap-2 shrink-0">
              <Filter size={14} />
              <span>Assigned Department: {selectedDept}</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel: Date, Dept (if Admin), Section, Slot Selectors */}
      <div className={`p-6 rounded-3xl border backdrop-blur-md grid grid-cols-1 ${
        isAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3'
      } gap-5 ${
        isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white/60 border-[#e5e2d9]'
      }`}>
        {/* Date Display */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Calendar size={12} />
            Attendance Date
          </label>
          <div className={`w-full h-10 px-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'
          }`}>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Today</span>
          </div>
        </div>

        {/* Department Selector for Admin */}
        {isAdmin && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Filter size={12} />
              Select Department
            </label>
            <Select value={selectedDept} onValueChange={(val) => setSelectedDept(val)}>
              <SelectTrigger className={`w-full h-10 rounded-2xl text-xs font-bold ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'
              }`}>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
                {Object.keys(DEPARTMENT_SECTIONS).map((dept) => (
                  <SelectItem key={dept} value={dept} className="text-xs font-bold cursor-pointer">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Section Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Layers size={12} />
            Select Section Roster
          </label>
          <Select value={selectedSection} onValueChange={(val) => setSelectedSection(val)}>
            <SelectTrigger className={`w-full h-10 rounded-2xl text-xs font-bold ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'
            }`}>
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
              {availableSections.map((sec) => (
                <SelectItem key={sec} value={sec} className="text-xs font-bold cursor-pointer">
                  Section {sec} ({selectedDept})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Slot Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Clock size={12} />
            Select Time Slot / Block
          </label>
          <Select value={selectedSlot} onValueChange={(val) => setSelectedSlot(val)}>
            <SelectTrigger className={`w-full h-10 rounded-2xl text-xs font-bold ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'
            }`}>
              <SelectValue placeholder="Select Time Slot" />
            </SelectTrigger>
            <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
              {TIME_SLOTS.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-xs font-medium cursor-pointer">
                  <span className="font-bold">{s.label}</span>
                  <span className="text-[10px] text-zinc-500 ml-2">({s.detail})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-white/80 border-[#e5e2d9]'
      }`}>
        {/* Roster Controls & Counters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/20">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tracking-tight">
              Section {selectedSection} Roster ({students.length} Students)
            </span>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Present: {presentCount}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                Absent: {absentCount}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Session: {currentSlotInfo?.hours}h Block
              </span>
            </div>
          </div>

          {!isAdmin && (
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
          )}
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500 font-mono">
            Loading Section {selectedSection} roster...
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500 font-mono">
            No students found in Section {selectedSection} for {selectedDept}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b text-[10px] uppercase font-bold tracking-wider ${
                  isDark ? 'border-zinc-800 text-zinc-500' : 'border-[#e5e2d9] text-zinc-600'
                }`}>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Section</th>
                  {isAdmin ? (
                    <th className="py-3 px-4 text-right">Overall Cumulative Attendance</th>
                  ) : (
                    <th className="py-3 px-4 text-right">Attendance Status</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {students.map((student) => {
                  const status = attendanceMap[student.studentId] || 'Present';
                  const pct = student.overallPercentage !== undefined ? student.overallPercentage : 100;
                  const isEligible = student.isExamEligible !== undefined ? student.isExamEligible : pct >= 75;

                  return (
                    <tr key={student._id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{student.studentId}</td>
                      <td className="py-3.5 px-4 font-semibold">{student.name}</td>
                      <td className="py-3.5 px-4 font-mono text-zinc-400">{student.section || selectedSection}</td>
                      <td className="py-3.5 px-4 text-right">
                        {isAdmin ? (
                          <div className="inline-flex items-center gap-3">
                            <span className="text-xs font-mono text-zinc-400">
                              {student.totalPresentHours || 0}/{student.totalConductedHours || 0} Hrs
                            </span>
                            <span className={`px-3 py-1 rounded-xl text-xs font-mono font-black border ${
                              isEligible
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}>
                              {pct}% {isEligible ? '(Eligible)' : '(Shortage)'}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl border bg-zinc-900/60 border-zinc-800">
                            <button
                              onClick={() => toggleStatus(student.studentId, 'Present')}
                              className={`px-3.5 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
                                status === 'Present'
                                  ? 'bg-emerald-500 text-white shadow-md'
                                  : 'text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              <CheckCircle2 size={12} />
                              Present
                            </button>
                            <button
                              onClick={() => toggleStatus(student.studentId, 'Absent')}
                              className={`px-3.5 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
                                status === 'Absent'
                                  ? 'bg-red-500 text-white shadow-md'
                                  : 'text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              <XCircle size={12} />
                              Absent
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Submit Attendance Button for Faculty / Read-Only Notice for Admin */}
        <div className="pt-4 border-t border-zinc-800/20 flex justify-end">
          {isAdmin ? (
            <div className="px-5 py-2 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-2">
              <Filter size={14} />
              <span>Read-Only Inspection Mode (Administrators Cannot Edit Attendance)</span>
            </div>
          ) : (
            <button
              onClick={handleSaveAttendance}
              disabled={saving || loading || students.length === 0}
              className={`px-6 py-2.5 rounded-full text-xs font-bold text-white flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 transition-all ${
                isDark ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-[#cc5a37] hover:bg-[#e05a47]'
              }`}
            >
              <Save size={14} />
              <span>{saving ? 'Submitting...' : `Save Attendance (${selectedSection} • ${selectedSlot})`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
