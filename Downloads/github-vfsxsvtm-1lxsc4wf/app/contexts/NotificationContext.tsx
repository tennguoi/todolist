import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Dynamically import notifications to handle cases where it might not be available
let Notifications: any = null;
try {
  Notifications = require("expo-notifications");
} catch (error) {
  console.warn("expo-notifications not available:", error);
}

// Configure notifications if available
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

interface NotificationSettings {
  enabled: boolean;
  reminderTime: number; // minutes before due date
  dailyReminder: boolean;
  dailyReminderTime: string; // HH:MM format
}

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  scheduleTaskReminder: (
    taskId: string,
    title: string,
    dueDate: string,
  ) => Promise<void>;
  cancelTaskReminder: (taskId: string) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  reminderTime: 60, // 1 hour before
  dailyReminder: true,
  dailyReminderTime: "09:00",
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] =
    useState<NotificationSettings>(defaultSettings);

  useEffect(() => {
    loadSettings();
    requestPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("notificationSettings");
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await AsyncStorage.setItem(
        "notificationSettings",
        JSON.stringify(updatedSettings),
      );
      setSettings(updatedSettings);
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (!Notifications) {
      console.warn("Notifications not available");
      return false;
    }

    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return false;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  };

  const scheduleTaskReminder = async (
    taskId: string,
    title: string,
    dueDate: string,
  ): Promise<void> => {
    if (!settings.enabled || !Notifications) return;

    try {
      const dueDateTime = new Date(dueDate);
      const reminderTime = new Date(
        dueDateTime.getTime() - settings.reminderTime * 60 * 1000,
      );

      if (reminderTime > new Date()) {
        await Notifications.scheduleNotificationAsync({
          identifier: `task-${taskId}`,
          content: {
            title: "Task Reminder",
            body: `"${title}" is due soon!`,
            data: { taskId },
          },
          trigger: {
            date: reminderTime,
          },
        });
      }
    } catch (error) {
      console.error("Error scheduling task reminder:", error);
    }
  };

  const cancelTaskReminder = async (taskId: string): Promise<void> => {
    if (!Notifications) return;

    try {
      await Notifications.cancelScheduledNotificationAsync(`task-${taskId}`);
    } catch (error) {
      console.error("Error canceling task reminder:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        settings,
        updateSettings,
        scheduleTaskReminder,
        cancelTaskReminder,
        requestPermissions,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
