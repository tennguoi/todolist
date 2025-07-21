import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import {
  Play,
  Pause,
  Square,
  Settings,
  ArrowLeft,
  Clock,
  Coffee,
  Target,
  BarChart3,
} from "lucide-react-native";
import { useTask, Task } from "../contexts/TaskContext";
import { useTheme } from "../contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FocusSessionProps {
  onBack?: () => void;
}

interface FocusSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
}

interface FocusStats {
  totalSessions: number;
  todaySessions: number;
  weekSessions: number;
  totalFocusTime: number; // in minutes
  lastSessionDate: string;
}

type SessionType = "work" | "shortBreak" | "longBreak";

const FocusSession = ({ onBack }: FocusSessionProps) => {
  const { tasks } = useTask();
  const { colors } = useTheme();
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [sessionType, setSessionType] = useState<SessionType>("work");
  const [completedSessions, setCompletedSessions] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [settings, setSettings] = useState<FocusSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
  });
  const [stats, setStats] = useState<FocusStats>({
    totalSessions: 0,
    todaySessions: 0,
    weekSessions: 0,
    totalFocusTime: 0,
    lastSessionDate: new Date().toISOString().split("T")[0],
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<any>(null);

  useEffect(() => {
    loadSettings();
    loadStats();
    loadSound();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const loadSound = async () => {
    // Sound functionality disabled - expo-av not available
  };

  const playNotificationSound = async () => {
    if (settings.soundEnabled) {
      // Sound functionality disabled - expo-av not available
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("focusSettings");
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        setTimeLeft(parsedSettings.workDuration * 60);
      }
    } catch (error) {
      // Use default settings if storage fails
      setTimeLeft(25 * 60);
    }
  };

  const saveSettings = async (newSettings: FocusSettings) => {
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem("focusSettings", JSON.stringify(newSettings));
    } catch (error) {
      // Continue with in-memory settings if storage fails
    }
  };

  const loadStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem("focusStats");
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        setStats(parsedStats);
      }
    } catch (error) {
      // Use default stats if storage fails
    }
  };

  const saveStats = async (newStats: FocusStats) => {
    setStats(newStats);
    try {
      await AsyncStorage.setItem("focusStats", JSON.stringify(newStats));
    } catch (error) {
      // Continue with in-memory stats if storage fails
    }
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    await playNotificationSound();

    if (sessionType === "work") {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);

      // Update stats
      const today = new Date().toISOString().split("T")[0];
      const newStats = {
        ...stats,
        totalSessions: stats.totalSessions + 1,
        todaySessions:
          stats.lastSessionDate === today ? stats.todaySessions + 1 : 1,
        totalFocusTime: stats.totalFocusTime + settings.workDuration,
        lastSessionDate: today,
      };
      await saveStats(newStats);

      // Determine next session type
      if (newCompletedSessions % settings.sessionsUntilLongBreak === 0) {
        setSessionType("longBreak");
        setTimeLeft(settings.longBreakDuration * 60);
        Alert.alert("Work Session Complete!", "Time for a long break!");
      } else {
        setSessionType("shortBreak");
        setTimeLeft(settings.shortBreakDuration * 60);
        Alert.alert("Work Session Complete!", "Time for a short break!");
      }
    } else {
      setSessionType("work");
      setTimeLeft(settings.workDuration * 60);
      Alert.alert("Break Complete!", "Ready for another work session?");
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCompletedSessions(0);
    setSessionType("work");
    setTimeLeft(settings.workDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getSessionTitle = () => {
    switch (sessionType) {
      case "work":
        return "Focus Session";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
      default:
        return "Focus Session";
    }
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case "work":
        return colors.primary;
      case "shortBreak":
        return "#10B981";
      case "longBreak":
        return "#3B82F6";
      default:
        return colors.primary;
    }
  };

  const getProgressPercentage = () => {
    const totalTime =
      sessionType === "work"
        ? settings.workDuration * 60
        : sessionType === "shortBreak"
          ? settings.shortBreakDuration * 60
          : settings.longBreakDuration * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const incompleteTasks = tasks.filter((task) => !task.isCompleted);

  const renderCircularProgress = () => {
    const { width } = Dimensions.get("window");
    const size = width * 0.6;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = getProgressPercentage();
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View
        className="items-center justify-center"
        style={{ width: size, height: size }}
      >
        <View
          className="absolute rounded-full border-4"
          style={{
            width: size,
            height: size,
            borderColor: colors.border,
          }}
        />
        <View
          className="absolute rounded-full border-4"
          style={{
            width: size,
            height: size,
            borderColor: getSessionColor(),
            transform: [{ rotate: "-90deg" }],
            borderTopColor: getSessionColor(),
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            borderLeftColor: "transparent",
          }}
        />
        <View className="absolute items-center justify-center">
          <Text className="text-4xl font-bold" style={{ color: colors.text }}>
            {formatTime(timeLeft)}
          </Text>
          <Text
            className="text-lg mt-2"
            style={{ color: colors.textSecondary }}
          >
            {getSessionTitle()}
          </Text>
          {selectedTask && (
            <Text
              className="text-sm mt-1 text-center px-4"
              style={{ color: colors.textSecondary }}
            >
              Working on: {selectedTask.title}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="px-4 py-4 border-b flex-row items-center justify-between"
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={onBack} className="p-2">
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          Focus Session
        </Text>
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => setShowStats(true)}
            className="p-2 mr-2"
          >
            <BarChart3 size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            className="p-2"
          >
            <Settings size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Dashboard Overview */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>
            Dashboard
          </Text>
          <View className="flex-row space-x-3">
            <View 
              className="flex-1 p-3 rounded-lg items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                {stats.todaySessions}
              </Text>
              <Text className="text-xs text-center" style={{ color: colors.textSecondary }}>
                Today
              </Text>
            </View>
            <View 
              className="flex-1 p-3 rounded-lg items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                {stats.totalSessions}
              </Text>
              <Text className="text-xs text-center" style={{ color: colors.textSecondary }}>
                Total
              </Text>
            </View>
            <View 
              className="flex-1 p-3 rounded-lg items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                {Math.floor(stats.totalFocusTime / 60)}h
              </Text>
              <Text className="text-xs text-center" style={{ color: colors.textSecondary }}>
                Focus Time
              </Text>
            </View>
            <View 
              className="flex-1 p-3 rounded-lg items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                {incompleteTasks.length}
              </Text>
              <Text className="text-xs text-center" style={{ color: colors.textSecondary }}>
                Tasks Left
              </Text>
            </View>
          </View>
        </View>

        {/* Session Info */}
        <View className="items-center mb-6">
          <Text
            className="text-lg mb-2"
            style={{ color: colors.textSecondary }}
          >
            Session {completedSessions + 1} of {settings.sessionsUntilLongBreak}
          </Text>
          <View className="flex-row items-center">
            {Array.from({ length: settings.sessionsUntilLongBreak }).map(
              (_, index) => (
                <View
                  key={index}
                  className="w-3 h-3 rounded-full mx-1"
                  style={{
                    backgroundColor:
                      index <
                      completedSessions % settings.sessionsUntilLongBreak
                        ? getSessionColor()
                        : colors.border,
                  }}
                />
              ),
            )}
          </View>
        </View>

        {/* Timer Display */}
        <View className="items-center mb-8">{renderCircularProgress()}</View>

        {/* Task Selection */}
        <TouchableOpacity
          className="rounded-lg p-4 mb-6 flex-row items-center justify-between"
          style={{ backgroundColor: colors.surface }}
          onPress={() => setShowTaskSelector(true)}
        >
          <View className="flex-row items-center flex-1">
            <Target size={20} color={colors.textSecondary} />
            <View className="ml-3 flex-1">
              <Text className="font-medium" style={{ color: colors.text }}>
                {selectedTask ? selectedTask.title : "Select a task"}
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                {selectedTask ? "Tap to change" : "Link this session to a task"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Control Buttons */}
        <View className="flex-row justify-center space-x-4">
          <TouchableOpacity
            className="rounded-full p-4"
            style={{ backgroundColor: getSessionColor() }}
            onPress={isRunning ? pauseTimer : startTimer}
          >
            {isRunning ? (
              <Pause size={32} color="white" />
            ) : (
              <Play size={32} color="white" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-full p-4"
            style={{ backgroundColor: colors.textSecondary }}
            onPress={resetTimer}
          >
            <Square size={32} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Task Selector Modal */}
      <Modal visible={showTaskSelector} animationType="slide" transparent>
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View
            className="rounded-t-3xl p-6 max-h-96"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                Select Task
              </Text>
              <TouchableOpacity onPress={() => setShowTaskSelector(false)}>
                <Text style={{ color: colors.primary }}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <TouchableOpacity
                className="p-3 rounded-lg mb-2"
                style={{
                  backgroundColor: !selectedTask
                    ? colors.primary + "20"
                    : "transparent",
                }}
                onPress={() => {
                  setSelectedTask(null);
                  setShowTaskSelector(false);
                }}
              >
                <Text style={{ color: colors.text }}>No task selected</Text>
              </TouchableOpacity>

              {incompleteTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  className="p-3 rounded-lg mb-2"
                  style={{
                    backgroundColor:
                      selectedTask?.id === task.id
                        ? colors.primary + "20"
                        : "transparent",
                  }}
                  onPress={() => {
                    setSelectedTask(task);
                    setShowTaskSelector(false);
                  }}
                >
                  <Text className="font-medium" style={{ color: colors.text }}>
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text
                      className="text-sm mt-1"
                      style={{ color: colors.textSecondary }}
                    >
                      {task.description}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" transparent>
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                Focus Settings
              </Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Text style={{ color: colors.primary }}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View className="space-y-4">
                <View>
                  <Text
                    className="font-medium mb-2"
                    style={{ color: colors.text }}
                  >
                    Work Duration: {settings.workDuration} minutes
                  </Text>
                  <View className="flex-row space-x-2">
                    {[15, 25, 30, 45, 60].map((duration) => (
                      <TouchableOpacity
                        key={duration}
                        className="px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor:
                            settings.workDuration === duration
                              ? colors.primary
                              : colors.border,
                        }}
                        onPress={() => {
                          const newSettings = {
                            ...settings,
                            workDuration: duration,
                          };
                          saveSettings(newSettings);
                          if (sessionType === "work") {
                            setTimeLeft(duration * 60);
                          }
                        }}
                      >
                        <Text
                          style={{
                            color:
                              settings.workDuration === duration
                                ? "white"
                                : colors.text,
                          }}
                        >
                          {duration}m
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text
                    className="font-medium mb-2"
                    style={{ color: colors.text }}
                  >
                    Short Break: {settings.shortBreakDuration} minutes
                  </Text>
                  <View className="flex-row space-x-2">
                    {[3, 5, 10, 15].map((duration) => (
                      <TouchableOpacity
                        key={duration}
                        className="px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor:
                            settings.shortBreakDuration === duration
                              ? colors.primary
                              : colors.border,
                        }}
                        onPress={() => {
                          const newSettings = {
                            ...settings,
                            shortBreakDuration: duration,
                          };
                          saveSettings(newSettings);
                        }}
                      >
                        <Text
                          style={{
                            color:
                              settings.shortBreakDuration === duration
                                ? "white"
                                : colors.text,
                          }}
                        >
                          {duration}m
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text
                    className="font-medium mb-2"
                    style={{ color: colors.text }}
                  >
                    Long Break: {settings.longBreakDuration} minutes
                  </Text>
                  <View className="flex-row space-x-2">
                    {[15, 20, 30, 45].map((duration) => (
                      <TouchableOpacity
                        key={duration}
                        className="px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor:
                            settings.longBreakDuration === duration
                              ? colors.primary
                              : colors.border,
                        }}
                        onPress={() => {
                          const newSettings = {
                            ...settings,
                            longBreakDuration: duration,
                          };
                          saveSettings(newSettings);
                        }}
                      >
                        <Text
                          style={{
                            color:
                              settings.longBreakDuration === duration
                                ? "white"
                                : colors.text,
                          }}
                        >
                          {duration}m
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text
                    className="font-medium mb-2"
                    style={{ color: colors.text }}
                  >
                    Sessions until long break: {settings.sessionsUntilLongBreak}
                  </Text>
                  <View className="flex-row space-x-2">
                    {[2, 3, 4, 5, 6].map((count) => (
                      <TouchableOpacity
                        key={count}
                        className="px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor:
                            settings.sessionsUntilLongBreak === count
                              ? colors.primary
                              : colors.border,
                        }}
                        onPress={() => {
                          const newSettings = {
                            ...settings,
                            sessionsUntilLongBreak: count,
                          };
                          saveSettings(newSettings);
                        }}
                      >
                        <Text
                          style={{
                            color:
                              settings.sessionsUntilLongBreak === count
                                ? "white"
                                : colors.text,
                          }}
                        >
                          {count}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  className="flex-row items-center justify-between p-4 rounded-lg"
                  style={{ backgroundColor: colors.background }}
                  onPress={() => {
                    const newSettings = {
                      ...settings,
                      soundEnabled: !settings.soundEnabled,
                    };
                    saveSettings(newSettings);
                  }}
                >
                  <Text style={{ color: colors.text }}>Notification Sound</Text>
                  <View
                    className="w-12 h-6 rounded-full p-1"
                    style={{
                      backgroundColor: settings.soundEnabled
                        ? colors.primary
                        : colors.border,
                    }}
                  >
                    <View
                      className="w-4 h-4 rounded-full bg-white"
                      style={{
                        transform: [
                          { translateX: settings.soundEnabled ? 20 : 0 },
                        ],
                      }}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Statistics Modal */}
      <Modal visible={showStats} animationType="slide" transparent>
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                Focus Statistics
              </Text>
              <TouchableOpacity onPress={() => setShowStats(false)}>
                <Text style={{ color: colors.primary }}>Done</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View
                className="p-4 rounded-lg"
                style={{ backgroundColor: colors.background }}
              >
                <Text
                  className="text-2xl font-bold"
                  style={{ color: colors.text }}
                >
                  {stats.todaySessions}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  Sessions Today
                </Text>
              </View>

              <View
                className="p-4 rounded-lg"
                style={{ backgroundColor: colors.background }}
              >
                <Text
                  className="text-2xl font-bold"
                  style={{ color: colors.text }}
                >
                  {stats.totalSessions}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  Total Sessions
                </Text>
              </View>

              <View
                className="p-4 rounded-lg"
                style={{ backgroundColor: colors.background }}
              >
                <Text
                  className="text-2xl font-bold"
                  style={{ color: colors.text }}
                >
                  {Math.floor(stats.totalFocusTime / 60)}h{" "}
                  {stats.totalFocusTime % 60}m
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  Total Focus Time
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FocusSession;
