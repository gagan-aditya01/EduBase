const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate Limiter: Max 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
    status: 429,
  },
});

module.exports = { helmet, apiLimiter };
