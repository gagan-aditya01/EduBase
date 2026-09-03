const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      default: 'Present',
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Stored as YYYY-MM-DD for simple date matching
      required: [true, 'Please provide an attendance date (YYYY-MM-DD)'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Please specify a department'],
      trim: true,
    },
    slot: {
      type: String,
      required: [true, 'Please specify a time slot'],
      enum: {
        values: ['10-11', '11-12', '10-12', '2-3', '3-4', '2-4'],
        message: 'Invalid time slot. Allowed slots: 10-11, 11-12, 10-12 (block), 2-3, 3-4, 2-4 (block)',
      },
    },
    slotHours: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
    recordedBy: {
      type: String,
      required: true,
      trim: true,
    },
    records: [attendanceRecordSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per date, department, and slot
attendanceSchema.index({ date: 1, department: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
