const Student = require('../models/studentModel');
const Department = require('../models/departmentModel');
const AuditLog = require('../models/auditLogModel');
const memoryCache = require('../utils/cacheEngine');
const backgroundQueue = require('../utils/backgroundQueue');

// @desc    Create a new student
// @route   POST /api/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  try {
    const { studentId, name, age, department } = req.body;

    if (!studentId || !name || !age || !department) {
      return res.status(400).json({ error: 'All fields (studentId, name, age, department) are required' });
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

    // Invalidate Memory Cache after new student creation
    memoryCache.clearPattern('students_');

    // Concept 2: Asynchronous Background Queue - Offload audit logging without blocking HTTP response
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

// @desc    Get all students (with support for RAM Caching, Pagination, Filtering & Relational Populate)
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res) => {
  try {
    const { studentId, name, age, minAge, maxAge, department, createdBy, search, page, limit } = req.query;

    // Concept 1: In-Memory Caching Key
    const cacheKey = `students_${JSON.stringify(req.query)}`;
    const cachedData = memoryCache.get(cacheKey);
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    const filter = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { studentId: searchRegex },
        { department: searchRegex },
      ];
    }

    if (studentId) {
      filter.studentId = { $regex: new RegExp(studentId.trim(), 'i') };
    }

    if (name) {
      filter.name = { $regex: new RegExp(name.trim(), 'i') };
    }

    if (department) {
      filter.department = { $regex: new RegExp(department.trim(), 'i') };
    }

    if (createdBy) {
      filter.createdBy = { $regex: new RegExp(createdBy.trim(), 'i') };
    }

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
    const limitNum = parseInt(limit, 10) || 50;
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

    // Cache the response for 30 seconds
    memoryCache.set(cacheKey, responseData, 30);
    res.setHeader('X-Cache', 'MISS');
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get a single student by studentId
// @route   GET /api/students/:studentId
// @access  Private
const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId }).populate('departmentRef', 'name code');

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update a student
// @route   PUT /api/students/:studentId
// @access  Private/Admin
const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name, age, department } = req.body;

    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
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

    const updatedStudent = await Student.findById(student._id).populate('departmentRef', 'name code');
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a student
// @route   DELETE /api/students/:studentId
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await student.deleteOne();
    memoryCache.clearPattern('students_');

    backgroundQueue.enqueue('DELETE_STUDENT_AUDIT', async () => {
      await AuditLog.create({
        action: 'DELETE_STUDENT',
        targetId: studentId,
        performedBy: req.user ? req.user.username : 'Admin',
        details: `Deleted student ${student.name} (${studentId})`,
      });
    });

    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Concept 3: Query Execution Performance Benchmark (explain())
// @route   GET /api/students/performance/explain
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

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  explainStudentQuery,
};
