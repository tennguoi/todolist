const User = require("./User");
const Project = require("./Project");
const Task = require("./Task");
const TaskTag = require("./TaskTag");
const FocusSession = require("./FocusSession");
const FocusSettings = require("./FocusSettings");
const NotificationSettings = require("./NotificationSettings");
const ThemeSettings = require("./ThemeSettings");

// Define associations
User.hasMany(Project, { foreignKey: "user_id", as: "projects" });
Project.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(Task, { foreignKey: "user_id", as: "tasks" });
Task.belongsTo(User, { foreignKey: "user_id", as: "user" });

Project.hasMany(Task, { foreignKey: "project_id", as: "tasks" });
Task.belongsTo(Project, { foreignKey: "project_id", as: "project" });

Task.hasMany(TaskTag, { foreignKey: "task_id", as: "tags" });
TaskTag.belongsTo(Task, { foreignKey: "task_id", as: "task" });

User.hasMany(FocusSession, { foreignKey: "user_id", as: "focusSessions" });
FocusSession.belongsTo(User, { foreignKey: "user_id", as: "user" });

Task.hasMany(FocusSession, { foreignKey: "task_id", as: "focusSessions" });
FocusSession.belongsTo(Task, { foreignKey: "task_id", as: "task" });

User.hasOne(FocusSettings, { foreignKey: "user_id", as: "focusSettings" });
FocusSettings.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasOne(NotificationSettings, {
  foreignKey: "user_id",
  as: "notificationSettings",
});
NotificationSettings.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasOne(ThemeSettings, { foreignKey: "user_id", as: "themeSettings" });
ThemeSettings.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = {
  User,
  Project,
  Task,
  TaskTag,
  FocusSession,
  FocusSettings,
  NotificationSettings,
  ThemeSettings,
};
