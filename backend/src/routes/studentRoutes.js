const express = require('express');
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getTrashStudents,
  restoreStudent,
  purgeStudent,
  explainStudentQuery,
} = require('../controllers/studentController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { validateStudentInput } = require('../middlewares/validateMiddleware');

// Performance Benchmark Route
router.get('/performance/explain', protect, admin, explainStudentQuery);

// Concept 2: Admin Trash Bin Recovery Console Routes
router.get('/trash/list', protect, admin, getTrashStudents);
router.put('/trash/:studentId/restore', protect, admin, restoreStudent);
router.delete('/trash/:studentId/purge', protect, admin, purgeStudent);

// Routes for /api/v1/students & /api/students
router.route('/')
  .post(protect, admin, validateStudentInput, createStudent)
  .get(protect, getStudents);

// Routes for /api/v1/students/:studentId
router.route('/:studentId')
  .get(protect, getStudentById)
  .put(protect, admin, validateStudentInput, updateStudent)
  .delete(protect, admin, deleteStudent);

module.exports = router;
