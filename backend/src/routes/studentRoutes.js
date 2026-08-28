const express = require('express');
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  explainStudentQuery,
} = require('../controllers/studentController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { validateStudentInput } = require('../middlewares/validateMiddleware');

// Performance Benchmark Route
router.get('/performance/explain', protect, admin, explainStudentQuery);

// Routes for /api/students
router.route('/')
  .post(protect, admin, validateStudentInput, createStudent)
  .get(protect, getStudents);

// Routes for /api/students/:studentId
router.route('/:studentId')
  .get(protect, getStudentById)
  .put(protect, admin, validateStudentInput, updateStudent)
  .delete(protect, admin, deleteStudent);

module.exports = router;
