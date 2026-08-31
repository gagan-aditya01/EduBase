const AuditLog = require('../models/auditLogModel');

// @desc    Get system audit log trail (Admin only)
// @route   GET /api/v1/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
  try {
    const { action, performedBy, search, page, limit } = req.query;

    const filter = {};

    if (action) {
      filter.action = action.trim();
    }

    if (performedBy) {
      filter.performedBy = { $regex: new RegExp(performedBy.trim(), 'i') };
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { details: searchRegex },
        { performedBy: searchRegex },
        { targetId: searchRegex },
        { action: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 30;
    const skip = (pageNum - 1) * limitNum;

    const totalLogs = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalLogs / limitNum),
      totalLogs,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAuditLogs,
};
