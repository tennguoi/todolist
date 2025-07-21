import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Check, Edit, Trash2 } from "lucide-react-native";

interface TaskCardProps {
  title?: string;
  description?: string;
  startDate?: string;
  onComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isCompleted?: boolean;
}

const TaskCard = ({
  title = "Learn Javascript",
  description = "Master the language powering the modern web",
  startDate = "07-07-2023",
  onComplete = () => {},
  onEdit = () => {},
  onDelete = () => {},
  isCompleted = false,
}: TaskCardProps) => {
  return (
    <View className="bg-amber-50 p-4 rounded-lg mb-3 border border-amber-100">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-2">
          <Text className="text-base font-medium text-gray-800">{title}</Text>
          <Text className="text-sm text-gray-600 mt-1">{description}</Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-xs text-gray-500">Start date: </Text>
            <Text className="text-xs font-medium text-gray-700">
              {startDate}
            </Text>
          </View>
        </View>

        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={onComplete}
            className={`w-8 h-8 rounded-full ${isCompleted ? "bg-green-100" : "bg-white"} items-center justify-center border border-gray-200`}
          >
            <Check size={16} color={isCompleted ? "#22c55e" : "#9ca3af"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onEdit}
            className="w-8 h-8 rounded-full bg-white items-center justify-center border border-gray-200"
          >
            <Edit size={16} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            className="w-8 h-8 rounded-full bg-white items-center justify-center border border-gray-200"
          >
            <Trash2 size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default TaskCard;
