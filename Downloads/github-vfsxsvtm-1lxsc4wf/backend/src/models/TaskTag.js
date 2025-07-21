const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TaskTag = sequelize.define(
  "TaskTag",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    task_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "tasks",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    tag: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "task_tags",
    indexes: [
      { fields: ["task_id"] },
      { fields: ["tag"] },
      {
        unique: true,
        fields: ["task_id", "tag"],
        name: "unique_task_tag",
      },
    ],
  },
);

module.exports = TaskTag;
