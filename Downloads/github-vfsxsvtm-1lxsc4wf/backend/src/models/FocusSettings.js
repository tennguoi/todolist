const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FocusSettings = sequelize.define(
  "FocusSettings",
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
    work_duration: {
      type: DataTypes.INTEGER,
      defaultValue: 25,
    },
    short_break_duration: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    long_break_duration: {
      type: DataTypes.INTEGER,
      defaultValue: 15,
    },
    sessions_until_long_break: {
      type: DataTypes.INTEGER,
      defaultValue: 4,
    },
    sound_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "focus_settings",
  },
);

module.exports = FocusSettings;
