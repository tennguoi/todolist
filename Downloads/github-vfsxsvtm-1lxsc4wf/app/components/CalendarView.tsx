import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Edit,
  Trash2,
  Flag,
  X,
} from "lucide-react-native";
import { useTask } from "../contexts/TaskContext";
import { useTheme } from "../contexts/ThemeContext";
import TaskFormModal from "./TaskFormModal";

interface CalendarViewProps {
  onBack: () => void;
}

const CalendarView = ({ onBack }: CalendarViewProps) => {
  const { tasks, toggleTaskComplete, deleteTask } = useTask();
  const { colors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);

  // Generate calendar dates for current month
  const calendarDates = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const dates = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate]);

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return tasks.filter((task) => {
      const taskDate = task.startDate || task.dueDate;
      return taskDate === dateStr;
    });
  };

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    return tasks.filter((task) => {
      const taskDate = task.startDate || task.dueDate;
      return taskDate === selectedDate;
    });
  }, [selectedDate, tasks]);

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDatePress = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    setSelectedDate(dateStr);
    setShowDayModal(true);
  };

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={onBack}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            Calendar
          </Text>
          <TouchableOpacity onPress={() => setShowTaskModal(true)}>
            <Plus size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Month Navigation */}
        <View
          className="mx-4 mt-4 rounded-lg p-4"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => navigateMonth(-1)}>
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth(1)}>
              <ChevronRight size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Week Days Header */}
          <View className="flex-row justify-between mb-2">
            {weekDays.map((day, index) => (
              <Text
                key={index}
                className="text-sm font-medium text-center"
                style={{ color: colors.textSecondary, width: "14.28%" }}
              >
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="flex-wrap flex-row">
            {calendarDates.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday =
                date.toISOString().split("T")[0] ===
                new Date().toISOString().split("T")[0];
              const dayTasks = getTasksForDate(date);
              const hasCompletedTasks = dayTasks.some(
                (task) => task.isCompleted,
              );
              const hasPendingTasks = dayTasks.some(
                (task) => !task.isCompleted,
              );

              return (
                <TouchableOpacity
                  key={index}
                  className="items-center justify-center mb-2"
                  style={{ width: "14.28%", height: 50 }}
                  onPress={() => handleDatePress(date)}
                >
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      isToday ? "border-2" : ""
                    }`}
                    style={{
                      backgroundColor: isToday ? colors.primary : "transparent",
                      borderColor: isToday ? colors.primary : "transparent",
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
                  {/* Task indicators */}
                  <View className="flex-row mt-1">
                    {hasCompletedTasks && (
                      <View className="w-1 h-1 bg-green-500 rounded-full mr-1" />
                    )}
                    {hasPendingTasks && (
                      <View className="w-1 h-1 bg-red-500 rounded-full" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Today's Tasks Preview */}
        <View
          className="mx-4 mt-4 mb-6 rounded-lg p-4"
          style={{ backgroundColor: colors.surface }}
        >
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Today's Tasks
          </Text>
          {getTasksForDate(new Date()).length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>
              No tasks for today
            </Text>
          ) : (
            getTasksForDate(new Date())
              .slice(0, 3)
              .map((task) => (
                <View key={task.id} className="flex-row items-center mb-3">
                  <TouchableOpacity
                    className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                      task.isCompleted
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300"
                    }`}
                    onPress={() => toggleTaskComplete(task.id)}
                  >
                    {task.isCompleted && <Check size={12} color="white" />}
                  </TouchableOpacity>
                  <Text
                    className={`flex-1 ${
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
                  <Flag size={14} color={getPriorityColor(task.priority)} />
                </View>
              ))
          )}
        </View>
      </ScrollView>

      {/* Day Tasks Modal */}
      <Modal
        visible={showDayModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
          <View
            className="flex-row justify-between items-center p-4 border-b"
            style={{
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            }}
          >
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              {selectedDate ? formatDate(selectedDate) : ""}
            </Text>
            <TouchableOpacity onPress={() => setShowDayModal(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {selectedDateTasks.length === 0 ? (
              <View className="items-center justify-center py-8">
                <Text style={{ color: colors.textSecondary }}>
                  No tasks for this day
                </Text>
              </View>
            ) : (
              selectedDateTasks.map((task) => (
                <View
                  key={task.id}
                  className="rounded-lg p-4 mb-3"
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
                        >
                          {task.description}
                        </Text>
                      )}

                      <View className="flex-row items-center justify-between">
                        <Text
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          {task.category}
                        </Text>

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
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Task Form Modal */}
      <TaskFormModal
        visible={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        task={editingTask}
        isEditing={!!editingTask}
      />
    </View>
  );
};

export default CalendarView;
