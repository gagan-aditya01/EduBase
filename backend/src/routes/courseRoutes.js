const express = require('express');
const router = express.Router();
const { getCourses, seedCourses } = require('../controllers/courseController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', protect, getCourses);
router.post('/seed', protect, admin, seedCourses);

module.exports = router;
