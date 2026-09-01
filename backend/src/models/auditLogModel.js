const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['CREATE_STUDENT', 'UPDATE_STUDENT', 'DELETE_STUDENT', 'RESTORE_STUDENT', 'PURGE_STUDENT', 'USER_LOGIN', 'CHANGE_PASSWORD', 'BULK_IMPORT_STUDENTS'],
    },
    targetId: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
