const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      trim: true,
    },
    studentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    courseRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    semester: {
      type: String,
      default: 'Spring 2026',
      trim: true,
    },
    // Indian University Marks Breakdown
    assignment1: {
      type: Number,
      min: 0,
      max: 20,
      default: 0,
    },
    midterm: {
      type: Number,
      min: 0,
      max: 50,
      default: 0,
    },
    assignment2: {
      type: Number,
      min: 0,
      max: 20,
      default: 0,
    },
    endSem: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    // Calculated Evaluation Outputs
    totalWeightedScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    letterGrade: {
      type: String,
      required: true,
      enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'],
    },
    gradePoint: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    evaluatedBy: {
      type: String,
      trim: true,
      default: 'Faculty',
    },
  },
  {
    timestamps: true,
  }
);

// Composite Unique Index (One grade entry per student per course per semester)
gradeSchema.index({ studentId: 1, courseCode: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Grade', gradeSchema);
