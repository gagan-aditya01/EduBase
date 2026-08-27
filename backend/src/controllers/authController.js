const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Generate JWT Token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Determine role (default is guest, unless explicitly setting admin for demo purposes)
    const userRole = role === 'admin' ? 'admin' : 'guest';

    const user = await User.create({
      username,
      password,
      role: userRole,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    res.status(550).json({ error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update user role or password (Admin only)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { role, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update role if provided
    if (role) {
      user.role = role;
    }

    // Update password if provided (will trigger mongoose pre-save bcrypt hook)
    if (password) {
      user.password = password;
    }

    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete user account (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot delete your own admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update profile password (Any logged in user)
// @route   PUT /api/auth/profile/password
// @access  Private
const updateProfilePassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.trim().length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(444).json({ error: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser,
  updateProfilePassword,
};
