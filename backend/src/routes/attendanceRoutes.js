const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getDepartmentStudents,
  getStudentSummary,
  getAttendanceRecords,
} = require('../controllers/attendanceController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, markAttendance);
router.get('/students/:department', protect, getDepartmentStudents);
router.get('/my-summary', protect, getStudentSummary);
router.get('/records', protect, getAttendanceRecords);

module.exports = router;
