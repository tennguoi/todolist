const express = require("express");
const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Focus routes working",
    timestamp: new Date().toISOString(),
  });
});

try {
  const {
    getFocusSessions,
    createFocusSession,
    completeFocusSession,
    getFocusStatistics,
    getFocusSettings,
    updateFocusSettings,
  } = require("../controllers/focusController");
  const { authenticateToken } = require("../middleware/auth");

  // All focus routes require authentication
  router.use(authenticateToken);

  router.get("/sessions", getFocusSessions);
  router.post("/sessions", createFocusSession);
  router.put("/sessions/:id/complete", completeFocusSession);
  router.get("/statistics", getFocusStatistics);
  router.get("/settings", getFocusSettings);
  router.put("/settings", updateFocusSettings);
} catch (error) {
  console.error("Error loading focus controller:", error.message);

  router.get("/settings", (req, res) => {
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Focus service temporarily unavailable",
      },
    });
  });
}

module.exports = router;
