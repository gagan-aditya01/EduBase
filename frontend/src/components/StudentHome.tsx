import { useState, useEffect } from 'react';
import { BookOpen, Award, Calendar, Layers } from 'lucide-react';

interface StudentHomeProps {
  user: any;
  theme?: 'light' | 'dark';
}

export function StudentHome({ user, theme = 'dark' }: StudentHomeProps) {
  const isDark = theme === 'dark';
  const [transcriptData, setTranscriptData] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const studentId = user?.studentId || user?.username;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 1. Fetch Student Transcript & CGPA Data
        if (studentId && user?.token) {
          const tRes = await fetch(`http://localhost:5050/api/v1/grades/student/${studentId}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (tRes.ok) {
            const tJson = await tRes.json();
            setTranscriptData(tJson);
          }
        }

        // 2. Fetch Course Curriculum to filter enrolled subjects
        const cRes = await fetch('http://localhost:5050/api/v1/courses');
        if (cRes.ok) {
          const cJson = await cRes.json();
          setCourses(cJson);
        }
      } catch (err) {
        console.error('Failed to load student home data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [studentId, user?.token]);

  // Extract enrolled subjects matching student department and current year
  const userDept = user?.department || transcriptData?.student?.department || 'Computer Science';
  const userYear = user?.year || transcriptData?.student?.year || '3rd Year';
  const yearDigit = userYear.match(/\d+/)?.[0] || '3';

  const enrolledCourses = courses.filter((c) => {
    const matchesDept = (c.department || '').toLowerCase().includes(userDept.toLowerCase()) ||
                        (userDept || '').toLowerCase().includes((c.department || '').toLowerCase());
    
    let matchesYear = false;
    if (c.year) {
      const yDigit = c.year.match(/\d+/)?.[0];
      if (yDigit === yearDigit) matchesYear = true;
    }
    const codeMatch = (c.courseCode || '').match(/[A-Z]+([1-4])\d{2}/);
    if (codeMatch && codeMatch[1] === yearDigit) matchesYear = true;

    return matchesDept && matchesYear;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Student Welcome Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden transition-all ${
        isDark
          ? 'bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border-zinc-800'
          : 'bg-gradient-to-r from-[#fcfbf9] via-[#f8f6f0] to-[#f5f2eb] border-[#e5e2d9] shadow-xs'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wider border ${
                isDark ? 'bg-zinc-800/80 border-zinc-700 text-amber-400' : 'bg-white border-[#e5e2d9] text-[#cc5a37]'
              }`}>
                Active Academic Enrolment
              </span>
              <span className={`px-3 py-1 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wider border ${
                isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                Reg ID: {studentId}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, <span className="gradient-text">{transcriptData?.student?.name || user?.name || user?.username}</span>!
            </h1>
            <p className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Department of {userDept} &bull; {userYear} &bull; Section {user?.section || transcriptData?.student?.section || '3CS'}
            </p>
          </div>

          {/* Quick CGPA Stat Card */}
          {transcriptData && (
            <div className={`px-5 py-4 rounded-2xl border flex items-center gap-4 shrink-0 ${
              isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white border-[#e5e2d9] shadow-sm'
            }`}>
              <div className={`p-3 rounded-xl border ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-emerald-400' : 'bg-[#f5f2eb] border-[#e5e2d9] text-[#cc5a37]'
              }`}>
                <Award size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Cumulative CGPA</span>
                <span className="text-2xl font-mono font-black text-emerald-400">
                  {transcriptData.cgpa ? transcriptData.cgpa.toFixed(2) : 'N/A'} <span className="text-xs text-zinc-500 font-normal">/ 10.0</span>
                </span>
                <span className="text-[10px] font-bold block text-zinc-400 mt-0.5">
                  {transcriptData.evaluatedCoursesCount || 0} Courses Evaluated
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enrolled Subjects Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <BookOpen size={18} className={isDark ? 'text-amber-400' : 'text-[#cc5a37]'} />
            Currently Enrolled Subjects ({enrolledCourses.length})
          </h2>
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-650'}`}>
            Active curriculum courses for your current academic year ({userYear})
          </p>
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`p-6 rounded-2xl border animate-pulse h-44 ${
              isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-[#e5e2d9]'
            }`} />
          ))}
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div className={`p-8 rounded-2xl border text-center ${
          isDark ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400' : 'bg-white border-[#e5e2d9] text-zinc-600'
        }`}>
          No enrolled courses found for {userDept} - {userYear}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrolledCourses.map((course) => (
            <div
              key={course.courseCode}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${
                isDark
                  ? 'bg-zinc-900/60 hover:bg-zinc-900/90 border-zinc-800 text-zinc-100'
                  : 'bg-white hover:bg-[#fcfbf9] border-[#e5e2d9] text-[#191919] shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    isDark ? 'bg-zinc-800 text-amber-300 border-zinc-700' : 'bg-[#f5f2eb] text-[#cc5a37] border-[#e5e2d9]'
                  }`}>
                    {course.courseCode}
                  </span>
                  <span className={`text-[10.5px] font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-650'}`}>
                    {course.credits || 4.0} Credits
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm tracking-tight">{course.title}</h3>
                  <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {course.description || `Core academic unit for ${course.department} curriculum.`}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-medium text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Layers size={13} /> {course.department}
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Calendar size={13} /> {course.year || userYear}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
