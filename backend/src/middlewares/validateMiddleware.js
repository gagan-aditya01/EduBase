// Input validation middleware for Student creation & updates
const validateStudentInput = (req, res, next) => {
  const { studentId, name, age, department } = req.body;

  if (req.method === 'POST') {
    if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
      return res.status(400).json({ error: 'Valid Student ID is required' });
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Valid Student Name is required' });
    }
    if (age === undefined || typeof Number(age) !== 'number' || isNaN(Number(age)) || Number(age) < 16 || Number(age) > 90) {
      return res.status(400).json({ error: 'Age must be a number between 16 and 90' });
    }
    if (!department || typeof department !== 'string' || !department.trim()) {
      return res.status(400).json({ error: 'Valid Department is required' });
    }
  }

  if (req.method === 'PUT') {
    if (age !== undefined && (isNaN(Number(age)) || Number(age) < 16 || Number(age) > 90)) {
      return res.status(400).json({ error: 'Age must be a number between 16 and 90' });
    }
  }

  next();
};

module.exports = { validateStudentInput };
