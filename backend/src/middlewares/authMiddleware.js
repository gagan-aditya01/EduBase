const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Student = require('../models/studentModel');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');

      // Get user from the token, excluding password
      req.user = await User.findById(decoded.id).select('-password');
      
      // If not in User collection, check Student collection
      if (!req.user) {
        const student = await Student.findById(decoded.id);
        if (student) {
          req.user = {
            _id: student._id,
            username: student.studentId,
            studentId: student.studentId,
            name: student.name,
            role: 'student',
            department: student.department,
            assignedDepartment: student.department,
            year: student.year,
            section: student.section,
          };
        }
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Admin role required' });
  }
};

const facultyOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'faculty')) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Admin or Faculty role required' });
  }
};

module.exports = { protect, admin, facultyOrAdmin };
