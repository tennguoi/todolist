import React from "react";
import { View, Text } from "react-native";

interface StatisticsProps {
  completedTasks?: number;
  pendingTasks?: number;
  tasksCreated?: number;
  activeUsers?: number;
}

const Statistics = ({
  completedTasks = 4,
  pendingTasks = 15,
  tasksCreated = 1500,
  activeUsers = 25,
}: StatisticsProps) => {
  return (
    <View className="bg-white p-4 rounded-lg shadow-sm w-full">
      <View className="flex-row justify-between mb-4">
        <View className="bg-amber-100 rounded-lg p-4 flex-1 mr-2">
          <Text className="text-center font-bold text-lg">
            {completedTasks}
          </Text>
          <Text className="text-center text-xs uppercase">Completed Tasks</Text>
        </View>

        <View className="bg-rose-200 rounded-lg p-4 flex-1 ml-2">
          <Text className="text-center font-bold text-lg">{pendingTasks}</Text>
          <Text className="text-center text-xs uppercase">Pending Tasks</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-sm text-gray-600">Tasks created</Text>
          <Text className="text-2xl font-bold">
            {tasksCreated.toLocaleString()}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text className="mr-2 text-sm font-medium">
            {activeUsers}k+ Active Users
          </Text>
          <View className="flex-row">
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                className="w-8 h-8 rounded-full bg-gray-300 -ml-2 border-2 border-white overflow-hidden"
                style={{ marginLeft: i === 1 ? 0 : -8 }}
              >
                <View className="w-full h-full bg-blue-400" />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default Statistics;
