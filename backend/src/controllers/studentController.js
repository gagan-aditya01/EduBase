const Student = require('../models/studentModel');

// @desc    Create a new student
// @route   POST /api/students
// @access  Public
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

    const student = await Student.create({
      studentId,
      name,
      age,
      department,
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all students (with support for rich multi-filtering using query parameters)
// @route   GET /api/students
// @access  Public
const getStudents = async (req, res) => {
  try {
    const { studentId, name, age, minAge, maxAge, department } = req.query;
    const filter = {};

    // Filter by studentId (case-insensitive, partial match)
    if (studentId) {
      filter.studentId = { $regex: new RegExp(studentId.trim(), 'i') };
    }

    // Filter by name (case-insensitive, partial match)
    if (name) {
      filter.name = { $regex: new RegExp(name.trim(), 'i') };
    }

    // Filter by department (case-insensitive, partial match)
    if (department) {
      filter.department = { $regex: new RegExp(department.trim(), 'i') };
    }

    // Filter by age (exact, minimum, and/or maximum)
    if (age) {
      filter.age = Number(age);
    } else {
      if (minAge || maxAge) {
        filter.age = {};
        if (minAge) {
          filter.age.$gte = Number(minAge);
        }
        if (maxAge) {
          filter.age.$lte = Number(maxAge);
        }
      }
    }

    const students = await Student.find(filter);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get a single student by studentId (path parameter)
// @route   GET /api/students/:studentId
// @access  Public
const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });

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
// @access  Public
const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name, age, department } = req.body;

    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update fields
    if (name) student.name = name;
    if (age) student.age = age;
    if (department) student.department = department;

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a student (path parameter)
// @route   DELETE /api/students/:studentId
// @access  Public
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
