const express = require('express');
const router = express.Router();
const { getStudentsV2 } = require('../controllers/studentController');
const { protect } = require('../middlewares/authMiddleware');

// Concept 3: API Version 2.0 Route (Standard HATEOAS Envelope)
router.get('/', protect, getStudentsV2);

module.exports = router;
