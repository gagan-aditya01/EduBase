import React, { useEffect, useState, useRef } from 'react';
import { GraduationCap, Download, X, Award, BookOpen, Sparkles, FileText, Building2 } from 'lucide-react';

interface TranscriptModalProps {
  student: {
    studentId: string;
    name: string;
    department: string;
    age?: number;
    section?: string;
    year?: string;
  };
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const TranscriptModal: React.FC<TranscriptModalProps> = ({ student, onClose, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(true);
  const [transcriptData, setTranscriptData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5050/api/v1/grades/student/${student.studentId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch academic transcript');
        }
        setTranscriptData(data);
      } catch (err: any) {
        setErrorMsg(err.message || 'Error loading transcript data');
      } finally {
        setLoading(false);
      }
    };

    fetchTranscript();
  }, [student.studentId]);

  const handlePrintPDF = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = printRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Official Academic Transcript - ${student.name} (${student.studentId})</title>
          <style>
            @media print {
              @page { size: A4; margin: 15mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #111827;
              background: #ffffff;
              margin: 0;
              padding: 24px;
            }
            .header { text-align: center; border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 24px; }
            .uni-name { font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #000000; }
            .uni-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #4b5563; margin-top: 4px; }
            .doc-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-top: 12px; color: #cc5a37; }
            .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px; }
            .info-item { font-size: 12px; }
            .info-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6b7280; }
            .info-val { font-weight: 700; color: #111827; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 11px; }
            th { background: #f3f4f6; text-align: left; padding: 8px 12px; font-weight: 700; text-transform: uppercase; border-bottom: 1.5px solid #d1d5db; }
            td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
            .summary-box { display: flex; justify-content: space-between; background: #f3f4f6; padding: 16px; border-radius: 8px; border: 1px solid #d1d5db; }
            .cgpa-val { font-size: 20px; font-weight: 800; color: #cc5a37; }
            .footer-sig { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; pt-8; border-top: 1px dashed #9ca3af; }
            .sig-line { border-top: 1px solid #000; width: 160px; text-align: center; font-size: 10px; font-weight: 700; padding-top: 4px; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const getAcademicStanding = (cgpa: number) => {
    if (cgpa >= 8.5) return { text: 'First Class with Distinction', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (cgpa >= 7.0) return { text: 'First Class', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' };
    if (cgpa >= 6.0) return { text: 'Second Class Upper', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
    if (cgpa >= 5.0) return { text: 'Second Class', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (cgpa >= 4.0) return { text: 'Pass Division', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
    return { text: 'Re-evaluation Required', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-[#e5e2d9] text-[#191919]'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'border-zinc-800 bg-zinc-900/60' : 'border-[#e5e2d9] bg-[#f8f6f0]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border ${
              isDark ? 'bg-zinc-800/80 border-zinc-700 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#cc5a37]'
            }`}>
              <GraduationCap size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                Official Academic Transcript
                <Sparkles size={16} className={isDark ? 'text-zinc-400' : 'text-[#cc5a37]'} />
              </h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-650'}`}>
                Student Performance & Certified CGPA Record
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintPDF}
              disabled={loading || !transcriptData}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isDark
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700'
                  : 'bg-[#191919] hover:bg-zinc-800 text-white shadow-md'
              }`}
            >
              <Download size={14} />
              Download Official PDF
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100' : 'bg-white border-[#e5e2d9] text-zinc-600 hover:text-black'
              }`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-400 inline-block" />
              <p className="text-xs font-mono text-zinc-400">Loading student academic transcript and course marks...</p>
            </div>
          ) : errorMsg ? (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {errorMsg}
            </div>
          ) : (
            <>
              {/* Printable PDF Render Container */}
              <div ref={printRef} className="space-y-6">
                {/* Official University Seal Header */}
                <div className="text-center pb-4 border-b border-zinc-800/40">
                  <div className="flex justify-center mb-2">
                    <Building2 size={32} className={isDark ? 'text-zinc-300' : 'text-[#cc5a37]'} />
                  </div>
                  <h1 className="uni-name text-lg font-black uppercase tracking-wider">EduBase Institute of Technology</h1>
                  <p className="uni-sub text-[11px] text-zinc-400 uppercase tracking-widest mt-0.5">
                    Recognized by AICTE & UGC • Official Academic Record
                  </p>
                  <div className="doc-title text-xs font-bold uppercase tracking-widest text-[#cc5a37] mt-3">
                    Transcript of Academic Record
                  </div>
                </div>

                {/* Student Personal Info Card */}
                <div className={`p-4 rounded-2xl border grid grid-cols-2 md:grid-cols-4 gap-4 ${
                  isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-[#fcfbf9] border-[#e5e2d9]'
                }`}>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Registration ID</span>
                    <span className="text-xs font-mono font-bold">{student.studentId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Student Name</span>
                    <span className="text-xs font-bold">{student.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Department</span>
                    <span className="text-xs font-medium">{student.department}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Section & Year</span>
                    <span className="text-xs font-mono font-medium">{student.section || 'N/A'} • {student.year || '3rd Year'}</span>
                  </div>
                </div>

                {/* CGPA & Academic Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
                  }`}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Cumulative CGPA</span>
                      <span className={`text-2xl font-mono font-black ${isDark ? 'text-emerald-400' : 'text-[#cc5a37]'}`}>
                        {transcriptData?.cgpa ? transcriptData.cgpa.toFixed(2) : '0.00'}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">on 10.0 Point Scale</span>
                    </div>
                    <Award size={28} className={isDark ? 'text-emerald-400/80' : 'text-[#cc5a37]'} />
                  </div>

                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
                  }`}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Academic Standing</span>
                      {(() => {
                        const standing = getAcademicStanding(transcriptData?.cgpa || 0);
                        return (
                          <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${standing.color}`}>
                            {standing.text}
                          </span>
                        );
                      })()}
                    </div>
                    <BookOpen size={24} className="text-zinc-500" />
                  </div>

                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-[#e5e2d9]'
                  }`}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Evaluated Courses</span>
                      <span className="text-2xl font-mono font-bold">{transcriptData?.evaluatedCoursesCount || 0}</span>
                      <span className="text-[10px] text-zinc-500 block">Subjects Completed</span>
                    </div>
                    <FileText size={24} className="text-zinc-500" />
                  </div>
                </div>

                {/* Complete Course Grade Breakdown Table */}
                <div className={`rounded-2xl border overflow-hidden ${
                  isDark ? 'bg-zinc-900/20 border-zinc-800' : 'bg-white border-[#e5e2d9]'
                }`}>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                        isDark ? 'bg-zinc-900/80 border-zinc-800 text-zinc-400' : 'bg-[#f5f2eb] border-[#e5e2d9] text-zinc-650'
                      }`}>
                        <th className="p-3">Course Code</th>
                        <th className="p-3">Subject Title</th>
                        <th className="p-3 text-center">Assign 1 (20)</th>
                        <th className="p-3 text-center">Midterm (50)</th>
                        <th className="p-3 text-center">Assign 2 (20)</th>
                        <th className="p-3 text-center">EndSem (100)</th>
                        <th className="p-3 text-center">Weighted %</th>
                        <th className="p-3 text-center">Grade</th>
                        <th className="p-3 text-center">Point</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/20">
                      {!transcriptData?.grades || transcriptData.grades.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center p-8 text-zinc-500 font-mono">
                            No subject evaluation marks published yet for this student.
                          </td>
                        </tr>
                      ) : (
                        transcriptData.grades.map((g: any, i: number) => (
                          <tr key={i} className={isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-[#f8f6f0]'}>
                            <td className="p-3 font-mono font-bold text-zinc-300">{g.courseCode}</td>
                            <td className="p-3 font-medium">{g.courseTitle}</td>
                            <td className="p-3 text-center font-mono">{g.assignment1}</td>
                            <td className="p-3 text-center font-mono">{g.midterm}</td>
                            <td className="p-3 text-center font-mono">{g.assignment2}</td>
                            <td className="p-3 text-center font-mono">{g.endSem}</td>
                            <td className={`p-3 text-center font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-[#cc5a37]'}`}>
                              {g.totalWeightedScore.toFixed(1)}%
                            </td>
                            <td className="p-3 text-center font-mono font-bold">{g.letterGrade}</td>
                            <td className="p-3 text-center font-mono font-bold">{g.gradePoint.toFixed(1)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Certificate Footer */}
                <div className="pt-6 border-t border-zinc-800/40 flex items-center justify-between text-[10px] text-zinc-500">
                  <div>
                    <span>Verified & Certified Official Grade Record</span>
                    <br />
                    <span>Issued Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="text-right">
                    <div className="w-32 border-b border-zinc-500 mb-1" />
                    <span className="font-bold uppercase tracking-wider">Controller of Examinations</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
