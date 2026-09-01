import { useState, useEffect, useMemo } from 'react';
import { Download, FileText, AlertCircle, Layers } from 'lucide-react';
import { TranscriptModal } from './TranscriptModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/interfaces-select';

interface StudentMarksPageProps {
  user: any;
  theme?: 'light' | 'dark';
}

export function StudentMarksPage({ user, theme = 'dark' }: StudentMarksPageProps) {
  const isDark = theme === 'dark';
  const [transcriptData, setTranscriptData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'yearwise' | 'combined'>('yearwise');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('ALL');
  const [showPdfModal, setShowPdfModal] = useState(false);

  const studentId = user?.studentId || user?.username;

  useEffect(() => {
    async function fetchTranscript() {
      if (!studentId || !user?.token) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:5050/api/v1/grades/student/${studentId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch academic marks');
        }

        const data = await res.json();
        setTranscriptData(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching marks console');
      } finally {
        setLoading(false);
      }
    }

    fetchTranscript();
  }, [studentId, user?.token]);

  // Group grades by academic year (1st Year, 2nd Year, 3rd Year, 4th Year)
  const gradesByYear = useMemo(() => {
    if (!transcriptData?.grades) return {};

    const groups: Record<string, any[]> = {
      '1st Year': [],
      '2nd Year': [],
      '3rd Year': [],
      '4th Year': [],
    };

    transcriptData.grades.forEach((g: any) => {
      let yr = g.year || '1st Year';
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

  // Compute Year SGPA
  const computeYearSgpa = (grades: any[]) => {
    if (!grades || grades.length === 0) return 0;
    let totalScore = 0;
    grades.forEach((g) => {
      totalScore += g.totalWeightedScore || 0;
    });
    const avg = totalScore / grades.length;
    return Math.min(10.0, Math.max(0, Math.round((avg / 10) * 100) / 100));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wider border ${
              isDark ? 'bg-zinc-800 text-emerald-400 border-zinc-700' : 'bg-white border-[#e5e2d9] text-[#cc5a37]'
            }`}>
              Student Marks Console
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">
            Academic Performance & Grade Sheet
          </h1>
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-650'}`}>
            View year-by-year mark breakdown or inspect certified combined transcript
          </p>
        </div>

        {/* Header Controls: Academic Year Select Dropdown + View Switcher Tabs + PDF Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Prominent Academic Year Dropdown */}
          <div className="w-48 sm:w-56">
            <Select value={selectedYearFilter} onValueChange={(val) => setSelectedYearFilter(val)}>
              <SelectTrigger className={`w-full rounded-2xl text-xs font-bold ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'
              }`}>
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
                <SelectItem value="ALL" className="text-xs font-bold cursor-pointer">
                  All Years ({transcriptData?.grades?.length || 0} Courses)
                </SelectItem>
                <SelectItem value="1st Year" className="text-xs font-medium cursor-pointer">
                  1st Year ({gradesByYear['1st Year']?.length || 0} Courses)
                </SelectItem>
                <SelectItem value="2nd Year" className="text-xs font-medium cursor-pointer">
                  2nd Year ({gradesByYear['2nd Year']?.length || 0} Courses)
                </SelectItem>
                <SelectItem value="3rd Year" className="text-xs font-medium cursor-pointer">
                  3rd Year ({gradesByYear['3rd Year']?.length || 0} Courses)
                </SelectItem>
                <SelectItem value="4th Year" className="text-xs font-medium cursor-pointer">
                  4th Year ({gradesByYear['4th Year']?.length || 0} Courses)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={`p-1 rounded-2xl border flex items-center gap-1 ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-[#e5e2d9]'
          }`}>
            <button
              onClick={() => setActiveTab('yearwise')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'yearwise'
                  ? isDark ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'bg-[#191919] text-white'
                  : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-black'
              }`}
            >
              <Layers size={14} />
              <span>Year-Wise</span>
            </button>

            <button
              onClick={() => setActiveTab('combined')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'combined'
                  ? isDark ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'bg-[#191919] text-white'
                  : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-black'
              }`}
            >
              <FileText size={14} />
              <span>Combined</span>
            </button>
          </div>

          <button
            onClick={() => setShowPdfModal(true)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              isDark
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-[#191919] text-white border-[#191919] hover:bg-[#333]'
            }`}
          >
            <Download size={14} />
            <span>PDF</span>
          </button>
        </div>
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
      ) : activeTab === 'yearwise' ? (
        /* YEAR-WISE SHEET VIEW */
        <div className="space-y-6">
          {/* Year Filter Select Dropdown */}
          <div className="w-full sm:w-64">
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
              isDark ? 'text-zinc-400' : 'text-zinc-650'
            }`}>
              Filter Academic Year
            </label>
            <Select value={selectedYearFilter} onValueChange={(val) => setSelectedYearFilter(val)}>
              <SelectTrigger className={`w-full rounded-2xl text-xs font-bold ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'
              }`}>
                <SelectValue placeholder="Select Academic Year" />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
                <SelectItem value="ALL" className="text-xs font-bold cursor-pointer">
                  All Academic Years ({transcriptData?.grades?.length || 0} Courses)
                </SelectItem>
                <SelectItem value="1st Year" className="text-xs font-medium cursor-pointer">
                  1st Year ({gradesByYear['1st Year']?.length || 0} Courses)
                </SelectItem>
                <SelectItem value="2nd Year" className="text-xs font-medium cursor-pointer">
                  2nd Year ({gradesByYear['2nd Year']?.length || 0} Courses)
                </SelectItem>
                <SelectItem value="3rd Year" className="text-xs font-medium cursor-pointer">
                  3rd Year ({gradesByYear['3rd Year']?.length || 0} Courses)
                </SelectItem>
                <SelectItem value="4th Year" className="text-xs font-medium cursor-pointer">
                  4th Year ({gradesByYear['4th Year']?.length || 0} Courses)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Year Tables */}
          {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((yr) => {
            if (selectedYearFilter !== 'ALL' && selectedYearFilter !== yr) return null;
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
          })}
        </div>
      ) : (
        /* COMBINED SHEET TRANSCRIPT VIEW */
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white border-[#e5e2d9] shadow-xs'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                isDark ? 'bg-zinc-800 text-emerald-400 border-zinc-700' : 'bg-[#f5f2eb] text-[#cc5a37] border-[#e5e2d9]'
              }`}>
                Cumulative Academic Summary
              </span>
              <h2 className="text-xl font-black tracking-tight mt-1">
                Official Consolidated Transcript
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Cumulative CGPA</span>
                <span className="text-2xl font-mono font-black text-emerald-400">
                  {transcriptData?.cgpa ? transcriptData.cgpa.toFixed(2) : 'N/A'} <span className="text-xs text-zinc-500 font-normal">/ 10.0</span>
                </span>
              </div>
            </div>
          </div>

          {/* All Evaluated Courses Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b text-[10.5px] uppercase font-bold tracking-wider ${
                  isDark ? 'border-zinc-800 text-zinc-500' : 'border-[#e5e2d9] text-zinc-400'
                }`}>
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3">Course Code</th>
                  <th className="py-2.5 px-3">Course Title</th>
                  <th className="py-2.5 px-3 text-center">Assign 1 (20)</th>
                  <th className="py-2.5 px-3 text-center">Midterm (50)</th>
                  <th className="py-2.5 px-3 text-center">Assign 2 (20)</th>
                  <th className="py-2.5 px-3 text-center">EndSem (100)</th>
                  <th className="py-2.5 px-3 text-center">Total %</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {(transcriptData?.grades || []).map((g: any) => (
                  <tr key={g.courseCode} className={isDark ? 'hover:bg-zinc-800/40' : 'hover:bg-[#fcfbf9]'}>
                    <td className="py-3 px-3 font-mono font-bold text-zinc-400">{g.year}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PDF Transcript Inspector Modal */}
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
