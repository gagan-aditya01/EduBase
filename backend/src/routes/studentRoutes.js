const express = require('express');
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Routes for /api/students
router.route('/')
  .post(protect, admin, createStudent)
  .get(protect, getStudents);

// Routes for /api/students/:studentId
router.route('/:studentId')
  .get(protect, getStudentById)
  .put(protect, admin, updateStudent)
  .delete(protect, admin, deleteStudent);

module.exports = router;
