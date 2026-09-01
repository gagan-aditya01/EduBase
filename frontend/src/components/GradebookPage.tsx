import { useState, useEffect } from 'react';
import { BookOpen, Save, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/interfaces-select';

interface StudentGradeRow {
  studentId: string;
  name: string;
  section: string;
  department: string;
  courseCode: string;
  assignment1: number;
  midterm: number;
  assignment2: number;
  endSem: number;
  totalWeightedScore: number;
  letterGrade: string;
  gradePoint: number;
}

interface GradebookPageProps {
  currentUser: { token: string; username: string; role: 'admin' | 'guest' | 'faculty'; assignedDepartment?: string };
  theme?: 'light' | 'dark';
  addToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

const SECTIONS_LIST = ['3CS', '2CS', '4CS', '1CS', '3EE', '2EE', '3ME', '2ME', '3ADSE', '2ADSE', '3MATH', '3ROB'];

export function GradebookPage({ currentUser, theme = 'dark', addToast }: GradebookPageProps) {
  const [selectedSection, setSelectedSection] = useState('3CS');
  const [selectedCourse, setSelectedCourse] = useState('CS301');
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [gradeRows, setGradeRows] = useState<StudentGradeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isDark = theme === 'dark';
  const isFaculty = currentUser.role === 'faculty';
  const userDept = currentUser.assignedDepartment || 'Computer Science';

  // Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('http://localhost:5050/api/v1/courses', {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          const deptFiltered = isFaculty
            ? data.filter((c) => c.department.toLowerCase() === userDept.toLowerCase())
            : data;
          setAvailableCourses(deptFiltered.length > 0 ? deptFiltered : data);

          if (deptFiltered.length > 0) {
            setSelectedCourse(deptFiltered[0].courseCode);
          }
        }
      } catch (err) {
        // Fallback
      }
    };
    fetchCourses();
  }, [currentUser, isFaculty, userDept]);

  // Fetch gradebook for selected section & course
  const fetchGradebook = async () => {
    if (!selectedSection || !selectedCourse) return;
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch(
        `http://localhost:5050/api/v1/grades?section=${selectedSection}&courseCode=${selectedCourse}`,
        {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load gradebook evaluation records');
      }
      setGradeRows(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradebook();
  }, [selectedSection, selectedCourse]);

  // Calculate live Indian 20-50-20-100 evaluation
  const computeLiveGrade = (a1: number, mid: number, a2: number, end: number) => {
    const assign1Marks = Math.min(20, Math.max(0, Number(a1) || 0));
    const midtermMarks = Math.min(50, Math.max(0, Number(mid) || 0));
    const assign2Marks = Math.min(20, Math.max(0, Number(a2) || 0));
    const endSemMarks = Math.min(100, Math.max(0, Number(end) || 0));

    const weightedPerc = Math.round(
      ((assign1Marks / 20 * 10) + (midtermMarks / 50 * 20) + (assign2Marks / 20 * 10) + (endSemMarks / 100 * 60)) * 100
    ) / 100;

    let letterGrade = 'F';
    let gradePoint = 0.0;

    if (weightedPerc >= 90) { letterGrade = 'O'; gradePoint = 10.0; }
    else if (weightedPerc >= 80) { letterGrade = 'A+'; gradePoint = 9.0; }
    else if (weightedPerc >= 70) { letterGrade = 'A'; gradePoint = 8.0; }
    else if (weightedPerc >= 60) { letterGrade = 'B+'; gradePoint = 7.0; }
    else if (weightedPerc >= 55) { letterGrade = 'B'; gradePoint = 6.0; }
    else if (weightedPerc >= 50) { letterGrade = 'C'; gradePoint = 5.0; }
    else if (weightedPerc >= 40) { letterGrade = 'P'; gradePoint = 4.0; }
    else { letterGrade = 'F'; gradePoint = 0.0; }

    return { totalWeightedScore: weightedPerc, letterGrade, gradePoint };
  };

  const handleMarkChange = (studentId: string, field: 'assignment1' | 'midterm' | 'assignment2' | 'endSem', value: string) => {
    const numVal = Number(value) || 0;
    setGradeRows((prev) =>
      prev.map((row) => {
        if (row.studentId !== studentId) return row;
        const updatedRow = { ...row, [field]: numVal };
        const liveEval = computeLiveGrade(
          field === 'assignment1' ? numVal : updatedRow.assignment1,
          field === 'midterm' ? numVal : updatedRow.midterm,
          field === 'assignment2' ? numVal : updatedRow.assignment2,
          field === 'endSem' ? numVal : updatedRow.endSem
        );
        return { ...updatedRow, ...liveEval };
      })
    );
  };

  const handleSaveAllGrades = async () => {
    if (gradeRows.length === 0) return;
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await fetch('http://localhost:5050/api/v1/grades/bulk-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          courseCode: selectedCourse,
          section: selectedSection,
          semester: 'Spring 2026',
          grades: gradeRows,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save grade evaluations');
      }

      setSuccessMsg(`Successfully saved grade evaluations for ${selectedCourse} (${selectedSection})!`);
      if (addToast) addToast('success', `Gradebook saved for ${selectedCourse}!`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'O': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'A+': return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
      case 'A': return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'B+': return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'B': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'C': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'P': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default: return 'bg-red-500/15 text-red-400 border-red-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm ${
        isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-[#e5e2d9]'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${
              isDark ? 'text-zinc-100' : 'text-[#191919]'
            }`}>
              Indian University Gradebook Console
              <Sparkles size={18} className="text-amber-400" />
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Indian Marks Evaluation System • Assign 1 (20) + Midterm (50) + Assign 2 (20) + EndSem (100)
            </p>
          </div>
        </div>

        {/* Section & Subject Filters */}
        <div className="flex items-center gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Section</label>
            <Select value={selectedSection} onValueChange={(val) => setSelectedSection(val)}>
              <SelectTrigger className={`w-28 rounded-2xl text-xs font-mono font-bold ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'
              }`}>
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
                {SECTIONS_LIST.map((sec) => (
                  <SelectItem key={sec} value={sec} className="text-xs font-mono font-bold cursor-pointer">{sec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Subject</label>
            <Select value={selectedCourse} onValueChange={(val) => setSelectedCourse(val)}>
              <SelectTrigger className={`w-52 rounded-2xl text-xs font-bold ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'
              }`}>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
                {availableCourses.map((c) => (
                  <SelectItem key={c.courseCode} value={c.courseCode} className="text-xs font-medium cursor-pointer">
                    <span className="font-mono font-bold text-indigo-400 mr-1.5">{c.courseCode}</span>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={handleSaveAllGrades}
            disabled={saving || gradeRows.length === 0}
            className={`mt-4 px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
              gradeRows.length > 0 && !saving
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800'
            }`}
          >
            <Save size={14} />
            {saving ? 'Saving Marks...' : 'Save & Publish Marks'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Spreadsheet Evaluation Grid */}
      <div className={`rounded-3xl border overflow-hidden shadow-sm ${
        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'border-zinc-800/80 bg-zinc-950/60 text-zinc-400' : 'border-[#e5e2d9] bg-[#f8f6f0] text-zinc-650'
              }`}>
                <th className="p-4">Reg ID</th>
                <th className="p-4">Student Name</th>
                <th className="p-4 text-center">Assign 1 (20) <span className="text-zinc-500 lowercase">(10%)</span></th>
                <th className="p-4 text-center">Midterm (50) <span className="text-zinc-500 lowercase">(20%)</span></th>
                <th className="p-4 text-center">Assign 2 (20) <span className="text-zinc-500 lowercase">(10%)</span></th>
                <th className="p-4 text-center">EndSem (100) <span className="text-zinc-500 lowercase">(60%)</span></th>
                <th className="p-4 text-center">Weighted %</th>
                <th className="p-4 text-center">Grade Tier</th>
                <th className="p-4 text-center">Grade Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/20">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center p-12 text-zinc-500">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-500 inline-block mr-2 align-middle" />
                    Loading section gradebook evaluation grid...
                  </td>
                </tr>
              ) : gradeRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-12 text-zinc-500 font-mono">
                    No enrolled students found in section {selectedSection}.
                  </td>
                </tr>
              ) : (
                gradeRows.map((r) => (
                  <tr key={r.studentId} className={isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-[#fbfaf7]'}>
                    <td className="p-4 font-mono font-bold text-zinc-300">{r.studentId}</td>
                    <td className="p-4 font-bold text-zinc-100">{r.name}</td>

                    {/* Assign 1 */}
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={r.assignment1}
                        onChange={(e) => handleMarkChange(r.studentId, 'assignment1', e.target.value)}
                        className={`w-16 text-center font-mono font-bold rounded-xl py-1.5 px-2 border focus:outline-none ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-indigo-500' : 'bg-white border-[#e5e2d9] text-[#191919]'
                        }`}
                      />
                    </td>

                    {/* Midterm */}
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={r.midterm}
                        onChange={(e) => handleMarkChange(r.studentId, 'midterm', e.target.value)}
                        className={`w-16 text-center font-mono font-bold rounded-xl py-1.5 px-2 border focus:outline-none ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-indigo-500' : 'bg-white border-[#e5e2d9] text-[#191919]'
                        }`}
                      />
                    </td>

                    {/* Assign 2 */}
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={r.assignment2}
                        onChange={(e) => handleMarkChange(r.studentId, 'assignment2', e.target.value)}
                        className={`w-16 text-center font-mono font-bold rounded-xl py-1.5 px-2 border focus:outline-none ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-indigo-500' : 'bg-white border-[#e5e2d9] text-[#191919]'
                        }`}
                      />
                    </td>

                    {/* EndSem */}
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={r.endSem}
                        onChange={(e) => handleMarkChange(r.studentId, 'endSem', e.target.value)}
                        className={`w-20 text-center font-mono font-bold rounded-xl py-1.5 px-2 border focus:outline-none ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-indigo-500' : 'bg-white border-[#e5e2d9] text-[#191919]'
                        }`}
                      />
                    </td>

                    {/* Weighted % */}
                    <td className="p-4 text-center font-mono font-bold text-indigo-400">
                      {r.totalWeightedScore.toFixed(1)}%
                    </td>

                    {/* Letter Grade Badge */}
                    <td className="p-4 text-center">
                      <span className={`inline-block font-mono font-bold px-2.5 py-0.5 rounded-lg border text-xs ${getGradeBadgeColor(r.letterGrade)}`}>
                        {r.letterGrade}
                      </span>
                    </td>

                    {/* Grade Point */}
                    <td className="p-4 text-center font-mono font-bold text-zinc-200">
                      {r.gradePoint.toFixed(1)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
