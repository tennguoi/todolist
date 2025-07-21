const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ThemeSettings = sequelize.define(
  "ThemeSettings",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    theme: {
      type: DataTypes.ENUM("light", "dark", "system"),
      defaultValue: "system",
    },
  },
  {
    tableName: "theme_settings",
  },
);

module.exports = ThemeSettings;
