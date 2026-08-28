const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  socialLoginHandler,
  googleAuthRedirect,
  googleAuthCallback,
  githubAuthRedirect,
  githubAuthCallback,
  refreshTokenHandler,
  getAllUsers,
  updateUser,
  deleteUser,
  updateProfilePassword,
} = require('../controllers/authController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/social', socialLoginHandler);

// Live OAuth 2.0 Endpoints
router.get('/google', googleAuthRedirect);
router.get('/google/callback', googleAuthCallback);
router.get('/github', githubAuthRedirect);
router.get('/github/callback', githubAuthCallback);

router.post('/refresh', refreshTokenHandler);

// Self password updates route
router.route('/profile/password')
  .put(protect, updateProfilePassword);

// Admin-only user management routes
router.route('/users')
  .get(protect, admin, getAllUsers);

router.route('/users/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;
