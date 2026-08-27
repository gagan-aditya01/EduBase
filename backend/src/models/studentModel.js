const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Please add a student ID'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a student name'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Please add student age'],
      min: [16, 'Age must be a number between 16 and 90'],
      max: [90, 'Age must be a number between 16 and 90'],
    },
    department: {
      type: String,
      required: [true, 'Please add a department'],
      trim: true,
    },
    departmentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    createdBy: {
      type: String,
      default: 'Admin',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Student', studentSchema);
