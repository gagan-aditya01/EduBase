const Student = require('../models/studentModel');
const Department = require('../models/departmentModel');

// @desc    Create a new student
// @route   POST /api/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  try {
    const { studentId, name, age, department } = req.body;

    if (!studentId || !name || !age || !department) {
      return res.status(400).json({ error: 'All fields (studentId, name, age, department) are required' });
    }

    // Check if student already exists
    const studentExists = await Student.findOne({ studentId });
    if (studentExists) {
      return res.status(400).json({ error: 'Student with this ID already exists' });
    }

    // Concept 1: Relational Data Modeling - Find or create department reference
    let deptDoc = await Department.findOne({ name: { $regex: new RegExp(`^${department.trim()}$`, 'i') } });
    if (!deptDoc) {
      const code = department.trim().substring(0, 4).toUpperCase();
      deptDoc = await Department.create({ name: department.trim(), code });
    }

    // Concept 2: Data Ownership - Automatically attach creator username from req.user
    const createdBy = req.user ? req.user.username : 'Admin';

    const student = await Student.create({
      studentId,
      name,
      age,
      department,
      departmentRef: deptDoc._id,
      createdBy,
    });

    const populatedStudent = await Student.findById(student._id).populate('departmentRef', 'name code');
    res.status(201).json(populatedStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all students (with support for Server-Side Pagination, Filtering & Relational Populate)
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res) => {
  try {
    const { studentId, name, age, minAge, maxAge, department, createdBy, search, page, limit } = req.query;
    const filter = {};

    // Global multi-field search string if provided
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { studentId: searchRegex },
        { department: searchRegex },
      ];
    }

    // Filter by studentId
    if (studentId) {
      filter.studentId = { $regex: new RegExp(studentId.trim(), 'i') };
    }

    // Filter by name
    if (name) {
      filter.name = { $regex: new RegExp(name.trim(), 'i') };
    }

    // Filter by department
    if (department) {
      filter.department = { $regex: new RegExp(department.trim(), 'i') };
    }

    // Filter by data creator
    if (createdBy) {
      filter.createdBy = { $regex: new RegExp(createdBy.trim(), 'i') };
    }

    // Filter by age range
    if (age) {
      filter.age = Number(age);
    } else {
      if (minAge || maxAge) {
        filter.age = {};
        if (minAge) filter.age.$gte = Number(minAge);
        if (maxAge) filter.age.$lte = Number(maxAge);
      }
    }

    // Concept 2: Server-Side Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const totalStudents = await Student.countDocuments(filter);
    
    // Concept 1: Mongoose .populate() Relational Joins
    const students = await Student.find(filter)
      .populate('departmentRef', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // If page parameter was explicitly provided, return structured pagination metadata
    if (page || limit) {
      return res.json({
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalStudents / limitNum),
        totalStudents,
        data: students,
      });
    }

    // Default response returning array directly for simple client consumption
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get a single student by studentId (path parameter with populate)
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

// @desc    Update a student (path parameter)
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
    const updatedStudent = await Student.findById(student._id).populate('departmentRef', 'name code');
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a student (path parameter)
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
    res.json({ message: 'Student removed successfully' });
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
};
