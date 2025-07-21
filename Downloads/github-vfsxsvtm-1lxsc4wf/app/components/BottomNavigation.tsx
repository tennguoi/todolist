import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Calendar, Search, Menu, Clock } from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";

interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabPress }: BottomNavigationProps) => {
  const { colors } = useTheme();
  const currentDay = new Date().getDate();

  const tabs = [
    { id: "today", label: "Today", icon: currentDay.toString() },
    { id: "upcoming", label: "Upcoming", icon: Calendar },
    { id: "focus", label: "Focus", icon: Clock },
    { id: "search", label: "Search", icon: Search },
    { id: "browse", label: "Browse", icon: Menu },
  ];

  return (
    <View
      className="border-t px-4 py-2"
      style={{
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
      }}
    >
      <View className="flex-row justify-around items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabPress(tab.id)}
              className="items-center py-2 px-4"
            >
              <View className="items-center">
                {tab.id === "today" ? (
                  <View
                    className="w-8 h-8 rounded items-center justify-center"
                    style={{
                      backgroundColor: isActive
                        ? colors.primary
                        : colors.border,
                    }}
                  >
                    <Text
                      className="font-bold"
                      style={{
                        color: isActive ? "white" : colors.textSecondary,
                      }}
                    >
                      {currentDay}
                    </Text>
                  </View>
                ) : (
                  <View
                    className="w-8 h-8 rounded items-center justify-center"
                    style={{
                      backgroundColor: isActive
                        ? colors.primary
                        : "transparent",
                    }}
                  >
                    {React.createElement(tab.icon as any, {
                      size: 20,
                      color: isActive ? "white" : colors.textSecondary,
                    })}
                  </View>
                )}
                <Text
                  className="text-xs mt-1"
                  style={{
                    color: isActive ? colors.primary : colors.textSecondary,
                    fontWeight: isActive ? "500" : "normal",
                  }}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BottomNavigation;
