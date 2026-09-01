import { useState, useEffect, useMemo } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import { TranscriptModal } from './TranscriptModal';

interface StudentMarksPageProps {
  user: any;
  theme?: 'light' | 'dark';
}

export function StudentMarksPage({ user, theme = 'dark' }: StudentMarksPageProps) {
  const isDark = theme === 'dark';
  const [transcriptData, setTranscriptData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);

  const studentId = user?.studentId || user?.username;

  useEffect(() => {
    async function fetchMarks() {
      if (!studentId || !user?.token) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:5050/api/v1/grades/student/${studentId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) {
          throw new Error('Failed to load academic marks data');
        }
        const data = await res.json();
        setTranscriptData(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching marks');
      } finally {
        setLoading(false);
      }
    }

    fetchMarks();
  }, [studentId, user?.token]);

  // Group grades by Academic Year
  const gradesByYear = useMemo(() => {
    if (!transcriptData?.grades) return {};
    const groups: Record<string, any[]> = {};
    transcriptData.grades.forEach((g: any) => {
      const yr = g.year || '1st Year';
      if (!groups[yr]) groups[yr] = [];
      groups[yr].push(g);
    });
    return groups;
  }, [transcriptData]);

  // Helper for grade badge styling (Monochromatic & Emerald/Rust - NO Yellow)
  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'O':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-black';
      case 'A+':
      case 'A':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'B+':
      case 'B':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/40';
      case 'C':
      case 'P':
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      case 'F':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  // Compute SGPA for a single year group
  const computeYearSgpa = (gradesList: any[]) => {
    if (!gradesList || gradesList.length === 0) return 0;
    let totalCredits = 0;
    let weightedPoints = 0;
    gradesList.forEach((g) => {
      const c = g.credits || 3;
      totalCredits += c;
      weightedPoints += (g.gradePoint || 0) * c;
    });
    if (totalCredits > 0) return Math.round((weightedPoints / totalCredits) * 100) / 100;
    const avg = gradesList.reduce((sum, g) => sum + (g.totalWeightedScore || 0), 0) / gradesList.length;
    return Math.min(10.0, Math.max(0, Math.round((avg / 10) * 100) / 100));
  };

  // Determine completed academic years based on student's current enrolled year (courseYear < studentYear)
  const studentYearStr = transcriptData?.student?.year || user?.year || '4th Year';
  const studentYearNum = parseInt(studentYearStr.match(/\d+/)?.[0] || '4', 10);

  const availableCompletedYears = useMemo(() => {
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    return years.filter((yr) => {
      const yrNum = parseInt(yr.match(/\d+/)?.[0] || '0', 10);
      return yrNum < studentYearNum;
    });
  }, [studentYearNum]);

  return (
    <div className="space-y-6 pb-12">
      {/* Clean Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-800/40">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            Academic Performance & Grade Sheet
          </h1>
        </div>

        <button
          onClick={() => setShowPdfModal(true)}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
            isDark
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-[#191919] text-white border-[#191919] hover:bg-[#333]'
          }`}
        >
          <Download size={14} />
          <span>Download Official PDF</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className={`p-6 rounded-2xl border animate-pulse h-48 ${
              isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-[#e5e2d9]'
            }`} />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl border border-red-500/40 bg-red-500/10 text-red-400 text-sm font-medium flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : (
        /* YEAR-WISE SHEET VIEW (NO FILTERS / NO TOGGLE BUTTONS) */
        <div className="space-y-6">
          {availableCompletedYears.length === 0 ? (
            <div className={`p-8 rounded-2xl border text-center ${
              isDark ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400' : 'bg-white border-[#e5e2d9] text-zinc-600'
            }`}>
              No completed academic years evaluated yet for {studentYearStr}.
            </div>
          ) : (
            availableCompletedYears.map((yr) => {
              const yearGrades = gradesByYear[yr] || [];
              if (yearGrades.length === 0) return null;

              const yearSgpa = computeYearSgpa(yearGrades);

              return (
                <div
                  key={yr}
                  className={`p-5 rounded-3xl border space-y-4 ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white border-[#e5e2d9] shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-xl text-xs font-black font-mono uppercase tracking-wider border ${
                        isDark ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-[#f5f2eb] text-[#cc5a37] border-[#e5e2d9]'
                      }`}>
                        {yr}
                      </span>
                      <span className={`text-xs font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {yearGrades.length} Courses Evaluated
                      </span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                      isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                      Year SGPA: {yearSgpa.toFixed(2)} / 10.0
                    </span>
                  </div>

                  {/* Table Grid */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className={`border-b text-[10.5px] uppercase font-bold tracking-wider ${
                          isDark ? 'border-zinc-800 text-zinc-500' : 'border-[#e5e2d9] text-zinc-400'
                        }`}>
                          <th className="py-2.5 px-3">Subject Code</th>
                          <th className="py-2.5 px-3">Course Title</th>
                          <th className="py-2.5 px-3 text-center">Assign 1 (20)</th>
                          <th className="py-2.5 px-3 text-center">Midterm (50)</th>
                          <th className="py-2.5 px-3 text-center">Assign 2 (20)</th>
                          <th className="py-2.5 px-3 text-center">EndSem (100)</th>
                          <th className="py-2.5 px-3 text-center">Total Weighted %</th>
                          <th className="py-2.5 px-3 text-center">Grade</th>
                          <th className="py-2.5 px-3 text-center">Grade Point</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/40">
                        {yearGrades.map((g) => (
                          <tr
                            key={g.courseCode}
                            className={`transition-colors ${
                              isDark ? 'hover:bg-zinc-800/40' : 'hover:bg-[#fcfbf9]'
                            }`}
                          >
                            <td className="py-3 px-3 font-mono font-bold text-emerald-400">{g.courseCode}</td>
                            <td className="py-3 px-3 font-medium">{g.courseTitle}</td>
                            <td className="py-3 px-3 text-center font-mono">{g.assignment1}</td>
                            <td className="py-3 px-3 text-center font-mono">{g.midterm}</td>
                            <td className="py-3 px-3 text-center font-mono">{g.assignment2}</td>
                            <td className="py-3 px-3 text-center font-mono">{g.endSem}</td>
                            <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">
                              {g.totalWeightedScore}%
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-black border ${getGradeBadgeColor(g.letterGrade)}`}>
                                {g.letterGrade}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-bold">{g.gradePoint}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* PDF Download Transcript Modal */}
      {showPdfModal && (
        <TranscriptModal
          student={transcriptData?.student || { studentId, name: user?.name, department: user?.department, year: user?.year, section: user?.section }}
          onClose={() => setShowPdfModal(false)}
          theme={theme}
        />
      )}
    </div>
  );
}
