const { Project, Task } = require("../models");
const sequelize = require("../config/database");

const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const projects = await Project.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Task,
          as: "tasks",
          attributes: ["id", "is_completed"],
          required: false,
        },
      ],
      order: [["created_at", "ASC"]],
    });

    // Transform projects to match React Native app format
    const transformedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      color: project.color,
      taskCount: project.tasks.filter((task) => !task.is_completed).length,
    }));

    res.json({
      success: true,
      data: transformedProjects,
      message: "Projects retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, color = "#3B82F6" } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_NAME",
          message: "Project name is required",
        },
      });
    }

    const project = await Project.create({
      user_id: userId,
      name,
      color,
    });

    const transformedProject = {
      id: project.id,
      name: project.name,
      color: project.color,
      taskCount: 0,
    };

    res.status(201).json({
      success: true,
      data: transformedProject,
      message: "Project created successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    const { name, color } = req.body;

    const project = await Project.findOne({
      where: { id: projectId, user_id: userId },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PROJECT_NOT_FOUND",
          message: "Project not found",
        },
      });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (color !== undefined) updates.color = color;

    await project.update(updates);

    // Get task count
    const taskCount = await Task.count({
      where: {
        project_id: projectId,
        is_completed: false,
      },
    });

    const transformedProject = {
      id: project.id,
      name: project.name,
      color: project.color,
      taskCount,
    };

    res.json({
      success: true,
      data: transformedProject,
      message: "Project updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    const project = await Project.findOne({
      where: { id: projectId, user_id: userId },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PROJECT_NOT_FOUND",
          message: "Project not found",
        },
      });
    }

    // Update tasks to remove project reference (tasks won't be deleted)
    await Task.update(
      { project_id: null },
      { where: { project_id: projectId } },
    );

    await project.destroy();

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getProjectTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    // Verify project belongs to user
    const project = await Project.findOne({
      where: { id: projectId, user_id: userId },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PROJECT_NOT_FOUND",
          message: "Project not found",
        },
      });
    }

    const tasks = await Task.findAll({
      where: { project_id: projectId },
      include: [
        {
          model: TaskTag,
          as: "tags",
          attributes: ["tag"],
        },
      ],
      order: [["created_at", "DESC"]],
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
    }));

    res.json({
      success: true,
      data: transformedTasks,
      message: "Project tasks retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectTasks,
};
