import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import {
  MoreVertical,
  Check,
  Edit,
  Trash2,
  Flag,
  Calendar,
  Tag,
  Settings,
  BarChart3,
  CalendarDays,
} from "lucide-react-native";
import { useTask } from "../contexts/TaskContext";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import TaskFormModal from "./TaskFormModal";

interface TodayScreenProps {
  onNavigate?: (screen: string) => void;
}

const TodayScreen = ({ onNavigate }: TodayScreenProps) => {
  const { tasks, toggleTaskComplete, deleteTask, getStatistics } = useTask();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter(
    (task) =>
      !!task &&
      !!task.startDate &&
      (task.startDate === today || (task.dueDate === today && !task.isCompleted)),
  );

  const stats = getStatistics();

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
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      weekday: "long",
    };
    return date.toLocaleDateString("en-US", options);
  };

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
              Today
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {todayTasks.length} tasks • {stats.completed} completed
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

        {/* Welcome Message */}
        <View className="mt-4">
          <Text className="text-lg" style={{ color: colors.text }}>
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 18
                ? "afternoon"
                : "evening"}
            , {user?.name}!
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Today's Date */}
        <View className="px-4 py-4">
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            {formatDate(today)}
          </Text>

          {/* Tasks */}
          {todayTasks.length === 0 ? (
            <View
              className="rounded-lg p-6 items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text
                className="text-center"
                style={{ color: colors.textSecondary }}
              >
                No tasks for today. Tap the + button to add a new task!
              </Text>
            </View>
          ) : (
            todayTasks.map((task) => (
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
                      >
                        {task.description}
                      </Text>
                    )}

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        {task.dueDate && (
                          <View className="flex-row items-center mr-3">
                            <Calendar size={12} color="#9CA3AF" />
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
                            <Tag size={12} color="#9CA3AF" />
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
            ))
          )}
        </View>
      </ScrollView>

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

export default TodayScreen;
