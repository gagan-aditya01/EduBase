const Grade = require('../models/gradeModel');
const Student = require('../models/studentModel');
const Course = require('../models/courseModel');

// Helper to compute Indian 20-50-20-100 Weighted Percentage & 10-Point CGPA
const calculateIndianGrade = (a1 = 0, mid = 0, a2 = 0, end = 0) => {
  const assign1Marks = Math.min(20, Math.max(0, Number(a1) || 0));
  const midtermMarks = Math.min(50, Math.max(0, Number(mid) || 0));
  const assign2Marks = Math.min(20, Math.max(0, Number(a2) || 0));
  const endSemMarks = Math.min(100, Math.max(0, Number(end) || 0));

  const weightedPerc = 
    (assign1Marks / 20 * 10) + 
    (midtermMarks / 50 * 20) + 
    (assign2Marks / 20 * 10) + 
    (endSemMarks / 100 * 60);

  const roundedPerc = Math.round(weightedPerc * 100) / 100;

  let letterGrade = 'F';
  let gradePoint = 0.0;

  if (roundedPerc >= 90) {
    letterGrade = 'O';
    gradePoint = 10.0;
  } else if (roundedPerc >= 80) {
    letterGrade = 'A+';
    gradePoint = 9.0;
  } else if (roundedPerc >= 70) {
    letterGrade = 'A';
    gradePoint = 8.0;
  } else if (roundedPerc >= 60) {
    letterGrade = 'B+';
    gradePoint = 7.0;
  } else if (roundedPerc >= 55) {
    letterGrade = 'B';
    gradePoint = 6.0;
  } else if (roundedPerc >= 50) {
    letterGrade = 'C';
    gradePoint = 5.0;
  } else if (roundedPerc >= 40) {
    letterGrade = 'P';
    gradePoint = 4.0;
  } else {
    letterGrade = 'F';
    gradePoint = 0.0;
  }

  return {
    assignment1: assign1Marks,
    midterm: midtermMarks,
    assignment2: assign2Marks,
    endSem: endSemMarks,
    totalWeightedScore: roundedPerc,
    letterGrade,
    gradePoint,
  };
};

// @desc    Get section gradebook records for a specific course & section
// @route   GET /api/v1/grades
// @access  Private (Faculty & Admin)
const getSectionGrades = async (req, res) => {
  try {
    const { section, courseCode, semester = 'Spring 2026' } = req.query;

    if (!section || !courseCode) {
      return res.status(400).json({ error: 'section and courseCode query parameters are required' });
    }

    const isFaculty = req.user && req.user.role === 'faculty';
    const assignedDept = isFaculty ? (req.user.assignedDepartment || '').trim() : '';

    // Find active students in section
    const studentFilter = { section: new RegExp(`^${section.trim()}$`, 'i'), isDeleted: false };
    if (isFaculty && assignedDept) {
      studentFilter.department = new RegExp(`^${assignedDept}$`, 'i');
    }

    const students = await Student.find(studentFilter).sort({ studentId: 1 });
    const studentIds = students.map((s) => s.studentId);

    // Fetch existing grade evaluations for these students
    const existingGrades = await Grade.find({
      studentId: { $in: studentIds },
      courseCode: courseCode.trim().toUpperCase(),
      semester: semester.trim(),
    });

    const gradeMap = new Map();
    existingGrades.forEach((g) => gradeMap.set(g.studentId, g));

    // Combine student record with evaluation data
    const gradebookData = students.map((st) => {
      const g = gradeMap.get(st.studentId);
      return {
        studentId: st.studentId,
        name: st.name,
        section: st.section,
        department: st.department,
        courseCode: courseCode.trim().toUpperCase(),
        assignment1: g ? g.assignment1 : 0,
        midterm: g ? g.midterm : 0,
        assignment2: g ? g.assignment2 : 0,
        endSem: g ? g.endSem : 0,
        totalWeightedScore: g ? g.totalWeightedScore : 0,
        letterGrade: g ? g.letterGrade : 'F',
        gradePoint: g ? g.gradePoint : 0,
        evaluatedBy: g ? g.evaluatedBy : null,
        updatedAt: g ? g.updatedAt : null,
      };
    });

    res.json(gradebookData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Bulk save or update grade evaluations for a section & course
// @route   POST /api/v1/grades/bulk-save
// @access  Private (Faculty & Admin)
const saveBulkGrades = async (req, res) => {
  try {
    const { courseCode, section, semester = 'Spring 2026', grades } = req.body;

    if (!courseCode || !Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ error: 'courseCode and a non-empty grades array are required' });
    }

    const courseDoc = await Course.findOne({ courseCode: courseCode.trim().toUpperCase() });
    const evaluatedBy = req.user ? req.user.username : 'Faculty';

    let savedCount = 0;

    for (const g of grades) {
      if (!g.studentId) continue;

      const evalResult = calculateIndianGrade(g.assignment1, g.midterm, g.assignment2, g.endSem);
      const studentDoc = await Student.findOne({ studentId: g.studentId });

      await Grade.findOneAndUpdate(
        {
          studentId: g.studentId,
          courseCode: courseCode.trim().toUpperCase(),
          semester: semester.trim(),
        },
        {
          studentId: g.studentId,
          studentRef: studentDoc ? studentDoc._id : null,
          courseCode: courseCode.trim().toUpperCase(),
          courseRef: courseDoc ? courseDoc._id : null,
          semester: semester.trim(),
          ...evalResult,
          evaluatedBy,
        },
        { upsert: true, new: true }
      );

      savedCount++;
    }

    res.json({ message: `Successfully saved ${savedCount} grade evaluations for ${courseCode}.`, savedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get cumulative GPA and grade transcript for a student
// @route   GET /api/v1/grades/student/:studentId
// @access  Private
const getStudentTranscript = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({ studentId, isDeleted: false });
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const grades = await Grade.find({ studentId }).populate('courseRef', 'title credits year department');

    let totalCredits = 0;
    let totalGradePointsWeighted = 0;

    const courseGrades = grades.map((g) => {
      const credits = g.courseRef ? g.courseRef.credits : 3;
      totalCredits += credits;
      totalGradePointsWeighted += g.gradePoint * credits;

      return {
        courseCode: g.courseCode,
        courseTitle: g.courseRef ? g.courseRef.title : g.courseCode,
        year: g.courseRef ? g.courseRef.year : 'N/A',
        credits,
        assignment1: g.assignment1,
        midterm: g.midterm,
        assignment2: g.assignment2,
        endSem: g.endSem,
        totalWeightedScore: g.totalWeightedScore,
        letterGrade: g.letterGrade,
        gradePoint: g.gradePoint,
        semester: g.semester,
      };
    });

    const cgpa = totalCredits > 0 ? Math.round((totalGradePointsWeighted / totalCredits) * 100) / 100 : 0;

    res.json({
      student: {
        studentId: student.studentId,
        name: student.name,
        age: student.age,
        department: student.department,
        year: student.year || '3rd Year',
        section: student.section || '3CS',
      },
      cgpa,
      totalCredits,
      evaluatedCoursesCount: courseGrades.length,
      grades: courseGrades,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  calculateIndianGrade,
  getSectionGrades,
  saveBulkGrades,
  getStudentTranscript,
};
