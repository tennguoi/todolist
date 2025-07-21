const express = require("express");

const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

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

  // Public routes
  router.post("/signin", signIn);
  router.post("/signup", signUp);
  router.post("/google", signInWithGoogle);

  // Protected routes
  router.post("/signout", signOut); // Allow signout without strict auth check
} catch (error) {
  console.error("Error loading auth controller:", error.message);

  // Fallback routes
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

  router.post("/signout", (req, res) => {
    res.json({
      success: true,
      message: "Sign out completed (fallback)",
    });
  });
}

module.exports = router;
