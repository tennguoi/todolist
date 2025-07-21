const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Project = sequelize.define(
  "Project",
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: "#3B82F6",
      validate: {
        is: /^#[0-9A-F]{6}$/i,
      },
    },
  },
  {
    tableName: "projects",
    indexes: [
      {
        fields: ["user_id"],
      },
    ],
  },
);

module.exports = Project;
