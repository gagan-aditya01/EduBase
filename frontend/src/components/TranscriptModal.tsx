import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GraduationCap, Download, X, Award, BookOpen, Sparkles, FileText, Building2, CheckCircle2 } from 'lucide-react';

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
        const token = localStorage.getItem('edubase_token') || (JSON.parse(localStorage.getItem('edubase_user') || '{}').token);
        const res = await fetch(`http://localhost:5050/api/v1/grades/student/${student.studentId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
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
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const cgpa = transcriptData?.cgpa ? transcriptData.cgpa.toFixed(2) : '0.00';
    const grades = transcriptData?.grades || [];
    const issueDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    let standingText = 'First Class with Distinction';
    if (parseFloat(cgpa) >= 8.5) standingText = 'First Class with Distinction';
    else if (parseFloat(cgpa) >= 7.0) standingText = 'First Class';
    else if (parseFloat(cgpa) >= 6.0) standingText = 'Second Class Upper';
    else if (parseFloat(cgpa) >= 5.0) standingText = 'Second Class';
    else if (parseFloat(cgpa) >= 4.0) standingText = 'Pass Division';
    else standingText = 'Re-evaluation Required';

    const rowsHTML = grades.length === 0
      ? `<tr><td colspan="9" style="text-align: center; padding: 20px; color: #6b7280;">No subject marks published yet.</td></tr>`
      : grades.map((g: any) => `
        <tr>
          <td style="padding: 8px 6px; font-family: monospace; font-weight: 700; color: #111827; border-bottom: 1px solid #e5e7eb;">${g.courseCode}</td>
          <td style="padding: 8px 6px; font-weight: 600; color: #1f2937; border-bottom: 1px solid #e5e7eb; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${g.courseTitle}</td>
          <td style="padding: 8px 4px; text-align: center; font-family: monospace; border-bottom: 1px solid #e5e7eb;">${g.assignment1}</td>
          <td style="padding: 8px 4px; text-align: center; font-family: monospace; border-bottom: 1px solid #e5e7eb;">${g.midterm}</td>
          <td style="padding: 8px 4px; text-align: center; font-family: monospace; border-bottom: 1px solid #e5e7eb;">${g.assignment2}</td>
          <td style="padding: 8px 4px; text-align: center; font-family: monospace; border-bottom: 1px solid #e5e7eb;">${g.endSem}</td>
          <td style="padding: 8px 4px; text-align: center; font-family: monospace; font-weight: 800; color: #111827; border-bottom: 1px solid #e5e7eb;">${typeof g.totalWeightedScore === 'number' ? g.totalWeightedScore.toFixed(1) : g.totalWeightedScore}%</td>
          <td style="padding: 8px 4px; text-align: center; font-family: monospace; font-weight: 900; border-bottom: 1px solid #e5e7eb;">${g.letterGrade}</td>
          <td style="padding: 8px 4px; text-align: center; font-family: monospace; font-weight: 700; border-bottom: 1px solid #e5e7eb;">${typeof g.gradePoint === 'number' ? g.gradePoint.toFixed(1) : g.gradePoint}</td>
        </tr>
      `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Official Academic Transcript - ${student.name} (${student.studentId})</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #111827;
              background: #ffffff;
              margin: 0;
              padding: 0;
              font-size: 11.5px;
              line-height: 1.4;
            }
            .transcript-container {
              width: 100%;
              max-width: 100%;
              box-sizing: border-box;
            }
            .transcript-border {
              border: 2px solid #111827;
              padding: 22px 24px;
              border-radius: 4px;
              width: 100%;
              box-sizing: border-box;
            }
            .header-box {
              text-align: center;
              border-bottom: 2px solid #111827;
              padding-bottom: 14px;
              margin-bottom: 18px;
            }
            .uni-title {
              font-size: 20px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #111827;
              margin: 0 0 3px 0;
            }
            .uni-sub {
              font-size: 9.5px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #4b5563;
              margin: 0 0 10px 0;
            }
            .doc-heading {
              display: inline-block;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #ffffff;
              background: #111827;
              padding: 3px 14px;
              border-radius: 20px;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 18px;
              background: #fafafa;
              border: 1px solid #e5e7eb;
            }
            .details-table td {
              padding: 8px 12px;
              width: 50%;
              vertical-align: top;
              border-bottom: 1px solid #e5e7eb;
            }
            .details-table tr:last-child td {
              border-bottom: none;
            }
            .field-label {
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #6b7280;
              display: block;
              margin-bottom: 2px;
            }
            .field-value {
              font-size: 12.5px;
              font-weight: 700;
              color: #111827;
            }
            .stat-badge {
              display: inline-block;
              padding: 2px 8px;
              background: #f3f4f6;
              color: #111827;
              border: 1px solid #d1d5db;
              border-radius: 4px;
              font-weight: 700;
              font-size: 10.5px;
            }
            .grades-table {
              width: 100%;
              table-layout: fixed;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 10.5px;
              border: 1px solid #e5e7eb;
            }
            .grades-table th {
              background: #f3f4f6;
              color: #111827;
              padding: 8px 4px;
              text-align: left;
              font-size: 9.5px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #d1d5db;
              border-right: 1px solid #e5e7eb;
            }
            .grades-table th:last-child {
              border-right: none;
            }
            .grades-table td {
              border-right: 1px solid #f3f4f6;
            }
            .grades-table td:last-child {
              border-right: none;
            }
            .grades-table th.center, .grades-table td.center {
              text-align: center;
            }
            .footer-box {
              margin-top: 24px;
              padding-top: 14px;
              border-top: 1px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .cert-text {
              font-size: 9.5px;
              color: #4b5563;
              line-height: 1.5;
            }
            .sig-box {
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="transcript-container">
            <div class="transcript-border">
              <div class="header-box">
                <h1 class="uni-title">EduBase Institute of Technology</h1>
                <p class="uni-sub">Recognized by AICTE & UGC &bull; Official Academic Record</p>
                <div class="doc-heading">Transcript of Academic Record</div>
              </div>

              <table class="details-table">
                <tr>
                  <td>
                    <span class="field-label">Student Name</span>
                    <span class="field-value">${student.name}</span>
                  </td>
                  <td>
                    <span class="field-label">Registration ID</span>
                    <span class="field-value" style="font-family: monospace;">${student.studentId}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span class="field-label">Department</span>
                    <span class="field-value">${student.department}</span>
                  </td>
                  <td>
                    <span class="field-label">Academic Enrolment</span>
                    <span class="field-value">${student.section || 'N/A'} &bull; ${student.year || '3rd Year'}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span class="field-label">Cumulative CGPA</span>
                    <span class="field-value" style="font-size: 15px; font-family: monospace; font-weight: 900; color: #111827;">${cgpa} <span style="font-size: 11px; color: #6b7280; font-weight: normal;">/ 10.0</span></span>
                  </td>
                  <td>
                    <span class="field-label">Academic Standing</span>
                    <span class="stat-badge">${standingText}</span>
                  </td>
                </tr>
              </table>

              <table class="grades-table">
                <colgroup>
                  <col style="width: 12%;" />
                  <col style="width: 28%;" />
                  <col style="width: 9%;" />
                  <col style="width: 9%;" />
                  <col style="width: 9%;" />
                  <col style="width: 9%;" />
                  <col style="width: 10%;" />
                  <col style="width: 7%;" />
                  <col style="width: 7%;" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Subject Title</th>
                    <th class="center">Assign 1 (20)</th>
                    <th class="center">Midterm (50)</th>
                    <th class="center">Assign 2 (20)</th>
                    <th class="center">EndSem (100)</th>
                    <th class="center">Weighted %</th>
                    <th class="center">Grade</th>
                    <th class="center">Point</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHTML}
                </tbody>
              </table>

              <div class="footer-box">
                <div class="cert-text">
                  <strong>Verified & Certified Official Grade Record</strong><br />
                  Issued Date: ${issueDate}<br />
                  Document Verification ID: <code>EDU-${student.studentId}-${Date.now().toString().slice(-6)}</code>
                </div>
                <div class="sig-box">
                  <div style="font-family: 'Dancing Script', cursive, Georgia, serif; font-size: 26px; font-weight: 700; color: #1e3a8a; font-style: italic; margin-bottom: -4px; padding-right: 8px; transform: rotate(-2deg);">
                    Gagan Aditya
                  </div>
                  <div style="width: 190px; border-top: 1.5px solid #111827; margin-left: auto; margin-bottom: 4px;"></div>
                  <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #111827; letter-spacing: 0.5px;">Gagan Aditya</div>
                  <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Controller of Examinations</div>
                  <div style="margin-top: 4px;">
                    <span style="display: inline-block; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 2px 6px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 4px;">
                      ✓ Digitally Certified & Verified Signature
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const getAcademicStanding = (cgpa: number) => {
    if (cgpa >= 8.5) {
      return {
        text: 'First Class with Distinction',
        color: isDark ? 'text-zinc-100 bg-zinc-800 border-zinc-700 font-bold' : 'text-zinc-900 bg-zinc-100 border-zinc-300 font-bold',
      };
    }
    if (cgpa >= 7.0) {
      return {
        text: 'First Class',
        color: isDark ? 'text-zinc-200 bg-zinc-850 border-zinc-700 font-bold' : 'text-zinc-900 bg-zinc-100 border-zinc-300 font-bold',
      };
    }
    if (cgpa >= 6.0) {
      return {
        text: 'Second Class Upper',
        color: isDark ? 'text-zinc-200 bg-zinc-800 border-zinc-700 font-bold' : 'text-zinc-900 bg-[#f0ede6] border-[#d8d4c8] font-bold',
      };
    }
    if (cgpa >= 5.0) {
      return {
        text: 'Second Class',
        color: isDark ? 'text-zinc-300 bg-zinc-850 border-zinc-700 font-medium' : 'text-zinc-800 bg-[#f5f2eb] border-[#e5e2d9] font-medium',
      };
    }
    if (cgpa >= 4.0) {
      return {
        text: 'Pass Division',
        color: isDark ? 'text-zinc-300 bg-zinc-800 border-zinc-700 font-bold' : 'text-zinc-900 bg-zinc-100 border-zinc-300 font-bold',
      };
    }
    return {
      text: 'Re-evaluation Required',
      color: isDark ? 'text-red-400 bg-red-500/10 border-red-500/30 font-bold' : 'text-red-900 bg-red-100/90 border-red-300 font-bold',
    };
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl max-h-[85vh] my-auto rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
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
                  <div className="doc-heading text-xs font-bold uppercase tracking-widest text-[#cc5a37] mt-3">
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
                      <span className={`text-2xl font-mono font-black ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                        {transcriptData?.cgpa ? transcriptData.cgpa.toFixed(2) : '0.00'}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">on 10.0 Point Scale</span>
                    </div>
                    <Award size={28} className={isDark ? 'text-zinc-400' : 'text-zinc-600'} />
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
                            <td className="p-3 text-center font-mono font-bold text-zinc-200">
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
                    <div className="font-serif text-lg font-bold text-blue-500 italic mb-0.5 tracking-wide">Gagan Aditya</div>
                    <div className="w-36 border-b border-zinc-500 mb-1 ml-auto" />
                    <span className="font-bold uppercase tracking-wider text-zinc-300 block">Gagan Aditya</span>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">Controller of Examinations</span>
                    <span className="inline-flex items-center gap-1 text-[8px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-1.5 py-0.5 rounded mt-1">
                      <CheckCircle2 size={9} /> Digitally Certified Signature
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
