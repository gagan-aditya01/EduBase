const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getDepartmentStudents,
  getStudentSummary,
  getAttendanceRecords,
  seedAttendance,
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/', protect, markAttendance);
router.post('/seed', protect, admin, seedAttendance);
router.get('/students/:department', protect, getDepartmentStudents);
router.get('/my-summary', protect, getStudentSummary);
router.get('/records', protect, getAttendanceRecords);

module.exports = router;
