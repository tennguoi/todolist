const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NotificationSettings = sequelize.define(
  "NotificationSettings",
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
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    reminder_time: {
      type: DataTypes.INTEGER,
      defaultValue: 60, // minutes
    },
    daily_reminder: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    daily_reminder_time: {
      type: DataTypes.TIME,
      defaultValue: "09:00:00",
    },
  },
  {
    tableName: "notification_settings",
  },
);

module.exports = NotificationSettings;
