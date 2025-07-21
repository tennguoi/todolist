const express = require("express");
const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "User routes working",
    timestamp: new Date().toISOString(),
  });
});

try {
  const { User } = require("../models");
  const { authenticateToken } = require("../middleware/auth");

  // All user routes require authentication
  router.use(authenticateToken);

  // Get current user profile
  router.get("/profile", async (req, res, next) => {
    try {
      res.json({
        success: true,
        data: req.user.toJSON(),
        message: "User profile retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  });

  // Update user profile
  router.put("/profile", async (req, res, next) => {
    try {
      const { name, avatar } = req.body;
      const user = req.user;

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (avatar !== undefined) updates.avatar = avatar;

      await user.update(updates);

      res.json({
        success: true,
        data: user.toJSON(),
        message: "User profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  });
} catch (error) {
  console.error("Error loading user models:", error.message);

  router.get("/profile", (req, res) => {
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "User service temporarily unavailable",
      },
    });
  });
}

module.exports = router;
