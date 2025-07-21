const express = require("express");
const router = express.Router();

// Test route (no auth required)
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Task routes working",
    timestamp: new Date().toISOString(),
  });
});

try {
  const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    getTaskStatistics,
  } = require("../controllers/taskController");
  const { authenticateToken } = require("../middleware/auth");

  // All task routes require authentication
  router.use(authenticateToken);

  router.get("/", getTasks);
  router.post("/", createTask);
  router.get("/statistics", getTaskStatistics);
  router.get("/search", getTasks); // Search tasks using query parameters
  router.get("/:id", getTask);
  router.put("/:id", updateTask);
  router.delete("/:id", deleteTask);
  router.post("/:id/complete", toggleTaskComplete);
} catch (error) {
  console.error("Error loading task controller:", error.message);

  // Fallback route
  router.get("/", (req, res) => {
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Task service temporarily unavailable",
      },
    });
  });
}

module.exports = router;
