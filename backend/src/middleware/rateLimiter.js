const rateLimit = require("express-rate-limit");

// Different rate limits for different endpoints
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message,
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests, please try again later.",
          retryAfter: Math.round(windowMs / 1000),
        },
      });
    },
  });
};

// Auth endpoints - stricter limits
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // 10 attempts per 15 minutes
  "Too many authentication attempts, please try again later."
);

// General API endpoints - more lenient
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  1000, // 1000 requests per 15 minutes
  "Too many API requests, please try again later."
);

// Task operations - moderate limits
const taskLimiter = createRateLimiter(
  1 * 60 * 1000, // 1 minute
  100, // 100 requests per minute
  "Too many task operations, please slow down."
);

module.exports = {
  authLimiter,
  apiLimiter,
  taskLimiter,
};