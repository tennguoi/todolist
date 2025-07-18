const express = require("express");
const router = express.Router();
const { authLimiter } = require("../middleware/rateLimiter");

// Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes working",
    timestamp: new Date().toISOString(),
  });
});

try {
  const {
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  } = require("../controllers/authController");
  const { authenticateToken } = require("../middleware/auth");

  // Public routes
  router.post("/signin", authLimiter, signIn);
  router.post("/signup", authLimiter, signUp);
  router.post("/google", authLimiter, signInWithGoogle);

  // Protected routes
  router.get("/verify", authenticateToken, (req, res) => {
    res.json({
      success: true,
      data: {
        user: req.user.toJSON(),
      },
      message: "Token verified successfully",
    });
  });

  router.post("/signout", authenticateToken, signOut);
} catch (error) {
  console.error("Error loading auth controller:", error.message);

  // Fallback routes
  router.get("/verify", (req, res) => {
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Authentication service temporarily unavailable",
      },
    });
  });

  router.post("/signin", (req, res) => {
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Authentication service temporarily unavailable",
      },
    });
  });

  router.post("/signup", (req, res) => {
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Authentication service temporarily unavailable",
      },
    });
  });
}

module.exports = router;
