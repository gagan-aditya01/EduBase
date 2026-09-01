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
  getAnalyticsStats,
  streamStudentEvents,
  seedRealisticData,
  bulkImportStudents,
} = require('../controllers/studentController');
const { protect, admin, facultyOrAdmin } = require('../middlewares/authMiddleware');
const { validateStudentInput } = require('../middlewares/validateMiddleware');

// Performance & Aggregation Analytics Routes
router.get('/performance/explain', protect, admin, explainStudentQuery);
router.get('/analytics/stats', protect, getAnalyticsStats);
router.get('/stream', protect, streamStudentEvents);
router.post('/seed-realistic', protect, admin, seedRealisticData);
router.post('/bulk-import', protect, facultyOrAdmin, bulkImportStudents);

// Concept 2: Admin Trash Bin Recovery Console Routes
router.get('/trash/list', protect, admin, getTrashStudents);
router.put('/trash/:studentId/restore', protect, admin, restoreStudent);
router.delete('/trash/:studentId/purge', protect, admin, purgeStudent);

// Routes for /api/v1/students & /api/students
router.route('/')
  .post(protect, facultyOrAdmin, validateStudentInput, createStudent)
  .get(protect, getStudents);

// Routes for /api/v1/students/:studentId
router.route('/:studentId')
  .get(protect, getStudentById)
  .put(protect, facultyOrAdmin, validateStudentInput, updateStudent)
  .delete(protect, admin, deleteStudent);

module.exports = router;
