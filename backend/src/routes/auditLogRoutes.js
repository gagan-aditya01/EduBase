const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', protect, admin, getAuditLogs);

module.exports = router;
