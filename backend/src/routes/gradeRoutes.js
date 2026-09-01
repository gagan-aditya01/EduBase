const express = require('express');
const router = express.Router();
const { getSectionGrades, saveBulkGrades, getStudentTranscript } = require('../controllers/gradeController');
const { protect, facultyOrAdmin } = require('../middlewares/authMiddleware');

router.get('/', protect, facultyOrAdmin, getSectionGrades);
router.post('/bulk-save', protect, facultyOrAdmin, saveBulkGrades);
router.get('/student/:studentId', protect, getStudentTranscript);

module.exports = router;
