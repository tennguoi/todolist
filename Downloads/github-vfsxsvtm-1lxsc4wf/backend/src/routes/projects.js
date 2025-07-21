const express = require("express");
const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Project routes working",
    timestamp: new Date().toISOString(),
  });
});

try {
  const {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectTasks,
  } = require("../controllers/projectController");
  const { authenticateToken } = require("../middleware/auth");

  // All project routes require authentication
  router.use(authenticateToken);

  router.get("/", getProjects);
  router.post("/", createProject);
  router.put("/:id", updateProject);
  router.delete("/:id", deleteProject);
  router.get("/:id/tasks", getProjectTasks);
} catch (error) {
  console.error("Error loading project controller:", error.message);

  router.get("/", (req, res) => {
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Project service temporarily unavailable",
      },
    });
  });
}

module.exports = router;
