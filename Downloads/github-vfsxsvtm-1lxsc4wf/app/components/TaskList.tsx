import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Search, ChevronDown } from "lucide-react-native";

// Define the TaskCard component inline since there seems to be an issue with importing it
const TaskCard = ({
  title = "Task Title",
  description = "Task Description",
  startDate = "01-01-2023",
  onComplete = () => {},
  onEdit = () => {},
  onDelete = () => {},
}) => {
  return (
    <View className="bg-amber-50 p-4 rounded-lg mb-3 border border-amber-100">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <Text className="font-semibold text-base">{title}</Text>
          <Text className="text-gray-600 text-sm mt-1">{description}</Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-xs text-gray-500">Start date: </Text>
            <Text className="text-xs font-medium">{startDate}</Text>
          </View>
        </View>
        <View className="flex-row space-x-2">
          <TouchableOpacity
            className="w-6 h-6 rounded-full bg-green-100 items-center justify-center"
            onPress={onComplete}
          >
            <Text className="text-green-800">✓</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center"
            onPress={onEdit}
          >
            <Text className="text-blue-800">✎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-6 h-6 rounded-full bg-red-100 items-center justify-center"
            onPress={onDelete}
          >
            <Text className="text-red-800">×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string;
  category: string;
  priority: string;
}

interface TaskListProps {
  tasks?: Task[];
  onTaskComplete?: (id: string) => void;
  onTaskEdit?: (id: string) => void;
  onTaskDelete?: (id: string) => void;
}

const TaskList = ({
  tasks = [
    {
      id: "1",
      title: "Learn Javascript",
      description: "Master the language powering the modern web",
      startDate: "07-07-2023",
      category: "Education",
      priority: "High",
    },
    {
      id: "2",
      title: "Learn Javascript",
      description: "Master the language powering the modern web",
      startDate: "07-07-2023",
      category: "Education",
      priority: "Medium",
    },
    {
      id: "3",
      title: "Learn Javascript",
      description: "Master the language powering the modern web",
      startDate: "07-07-2023",
      category: "Education",
      priority: "Low",
    },
  ],
  onTaskComplete = () => {},
  onTaskEdit = () => {},
  onTaskDelete = () => {},
}: TaskListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const categories = ["Education", "Work", "Personal", "Health", "All"];
  const priorities = ["High", "Medium", "Low", "All"];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "" ||
      selectedCategory === "All" ||
      task.category === selectedCategory;
    const matchesPriority =
      selectedPriority === "" ||
      selectedPriority === "All" ||
      task.priority === selectedPriority;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  return (
    <View className="w-full bg-white p-4 rounded-lg">
      {/* Search and Filter Section */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          {/* Category Filter */}
          <View className="relative">
            <TouchableOpacity
              className="flex-row items-center bg-amber-50 px-3 py-1 rounded-md border border-amber-200"
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Text className="text-amber-800 text-xs mr-1">By category</Text>
              <ChevronDown size={14} color="#92400e" />
            </TouchableOpacity>

            {showCategoryDropdown && (
              <View className="absolute top-8 left-0 bg-white shadow-md rounded-md z-10 w-32 border border-gray-200">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    className="px-3 py-2 border-b border-gray-100"
                    onPress={() => {
                      setSelectedCategory(category === "All" ? "" : category);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text className="text-gray-800">{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Priority Filter */}
          <View className="relative">
            <TouchableOpacity
              className="flex-row items-center bg-amber-50 px-3 py-1 rounded-md border border-amber-200"
              onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
            >
              <Text className="text-amber-800 text-xs mr-1">By priority</Text>
              <ChevronDown size={14} color="#92400e" />
            </TouchableOpacity>

            {showPriorityDropdown && (
              <View className="absolute top-8 right-0 bg-white shadow-md rounded-md z-10 w-32 border border-gray-200">
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    className="px-3 py-2 border-b border-gray-100"
                    onPress={() => {
                      setSelectedPriority(priority === "All" ? "" : priority);
                      setShowPriorityDropdown(false);
                    }}
                  >
                    <Text className="text-gray-800">{priority}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Search Box */}
          <View className="flex-row items-center bg-gray-100 rounded-md px-2 py-1">
            <Search size={16} color="#9ca3af" />
            <TextInput
              className="ml-1 flex-1 text-sm"
              placeholder="Search tasks"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>

      {/* Task List */}
      <ScrollView className="mb-4">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            title={task.title}
            description={task.description}
            startDate={task.startDate}
            onComplete={() => onTaskComplete(task.id)}
            onEdit={() => onTaskEdit(task.id)}
            onDelete={() => onTaskDelete(task.id)}
          />
        ))}
      </ScrollView>

      {/* Load More Button */}
      <TouchableOpacity className="bg-white border border-gray-300 rounded-md py-2 items-center">
        <Text className="text-gray-700">Load more</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TaskList;
