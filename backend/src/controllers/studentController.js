const Student = require('../models/studentModel');
const Department = require('../models/departmentModel');
const AuditLog = require('../models/auditLogModel');
const memoryCache = require('../utils/cacheEngine');
const backgroundQueue = require('../utils/backgroundQueue');

// @desc    Create a new student
// @route   POST /api/v1/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  try {
    const { studentId, name, age, department } = req.body;

    if (!studentId || !name || !age || !department) {
      return res.status(400).json({ error: 'All fields (studentId, name, age, department) are required' });
    }

    // Faculty Department Isolation Guard
    if (req.user && req.user.role === 'faculty') {
      if (!req.user.assignedDepartment) {
        return res.status(403).json({ error: 'Access denied: Faculty account has no assigned department' });
      }
      if (department.trim().toLowerCase() !== req.user.assignedDepartment.trim().toLowerCase()) {
        return res.status(403).json({ error: `Access denied: Faculty members can only create records for their assigned department (${req.user.assignedDepartment})` });
      }
    }

    const studentExists = await Student.findOne({ studentId });
    if (studentExists) {
      return res.status(400).json({ error: 'A student with this ID already exists in the database' });
    }

    let deptDoc = await Department.findOne({ name: { $regex: new RegExp(`^${department.trim()}$`, 'i') } });
    if (!deptDoc) {
      const code = department.trim().substring(0, 4).toUpperCase();
      deptDoc = await Department.create({ name: department.trim(), code });
    }

    const createdBy = req.user ? req.user.username : 'Admin';

    const student = await Student.create({
      studentId,
      name,
      age,
      department,
      departmentRef: deptDoc._id,
      createdBy,
    });

    memoryCache.clearPattern('students_');

    backgroundQueue.enqueue('CREATE_STUDENT_AUDIT', async () => {
      await AuditLog.create({
        action: 'CREATE_STUDENT',
        targetId: studentId,
        performedBy: createdBy,
        details: `Created student ${name} (${department})`,
      });
    });

    const populatedStudent = await Student.findById(student._id).populate('departmentRef', 'name code');
    res.status(201).json(populatedStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get active non-deleted students (v1 contract)
// @route   GET /api/v1/students
// @access  Private
const getStudents = async (req, res) => {
  try {
    const { studentId, name, age, minAge, maxAge, department, createdBy, search, page, limit } = req.query;

    const cacheKey = `students_${JSON.stringify(req.query)}`;
    const cachedData = memoryCache.get(cacheKey);
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    // Filter out soft-deleted items
    const filter = { isDeleted: { $ne: true } };

    // Faculty Department Scoping Guard
    if (req.user && req.user.role === 'faculty') {
      if (req.user.assignedDepartment) {
        filter.department = new RegExp(`^${req.user.assignedDepartment.trim()}$`, 'i');
      }
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { studentId: searchRegex },
        { department: searchRegex },
      ];
    }

    if (studentId) filter.studentId = { $regex: new RegExp(studentId.trim(), 'i') };
    if (name) filter.name = { $regex: new RegExp(name.trim(), 'i') };
    if (department) filter.department = { $regex: new RegExp(department.trim(), 'i') };
    if (createdBy) filter.createdBy = { $regex: new RegExp(createdBy.trim(), 'i') };

    if (age) {
      filter.age = Number(age);
    } else {
      if (minAge || maxAge) {
        filter.age = {};
        if (minAge) filter.age.$gte = Number(minAge);
        if (maxAge) filter.age.$lte = Number(maxAge);
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = limit ? parseInt(limit, 10) : 1000;
    const skip = (pageNum - 1) * limitNum;

    const totalStudents = await Student.countDocuments(filter);
    
    const students = await Student.find(filter)
      .populate('departmentRef', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const responseData = (page || limit)
      ? {
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalStudents / limitNum),
          totalStudents,
          data: students,
        }
      : students;

    memoryCache.set(cacheKey, responseData, 30);
    res.setHeader('X-Cache', 'MISS');
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get active non-deleted students (v2 envelope contract with HATEOAS links)
// @route   GET /api/v2/students
// @access  Private
const getStudentsV2 = async (req, res) => {
  try {
    const filter = { isDeleted: { $ne: true } };
    const pageNum = parseInt(req.query.page, 10) || 1;
    const limitNum = parseInt(req.query.limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Student.countDocuments(filter);
    const data = await Student.find(filter).skip(skip).limit(limitNum).sort({ createdAt: -1 });

    res.json({
      apiVersion: '2.0',
      success: true,
      metadata: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalRecords: total,
      },
      data,
      _links: {
        self: `/api/v2/students?page=${pageNum}&limit=${limitNum}`,
        next: pageNum * limitNum < total ? `/api/v2/students?page=${pageNum + 1}&limit=${limitNum}` : null,
        prev: pageNum > 1 ? `/api/v2/students?page=${pageNum - 1}&limit=${limitNum}` : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get a single student by studentId
// @route   GET /api/v1/students/:studentId
// @access  Private
const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId, isDeleted: { $ne: true } }).populate('departmentRef', 'name code');

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update a student
// @route   PUT /api/v1/students/:studentId
// @access  Private/Admin
const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name, age, department } = req.body;

    const student = await Student.findOne({ studentId, isDeleted: { $ne: true } });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Faculty Department Isolation Guard
    if (req.user && req.user.role === 'faculty') {
      if (!req.user.assignedDepartment || student.department.trim().toLowerCase() !== req.user.assignedDepartment.trim().toLowerCase()) {
        return res.status(403).json({ error: `Access denied: Faculty members can only update records within their assigned department (${req.user.assignedDepartment || 'None'})` });
      }
      if (department && department.trim().toLowerCase() !== req.user.assignedDepartment.trim().toLowerCase()) {
        return res.status(403).json({ error: `Access denied: Cannot reassign student to another department outside your assigned department (${req.user.assignedDepartment})` });
      }
    }

    if (name) student.name = name;
    if (age) student.age = age;
    if (department) {
      student.department = department;
      let deptDoc = await Department.findOne({ name: { $regex: new RegExp(`^${department.trim()}$`, 'i') } });
      if (!deptDoc) {
        const code = department.trim().substring(0, 4).toUpperCase();
        deptDoc = await Department.create({ name: department.trim(), code });
      }
      student.departmentRef = deptDoc._id;
    }

    await student.save();
    memoryCache.clearPattern('students_');

    backgroundQueue.enqueue('UPDATE_STUDENT_AUDIT', async () => {
      await AuditLog.create({
        action: 'UPDATE_STUDENT',
        targetId: studentId,
        performedBy: req.user ? req.user.username : 'Admin',
        details: `Updated student ${student.name} (${studentId})`,
      });
    });

    const updatedStudent = await Student.findById(student._id).populate('departmentRef', 'name code');
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Concept 2: Soft Delete a student (Sets isDeleted=true, deletedAt=Date)
// @route   DELETE /api/v1/students/:studentId
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId, isDeleted: { $ne: true } });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Soft delete
    student.isDeleted = true;
    student.deletedAt = new Date();
    await student.save();

    memoryCache.clearPattern('students_');

    backgroundQueue.enqueue('SOFT_DELETE_STUDENT_AUDIT', async () => {
      await AuditLog.create({
        action: 'DELETE_STUDENT',
        targetId: studentId,
        performedBy: req.user ? req.user.username : 'Admin',
        details: `Soft-deleted student ${student.name} (${studentId})`,
      });
    });

    res.json({ message: 'Student moved to trash console successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Concept 2: Get all soft-deleted students (Admin Trash Bin Console)
// @route   GET /api/v1/students/trash/list
// @access  Private/Admin
const getTrashStudents = async (req, res) => {
  try {
    const deletedStudents = await Student.find({ isDeleted: true }).sort({ deletedAt: -1 });
    res.json(deletedStudents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Concept 2: Restore soft-deleted student
// @route   PUT /api/v1/students/trash/:studentId/restore
// @access  Private/Admin
const restoreStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId, isDeleted: true });

    if (!student) {
      return res.status(404).json({ error: 'Soft-deleted student record not found' });
    }

    student.isDeleted = false;
    student.deletedAt = null;
    await student.save();

    memoryCache.clearPattern('students_');

    backgroundQueue.enqueue('RESTORE_STUDENT_AUDIT', async () => {
      await AuditLog.create({
        action: 'RESTORE_STUDENT',
        targetId: studentId,
        performedBy: req.user ? req.user.username : 'Admin',
        details: `Restored student ${student.name} (${studentId})`,
      });
    });

    res.json({ message: 'Student record restored successfully', student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Concept 2: Permanent Hard Purge student
// @route   DELETE /api/v1/students/trash/:studentId/purge
// @access  Private/Admin
const purgeStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    await student.deleteOne();
    memoryCache.clearPattern('students_');

    backgroundQueue.enqueue('PURGE_STUDENT_AUDIT', async () => {
      await AuditLog.create({
        action: 'PURGE_STUDENT',
        targetId: studentId,
        performedBy: req.user ? req.user.username : 'Admin',
        details: `Permanently purged student ${student.name} (${studentId})`,
      });
    });

    res.json({ message: 'Student permanently purged from database' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Query Execution Performance Benchmark (explain())
// @route   GET /api/v1/students/performance/explain
// @access  Private/Admin
const explainStudentQuery = async (req, res) => {
  try {
    const explanation = await Student.find({ department: 'Computer Science' })
      .sort({ age: -1 })
      .explain('executionStats');

    res.json({
      executionStats: explanation.executionStats,
      queryPlanner: explanation.queryPlanner,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Minor Concept 2: MongoDB Aggregation Pipeline ($group, $facet, $project)
// @route   GET /api/v1/students/analytics/stats
// @access  Private
const getAnalyticsStats = async (req, res) => {
  try {
    const matchStage = { isDeleted: { $ne: true } };
    if (req.user && req.user.role === 'faculty' && req.user.assignedDepartment) {
      matchStage.department = new RegExp(`^${req.user.assignedDepartment.trim()}$`, 'i');
    }

    const stats = await Student.aggregate([
      { $match: matchStage },
      {
        $facet: {
          departmentBreakdown: [
            { $group: { _id: '$department', count: { $sum: 1 }, avgAge: { $avg: '$age' } } },
            { $sort: { count: -1 } },
          ],
          ageDemographics: [
            {
              $bucket: {
                groupBy: '$age',
                boundaries: [16, 21, 26, 31, 41, 100],
                default: 'Other',
                output: { count: { $sum: 1 } },
              },
            },
          ],
          overall: [
            {
              $group: {
                _id: null,
                totalStudents: { $sum: 1 },
                avgAge: { $avg: '$age' },
                minAge: { $min: '$age' },
                maxAge: { $max: '$age' },
              },
            },
          ],
        },
      },
    ]);

    const User = require('../models/userModel');
    const totalTrash = await Student.countDocuments({ isDeleted: true });
    const userRoleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const facultyDepartmentBreakdown = await User.aggregate([
      { $match: { role: 'faculty' } },
      { $group: { _id: '$assignedDepartment', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Student Enrolment Growth Over Joining Years by Department
    const allStudents = await Student.find({ isDeleted: { $ne: true } }, 'studentId department year createdAt');
    
    const years = ['2023', '2024', '2025', '2026'];
    const depts = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'ADSE', 'Mathematics', 'Robotics'];
    
    const growthTrend = years.map((yr) => {
      const yearShort = yr.substring(2);
      const entry = { year: yr };
      let totalYrCount = 0;
      
      depts.forEach((d) => {
        const count = allStudents.filter((s) => {
          const matchDept = s.department && s.department.trim().toLowerCase() === d.toLowerCase();
          const matchYear = s.studentId && s.studentId.startsWith(yearShort);
          return matchDept && matchYear;
        }).length;
        entry[d] = count;
        totalYrCount += count;
      });
      entry.Total = totalYrCount;
      return entry;
    });

    const result = stats[0] || {};
    result.totalTrash = totalTrash;
    result.userRoleCounts = userRoleCounts;
    result.facultyDepartmentBreakdown = facultyDepartmentBreakdown;
    result.studentGrowthTrend = growthTrend;

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SSE Active Clients Array
let sseClients = [];

// Helper to broadcast real-time events to all SSE clients
const broadcastSSE = (eventType, data) => {
  sseClients.forEach((client) => {
    client.res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
  });
};

// @desc    Minor Concept 3: Real-Time Server-Sent Events (SSE) Stream
// @route   GET /api/v1/students/stream
// @access  Private
const streamStudentEvents = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to EduBase Real-time SSE Stream' })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
};

// @desc    Seed realistic academic data and purge auto-generated test IDs
// @route   POST /api/v1/students/seed-realistic
// @access  Private/Admin
const seedRealisticData = async (req, res) => {
  try {
    // Purge test IDs starting with FAC_ or numbers longer than 8 digits
    await Student.deleteMany({
      $or: [
        { studentId: { $regex: /^FAC_/i } },
        { name: { $regex: /FACULTY|TEST|MOCK/i } },
      ],
    });

    const realisticStudents = [
      { studentId: 'CS-2024-001', name: 'Eleanor Vance', age: 20, department: 'Computer Science', createdBy: 'dr.sarah.jenkins@edubase.edu' },
      { studentId: 'CS-2024-014', name: 'Marcus Sterling', age: 22, department: 'Computer Science', createdBy: 'dr.sarah.jenkins@edubase.edu' },
      { studentId: 'CS-2024-032', name: 'Sophia Chen', age: 21, department: 'Computer Science', createdBy: 'dr.sarah.jenkins@edubase.edu' },
      { studentId: 'EE-2024-005', name: 'Alexander Hayes', age: 23, department: 'Electrical Engineering', createdBy: 'prof.michael.chen@edubase.edu' },
      { studentId: 'EE-2024-019', name: 'Maya Lin', age: 20, department: 'Electrical Engineering', createdBy: 'prof.michael.chen@edubase.edu' },
      { studentId: 'ME-2024-008', name: 'Liam Gallagher', age: 22, department: 'Mechanical Engineering', createdBy: 'dr.elena.rostova@edubase.edu' },
      { studentId: 'ADSE-2024-012', name: 'Amara Okafor', age: 24, department: 'ADSE', createdBy: 'prof.marcus.vance@edubase.edu' },
      { studentId: 'ADSE-2024-045', name: 'Devin Sterling', age: 21, department: 'ADSE', createdBy: 'prof.marcus.vance@edubase.edu' },
      { studentId: 'MATH-2024-003', name: 'Tricia McMillan', age: 25, department: 'Mathematics', createdBy: 'yashureddy4044@gmail.com' },
      { studentId: 'ROB-2024-007', name: 'Julian Thorne', age: 26, department: 'Robotics', createdBy: 'yashureddy4044@gmail.com' },
    ];

    for (const student of realisticStudents) {
      await Student.findOneAndUpdate(
        { studentId: student.studentId },
        { ...student, isDeleted: false },
        { upsert: true, new: true }
      );
    }

    memoryCache.clearPattern('students_');
    res.json({ message: 'Realistic academic student directory seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentsV2,
  getStudentById,
  updateStudent,
  deleteStudent,
  getTrashStudents,
  restoreStudent,
  purgeStudent,
  explainStudentQuery,
  getAnalyticsStats,
  streamStudentEvents,
  seedRealisticData,
};
