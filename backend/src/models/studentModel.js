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
    },
    department: {
      type: String,
      required: [true, 'Please add a department'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Student', studentSchema);
