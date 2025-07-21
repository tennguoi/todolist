import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  Target,
  Award,
} from "lucide-react-native";
import { LineChart, PieChart, BarChart } from "react-native-chart-kit";
import { useTask } from "../contexts/TaskContext";
import { useTheme } from "../contexts/ThemeContext";

interface StatisticsScreenProps {
  onBack: () => void;
}

const StatisticsScreen = ({ onBack }: StatisticsScreenProps) => {
  const { tasks, getStatistics } = useTask();
  const { colors, isDark } = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const stats = getStatistics();

  // Calculate weekly completion data
  const weeklyData = useMemo(() => {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const completedTasks = tasks.filter(
        (task) =>
          task.completedAt && task.completedAt.split("T")[0] === dateStr,
      ).length;

      last7Days.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        completed: completedTasks,
      });
    }

    return last7Days;
  }, [tasks]);

  // Calculate category distribution
  const categoryData = useMemo(() => {
    const categories = {};
    tasks.forEach((task) => {
      categories[task.category] = (categories[task.category] || 0) + 1;
    });

    const colors = [
      "#EF4444",
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#8B5CF6",
      "#EC4899",
    ];

    return Object.entries(categories).map(([name, population], index) => ({
      name,
      population,
      color: colors[index % colors.length],
      legendFontColor: isDark ? "#F9FAFB" : "#374151",
      legendFontSize: 12,
    }));
  }, [tasks, isDark]);

  // Calculate priority distribution
  const priorityStats = useMemo(() => {
    const priorities = { high: 0, medium: 0, low: 0 };
    tasks.forEach((task) => {
      priorities[task.priority]++;
    });
    return priorities;
  }, [tasks]);

  // Calculate completion rate
  const completionRate = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  }, [stats]);

  // Calculate streak
  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const hasCompletedTask = tasks.some(
        (task) =>
          task.completedAt && task.completedAt.split("T")[0] === dateStr,
      );

      if (hasCompletedTask) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [tasks]);

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
    labelColor: (opacity = 1) =>
      isDark
        ? `rgba(249, 250, 251, ${opacity})`
        : `rgba(55, 65, 81, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: colors.primary,
    },
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
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onBack} className="mr-4">
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            Statistics
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Overview Cards */}
        <View className="flex-row flex-wrap px-4 mt-4">
          <View className="w-1/2 p-2">
            <View
              className="rounded-lg p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center mb-2">
                <CheckCircle size={20} color="#10B981" />
                <Text
                  className="ml-2 font-medium"
                  style={{ color: colors.text }}
                >
                  Completed
                </Text>
              </View>
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {stats.completed}
              </Text>
            </View>
          </View>

          <View className="w-1/2 p-2">
            <View
              className="rounded-lg p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center mb-2">
                <Clock size={20} color="#F59E0B" />
                <Text
                  className="ml-2 font-medium"
                  style={{ color: colors.text }}
                >
                  Pending
                </Text>
              </View>
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {stats.pending}
              </Text>
            </View>
          </View>

          <View className="w-1/2 p-2">
            <View
              className="rounded-lg p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center mb-2">
                <Target size={20} color="#3B82F6" />
                <Text
                  className="ml-2 font-medium"
                  style={{ color: colors.text }}
                >
                  Completion Rate
                </Text>
              </View>
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {completionRate}%
              </Text>
            </View>
          </View>

          <View className="w-1/2 p-2">
            <View
              className="rounded-lg p-4"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center mb-2">
                <Award size={20} color="#8B5CF6" />
                <Text
                  className="ml-2 font-medium"
                  style={{ color: colors.text }}
                >
                  Current Streak
                </Text>
              </View>
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {currentStreak} days
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Progress Chart */}
        <View
          className="mx-4 mt-4 rounded-lg p-4"
          style={{ backgroundColor: colors.surface }}
        >
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Weekly Progress
          </Text>
          {weeklyData.length > 0 && (
            <LineChart
              data={{
                labels: weeklyData.map((d) => d.day),
                datasets: [
                  {
                    data: weeklyData.map((d) => d.completed),
                  },
                ],
              }}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          )}
        </View>

        {/* Category Distribution */}
        {categoryData.length > 0 && (
          <View
            className="mx-4 mt-4 rounded-lg p-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text
              className="text-lg font-bold mb-4"
              style={{ color: colors.text }}
            >
              Tasks by Category
            </Text>
            <PieChart
              data={categoryData}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              absolute
            />
          </View>
        )}

        {/* Priority Breakdown */}
        <View
          className="mx-4 mt-4 mb-6 rounded-lg p-4"
          style={{ backgroundColor: colors.surface }}
        >
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Priority Breakdown
          </Text>

          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-red-500 rounded mr-3" />
                <Text style={{ color: colors.text }}>High Priority</Text>
              </View>
              <Text className="font-bold" style={{ color: colors.text }}>
                {priorityStats.high}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-yellow-500 rounded mr-3" />
                <Text style={{ color: colors.text }}>Medium Priority</Text>
              </View>
              <Text className="font-bold" style={{ color: colors.text }}>
                {priorityStats.medium}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-green-500 rounded mr-3" />
                <Text style={{ color: colors.text }}>Low Priority</Text>
              </View>
              <Text className="font-bold" style={{ color: colors.text }}>
                {priorityStats.low}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default StatisticsScreen;
