import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import {
  Bell,
  Settings,
  Plus,
  ChevronUp,
  Hash,
  Edit,
  Target,
  LogOut,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Folder,
  X,
  CalendarDays,
} from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTask, Task } from "../contexts/TaskContext";
import { useTheme } from "../contexts/ThemeContext";

interface BrowseScreenProps {
  onNavigate?: (screen: string) => void;
}

const BrowseScreen = ({ onNavigate }: BrowseScreenProps) => {
  const { user, signOut } = useAuth();
  const { projects, getStatistics, tasks, addProject, deleteProject } =
    useTask();
  const { colors } = useTheme();
  const stats = getStatistics();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filterTitle, setFilterTitle] = useState("");

  const handleSignOut = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            // Show loading state if needed
            await signOut();
            // Success - user will be redirected to login screen automatically
            // No need to show success message as the app will navigate to auth screen
          } catch (error) {
            console.error("Sign out error:", error);
            Alert.alert(
              "Lỗi", 
              "Không thể đăng xuất. Vui lòng thử lại.",
              [{ text: "OK" }]
            );
          }
        },
      },
    ]);
  };

  const getOverdueTasks = () => {
    return tasks.filter((task) => {
      if (!task.dueDate || task.isCompleted) return false;
      return new Date(task.dueDate) < new Date();
    }).length;
  };

  const showTasksByFilter = (filter: string) => {
    let filtered: Task[] = [];
    let title = "";

    switch (filter) {
      case "all":
        filtered = tasks;
        title = "All Tasks";
        break;
      case "completed":
        filtered = tasks.filter((task) => task.isCompleted);
        title = "Completed Tasks";
        break;
      case "overdue":
        filtered = tasks.filter((task) => {
          if (!task.dueDate || task.isCompleted) return false;
          return new Date(task.dueDate) < new Date();
        });
        title = "Overdue Tasks";
        break;
      case "high":
        filtered = tasks.filter((task) => task.priority === "high");
        title = "High Priority Tasks";
        break;
    }

    setFilteredTasks(filtered);
    setFilterTitle(title);
    setShowTasksModal(true);
  };

  const showProjectTasks = (projectId: string, projectName: string) => {
    const projectTasks = tasks.filter((task) => task.projectId === projectId);
    setFilteredTasks(projectTasks);
    setFilterTitle(`${projectName} Tasks`);
    setShowTasksModal(true);
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      Alert.alert("Error", "Please enter a project name");
      return;
    }

    addProject({
      name: newProjectName.trim(),
      color: selectedColor,
    });

    setNewProjectName("");
    setSelectedColor("#3B82F6");
    setShowProjectModal(false);
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    Alert.alert(
      "Delete Project",
      `Are you sure you want to delete "${projectName}"? Tasks in this project will not be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteProject(projectId),
        },
      ],
    );
  };

  const projectColors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
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
          <View className="flex-row items-center">
            <Image
              source={{
                uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "user"}`,
              }}
              className="w-10 h-10 rounded-full mr-3"
            />
            <View>
              <Text
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                {user?.name || "User"}
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                {user?.email}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity onPress={() => onNavigate?.("calendar")}>
              <CalendarDays size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onNavigate?.("statistics")}>
              <BarChart3 size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onNavigate?.("settings")}>
              <Settings size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignOut}>
              <LogOut size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Statistics Overview */}
        <View
          className="mt-4 mx-4 rounded-lg p-4"
          style={{ backgroundColor: colors.surface }}
        >
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Overview
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                <CheckCircle size={24} color="#10B981" />
              </View>
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {stats.completed}
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Completed
              </Text>
            </View>

            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                <Clock size={24} color="#3B82F6" />
              </View>
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {stats.pending}
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Pending
              </Text>
            </View>

            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mb-2">
                <Calendar size={24} color="#EF4444" />
              </View>
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {getOverdueTasks()}
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Overdue
              </Text>
            </View>

            <View className="items-center flex-1">
              <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
                <BarChart3 size={24} color="#8B5CF6" />
              </View>
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {stats.total}
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Total
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View
          className="mt-4 mx-4 rounded-lg"
          style={{ backgroundColor: colors.surface }}
        >
          <Text
            className="text-lg font-bold px-4 py-4 border-b"
            style={{ color: colors.text, borderBottomColor: colors.border }}
          >
            Quick Actions
          </Text>

          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4 border-b"
            style={{ borderBottomColor: colors.border }}
            onPress={() => showTasksByFilter("all")}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-blue-100 rounded items-center justify-center mr-3">
                <BarChart3 size={16} color="#3B82F6" />
              </View>
              <Text className="text-base" style={{ color: colors.text }}>
                All Tasks
              </Text>
            </View>
            <Text
              className="font-medium"
              style={{ color: colors.textSecondary }}
            >
              {stats.total}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4 border-b"
            style={{ borderBottomColor: colors.border }}
            onPress={() => showTasksByFilter("completed")}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-green-100 rounded items-center justify-center mr-3">
                <CheckCircle size={16} color="#10B981" />
              </View>
              <Text className="text-base" style={{ color: colors.text }}>
                Completed
              </Text>
            </View>
            <Text
              className="font-medium"
              style={{ color: colors.textSecondary }}
            >
              {stats.completed}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4 border-b"
            style={{ borderBottomColor: colors.border }}
            onPress={() => showTasksByFilter("overdue")}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-red-100 rounded items-center justify-center mr-3">
                <Calendar size={16} color="#EF4444" />
              </View>
              <Text className="text-base" style={{ color: colors.text }}>
                Overdue
              </Text>
            </View>
            <Text
              className="font-medium"
              style={{ color: colors.textSecondary }}
            >
              {getOverdueTasks()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={() => showTasksByFilter("high")}
          >
            <View className="w-8 h-8 bg-orange-100 rounded items-center justify-center mr-3">
              <Target size={16} color="#F59E0B" />
            </View>
            <Text className="text-base" style={{ color: colors.text }}>
              High Priority
            </Text>
          </TouchableOpacity>
        </View>

        {/* My Projects Section */}
        <View
          className="mt-4 mx-4 rounded-lg"
          style={{ backgroundColor: colors.surface }}
        >
          <View
            className="flex-row items-center justify-between px-4 py-4 border-b"
            style={{ borderBottomColor: colors.border }}
          >
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              My Projects
            </Text>
            <View className="flex-row items-center space-x-2">
              <TouchableOpacity onPress={() => setShowProjectModal(true)}>
                <Plus size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity>
                <ChevronUp size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              className="flex-row items-center justify-between px-4 py-4 border-b"
              style={{ borderBottomColor: colors.border }}
              onPress={() => showProjectTasks(project.id, project.name)}
              onLongPress={() => handleDeleteProject(project.id, project.name)}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded items-center justify-center mr-3">
                  <View
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                </View>
                <Text className="text-base" style={{ color: colors.text }}>
                  {project.name}
                </Text>
              </View>
              <Text
                className="font-medium"
                style={{ color: colors.textSecondary }}
              >
                {project.taskCount}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            className="flex-row items-center px-4 py-4 border-b"
            style={{ borderBottomColor: colors.border }}
          >
            <Edit size={20} color={colors.textSecondary} className="mr-3" />
            <Text className="text-base" style={{ color: colors.textSecondary }}>
              Manage projects
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={() => setShowProjectModal(true)}
          >
            <Folder size={20} color={colors.textSecondary} className="mr-3" />
            <Text className="text-base" style={{ color: colors.text }}>
              Create new project
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View
          className="mt-4 mx-4 mb-6 rounded-lg"
          style={{ backgroundColor: colors.surface }}
        >
          <Text
            className="text-lg font-bold px-4 py-4 border-b"
            style={{ color: colors.text, borderBottomColor: colors.border }}
          >
            Settings
          </Text>

          <TouchableOpacity
            className="flex-row items-center px-4 py-4 border-b"
            style={{ borderBottomColor: colors.border }}
            onPress={() => onNavigate?.("settings")}
          >
            <Settings size={20} color={colors.textSecondary} className="mr-3" />
            <Text className="text-base" style={{ color: colors.text }}>
              Preferences
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-4 py-4 border-b"
            style={{ borderBottomColor: colors.border }}
          >
            <Bell size={20} color={colors.textSecondary} className="mr-3" />
            <Text className="text-base" style={{ color: colors.text }}>
              Notifications
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center px-4 py-4"
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#EF4444" className="mr-3" />
            <Text className="text-base text-red-500">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Create Project Modal */}
      <Modal
        visible={showProjectModal}
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
              New Project
            </Text>
            <TouchableOpacity onPress={() => setShowProjectModal(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View className="p-4">
            <Text
              className="text-base font-medium mb-2"
              style={{ color: colors.text }}
            >
              Project Name
            </Text>
            <TextInput
              className="border rounded-lg px-3 py-3 text-base mb-4"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
                color: colors.text,
              }}
              placeholder="Enter project name"
              value={newProjectName}
              onChangeText={setNewProjectName}
              placeholderTextColor={colors.textSecondary}
            />

            <Text
              className="text-base font-medium mb-2"
              style={{ color: colors.text }}
            >
              Color
            </Text>
            <View className="flex-row flex-wrap mb-6">
              {projectColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  className={`w-12 h-12 rounded-full mr-3 mb-3 items-center justify-center ${
                    selectedColor === color ? "border-2 border-gray-400" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <View className="w-4 h-4 bg-white rounded-full" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="py-4 rounded-lg items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={handleCreateProject}
            >
              <Text className="text-white text-base font-semibold">
                Create Project
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tasks Modal */}
      <Modal
        visible={showTasksModal}
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
              {filterTitle}
            </Text>
            <TouchableOpacity onPress={() => setShowTasksModal(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {filteredTasks.length === 0 ? (
              <View className="items-center justify-center py-8">
                <Text
                  className="text-center"
                  style={{ color: colors.textSecondary }}
                >
                  No tasks found in this category.
                </Text>
              </View>
            ) : (
              filteredTasks.map((task) => (
                <View
                  key={task.id}
                  className="rounded-lg p-4 mb-3"
                  style={{ backgroundColor: colors.surface }}
                >
                  <View className="flex-row items-center mb-2">
                    <View
                      className={`w-4 h-4 rounded-full mr-3 ${
                        task.isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <Text
                      className={`text-base font-medium flex-1 ${
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
                  </View>
                  {task.description && (
                    <Text
                      className="text-sm mb-2 ml-7"
                      style={{ color: colors.textSecondary }}
                    >
                      {task.description}
                    </Text>
                  )}
                  <View className="flex-row items-center ml-7">
                    <Text
                      className="text-xs mr-3"
                      style={{ color: colors.textSecondary }}
                    >
                      {task.category}
                    </Text>
                    {task.dueDate && (
                      <Text
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        Due: {task.dueDate}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default BrowseScreen;
