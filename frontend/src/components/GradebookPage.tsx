import { useState, useEffect, useMemo } from 'react';
import { BookOpen, CheckCircle2, AlertCircle, Sparkles, GraduationCap, Download, TrendingUp, Award, AlertTriangle, Search, X } from 'lucide-react';
import { LiquidMetalButton } from './ui/liquid-metal-button';
import { TranscriptModal } from './TranscriptModal';
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
  assignment1: number | string;
  midterm: number | string;
  assignment2: number | string;
  endSem: number | string;
  totalWeightedScore: number;
  letterGrade: string;
  gradePoint: number;
}

interface GradebookPageProps {
  currentUser: {
    token: string;
    username: string;
    role: 'admin' | 'guest' | 'faculty';
    assignedDepartment?: string;
    assignedSubjects?: string[];
  };
  theme?: 'light' | 'dark';
  addToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

const FALLBACK_COURSES = [
  // --- Computer Science ---
  { courseCode: 'CS101', title: 'C Programming & Logic Building', department: 'Computer Science', year: '1st Year', credits: 4 },
  { courseCode: 'CS102', title: 'Web Technologies & Design', department: 'Computer Science', year: '1st Year', credits: 3 },
  { courseCode: 'CS103', title: 'Digital Electronics & Logic', department: 'Computer Science', year: '1st Year', credits: 3 },
  { courseCode: 'CS201', title: 'Data Structures & Algorithms', department: 'Computer Science', year: '2nd Year', credits: 4 },
  { courseCode: 'CS202', title: 'Computer Networks & Protocols', department: 'Computer Science', year: '2nd Year', credits: 3 },
  { courseCode: 'CS203', title: 'Object Oriented Programming in Java', department: 'Computer Science', year: '2nd Year', credits: 4 },
  { courseCode: 'CS301', title: 'Operating Systems & Architecture', department: 'Computer Science', year: '3rd Year', credits: 3 },
  { courseCode: 'CS302', title: 'Database Management Systems', department: 'Computer Science', year: '3rd Year', credits: 4 },
  { courseCode: 'CS303', title: 'Software Engineering Principles', department: 'Computer Science', year: '3rd Year', credits: 3 },
  { courseCode: 'CS401', title: 'Artificial Intelligence & ML', department: 'Computer Science', year: '4th Year', credits: 4 },
  { courseCode: 'CS402', title: 'Cloud Computing & Distributed Systems', department: 'Computer Science', year: '4th Year', credits: 3 },
  { courseCode: 'CS403', title: 'Cyber Security & Cryptography', department: 'Computer Science', year: '4th Year', credits: 3 },

  // --- ADSE ---
  { courseCode: 'ADSE101', title: 'Software Process Fundamentals', department: 'ADSE', year: '1st Year', credits: 3 },
  { courseCode: 'ADSE102', title: 'Python Application Programming', department: 'ADSE', year: '1st Year', credits: 4 },
  { courseCode: 'ADSE103', title: 'Mathematical Foundations for Engineering', department: 'ADSE', year: '1st Year', credits: 3 },
  { courseCode: 'ADSE201', title: 'Agile Systems Development', department: 'ADSE', year: '2nd Year', credits: 3 },
  { courseCode: 'ADSE202', title: 'Software Architecture & Patterns', department: 'ADSE', year: '2nd Year', credits: 4 },
  { courseCode: 'ADSE203', title: 'UI/UX Engineering & Design', department: 'ADSE', year: '2nd Year', credits: 3 },
  { courseCode: 'ADSE301', title: 'Enterprise DevOps & CI/CD Pipelines', department: 'ADSE', year: '3rd Year', credits: 4 },
  { courseCode: 'ADSE302', title: 'Microservices & API Architecture', department: 'ADSE', year: '3rd Year', credits: 4 },
  { courseCode: 'ADSE303', title: 'Software Quality Assurance & Testing', department: 'ADSE', year: '3rd Year', credits: 3 },
  { courseCode: 'ADSE401', title: 'Cloud Native Application Design', department: 'ADSE', year: '4th Year', credits: 4 },
  { courseCode: 'ADSE402', title: 'Big Data & Analytics Pipelines', department: 'ADSE', year: '4th Year', credits: 4 },
  { courseCode: 'ADSE403', title: 'Enterprise Capstone Project', department: 'ADSE', year: '4th Year', credits: 6 },

  // --- Mathematics ---
  { courseCode: 'MATH101', title: 'Calculus & Analytical Geometry', department: 'Mathematics', year: '1st Year', credits: 4 },
  { courseCode: 'MATH102', title: 'Linear Algebra & Matrices', department: 'Mathematics', year: '1st Year', credits: 4 },
  { courseCode: 'MATH103', title: 'Vector Algebra & Coordinate Geometry', department: 'Mathematics', year: '1st Year', credits: 3 },
  { courseCode: 'MATH201', title: 'Multivariable Calculus', department: 'Mathematics', year: '2nd Year', credits: 4 },
  { courseCode: 'MATH202', title: 'Ordinary Differential Equations', department: 'Mathematics', year: '2nd Year', credits: 4 },
  { courseCode: 'MATH203', title: 'Real Analysis & Sequences', department: 'Mathematics', year: '2nd Year', credits: 3 },
  { courseCode: 'MATH301', title: 'Discrete Mathematics & Graph Theory', department: 'Mathematics', year: '3rd Year', credits: 3 },
  { courseCode: 'MATH302', title: 'Numerical Analysis & Computation', department: 'Mathematics', year: '3rd Year', credits: 4 },
  { courseCode: 'MATH303', title: 'Complex Variables & Transforms', department: 'Mathematics', year: '3rd Year', credits: 3 },
  { courseCode: 'MATH401', title: 'Probability Theory & Applied Statistics', department: 'Mathematics', year: '4th Year', credits: 4 },
  { courseCode: 'MATH402', title: 'Abstract Algebra & Group Theory', department: 'Mathematics', year: '4th Year', credits: 4 },
  { courseCode: 'MATH403', title: 'Optimization Techniques & Operations Research', department: 'Mathematics', year: '4th Year', credits: 3 },

  // --- Electrical Engineering ---
  { courseCode: 'EE101', title: 'Basic Electrical Engineering', department: 'Electrical Engineering', year: '1st Year', credits: 3 },
  { courseCode: 'EE102', title: 'Engineering Circuit Analysis', department: 'Electrical Engineering', year: '1st Year', credits: 4 },
  { courseCode: 'EE201', title: 'Electromagnetic Field Theory', department: 'Electrical Engineering', year: '2nd Year', credits: 4 },
  { courseCode: 'EE202', title: 'Signals & Systems Analysis', department: 'Electrical Engineering', year: '2nd Year', credits: 4 },
  { courseCode: 'EE301', title: 'Linear Control Systems', department: 'Electrical Engineering', year: '3rd Year', credits: 3 },
  { courseCode: 'EE302', title: 'Analog & Digital Electronics', department: 'Electrical Engineering', year: '3rd Year', credits: 4 },
  { courseCode: 'EE401', title: 'Power Electronics & Drives', department: 'Electrical Engineering', year: '4th Year', credits: 4 },
  { courseCode: 'EE402', title: 'Microprocessors & Embedded Systems', department: 'Electrical Engineering', year: '4th Year', credits: 4 },

  // --- Mechanical Engineering ---
  { courseCode: 'ME101', title: 'Engineering Mechanics & Statics', department: 'Mechanical Engineering', year: '1st Year', credits: 3 },
  { courseCode: 'ME102', title: 'Engineering Graphics & 3D CAD', department: 'Mechanical Engineering', year: '1st Year', credits: 3 },
  { courseCode: 'ME201', title: 'Engineering Thermodynamics', department: 'Mechanical Engineering', year: '2nd Year', credits: 4 },
  { courseCode: 'ME202', title: 'Strength of Materials & Mechanics', department: 'Mechanical Engineering', year: '2nd Year', credits: 4 },
  { courseCode: 'ME301', title: 'Fluid Mechanics & Machinery', department: 'Mechanical Engineering', year: '3rd Year', credits: 4 },
  { courseCode: 'ME302', title: 'Manufacturing & Casting Technology', department: 'Mechanical Engineering', year: '3rd Year', credits: 3 },
  { courseCode: 'ME401', title: 'Heat & Mass Transfer', department: 'Mechanical Engineering', year: '4th Year', credits: 4 },
  { courseCode: 'ME402', title: 'Machine Element Design', department: 'Mechanical Engineering', year: '4th Year', credits: 4 },

  // --- Robotics ---
  { courseCode: 'ROB101', title: 'Introduction to Robotics & Automation', department: 'Robotics', year: '1st Year', credits: 3 },
  { courseCode: 'ROB102', title: 'Embedded C Programming for Controllers', department: 'Robotics', year: '1st Year', credits: 3 },
  { courseCode: 'ROB201', title: 'Sensors, Transducers & Actuators', department: 'Robotics', year: '2nd Year', credits: 4 },
  { courseCode: 'ROB202', title: 'Microcontroller Architecture & Interfaces', department: 'Robotics', year: '2nd Year', credits: 4 },
  { courseCode: 'ROB301', title: 'Robot Kinematics & Dynamics', department: 'Robotics', year: '3rd Year', credits: 4 },
  { courseCode: 'ROB302', title: 'Mechatronics Systems Design', department: 'Robotics', year: '3rd Year', credits: 3 },
  { courseCode: 'ROB401', title: 'Autonomous Navigation & Robot Operating System (ROS)', department: 'Robotics', year: '4th Year', credits: 4 },
  { courseCode: 'ROB402', title: 'Computer Vision for Robotics', department: 'Robotics', year: '4th Year', credits: 4 },
];

const SECTIONS_BY_DEPT = [
  { dept: 'Computer Science', sections: ['1CS', '2CS', '3CS', '4CS'] },
  { dept: 'Mathematics', sections: ['1MATH', '2MATH', '3MATH', '4MATH'] },
  { dept: 'ADSE', sections: ['1ADSE', '2ADSE', '3ADSE', '4ADSE'] },
  { dept: 'Electrical Engineering', sections: ['1EE', '2EE', '3EE', '4EE'] },
  { dept: 'Mechanical Engineering', sections: ['1ME', '2ME', '3ME', '4ME'] },
  { dept: 'Robotics', sections: ['1ROB', '2ROB', '3ROB', '4ROB'] },
];

const SECTIONS_LIST = SECTIONS_BY_DEPT.flatMap((group) => group.sections);

const getSectionFromCourseCode = (code: string) => {
  if (!code) return '3CS';
  const yearDigit = code.replace(/[^0-9]/g, '').charAt(0) || '3';
  const deptPrefix = code.replace(/[0-9]/g, '').toUpperCase();
  return `${yearDigit}${deptPrefix}`;
};

export function GradebookPage({ currentUser, theme = 'dark', addToast }: GradebookPageProps) {
  const isDark = theme === 'dark';
  const isFaculty = currentUser.role === 'faculty';
  const userDept = currentUser.assignedDepartment || 'Computer Science';
  const userSubjects = currentUser.assignedSubjects || [];

  const [userProfile, setUserProfile] = useState<any>(currentUser);

  // Filter initial available courses for Faculty vs Admin
  const getInitialCourses = () => {
    if (isFaculty) {
      if (userSubjects.length > 0) {
        const filtered = FALLBACK_COURSES.filter((c) => userSubjects.includes(c.courseCode));
        if (filtered.length > 0) return filtered;
      }
      const deptFiltered = FALLBACK_COURSES.filter((c) => c.department.toLowerCase().includes(userDept.toLowerCase()));
      if (deptFiltered.length > 0) return deptFiltered;
    }
    return FALLBACK_COURSES;
  };

  const initialList = getInitialCourses();
  const initialDefaultCode = initialList[0]?.courseCode || 'CS301';
  const initialDefaultSection = getSectionFromCourseCode(initialDefaultCode);

  const [selectedSection, setSelectedSection] = useState(initialDefaultSection);
  const [selectedCourse, setSelectedCourse] = useState(initialDefaultCode);
  const [availableCourses, setAvailableCourses] = useState<any[]>(initialList);
  const [gradeRows, setGradeRows] = useState<StudentGradeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [transcriptStudent, setTranscriptStudent] = useState<any>(null);
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Allowed sections: For Faculty, filter sections to ONLY match their assigned subjects. For Admin, show all.
  const activeRole = userProfile?.role || currentUser.role;
  const allowedSections = activeRole === 'faculty'
    ? Array.from(new Set(availableCourses.map((c) => getSectionFromCourseCode(c.courseCode))))
    : SECTIONS_LIST;

  // Filter available courses matching the selected section (dept + year e.g. 4MATH -> MATH401-403)
  const filterCoursesForSection = (sec: string, courses: any[]) => {
    if (!sec) return courses;
    const yearDigit = sec.match(/^\d+/)?.[0];
    const deptCode = sec.replace(/^\d+/, '').toUpperCase();

    const filtered = courses.filter((c) => {
      const codeUpper = (c.courseCode || '').toUpperCase();
      const matchesDept = !deptCode || codeUpper.startsWith(deptCode);

      let matchesYear = false;
      if (c.year) {
        const yDigit = c.year.match(/\d+/)?.[0];
        if (yDigit === yearDigit) matchesYear = true;
      }
      const codeMatch = c.courseCode.match(/[A-Z]+([1-4])\d{2}/);
      if (codeMatch && codeMatch[1] === yearDigit) matchesYear = true;

      return matchesDept && matchesYear;
    });

    return filtered.length > 0 ? filtered : courses;
  };

  const scopedCoursesForSection = filterCoursesForSection(selectedSection, availableCourses);

  // Compute live Class Performance Analytics for selected section gradebook
  const performanceStats = useMemo(() => {
    if (gradeRows.length === 0) return { avgScore: 0, passRate: 0, gradesCount: {} };
    let totalScore = 0;
    let passed = 0;
    const counts: Record<string, number> = { O: 0, 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, P: 0, F: 0 };

    gradeRows.forEach((r) => {
      totalScore += r.totalWeightedScore;
      if (r.letterGrade !== 'F') passed++;
      counts[r.letterGrade] = (counts[r.letterGrade] || 0) + 1;
    });

    return {
      avgScore: Math.round((totalScore / gradeRows.length) * 10) / 10,
      passRate: Math.round((passed / gradeRows.length) * 100),
      gradesCount: counts,
    };
  }, [gradeRows]);

  // Filter gradeRows by grade tier or Failures Only + Search Query
  const filteredGradeRows = useMemo(() => {
    let list = gradeRows;

    if (gradeFilter === 'FAILURES' || gradeFilter === 'F') {
      list = list.filter((r) => r.letterGrade === 'F');
    } else if (gradeFilter !== 'ALL') {
      list = list.filter((r) => r.letterGrade === gradeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.studentId.toLowerCase().includes(q)
      );
    }

    return list;
  }, [gradeRows, gradeFilter, searchQuery]);
  const exportGradebookCSV = () => {
    if (gradeRows.length === 0) return;

    const headers = ['Registration ID', 'Student Name', 'Department', 'Section', 'Assign 1 (20)', 'Midterm (50)', 'Assign 2 (20)', 'EndSem (100)', 'Total Weighted %', 'Letter Grade', 'Grade Point'];

    const rows = gradeRows.map((r) => [
      `"${r.studentId}"`,
      `"${r.name}"`,
      `"${r.department}"`,
      `"${r.section}"`,
      r.assignment1,
      r.midterm,
      r.assignment2,
      r.endSem,
      r.totalWeightedScore.toFixed(1),
      `"${r.letterGrade}"`,
      r.gradePoint.toFixed(1),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Gradebook_${selectedCourse}_${selectedSection}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fetch fresh profile from MongoDB and strictly scope available courses
  useEffect(() => {
    const fetchFreshProfileAndCourses = async () => {
      try {
        let freshUser = currentUser;
        const meRes = await fetch('http://localhost:5050/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        if (meRes.ok) {
          freshUser = await meRes.json();
          setUserProfile(freshUser);
        }

        const facultyRole = freshUser.role === 'faculty';
        const assignedSubs = Array.isArray(freshUser.assignedSubjects) ? freshUser.assignedSubjects : [];
        const dept = freshUser.assignedDepartment || userDept;

        const res = await fetch('http://localhost:5050/api/v1/courses', {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const catalog = await res.json();
        const allCoursesList = Array.isArray(catalog) && catalog.length > 0 ? catalog : FALLBACK_COURSES;

        let activeList = allCoursesList;
        if (facultyRole) {
          if (assignedSubs.length > 0) {
            activeList = allCoursesList.filter((c: any) => assignedSubs.includes(c.courseCode));
          } else {
            activeList = allCoursesList.filter((c: any) => c.department.toLowerCase().includes(dept.toLowerCase()));
          }
        }

        if (activeList.length === 0) activeList = allCoursesList;

        setAvailableCourses(activeList);

        if (activeList.length > 0) {
          const firstCode = activeList[0].courseCode;
          setSelectedCourse(firstCode);
          setSelectedSection(getSectionFromCourseCode(firstCode));
        }
      } catch (err) {
        // Fallback already populated
      }
    };

    fetchFreshProfileAndCourses();
  }, [currentUser]);

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

  // Calculate live evaluation math
  const computeLiveGrade = (a1: number | string, mid: number | string, a2: number | string, end: number | string) => {
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



  const getInputStyle = (val: number | string, maxVal: number) => {
    const num = Number(val);
    const isError = val !== '' && !isNaN(num) && (num > maxVal || num < 0);

    if (isError) {
      return isDark
        ? 'bg-red-500/15 border-red-500 text-red-400 font-bold outline-none ring-2 ring-red-500/40 animate-pulse'
        : 'bg-red-50 border-red-500 text-red-600 font-bold outline-none ring-2 ring-red-500/40 animate-pulse';
    }

    return isDark
      ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-500'
      : 'bg-[#fcfbf9] border-[#e5e2d9] text-[#191919] focus:border-[#cc5a37]';
  };

  const handleMarkChange = (studentId: string, field: 'assignment1' | 'midterm' | 'assignment2' | 'endSem', rawValue: string) => {
    if (rawValue === '') {
      setGradeRows((prev) =>
        prev.map((row) => {
          if (row.studentId !== studentId) return row;
          const updatedRow = { ...row, [field]: '' };
          const liveEval = computeLiveGrade(
            field === 'assignment1' ? 0 : updatedRow.assignment1,
            field === 'midterm' ? 0 : updatedRow.midterm,
            field === 'assignment2' ? 0 : updatedRow.assignment2,
            field === 'endSem' ? 0 : updatedRow.endSem
          );
          return { ...updatedRow, ...liveEval };
        })
      );
      return;
    }

    let parsedNum = Number(rawValue);

    if (isNaN(parsedNum)) return;

    setGradeRows((prev) =>
      prev.map((row) => {
        if (row.studentId !== studentId) return row;
        const updatedRow = { ...row, [field]: parsedNum };
        const liveEval = computeLiveGrade(
          field === 'assignment1' ? parsedNum : updatedRow.assignment1,
          field === 'midterm' ? parsedNum : updatedRow.midterm,
          field === 'assignment2' ? parsedNum : updatedRow.assignment2,
          field === 'endSem' ? parsedNum : updatedRow.endSem
        );
        return { ...updatedRow, ...liveEval };
      })
    );
  };

  const handleSaveAllGrades = async () => {
    if (gradeRows.length === 0) return;

    const hasValidationErrors = gradeRows.some(
      (r) =>
        Number(r.assignment1) > 20 ||
        Number(r.midterm) > 50 ||
        Number(r.assignment2) > 20 ||
        Number(r.endSem) > 100
    );

    if (hasValidationErrors) {
      setErrorMsg('Cannot save: One or more mark entries exceed maximum allowed limits (Assign 1 ≤ 20, Midterm ≤ 50, Assign 2 ≤ 20, EndSem ≤ 100).');
      return;
    }

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
      case 'O':
        return isDark
          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold'
          : 'bg-emerald-100/90 text-emerald-900 border-emerald-300 font-bold';
      case 'A+':
        return isDark
          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 font-bold'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
      case 'A':
        return isDark
          ? 'bg-zinc-800 text-zinc-200 border-zinc-700 font-bold'
          : 'bg-[#f0ede6] text-zinc-900 border-[#d8d4c8] font-bold';
      case 'B+':
        return isDark
          ? 'bg-zinc-800/80 text-zinc-300 border-zinc-700/80 font-medium'
          : 'bg-[#f5f2eb] text-zinc-800 border-[#e5e2d9] font-semibold';
      case 'B':
        return isDark
          ? 'bg-zinc-850 text-zinc-400 border-zinc-800 font-medium'
          : 'bg-[#f8f6f0] text-zinc-700 border-[#e5e2d9] font-medium';
      case 'C':
        return isDark
          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold'
          : 'bg-amber-100/80 text-amber-900 border-amber-300 font-bold';
      case 'P':
        return isDark
          ? 'bg-stone-500/15 text-stone-300 border-stone-500/30 font-bold'
          : 'bg-[#eae6dd] text-zinc-800 border-[#d0cbbe] font-bold';
      default:
        return isDark
          ? 'bg-red-500/15 text-red-400 border-red-500/30 font-bold'
          : 'bg-red-100/90 text-red-900 border-red-300 font-bold';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm ${
        isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-[#e5e2d9]'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl border ${
            isDark ? 'bg-zinc-800/60 border-zinc-700 text-zinc-200' : 'bg-[#f5f2eb] border-[#e5e2d9] text-[#cc5a37]'
          }`}>
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${
              isDark ? 'text-zinc-100' : 'text-[#191919]'
            }`}>
              Faculty Gradebook
              <Sparkles size={18} className={isDark ? 'text-zinc-400' : 'text-[#cc5a37]'} />
            </h1>
          </div>
        </div>

        {/* Section & Subject Filters + Liquid Metal Button */}
        <div className="flex items-center gap-3">
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
              isDark ? 'text-zinc-400' : 'text-zinc-650'
            }`}>Section</label>
            <Select
              value={selectedSection}
              onValueChange={(sec) => {
                setSelectedSection(sec);
                const matchingCourses = filterCoursesForSection(sec, availableCourses);
                if (matchingCourses.length > 0) {
                  setSelectedCourse(matchingCourses[0].courseCode);
                }
              }}
            >
              <SelectTrigger className={`w-32 rounded-2xl text-xs font-mono font-bold ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'
              }`}>
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent className={`max-h-80 overflow-y-auto ${isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}`}>
                {SECTIONS_BY_DEPT.map((group) => {
                  const validGroupSections = group.sections.filter((sec) => allowedSections.includes(sec));
                  if (validGroupSections.length === 0) return null;

                  return (
                    <div key={group.dept} className="py-1">
                      <div className={`px-3 py-1 text-[9.5px] font-bold uppercase tracking-wider ${
                        isDark ? 'text-zinc-500 bg-zinc-900/80' : 'text-zinc-650 bg-[#f5f2eb]'
                      }`}>
                        {group.dept}
                      </div>
                      {validGroupSections.map((sec) => (
                        <SelectItem key={sec} value={sec} className="text-xs font-mono font-bold cursor-pointer pl-4">
                          {sec}
                        </SelectItem>
                      ))}
                    </div>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
              isDark ? 'text-zinc-400' : 'text-zinc-650'
            }`}>Subject</label>
            <Select
              value={selectedCourse}
              onValueChange={(val) => {
                setSelectedCourse(val);
                setSelectedSection(getSectionFromCourseCode(val));
              }}
            >
              <SelectTrigger className={`w-56 rounded-2xl text-xs font-bold ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'
              }`}>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-white border-[#e5e2d9] text-[#191919]'}>
                {scopedCoursesForSection.map((c) => (
                  <SelectItem key={c.courseCode} value={c.courseCode} className="text-xs font-medium cursor-pointer">
                    <span className={`font-mono font-bold mr-1.5 ${isDark ? 'text-zinc-300' : 'text-[#cc5a37]'}`}>{c.courseCode}</span>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex items-center gap-2">
            <button
              onClick={exportGradebookCSV}
              disabled={gradeRows.length === 0}
              className={`px-3 py-2 rounded-full text-[11.5px] font-bold flex items-center gap-1.5 cursor-pointer transition-all border ${
                isDark
                  ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-200'
                  : 'bg-white hover:bg-zinc-100 border-[#e5e2d9] text-zinc-800 shadow-sm'
              }`}
              title="Export Section Gradebook to CSV"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>

            <LiquidMetalButton
              label={saving ? "Saving..." : "Save & Publish Marks"}
              onClick={handleSaveAllGrades}
              width={155}
              fontSize={11.5}
            />
          </div>
        </div>
      </div>

            {/* Class Performance Analytics & Search Bar */}
      {gradeRows.length > 0 && (
        <div className="space-y-3">
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            isDark ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-[#fcfbf9] border-[#e5e2d9]'
          }`}>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-zinc-800/60 border-zinc-700 text-emerald-400' : 'bg-white border-[#e5e2d9] text-[#cc5a37]'
                }`}>
                  <TrendingUp size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Class Average</span>
                  <span className="text-base font-mono font-black">{performanceStats.avgScore}%</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-zinc-800/60 border-zinc-700 text-teal-400' : 'bg-white border-[#e5e2d9] text-[#cc5a37]'
                }`}>
                  <Award size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Pass Rate</span>
                  <span className="text-base font-mono font-black">{performanceStats.passRate}%</span>
                </div>
              </div>
            </div>

            {/* Search Student by Name or Reg ID */}
            <div className="relative w-full md:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or Reg ID..."
                className={`w-full pl-9 pr-8 py-2 rounded-2xl text-xs font-medium border outline-none transition-all ${
                  isDark
                    ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-zinc-700'
                    : 'bg-white border-[#e5e2d9] text-[#191919] placeholder-zinc-400 focus:border-[#cc5a37]'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Clickable Grade Badges Bar */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <button
              onClick={() => setGradeFilter('ALL')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                gradeFilter === 'ALL'
                  ? isDark ? 'bg-zinc-200 text-zinc-950 border-white' : 'bg-[#191919] text-white border-[#191919]'
                  : isDark ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 'bg-white text-zinc-600 border-[#e5e2d9]'
              }`}
            >
              All ({gradeRows.length})
            </button>

            {Object.entries(performanceStats.gradesCount).map(([grade, count]) => (
              count > 0 && (
                <button
                  key={grade}
                  onClick={() => setGradeFilter(gradeFilter === grade ? 'ALL' : grade)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold border transition-all cursor-pointer ${getGradeBadgeColor(grade)} ${
                    gradeFilter === grade ? 'ring-2 ring-emerald-400 scale-105 shadow-md' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  {grade}: {count}
                </button>
              )
            ))}
          </div>
        </div>
      )}

      {/* Backlog Alert Banner */}
      {performanceStats.gradesCount['F'] > 0 && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle size={16} className="shrink-0 animate-pulse" />
            <span>
              <strong>{performanceStats.gradesCount['F']} Student(s)</strong> in {selectedSection} ({selectedCourse}) failed evaluation and require re-examination / backlog processing.
            </span>
          </div>
          <button
            onClick={() => setGradeFilter('FAILURES')}
            className="px-3 py-1 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-bold hover:bg-red-500/30 text-[11px] cursor-pointer transition-all"
          >
            View {performanceStats.gradesCount['F']} Failures
          </button>
        </div>
      )}

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
              ) : filteredGradeRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-12 text-zinc-500 font-mono">
                    {gradeFilter !== 'ALL'
                      ? `No student records found matching grade filter "${gradeFilter}".`
                      : `No enrolled students found in section ${selectedSection}.`}
                  </td>
                </tr>
              ) : (
                filteredGradeRows.map((r) => (
                  <tr key={r.studentId} className={isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-[#f8f6f0]'}>
                    <td className={`p-4.5 font-mono font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{r.studentId}</td>
                    <td className={`p-4.5 font-bold ${isDark ? 'text-zinc-100' : 'text-[#191919]'}`}>
                      <button
                        onClick={() => setTranscriptStudent({ studentId: r.studentId, name: r.name, department: r.department, section: r.section })}
                        className="hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                      >
                        <span>{r.name}</span>
                        <GraduationCap size={13} className={isDark ? 'text-emerald-400' : 'text-[#cc5a37]'} />
                      </button>
                    </td>

                    {/* Assign 1 */}
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={r.assignment1}
                        onChange={(e) => handleMarkChange(r.studentId, 'assignment1', e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className={`w-16 text-center font-mono font-bold rounded-xl py-1.5 px-2 border focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all ${getInputStyle(
                          r.assignment1,
                          20
                        )}`}
                      />
                    </td>

                    {/* Midterm */}
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={r.midterm}
                        onChange={(e) => handleMarkChange(r.studentId, 'midterm', e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className={`w-16 text-center font-mono font-bold rounded-xl py-1.5 px-2 border focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all ${getInputStyle(
                          r.midterm,
                          50
                        )}`}
                      />
                    </td>

                    {/* Assign 2 */}
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={r.assignment2}
                        onChange={(e) => handleMarkChange(r.studentId, 'assignment2', e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className={`w-16 text-center font-mono font-bold rounded-xl py-1.5 px-2 border focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all ${getInputStyle(
                          r.assignment2,
                          20
                        )}`}
                      />
                    </td>

                    {/* EndSem */}
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={r.endSem}
                        onChange={(e) => handleMarkChange(r.studentId, 'endSem', e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className={`w-20 text-center font-mono font-bold rounded-xl py-1.5 px-2 border focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all ${getInputStyle(
                          r.endSem,
                          100
                        )}`}
                      />
                    </td>

                    {/* Weighted % */}
                    <td className={`p-4.5 text-center font-mono font-bold ${isDark ? 'text-emerald-400' : 'text-[#cc5a37]'}`}>
                      {r.totalWeightedScore.toFixed(1)}%
                    </td>

                    {/* Letter Grade Badge */}
                    <td className="p-4.5 text-center">
                      <span className={`inline-block font-mono font-bold px-2.5 py-0.5 rounded-lg border text-xs ${getGradeBadgeColor(r.letterGrade)}`}>
                        {r.letterGrade}
                      </span>
                    </td>

                    {/* Grade Point */}
                    <td className={`p-4.5 text-center font-mono font-bold ${isDark ? 'text-zinc-200' : 'text-[#191919]'}`}>
                      {r.gradePoint.toFixed(1)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Transcript Modal */}
      {transcriptStudent && (
        <TranscriptModal
          student={transcriptStudent}
          onClose={() => setTranscriptStudent(null)}
          theme={theme}
        />
      )}
    </div>
  );
}
