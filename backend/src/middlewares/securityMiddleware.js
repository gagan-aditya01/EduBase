const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate Limiter: Max 100 requests per 15 minutes per IP (disabled in test env)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
    status: 429,
  },
});

module.exports = { helmet, apiLimiter };
