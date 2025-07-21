import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import {
  MoreVertical,
  ChevronDown,
  Check,
  Edit,
  Trash2,
  Flag,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  Settings,
  BarChart3,
  CalendarDays,
} from "lucide-react-native";
import { useTask } from "../contexts/TaskContext";
import { useTheme } from "../contexts/ThemeContext";
import TaskFormModal from "./TaskFormModal";

interface UpcomingScreenProps {
  onNavigate?: (screen: string) => void;
}

const UpcomingScreen = ({ onNavigate }: UpcomingScreenProps) => {
  const { tasks, toggleTaskComplete, deleteTask } = useTask();
  const { colors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingTask, setEditingTask] = useState<any>(undefined);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Get upcoming tasks (excluding today)
  const upcomingTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    return tasks
      .filter((task) => {
        const taskDate = task.startDate || task.dueDate;
        return taskDate && taskDate >= todayStr;
      })
      .sort((a, b) => {
        const dateA = a.startDate || a.dueDate || "";
        const dateB = b.startDate || b.dueDate || "";
        return dateA.localeCompare(dateB);
      });
  }, [tasks]);

  // Group tasks by date
  const groupedTasks = useMemo(() => {
    const groups: { [key: string]: typeof tasks } = {};
    upcomingTasks.forEach((task) => {
      const date = task.startDate || task.dueDate || "";
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(task);
    });
    return groups;
  }, [upcomingTasks]);

  // Generate calendar dates for current month
  const calendarDates = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Start from Monday

    const dates = [];
    for (let i = 0; i < 35; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate]);

  const handleDeleteTask = (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTask(taskId),
      },
    ]);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Sử dụng logic ngày chính xác tương tự getTasksForDate
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const localDate = new Date(year, month, day);
    const dateStr = localDate.toISOString().split("T")[0];
    
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    const todayLocalDate = new Date(todayYear, todayMonth, todayDay);
    const todayStr = todayLocalDate.toISOString().split("T")[0];
    
    const tomorrowYear = tomorrow.getFullYear();
    const tomorrowMonth = tomorrow.getMonth();
    const tomorrowDay = tomorrow.getDate();
    const tomorrowLocalDate = new Date(tomorrowYear, tomorrowMonth, tomorrowDay);
    const tomorrowStr = tomorrowLocalDate.toISOString().split("T")[0];

    if (dateStr === todayStr) {
      return `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "short" })} • Today • ${date.toLocaleDateString("en-US", { weekday: "long" })}`;
    } else if (dateStr === tomorrowStr) {
      return `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "short" })} • Tomorrow • ${date.toLocaleDateString("en-US", { weekday: "long" })}`;
    } else {
      return `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "short" })} • ${date.toLocaleDateString("en-US", { weekday: "long" })}`;
    }
  };

  const getTasksForDate = (date: Date) => {
    // Sử dụng timezone offset để đảm bảo ngày chính xác
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // Tạo ngày mới với timezone local
    const localDate = new Date(year, month, day);
    const dateStr = localDate.toISOString().split("T")[0];
    
    return tasks.filter((task) => {
      const taskDate = task.startDate || task.dueDate;
      return taskDate === dateStr;
    }).length;
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="px-4 py-4 border-b"
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>
              Upcoming
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {upcomingTasks.length} upcoming tasks
            </Text>
          </View>
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity onPress={() => onNavigate?.("calendar")}>
              <CalendarDays size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onNavigate?.("statistics")}>
              <BarChart3 size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onNavigate?.("settings")}>
              <Settings size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Month Selector */}
        <View className="px-4 py-4" style={{ backgroundColor: colors.surface }}>
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => navigateMonth(-1)}>
              <ChevronLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth(1)}>
              <ChevronRight size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Mini Calendar */}
          <View className="mt-4">
            <View className="flex-row justify-between mb-2">
              {weekDays.map((day, index) => (
                <Text
                  key={index}
                  className="text-sm font-medium w-8 text-center"
                  style={{ color: colors.textSecondary }}
                >
                  {day}
                </Text>
              ))}
            </View>

            <View className="flex-wrap flex-row">
              {calendarDates.slice(0, 35).map((date, index) => {
                const isCurrentMonth =
                  date.getMonth() === currentDate.getMonth();
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // Sử dụng logic ngày chính xác tương tự getTasksForDate
                const year = date.getFullYear();
                const month = date.getMonth();
                const day = date.getDate();
                const localDate = new Date(year, month, day);
                const dateStr = localDate.toISOString().split("T")[0];
                
                const todayYear = today.getFullYear();
                const todayMonth = today.getMonth();
                const todayDay = today.getDate();
                const todayLocalDate = new Date(todayYear, todayMonth, todayDay);
                const todayStr = todayLocalDate.toISOString().split("T")[0];
                
                const isToday = dateStr === todayStr;
                const taskCount = getTasksForDate(date);

                return (
                  <View
                    key={index}
                    className="w-8 h-8 items-center justify-center mb-2"
                    style={{ width: "14.28%" }}
                  >
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: isToday
                          ? colors.primary
                          : "transparent",
                      }}
                    >
                      <Text
                        className="text-sm font-medium"
                        style={{
                          color: isToday
                            ? "white"
                            : isCurrentMonth
                              ? colors.text
                              : colors.textSecondary,
                        }}
                      >
                        {date.getDate()}
                      </Text>
                    </View>
                    {taskCount > 0 && (
                      <View
                        className="w-1 h-1 rounded-full mt-1"
                        style={{ backgroundColor: colors.primary }}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Tasks */}
        <View className="px-4 py-4">
          {Object.keys(groupedTasks).length === 0 ? (
            <View
              className="rounded-lg p-6 items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text
                className="text-center"
                style={{ color: colors.textSecondary }}
              >
                No upcoming tasks. All caught up! 🎉
              </Text>
            </View>
          ) : (
            Object.entries(groupedTasks).map(([date, dateTasks]) => (
              <View key={date} className="mb-6">
                <Text
                  className="text-lg font-bold mb-3"
                  style={{ color: colors.text }}
                >
                  {formatDate(date)}
                </Text>

                {dateTasks.map((task) => (
                  <View
                    key={task.id}
                    className="rounded-lg p-4 mb-3 shadow-sm"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View className="flex-row items-start">
                      <TouchableOpacity
                        className={`w-6 h-6 rounded-full border-2 mr-3 mt-1 items-center justify-center ${
                          task.isCompleted
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300"
                        }`}
                        onPress={() => toggleTaskComplete(task.id)}
                      >
                        {task.isCompleted && <Check size={16} color="white" />}
                      </TouchableOpacity>

                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text
                            className={`text-base font-medium ${
                              task.isCompleted ? "line-through" : ""
                            }`}
                            style={{
                              color: task.isCompleted
                                ? colors.textSecondary
                                : colors.text,
                            }}
                          >
                            {task.title}
                          </Text>
                          <Flag
                            size={14}
                            color={getPriorityColor(task.priority)}
                            className="ml-2"
                          />
                        </View>

                        {task.description && (
                          <Text
                            className="text-sm mb-2"
                            style={{ color: colors.textSecondary }}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {task.description}
                          </Text>
                        )}

                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Text
                              className="text-xs mr-3"
                              style={{ color: colors.textSecondary }}
                            >
                              {task.category}
                            </Text>

                            {task.dueDate &&
                              task.dueDate !== task.startDate && (
                                <View className="flex-row items-center mr-3">
                                  <Calendar
                                    size={12}
                                    color={colors.textSecondary}
                                  />
                                  <Text
                                    className="text-xs ml-1"
                                    style={{ color: colors.textSecondary }}
                                  >
                                    Due: {task.dueDate}
                                  </Text>
                                </View>
                              )}

                            {task.tags.length > 0 && (
                              <View className="flex-row items-center">
                                <Tag size={12} color={colors.textSecondary} />
                                <Text
                                  className="text-xs ml-1"
                                  style={{ color: colors.textSecondary }}
                                >
                                  {task.tags.slice(0, 2).join(", ")}
                                </Text>
                              </View>
                            )}
                          </View>

                          <View className="flex-row items-center">
                            <TouchableOpacity
                              className="p-2 mr-1"
                              onPress={() => handleEditTask(task)}
                            >
                              <Edit size={16} color={colors.textSecondary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                              className="p-2"
                              onPress={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 size={16} color={colors.textSecondary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Task Form Modal */}
      <TaskFormModal
        visible={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(undefined);
        }}
        task={editingTask}
        isEditing={!!editingTask}
      />
    </View>
  );
};

export default UpcomingScreen;
