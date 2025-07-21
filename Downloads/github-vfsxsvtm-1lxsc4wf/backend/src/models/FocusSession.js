const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FocusSession = sequelize.define(
  "FocusSession",
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
    task_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "tasks",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    session_type: {
      type: DataTypes.ENUM("work", "shortBreak", "longBreak"),
      defaultValue: "work",
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    started_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "focus_sessions",
    indexes: [
      { fields: ["user_id"] },
      { fields: ["started_at", "completed_at"] },
    ],
  },
);

module.exports = FocusSession;
