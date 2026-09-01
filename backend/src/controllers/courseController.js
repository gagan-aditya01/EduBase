const Course = require('../models/courseModel');

// 60 Curated Courses across 6 Departments
const DEFAULT_COURSES = [
  // --- Computer Science (12 Courses: 3 per year) ---
  { courseCode: 'CS101', title: 'C Programming & Logic Building', department: 'Computer Science', year: '1st Year', credits: 4 },
  { courseCode: 'CS102', title: 'Web Technologies & Design', department: 'Computer Science', year: '1st Year', credits: 3 },
  { courseCode: 'CS103', title: 'Digital Electronics & Logic', department: 'Computer Science', year: '1st Year', credits: 3 },
  { courseCode: 'CS201', title: 'Data Structures & Algorithms', department: 'Computer Science', year: '2nd Year', credits: 4 },
  { courseCode: 'CS202', title: 'Computer Networks & Protocols', department: 'Computer Science', year: '2nd Year', credits: 3 },
  { courseCode: 'CS203', title: 'Object Oriented Programming in Java', department: 'Computer Science', year: '2nd Year', credits: 4 },
  { courseCode: 'CS301', title: 'Operating Systems & Architecture', department: 'Computer Science', year: '3rd Year', credits: 3 },
  { courseCode: 'CS302', title: 'Database Management Systems', department: 'Computer Science', year: '3rd Year', credits: 4 },
  { courseCode: 'CS303', title: 'Software Engineering Principles', department: 'Computer Science', year: '3rd Year', credits: 3 },
  { courseCode: 'CS401', title: 'Artificial Intelligence & ML', department: 'Computer Science', year: '4th Year', credits: 4 },
  { courseCode: 'CS402', title: 'Cloud Computing & Distributed Systems', department: 'Computer Science', year: '4th Year', credits: 3 },
  { courseCode: 'CS403', title: 'Cyber Security & Cryptography', department: 'Computer Science', year: '4th Year', credits: 3 },

  // --- ADSE (12 Courses: 3 per year) ---
  { courseCode: 'ADSE101', title: 'Software Process Fundamentals', department: 'ADSE', year: '1st Year', credits: 3 },
  { courseCode: 'ADSE102', title: 'Python Application Programming', department: 'ADSE', year: '1st Year', credits: 4 },
  { courseCode: 'ADSE103', title: 'Mathematical Foundations for Engineering', department: 'ADSE', year: '1st Year', credits: 3 },
  { courseCode: 'ADSE201', title: 'Agile Systems Development', department: 'ADSE', year: '2nd Year', credits: 3 },
  { courseCode: 'ADSE202', title: 'Software Architecture & Patterns', department: 'ADSE', year: '2nd Year', credits: 4 },
  { courseCode: 'ADSE203', title: 'UI/UX Engineering & Design', department: 'ADSE', year: '2nd Year', credits: 3 },
  { courseCode: 'ADSE301', title: 'Enterprise DevOps & CI/CD Pipelines', department: 'ADSE', year: '3rd Year', credits: 4 },
  { courseCode: 'ADSE302', title: 'Microservices & API Architecture', department: 'ADSE', year: '3rd Year', credits: 4 },
  { courseCode: 'ADSE303', title: 'Software Quality Assurance & Testing', department: 'ADSE', year: '3rd Year', credits: 3 },
  { courseCode: 'ADSE401', title: 'Cloud Native Application Design', department: 'ADSE', year: '4th Year', credits: 4 },
  { courseCode: 'ADSE402', title: 'Big Data & Analytics Pipelines', department: 'ADSE', year: '4th Year', credits: 4 },
  { courseCode: 'ADSE403', title: 'Enterprise Capstone Project', department: 'ADSE', year: '4th Year', credits: 6 },

  // --- Mathematics (12 Courses: 3 per year) ---
  { courseCode: 'MATH101', title: 'Calculus & Analytical Geometry', department: 'Mathematics', year: '1st Year', credits: 4 },
  { courseCode: 'MATH102', title: 'Linear Algebra & Matrices', department: 'Mathematics', year: '1st Year', credits: 4 },
  { courseCode: 'MATH103', title: 'Vector Algebra & Coordinate Geometry', department: 'Mathematics', year: '1st Year', credits: 3 },
  { courseCode: 'MATH201', title: 'Multivariable Calculus', department: 'Mathematics', year: '2nd Year', credits: 4 },
  { courseCode: 'MATH202', title: 'Ordinary Differential Equations', department: 'Mathematics', year: '2nd Year', credits: 4 },
  { courseCode: 'MATH203', title: 'Real Analysis & Sequences', department: 'Mathematics', year: '2nd Year', credits: 3 },
  { courseCode: 'MATH301', title: 'Discrete Mathematics & Graph Theory', department: 'Mathematics', year: '3rd Year', credits: 3 },
  { courseCode: 'MATH302', title: 'Numerical Analysis & Computation', department: 'Mathematics', year: '3rd Year', credits: 4 },
  { courseCode: 'MATH303', title: 'Complex Variables & Transforms', department: 'Mathematics', year: '3rd Year', credits: 3 },
  { courseCode: 'MATH401', title: 'Probability Theory & Applied Statistics', department: 'Mathematics', year: '4th Year', credits: 4 },
  { courseCode: 'MATH402', title: 'Abstract Algebra & Group Theory', department: 'Mathematics', year: '4th Year', credits: 4 },
  { courseCode: 'MATH403', title: 'Optimization Techniques & Operations Research', department: 'Mathematics', year: '4th Year', credits: 3 },

  // --- Electrical Engineering (8 Courses: 2 per year) ---
  { courseCode: 'EE101', title: 'Basic Electrical Engineering', department: 'Electrical Engineering', year: '1st Year', credits: 3 },
  { courseCode: 'EE102', title: 'Engineering Circuit Analysis', department: 'Electrical Engineering', year: '1st Year', credits: 4 },
  { courseCode: 'EE201', title: 'Electromagnetic Field Theory', department: 'Electrical Engineering', year: '2nd Year', credits: 4 },
  { courseCode: 'EE202', title: 'Signals & Systems Analysis', department: 'Electrical Engineering', year: '2nd Year', credits: 4 },
  { courseCode: 'EE301', title: 'Linear Control Systems', department: 'Electrical Engineering', year: '3rd Year', credits: 3 },
  { courseCode: 'EE302', title: 'Analog & Digital Electronics', department: 'Electrical Engineering', year: '3rd Year', credits: 4 },
  { courseCode: 'EE401', title: 'Power Electronics & Drives', department: 'Electrical Engineering', year: '4th Year', credits: 4 },
  { courseCode: 'EE402', title: 'Microprocessors & Embedded Systems', department: 'Electrical Engineering', year: '4th Year', credits: 4 },

  // --- Mechanical Engineering (8 Courses: 2 per year) ---
  { courseCode: 'ME101', title: 'Engineering Mechanics & Statics', department: 'Mechanical Engineering', year: '1st Year', credits: 3 },
  { courseCode: 'ME102', title: 'Engineering Graphics & 3D CAD', department: 'Mechanical Engineering', year: '1st Year', credits: 3 },
  { courseCode: 'ME201', title: 'Engineering Thermodynamics', department: 'Mechanical Engineering', year: '2nd Year', credits: 4 },
  { courseCode: 'ME202', title: 'Strength of Materials & Mechanics', department: 'Mechanical Engineering', year: '2nd Year', credits: 4 },
  { courseCode: 'ME301', title: 'Fluid Mechanics & Machinery', department: 'Mechanical Engineering', year: '3rd Year', credits: 4 },
  { courseCode: 'ME302', title: 'Manufacturing & Casting Technology', department: 'Mechanical Engineering', year: '3rd Year', credits: 3 },
  { courseCode: 'ME401', title: 'Heat & Mass Transfer', department: 'Mechanical Engineering', year: '4th Year', credits: 4 },
  { courseCode: 'ME402', title: 'Machine Element Design', department: 'Mechanical Engineering', year: '4th Year', credits: 4 },

  // --- Robotics (8 Courses: 2 per year) ---
  { courseCode: 'ROB101', title: 'Introduction to Robotics & Automation', department: 'Robotics', year: '1st Year', credits: 3 },
  { courseCode: 'ROB102', title: 'Embedded C Programming for Controllers', department: 'Robotics', year: '1st Year', credits: 3 },
  { courseCode: 'ROB201', title: 'Sensors, Transducers & Actuators', department: 'Robotics', year: '2nd Year', credits: 4 },
  { courseCode: 'ROB202', title: 'Microcontroller Architecture & Interfaces', department: 'Robotics', year: '2nd Year', credits: 4 },
  { courseCode: 'ROB301', title: 'Robot Kinematics & Dynamics', department: 'Robotics', year: '3rd Year', credits: 4 },
  { courseCode: 'ROB302', title: 'Mechatronics Systems Design', department: 'Robotics', year: '3rd Year', credits: 3 },
  { courseCode: 'ROB401', title: 'Autonomous Navigation & Robot Operating System (ROS)', department: 'Robotics', year: '4th Year', credits: 4 },
  { courseCode: 'ROB402', title: 'Computer Vision for Robotics', department: 'Robotics', year: '4th Year', credits: 4 },
];

// @desc    Get all courses with optional filters (department, year)
// @route   GET /api/v1/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    const { department, year } = req.query;
    const filter = {};

    if (department && department !== 'ALL') {
      filter.department = new RegExp(`^${department.trim()}$`, 'i');
    }
    if (year && year !== 'ALL') {
      filter.year = new RegExp(`^${year.trim()}$`, 'i');
    }

    const count = await Course.countDocuments(filter);
    if (count === 0 && Object.keys(filter).length === 0) {
      // Auto seed if empty
      await Course.insertMany(DEFAULT_COURSES);
    }

    const courses = await Course.find(filter).sort({ courseCode: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Seed curriculum courses
// @route   POST /api/v1/courses/seed
// @access  Private/Admin
const seedCourses = async (req, res) => {
  try {
    for (const c of DEFAULT_COURSES) {
      await Course.findOneAndUpdate(
        { courseCode: c.courseCode },
        { ...c },
        { upsert: true, new: true }
      );
    }
    res.json({ message: 'Curriculum course database seeded successfully (60 total courses across 6 departments).' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCourses,
  seedCourses,
  DEFAULT_COURSES,
};
