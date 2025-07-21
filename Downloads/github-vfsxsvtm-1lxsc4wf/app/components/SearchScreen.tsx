import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import {
  Search,
  MoreVertical,
  Check,
  Edit,
  Trash2,
  Flag,
  Calendar,
  Tag,
  Filter,
  Settings,
  BarChart3,
  CalendarDays,
} from "lucide-react-native";
import { useTask } from "../contexts/TaskContext";
import { useTheme } from "../contexts/ThemeContext";
import TaskFormModal from "./TaskFormModal";

interface SearchScreenProps {
  onNavigate?: (screen: string) => void;
}

const SearchScreen = ({ onNavigate }: SearchScreenProps) => {
  const { tasks, searchTasks, toggleTaskComplete, deleteTask, projects } =
    useTask();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    if (searchQuery.trim() || selectedFilter !== "all") {
      let results = searchQuery.trim() ? searchTasks(searchQuery) : tasks;

      // Apply additional filters
      if (selectedFilter !== "all") {
        switch (selectedFilter) {
          case "completed":
            results = results.filter((task) => task.isCompleted);
            break;
          case "pending":
            results = results.filter((task) => !task.isCompleted);
            break;
          case "high":
            results = results.filter((task) => task.priority === "high");
            break;
          case "overdue":
            results = results.filter((task) => {
              if (!task.dueDate || task.isCompleted) return false;
              return new Date(task.dueDate) < new Date();
            });
            break;
        }
      }

      setFilteredTasks(results);
    } else {
      setFilteredTasks([]);
    }
  }, [searchQuery, selectedFilter, tasks]);

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

  const filterOptions = [
    { value: "all", label: "All Tasks" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "high", label: "High Priority" },
    { value: "overdue", label: "Overdue" },
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
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            Search
          </Text>
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

        {/* Search Bar */}
        <View
          className="flex-row items-center rounded-lg px-4 py-3 mb-3"
          style={{ backgroundColor: colors.border }}
        >
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            className="flex-1 ml-3 text-base"
            style={{ color: colors.text }}
            placeholder="Search tasks, descriptions, tags..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Filter Dropdown */}
        <View className="relative">
          <TouchableOpacity
            className="flex-row items-center rounded-lg px-4 py-2"
            style={{ backgroundColor: colors.border }}
            onPress={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Filter size={16} color={colors.textSecondary} />
            <Text className="ml-2 text-sm" style={{ color: colors.text }}>
              {filterOptions.find((f) => f.value === selectedFilter)?.label}
            </Text>
          </TouchableOpacity>

          {showFilterDropdown && (
            <View
              className="absolute top-10 left-0 right-0 border rounded-lg shadow-lg z-10"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className="px-4 py-3 border-b"
                  style={{ borderBottomColor: colors.border }}
                  onPress={() => {
                    setSelectedFilter(option.value);
                    setShowFilterDropdown(false);
                  }}
                >
                  <Text style={{ color: colors.text }}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {!searchQuery.trim() ? (
          /* Recently Visited Section */
          <View>
            <Text
              className="text-xl font-bold mb-4"
              style={{ color: colors.text }}
            >
              Quick Actions
            </Text>

            <View className="space-y-3">
              <TouchableOpacity
                className="flex-row items-center py-3 rounded-lg px-4"
                style={{ backgroundColor: colors.surface }}
                onPress={() => {
                  setSearchQuery("all");
                  setSelectedFilter("all");
                }}
              >
                <View
                  className="w-8 h-8 rounded items-center justify-center mr-4"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <View
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: colors.primary }}
                  />
                </View>
                <Text className="text-lg" style={{ color: colors.text }}>
                  View All Tasks
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-3 rounded-lg px-4"
                style={{ backgroundColor: colors.surface }}
                onPress={() => {
                  setSearchQuery("");
                  setSelectedFilter("completed");
                }}
              >
                <View
                  className="w-8 h-8 rounded items-center justify-center mr-4"
                  style={{ backgroundColor: colors.success + "20" }}
                >
                  <Check size={16} color={colors.success} />
                </View>
                <Text className="text-lg" style={{ color: colors.text }}>
                  Completed Tasks
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-3 rounded-lg px-4"
                style={{ backgroundColor: colors.surface }}
                onPress={() => {
                  setSearchQuery("");
                  setSelectedFilter("high");
                }}
              >
                <View
                  className="w-8 h-8 rounded items-center justify-center mr-4"
                  style={{ backgroundColor: colors.warning + "20" }}
                >
                  <Flag size={16} color={colors.warning} />
                </View>
                <Text className="text-lg" style={{ color: colors.text }}>
                  High Priority
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search Tips */}
            <View
              className="mt-6 rounded-lg p-4"
              style={{ backgroundColor: colors.primary + "10" }}
            >
              <Text
                className="font-semibold mb-2"
                style={{ color: colors.text }}
              >
                Search Tips:
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                • Search by task title or description
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                • Use tags to find related tasks
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                • Filter by status or priority
              </Text>
            </View>
          </View>
        ) : (
          /* Search Results */
          <View>
            <Text
              className="text-lg font-bold mb-4"
              style={{ color: colors.text }}
            >
              {filteredTasks.length} result
              {filteredTasks.length !== 1 ? "s" : ""} found
            </Text>

            {filteredTasks.length === 0 ? (
              <View
                className="rounded-lg p-6 items-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Text
                  className="text-center"
                  style={{ color: colors.textSecondary }}
                >
                  No tasks found matching your search.
                </Text>
              </View>
            ) : (
              filteredTasks.map((task) => (
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

                          {task.dueDate && (
                            <View className="flex-row items-center mr-3">
                              <Calendar
                                size={12}
                                color={colors.textSecondary}
                              />
                              <Text
                                className="text-xs ml-1"
                                style={{ color: colors.textSecondary }}
                              >
                                {task.dueDate}
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
              ))
            )}
          </View>
        )}
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

export default SearchScreen;
