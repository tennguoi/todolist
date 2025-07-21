const { Task, TaskTag, Project } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      completed,
      category,
      priority,
      project_id,
      start_date,
      due_date,
      search,
      limit = 50,
      offset = 0,
    } = req.query;

    const where = { user_id: userId };

    if (completed !== undefined) {
      where.is_completed = completed === "true";
    }

    if (category) {
      where.category = category;
    }

    if (priority) {
      where.priority = priority;
    }

    if (project_id) {
      where.project_id = project_id;
    }

    if (start_date) {
      where.start_date = { [Op.gte]: start_date };
    }

    if (due_date) {
      where.due_date = { [Op.lte]: due_date };
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: TaskTag,
          as: "tags",
          attributes: ["tag"],
        },
        {
          model: Project,
          as: "project",
          attributes: ["id", "name", "color"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Transform tasks to match React Native app format
    const transformedTasks = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      startDate: task.start_date,
      dueDate: task.due_date,
      category: task.category,
      priority: task.priority,
      isCompleted: task.is_completed,
      tags: task.tags.map((tag) => tag.tag),
      projectId: task.project_id,
      isRecurring: task.is_recurring,
      recurringType: task.recurring_type,
      createdAt: task.created_at,
      completedAt: task.completed_at,
      project: task.project,
    }));

    res.json({
      success: true,
      data: transformedTasks,
      message: "Tasks retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    const task = await Task.findOne({
      where: { id: taskId, user_id: userId },
      include: [
        {
          model: TaskTag,
          as: "tags",
          attributes: ["tag"],
        },
        {
          model: Project,
          as: "project",
          attributes: ["id", "name", "color"],
        },
      ],
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

    const transformedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      startDate: task.start_date,
      dueDate: task.due_date,
      category: task.category,
      priority: task.priority,
      isCompleted: task.is_completed,
      tags: task.tags.map((tag) => tag.tag),
      projectId: task.project_id,
      isRecurring: task.is_recurring,
      recurringType: task.recurring_type,
      createdAt: task.created_at,
      completedAt: task.completed_at,
      project: task.project,
    };

    res.json({
      success: true,
      data: transformedTask,
      message: "Task retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      startDate,
      dueDate,
      category = "Personal",
      priority = "medium",
      tags = [],
      projectId,
      isRecurring = false,
      recurringType,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_TITLE",
          message: "Task title is required",
        },
      });
    }

    const task = await Task.create({
      user_id: userId,
      title,
      description,
      start_date: startDate,
      due_date: dueDate,
      category,
      priority,
      project_id: projectId,
      is_recurring: isRecurring,
      recurring_type: recurringType,
    });

    // Add tags if provided
    if (tags.length > 0) {
      const taskTags = tags.map((tag) => ({
        task_id: task.id,
        tag,
      }));
      await TaskTag.bulkCreate(taskTags);
    }

    // Fetch the created task with associations
    const createdTask = await Task.findByPk(task.id, {
      include: [
        {
          model: TaskTag,
          as: "tags",
          attributes: ["tag"],
        },
        {
          model: Project,
          as: "project",
          attributes: ["id", "name", "color"],
        },
      ],
    });

    const transformedTask = {
      id: createdTask.id,
      title: createdTask.title,
      description: createdTask.description,
      startDate: createdTask.start_date,
      dueDate: createdTask.due_date,
      category: createdTask.category,
      priority: createdTask.priority,
      isCompleted: createdTask.is_completed,
      tags: createdTask.tags.map((tag) => tag.tag),
      projectId: createdTask.project_id,
      isRecurring: createdTask.is_recurring,
      recurringType: createdTask.recurring_type,
      createdAt: createdTask.created_at,
      completedAt: createdTask.completed_at,
      project: createdTask.project,
    };

    res.status(201).json({
      success: true,
      data: transformedTask,
      message: "Task created successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const updates = req.body;

    const task = await Task.findOne({
      where: { id: taskId, user_id: userId },
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

    // Map React Native field names to database field names
    const dbUpdates = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined)
      dbUpdates.description = updates.description;
    if (updates.startDate !== undefined)
      dbUpdates.start_date = updates.startDate;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.isCompleted !== undefined) {
      dbUpdates.is_completed = updates.isCompleted;
      // The completed_at field is handled by the toggle endpoint
    }
    if (updates.projectId !== undefined)
      dbUpdates.project_id = updates.projectId;
    if (updates.isRecurring !== undefined)
      dbUpdates.is_recurring = updates.isRecurring;
    if (updates.recurringType !== undefined)
      dbUpdates.recurring_type = updates.recurringType;
    if (updates.completedAt !== undefined)
      dbUpdates.completed_at = updates.completedAt;

    await task.update(dbUpdates);

    // Update tags if provided
    if (updates.tags !== undefined) {
      await TaskTag.destroy({ where: { task_id: taskId } });
      if (updates.tags.length > 0) {
        const taskTags = updates.tags.map((tag) => ({
          task_id: taskId,
          tag,
        }));
        await TaskTag.bulkCreate(taskTags);
      }
    }

    // Fetch updated task with associations
    const updatedTask = await Task.findByPk(taskId, {
      include: [
        {
          model: TaskTag,
          as: "tags",
          attributes: ["tag"],
        },
        {
          model: Project,
          as: "project",
          attributes: ["id", "name", "color"],
        },
      ],
    });

    const transformedTask = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      startDate: updatedTask.start_date,
      dueDate: updatedTask.due_date,
      category: updatedTask.category,
      priority: updatedTask.priority,
      isCompleted: updatedTask.is_completed,
      tags: updatedTask.tags.map((tag) => tag.tag),
      projectId: updatedTask.project_id,
      isRecurring: updatedTask.is_recurring,
      recurringType: updatedTask.recurring_type,
      createdAt: updatedTask.created_at,
      completedAt: updatedTask.completed_at,
      project: updatedTask.project,
    };

    res.json({
      success: true,
      data: transformedTask,
      message: "Task updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    const task = await Task.findOne({
      where: { id: taskId, user_id: userId },
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

    await task.destroy();

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const toggleTaskComplete = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    const task = await Task.findOne({
      where: { id: taskId, user_id: userId },
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

    const isCompleted = !task.is_completed;
    await task.update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date() : null,
    });

    // Fetch updated task with associations
    const updatedTask = await Task.findByPk(taskId, {
      include: [
        {
          model: TaskTag,
          as: "tags",
          attributes: ["tag"],
        },
        {
          model: Project,
          as: "project",
          attributes: ["id", "name", "color"],
        },
      ],
    });

    const transformedTask = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      startDate: updatedTask.start_date,
      dueDate: updatedTask.due_date,
      category: updatedTask.category,
      priority: updatedTask.priority,
      isCompleted: updatedTask.is_completed,
      tags: updatedTask.tags.map((tag) => tag.tag),
      projectId: updatedTask.project_id,
      isRecurring: updatedTask.is_recurring,
      recurringType: updatedTask.recurring_type,
      createdAt: updatedTask.created_at,
      completedAt: updatedTask.completed_at,
      project: updatedTask.project,
    };

    res.json({
      success: true,
      data: transformedTask,
      message: "Task completion status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getTaskStatistics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [totalTasks, completedTasks, overdueTasks] = await Promise.all([
      Task.count({ where: { user_id: userId } }),
      Task.count({ where: { user_id: userId, is_completed: true } }),
      Task.count({
        where: {
          user_id: userId,
          is_completed: false,
          due_date: { [Op.lt]: new Date() },
        },
      }),
    ]);

    const pendingTasks = totalTasks - completedTasks;

    // Get statistics by priority
    const priorityStats = await Task.findAll({
      where: { user_id: userId },
      attributes: [
        "priority",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["priority"],
      raw: true,
    });

    const byPriority = {};
    priorityStats.forEach((stat) => {
      byPriority[stat.priority] = parseInt(stat.count);
    });

    // Get statistics by category
    const categoryStats = await Task.findAll({
      where: { user_id: userId },
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["category"],
      raw: true,
    });

    const byCategory = {};
    categoryStats.forEach((stat) => {
      byCategory[stat.category] = parseInt(stat.count);
    });

    res.json({
      success: true,
      data: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        overdue: overdueTasks,
        by_priority: byPriority,
        by_category: byCategory,
      },
      message: "Task statistics retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  getTaskStatistics,
};
