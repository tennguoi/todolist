const express = require("express");
const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Settings routes working",
    timestamp: new Date().toISOString(),
  });
});

try {
  const { NotificationSettings, ThemeSettings } = require("../models");
  const { authenticateToken } = require("../middleware/auth");

  // All settings routes require authentication
  router.use(authenticateToken);

  // Notification settings
  router.get("/notifications", async (req, res, next) => {
    try {
      const userId = req.user.id;

      let settings = await NotificationSettings.findOne({
        where: { user_id: userId },
      });

      if (!settings) {
        settings = await NotificationSettings.create({ user_id: userId });
      }

      res.json({
        success: true,
        data: settings,
        message: "Notification settings retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  });

  router.put("/notifications", async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { enabled, reminder_time, daily_reminder, daily_reminder_time } =
        req.body;

      let settings = await NotificationSettings.findOne({
        where: { user_id: userId },
      });

      if (!settings) {
        settings = await NotificationSettings.create({ user_id: userId });
      }

      const updates = {};
      if (enabled !== undefined) updates.enabled = enabled;
      if (reminder_time !== undefined) updates.reminder_time = reminder_time;
      if (daily_reminder !== undefined) updates.daily_reminder = daily_reminder;
      if (daily_reminder_time !== undefined)
        updates.daily_reminder_time = daily_reminder_time;

      await settings.update(updates);

      res.json({
        success: true,
        data: settings,
        message: "Notification settings updated successfully",
      });
    } catch (error) {
      next(error);
    }
  });

  // Theme settings
  router.get("/theme", async (req, res, next) => {
    try {
      const userId = req.user.id;

      let settings = await ThemeSettings.findOne({
        where: { user_id: userId },
      });

      if (!settings) {
        settings = await ThemeSettings.create({ user_id: userId });
      }

      res.json({
        success: true,
        data: settings,
        message: "Theme settings retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  });

  router.put("/theme", async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { theme } = req.body;

      let settings = await ThemeSettings.findOne({
        where: { user_id: userId },
      });

      if (!settings) {
        settings = await ThemeSettings.create({ user_id: userId });
      }

      if (theme !== undefined) {
        await settings.update({ theme });
      }

      res.json({
        success: true,
        data: settings,
        message: "Theme settings updated successfully",
      });
    } catch (error) {
      next(error);
    }
  });
} catch (error) {
  console.error("Error loading settings models:", error.message);

  router.get("/notifications", (req, res) => {
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Settings service temporarily unavailable",
      },
    });
  });

  router.get("/theme", (req, res) => {
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Settings service temporarily unavailable",
      },
    });
  });
}

module.exports = router;
