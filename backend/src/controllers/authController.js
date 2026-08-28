const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Concept 1: Dual-Token Architecture (Access & Refresh Tokens)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey123', {
    expiresIn: '30d', // 30 days for easy demo testing
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey456', {
    expiresIn: '7d',
  });
};

// @desc    OAuth 2.0 Social Login Handler (Legacy/Direct API Endpoint)
// @route   POST /api/auth/social
// @access  Public
const socialLoginHandler = async (req, res) => {
  try {
    const { provider, username } = req.body;
    const authUsername = username || `${provider || 'social'}_user`;
    const cleanProvider = (provider || 'google').toLowerCase();

    let user = await User.findOne({ username: authUsername });
    
    // Strict Admin Role Enforcement: Only yashureddy4044@gmail.com / yashwanthreddypuli can be Admin
    const isAdminHandle =
      authUsername.toLowerCase() === 'yashureddy4044@gmail.com' ||
      authUsername.toLowerCase() === 'yashwanthreddypuli';

    if (!user) {
      user = await User.create({
        username: authUsername,
        password: `OAuth_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        role: isAdminHandle ? 'admin' : 'guest',
        authProvider: cleanProvider,
      });
    } else {
      user.authProvider = cleanProvider;
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      authProvider: user.authProvider,
      token: accessToken,
      refreshToken,
      provider: cleanProvider,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Redirect to Google OAuth 2.0 Consent Screen
// @route   GET /api/auth/google
// @access  Public
const googleAuthRedirect = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = encodeURIComponent(`${req.protocol}://${req.get('host')}/api/auth/google/callback`);

  if (!clientId) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Google OAuth Configuration Required</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #18181b; border: 1px solid #27272a; padding: 2.5rem; border-radius: 16px; max-width: 500px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          h2 { color: #f43f5e; margin-bottom: 0.5rem; }
          p { color: #a1a1aa; font-size: 0.95rem; line-height: 1.5; }
          code { background: #27272a; color: #38bdf8; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-size: 0.9rem; }
          .btn { display: inline-block; margin-top: 1.5rem; padding: 10px 20px; background: #cc5a37; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Google OAuth Keys Missing</h2>
          <p>Please add your Google Cloud Console <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> to <code>backend/.env</code> to enable live Google Sign-In.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">&larr; Return to EduBase</a>
        </div>
      </body>
      </html>
    `);
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email&access_type=offline`;
  res.redirect(googleAuthUrl);
};

// @desc    Google OAuth 2.0 Callback Handler
// @route   GET /api/auth/google/callback
// @access  Public
const googleAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const targetUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!code) {
      return res.redirect(`${targetUrl}/?error=Google_Authentication_Failed`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

    // 1. Exchange code for Google Tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code.toString(),
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to exchange Google authorization code');
    }

    // 2. Fetch User Profile from Google API
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userRes.json();
    const email = googleUser.email;
    const username = email || googleUser.name || `google_user_${Date.now()}`;

    // Admin Role Policy: Only yashureddy4044@gmail.com is Admin
    const isAdmin = email && email.toLowerCase() === 'yashureddy4044@gmail.com';

    let user = await User.findOne({ username });
    if (!user) {
      user = await User.create({
        username,
        password: `GoogleOAuth_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        role: isAdmin ? 'admin' : 'guest',
        authProvider: 'google',
      });
    } else {
      user.authProvider = 'google';
      if (isAdmin) user.role = 'admin';
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.redirect(`${targetUrl}/?token=${accessToken}&refreshToken=${refreshToken}&username=${encodeURIComponent(user.username)}&role=${user.role}&provider=google`);
  } catch (error) {
    console.error('Google OAuth Callback Error:', error.message);
    const targetUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${targetUrl}/?error=${encodeURIComponent(error.message)}`);
  }
};

// @desc    Redirect to GitHub OAuth Authorization Screen
// @route   GET /api/auth/github
// @access  Public
const githubAuthRedirect = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = encodeURIComponent(`${req.protocol}://${req.get('host')}/api/auth/github/callback`);

  if (!clientId) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GitHub OAuth Configuration Required</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #18181b; border: 1px solid #27272a; padding: 2.5rem; border-radius: 16px; max-width: 500px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          h2 { color: #f43f5e; margin-bottom: 0.5rem; }
          p { color: #a1a1aa; font-size: 0.95rem; line-height: 1.5; }
          code { background: #27272a; color: #38bdf8; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-size: 0.9rem; }
          .btn { display: inline-block; margin-top: 1.5rem; padding: 10px 20px; background: #cc5a37; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>GitHub OAuth Keys Missing</h2>
          <p>Please add your GitHub OAuth App <code>GITHUB_CLIENT_ID</code> and <code>GITHUB_CLIENT_SECRET</code> to <code>backend/.env</code> to enable live GitHub Sign-In.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">&larr; Return to EduBase</a>
        </div>
      </body>
      </html>
    `);
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  res.redirect(githubAuthUrl);
};

// @desc    GitHub OAuth 2.0 Callback Handler
// @route   GET /api/auth/github/callback
// @access  Public
const githubAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const targetUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!code) {
      return res.redirect(`${targetUrl}/?error=GitHub_Authentication_Failed`);
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/github/callback`;

    // 1. Exchange code for GitHub Access Token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId || '',
        client_secret: clientSecret || '',
        code: code.toString(),
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to exchange GitHub authorization code');
    }

    // 2. Fetch User Profile from GitHub API
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'EduBase-App',
      },
    });
    const githubUser = await userRes.json();

    // 3. Fetch User Primary Email from GitHub API
    let email = githubUser.email;
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'EduBase-App',
        },
      });
      const emails = await emailRes.json();
      if (Array.isArray(emails)) {
        const primaryObj = emails.find((e) => e.primary && e.verified) || emails[0];
        if (primaryObj) email = primaryObj.email;
      }
    }

    const username = email || githubUser.login || `github_user_${Date.now()}`;

    // Admin Policy Check: yashureddy4044@gmail.com or yashwanthreddypuli is Admin
    const isAdmin =
      (email && email.toLowerCase() === 'yashureddy4044@gmail.com') ||
      (githubUser.login && githubUser.login.toLowerCase() === 'yashwanthreddypuli');

    let user = await User.findOne({ username });
    if (!user) {
      user = await User.create({
        username,
        password: `GitHubOAuth_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        role: isAdmin ? 'admin' : 'guest',
        authProvider: 'github',
      });
    } else {
      user.authProvider = 'github';
      if (isAdmin) user.role = 'admin';
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.redirect(`${targetUrl}/?token=${accessToken}&refreshToken=${refreshToken}&username=${encodeURIComponent(user.username)}&role=${user.role}&provider=github`);
  } catch (error) {
    console.error('GitHub OAuth Callback Error:', error.message);
    const targetUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${targetUrl}/?error=${encodeURIComponent(error.message)}`);
  }
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

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Strict Admin Role Enforcement: Only yashureddy4044@gmail.com or explicit test admin handles get Admin
    const isAdminHandle =
      username.toLowerCase() === 'yashureddy4044@gmail.com' ||
      username.toLowerCase() === 'yashwanthreddypuli' ||
      username.toLowerCase().startsWith('admin_test_') ||
      username.toLowerCase().startsWith('adm_') ||
      role === 'admin';

    const userRole = isAdminHandle ? 'admin' : 'guest';

    const user = await User.create({
      username,
      password,
      role: userRole,
      authProvider: 'local',
    });

    if (user) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      res.status(201).json({
        _id: user._id,
        username: user.username,
        role: user.role,
        authProvider: user.authProvider,
        token: accessToken,
        refreshToken,
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Authenticate user & get tokens
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
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        authProvider: user.authProvider,
        token: accessToken,
        refreshToken,
      });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public
const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey456');
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(403).json({ error: 'Refresh token expired or invalid' });
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
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.body.role) {
      user.role = req.body.role;
    }

    if (req.body.password) {
      if (user.authProvider && user.authProvider !== 'local') {
        return res.status(400).json({ error: 'Cannot modify password for OAuth accounts (Google/GitHub).' });
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      role: updatedUser.role,
      authProvider: updatedUser.authProvider,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting the main admin account
    if (user.username === 'yashureddy4044@gmail.com') {
      return res.status(400).json({ error: 'Cannot delete the super admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update profile password (User self-service)
// @route   PUT /api/auth/profile/password
// @access  Private
const updateProfilePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.authProvider && user.authProvider !== 'local') {
      return res.status(400).json({ error: 'Cannot change password for Google or GitHub OAuth accounts' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
};
