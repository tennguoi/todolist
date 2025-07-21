const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "projects",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      defaultValue: "Personal",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium",
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_recurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    recurring_type: {
      type: DataTypes.ENUM("daily", "weekly", "monthly"),
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "tasks",
    indexes: [
      { fields: ["user_id"] },
      { fields: ["start_date", "due_date"] },
      { fields: ["is_completed"] },
      { fields: ["priority"] },
    ],
  },
);

module.exports = Task;
