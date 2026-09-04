const Attendance = require('../models/attendanceModel');
const Student = require('../models/studentModel');
const AuditLog = require('../models/auditLogModel');

const ALLOWED_SLOTS = {
  '10-11': 1,
  '11-12': 1,
  '10-12': 2,
  '2-3': 1,
  '3-4': 1,
  '2-4': 2,
};

// @desc    Mark or update attendance for a class session
// @route   POST /api/v1/attendance
// @access  Private/Faculty & Admin
const markAttendance = async (req, res) => {
  try {
    const { date, department, slot, records } = req.body;

    if (!date || !department || !slot || !records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'date, department, slot, and records array are required' });
    }

    // 1. Validate continuous slot rules
    if (!ALLOWED_SLOTS[slot]) {
      return res.status(400).json({
        error: 'Invalid time slot or non-continuous block. Allowed slots: 10-11 (1h), 11-12 (1h), 10-12 (2h block), 2-3 (1h), 3-4 (1h), 2-4 (2h block). Cross-session blocks like 10-3 are prohibited.',
      });
    }

    // 2. Admin & Guest Read-Only Guard & Faculty Department Scoping
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({
        error: 'Access Denied: Administrators have read-only inspection access to student attendance and cannot mark or modify attendance records.',
      });
    }

    if (req.user && req.user.role === 'faculty') {
      const assignedDept = (req.user.assignedDepartment || '').trim().toLowerCase();
      const targetDept = department.trim().toLowerCase();

      if (!assignedDept || assignedDept !== targetDept) {
        return res.status(403).json({
          error: `Access Denied: As a faculty member in ${req.user.assignedDepartment || 'unassigned'}, you can only mark attendance for your assigned department.`,
        });
      }
    }

    const slotHours = ALLOWED_SLOTS[slot];
    const recordedBy = req.user ? req.user.username : 'Admin';

    // Normalize date to YYYY-MM-DD format & check for future dates
    const formattedDate = new Date(date).toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    if (formattedDate > todayStr) {
      return res.status(400).json({ error: 'Cannot mark or submit attendance for future dates.' });
    }

    // Upsert attendance document
    const attendanceDoc = await Attendance.findOneAndUpdate(
      {
        date: formattedDate,
        department: { $regex: new RegExp(`^${department.trim()}$`, 'i') },
        slot,
      },
      {
        date: formattedDate,
        department: department.trim(),
        slot,
        slotHours,
        recordedBy,
        records,
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    // Record audit log entry
    await AuditLog.create({
      action: 'MARK_ATTENDANCE',
      targetId: `${formattedDate}_${slot}`,
      performedBy: recordedBy,
      details: `Marked ${slotHours}h attendance (${slot}) for ${department} (${records.length} students)`,
    }).catch(() => {});

    res.status(201).json(attendanceDoc);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Attendance record already exists for this date, department, and slot' });
    }
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get department students for attendance marking roster
// @route   GET /api/v1/attendance/students/:department
// @access  Private/Faculty & Admin
const getDepartmentStudents = async (req, res) => {
  try {
    const { department } = req.params;

    // Faculty Scoping Check
    if (req.user && req.user.role === 'faculty') {
      const assignedDept = (req.user.assignedDepartment || '').trim().toLowerCase();
      const targetDept = department.trim().toLowerCase();

      if (!assignedDept || assignedDept !== targetDept) {
        return res.status(403).json({
          error: `Access Denied: You are only permitted to view roster for ${req.user.assignedDepartment}.`,
        });
      }
    }

    const students = await Student.find({
      department: { $regex: new RegExp(`^${department.trim()}$`, 'i') },
    }).sort({ studentId: 1 });

    // Fetch all attendance documents to calculate overall percentage for each student
    const attendanceDocs = await Attendance.find({
      department: { $regex: new RegExp(`^${department.trim()}$`, 'i') },
    });

    const studentStats = {};
    attendanceDocs.forEach((doc) => {
      const hours = doc.slotHours || 1;
      (doc.records || []).forEach((r) => {
        const sid = r.studentId.trim().toLowerCase();
        if (!studentStats[sid]) {
          studentStats[sid] = { totalHours: 0, presentHours: 0 };
        }
        studentStats[sid].totalHours += hours;
        if (r.status === 'Present' || r.status === 'Late') {
          studentStats[sid].presentHours += hours;
        }
      });
    });

    const studentsWithAttendance = students.map((s) => {
      const sObj = s.toObject();
      const stats = studentStats[s.studentId.trim().toLowerCase()];
      if (stats && stats.totalHours > 0) {
        sObj.overallPercentage = Math.round((stats.presentHours / stats.totalHours) * 100);
        sObj.totalConductedHours = stats.totalHours;
        sObj.totalPresentHours = stats.presentHours;
      } else {
        sObj.overallPercentage = 100;
        sObj.totalConductedHours = 0;
        sObj.totalPresentHours = 0;
      }
      sObj.isExamEligible = sObj.overallPercentage >= 75;
      return sObj;
    });

    res.json(studentsWithAttendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get student attendance summary & daily log timeline
// @route   GET /api/v1/attendance/my-summary
// @access  Private (Student or Faculty/Admin specifying studentId)
const getStudentSummary = async (req, res) => {
  try {
    let studentId = req.query.studentId;

    // If no studentId in query, attempt to find student matching logged in user's username
    if (!studentId && req.user) {
      const matchedStudent = await Student.findOne({
        $or: [
          { studentId: { $regex: new RegExp(`^${req.user.username.trim()}$`, 'i') } },
          { name: { $regex: new RegExp(`^${req.user.username.trim()}$`, 'i') } },
        ],
      });
      if (matchedStudent) {
        studentId = matchedStudent.studentId;
      } else {
        studentId = req.user.username;
      }
    }

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // Query all attendance documents containing this studentId
    const attendanceDocs = await Attendance.find({
      'records.studentId': { $regex: new RegExp(`^${studentId.trim()}$`, 'i') },
    }).sort({ date: -1 });

    let totalConductedHours = 0;
    let totalPresentHours = 0;
    let totalAbsentHours = 0;
    let totalLateHours = 0;
    const dailyLog = [];

    attendanceDocs.forEach((doc) => {
      const record = doc.records.find(
        (r) => r.studentId.trim().toLowerCase() === studentId.trim().toLowerCase()
      );
      if (record) {
        const hours = doc.slotHours || 1;
        totalConductedHours += hours;

        if (record.status === 'Present') {
          totalPresentHours += hours;
        } else if (record.status === 'Absent') {
          totalAbsentHours += hours;
        } else if (record.status === 'Late') {
          totalLateHours += hours;
          // Count late as present for percentage
          totalPresentHours += hours;
        }

        dailyLog.push({
          id: doc._id,
          date: doc.date,
          slot: doc.slot,
          slotHours: hours,
          department: doc.department,
          recordedBy: doc.recordedBy,
          status: record.status,
        });
      }
    });

    const overallPercentage = totalConductedHours > 0
      ? Math.round((totalPresentHours / totalConductedHours) * 100)
      : 100;

    res.json({
      studentId,
      overallPercentage,
      isExamEligible: overallPercentage >= 75,
      totalConductedHours,
      totalPresentHours,
      totalAbsentHours,
      totalLateHours,
      dailyLog,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get attendance records by date / department / slot
// @route   GET /api/v1/attendance/records
// @access  Private/Faculty & Admin
const getAttendanceRecords = async (req, res) => {
  try {
    const { date, department, slot } = req.query;
    const filter = {};

    if (date) filter.date = new Date(date).toISOString().split('T')[0];
    if (department) filter.department = { $regex: new RegExp(`^${department.trim()}$`, 'i') };
    if (slot) filter.slot = slot;

    // Faculty Scoping Check
    if (req.user && req.user.role === 'faculty') {
      filter.department = { $regex: new RegExp(`^${req.user.assignedDepartment.trim()}$`, 'i') };
    }

    const records = await Attendance.find(filter).sort({ date: -1, slot: 1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Seed realistic attendance data for all students
// @route   POST /api/v1/attendance/seed
// @access  Private/Admin
const seedAttendance = async (req, res) => {
  try {
    const students = await Student.find({ isDeleted: false });
    if (!students || students.length === 0) {
      return res.status(400).json({ error: 'No active students found to seed attendance.' });
    }

    const dates = [
      '2026-08-25', '2026-08-26', '2026-08-27', '2026-08-28', '2026-08-31',
      '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04'
    ];
    const slots = [
      { slot: '10-11', slotHours: 1 },
      { slot: '11-12', slotHours: 1 },
      { slot: '2-3', slotHours: 1 },
      { slot: '3-4', slotHours: 1 }
    ];

    // Group students by department
    const depts = [...new Set(students.map(s => s.department))];

    let createdCount = 0;

    for (const dept of depts) {
      const deptStudents = students.filter(s => s.department === dept);

      for (const dateStr of dates) {
        for (const slotObj of slots) {
          const recordsPayload = deptStudents.map((s, idx) => {
            // Seed a realistic ~82% attendance rate with variance per student ID hash
            const charCodeSum = s.studentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const dateNum = parseInt(dateStr.replace(/-/g, ''), 10);
            const slotHash = slotObj.slot === '10-11' ? 1 : slotObj.slot === '11-12' ? 2 : slotObj.slot === '2-3' ? 3 : 4;
            const pseudoRandom = (charCodeSum + dateNum + slotHash + idx * 7) % 100;
            
            // 85% chance present, 15% absent
            const status = pseudoRandom < 85 ? 'Present' : 'Absent';
            return {
              studentId: s.studentId,
              studentName: s.name,
              status
            };
          });

          await Attendance.findOneAndUpdate(
            { date: dateStr, department: dept, slot: slotObj.slot },
            {
              date: dateStr,
              department: dept,
              slot: slotObj.slot,
              slotHours: slotObj.slotHours,
              recordedBy: 'system.seeder@edubase.edu',
              records: recordsPayload
            },
            { upsert: true, new: true }
          );
          createdCount++;
        }
      }
    }

    res.json({ message: `Successfully seeded realistic attendance records across ${students.length} students across ${createdCount} sessions.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  markAttendance,
  getDepartmentStudents,
  getStudentSummary,
  getAttendanceRecords,
  seedAttendance,
};
