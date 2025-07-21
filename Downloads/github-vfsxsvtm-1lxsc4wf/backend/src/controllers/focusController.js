const { FocusSession, FocusSettings, Task } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

const getFocusSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date, limit = 50, offset = 0 } = req.query;

    const where = { user_id: userId };

    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.started_at = {
        [Op.between]: [startOfDay, endOfDay],
      };
    }

    const sessions = await FocusSession.findAll({
      where,
      include: [
        {
          model: Task,
          as: "task",
          attributes: ["id", "title"],
        },
      ],
      order: [["started_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: sessions,
      message: "Focus sessions retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

const createFocusSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { task_id, session_type = "work", duration_minutes } = req.body;

    if (!duration_minutes) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_DURATION",
          message: "Session duration is required",
        },
      });
    }

    // Verify task belongs to user if task_id is provided
    if (task_id) {
      const task = await Task.findOne({
        where: { id: task_id, user_id: userId },
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TASK_NOT_FOUND",
            message: "Task not found",
          },
        });
      }
    }

    const session = await FocusSession.create({
      user_id: userId,
      task_id,
      session_type,
      duration_minutes,
    });

    // Fetch created session with task details
    const createdSession = await FocusSession.findByPk(session.id, {
      include: [
        {
          model: Task,
          as: "task",
          attributes: ["id", "title"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: createdSession,
      message: "Focus session created successfully",
    });
  } catch (error) {
    next(error);
  }
};

const completeFocusSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { completed_at } = req.body;

    const session = await FocusSession.findOne({
      where: { id: sessionId, user_id: userId },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: "SESSION_NOT_FOUND",
          message: "Focus session not found",
        },
      });
    }

    await session.update({
      completed: true,
      completed_at: completed_at || new Date(),
    });

    // Fetch updated session with task details
    const updatedSession = await FocusSession.findByPk(sessionId, {
      include: [
        {
          model: Task,
          as: "task",
          attributes: ["id", "title"],
        },
      ],
    });

    res.json({
      success: true,
      data: updatedSession,
      message: "Focus session completed successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getFocusStatistics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      totalSessions,
      todaySessions,
      weekSessions,
      totalFocusTime,
      lastSession,
    ] = await Promise.all([
      FocusSession.count({
        where: {
          user_id: userId,
          completed: true,
          session_type: "work",
        },
      }),
      FocusSession.count({
        where: {
          user_id: userId,
          completed: true,
          session_type: "work",
          started_at: { [Op.gte]: startOfToday },
        },
      }),
      FocusSession.count({
        where: {
          user_id: userId,
          completed: true,
          session_type: "work",
          started_at: { [Op.gte]: startOfWeek },
        },
      }),
      FocusSession.sum("duration_minutes", {
        where: {
          user_id: userId,
          completed: true,
          session_type: "work",
        },
      }),
      FocusSession.findOne({
        where: {
          user_id: userId,
          completed: true,
        },
        order: [["completed_at", "DESC"]],
        attributes: ["completed_at"],
      }),
    ]);

    const averageSessionLength =
      totalSessions > 0 ? Math.round(totalFocusTime / totalSessions) : 0;
    const lastSessionDate = lastSession
      ? lastSession.completed_at.toISOString().split("T")[0]
      : null;

    res.json({
      success: true,
      data: {
        total_sessions: totalSessions,
        today_sessions: todaySessions,
        week_sessions: weekSessions,
        total_focus_time: totalFocusTime || 0,
        average_session_length: averageSessionLength,
        last_session_date: lastSessionDate,
      },
      message: "Focus statistics retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getFocusSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let settings = await FocusSettings.findOne({
      where: { user_id: userId },
    });

    if (!settings) {
      // Create default settings if they don't exist
      settings = await FocusSettings.create({ user_id: userId });
    }

    // Transform to match React Native app format
    const transformedSettings = {
      workDuration: settings.work_duration,
      shortBreakDuration: settings.short_break_duration,
      longBreakDuration: settings.long_break_duration,
      sessionsUntilLongBreak: settings.sessions_until_long_break,
      soundEnabled: settings.sound_enabled,
    };

    res.json({
      success: true,
      data: transformedSettings,
      message: "Focus settings retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateFocusSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      workDuration,
      shortBreakDuration,
      longBreakDuration,
      sessionsUntilLongBreak,
      soundEnabled,
    } = req.body;

    let settings = await FocusSettings.findOne({
      where: { user_id: userId },
    });

    if (!settings) {
      settings = await FocusSettings.create({ user_id: userId });
    }

    const updates = {};
    if (workDuration !== undefined) updates.work_duration = workDuration;
    if (shortBreakDuration !== undefined)
      updates.short_break_duration = shortBreakDuration;
    if (longBreakDuration !== undefined)
      updates.long_break_duration = longBreakDuration;
    if (sessionsUntilLongBreak !== undefined)
      updates.sessions_until_long_break = sessionsUntilLongBreak;
    if (soundEnabled !== undefined) updates.sound_enabled = soundEnabled;

    await settings.update(updates);

    // Transform to match React Native app format
    const transformedSettings = {
      workDuration: settings.work_duration,
      shortBreakDuration: settings.short_break_duration,
      longBreakDuration: settings.long_break_duration,
      sessionsUntilLongBreak: settings.sessions_until_long_break,
      soundEnabled: settings.sound_enabled,
    };

    res.json({
      success: true,
      data: transformedSettings,
      message: "Focus settings updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFocusSessions,
  createFocusSession,
  completeFocusSession,
  getFocusStatistics,
  getFocusSettings,
  updateFocusSettings,
};
