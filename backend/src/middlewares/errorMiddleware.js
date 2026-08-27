// Comprehensive Custom Error Handler with Friendly Messages
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let customMessage = err.message || 'An unexpected server error occurred. Please try again later.';

  // 1. Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'record';
    const value = err.keyValue ? err.keyValue[field] : '';
    customMessage = `A record with ${field} "${value}" already exists in the database. Please use a unique identifier.`;
  }

  // 2. Mongoose Invalid ObjectId / CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    customMessage = `Invalid format provided for field '${err.path}'. Expected a valid database ID.`;
  }

  // 3. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    customMessage = `Invalid Input: ${messages.join('. ')}`;
  }

  // 4. JWT Verification Error
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    customMessage = 'Invalid authentication token. Please log in again to receive a fresh security token.';
  }

  // 5. JWT Expired Error
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    customMessage = 'Your security session has expired. Please log in again to continue.';
  }

  // 6. Syntax Error / Malformed JSON in Request Body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    customMessage = 'Malformed JSON payload in request body. Please verify your data format.';
  }

  res.status(statusCode).json({
    success: false,
    error: customMessage,
    status: statusCode,
    timestamp: new Date().toISOString(),
  });
};

// 404 Route Not Found Middleware
const notFound = (req, res, next) => {
  const error = new Error(`API endpoint '${req.originalUrl}' does not exist on this server.`);
  res.status(404);
  next(error);
};

// Async handler wrapper to remove try-catch boilerplate in controllers
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, notFound, catchAsync };
