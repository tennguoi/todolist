import React, { useState } from "react";
import { View, TouchableOpacity, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Plus } from "lucide-react-native";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TaskProvider } from "./contexts/TaskContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import BottomNavigation from "./components/BottomNavigation";
import TodayScreen from "./components/TodayScreen";
import UpcomingScreen from "./components/UpcomingScreen";
import SearchScreen from "./components/SearchScreen";
import BrowseScreen from "./components/BrowseScreen";
import AuthScreen from "./components/AuthScreen";
import TaskFormModal from "./components/TaskFormModal";
import SettingsScreen from "./components/SettingsScreen";
import CalendarView from "./components/CalendarView";
import StatisticsScreen from "./components/StatisticsScreen";
import FocusSession from "./components/FocusSession";

function MainApp() {
  const [activeTab, setActiveTab] = useState("today");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("main");
  const { user, isLoading } = useAuth();
  const { colors, isDark } = useTheme();

  const renderScreen = () => {
    if (currentScreen === "settings") {
      return <SettingsScreen onBack={() => setCurrentScreen("main")} />;
    }
    if (currentScreen === "calendar") {
      return <CalendarView onBack={() => setCurrentScreen("main")} />;
    }
    if (currentScreen === "statistics") {
      return <StatisticsScreen onBack={() => setCurrentScreen("main")} />;
    }
    if (currentScreen === "focusDetail") {
      return <FocusSession onBack={() => setCurrentScreen("main")} />;
    }

    switch (activeTab) {
      case "today":
        return <TodayScreen onNavigate={setCurrentScreen} />;
      case "upcoming":
        return <UpcomingScreen onNavigate={setCurrentScreen} />;
      case "search":
        return <SearchScreen onNavigate={setCurrentScreen} />;
      case "focus":
        return <FocusSession onBack={() => {}} />;
      case "browse":
        return <BrowseScreen onNavigate={setCurrentScreen} />;
      default:
        return <TodayScreen onNavigate={setCurrentScreen} />;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <AuthScreen />
      </SafeAreaView>
    );
  }

  return (
    <TaskProvider>
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Main Content */}
        <View className="flex-1">{renderScreen()}</View>

        {/* Bottom Navigation - Only show on main screens */}
        {currentScreen === "main" && (
          <BottomNavigation activeTab={activeTab} onTabPress={setActiveTab} />
        )}

        {/* Floating Action Button - Only show on main screens */}
        {currentScreen === "main" && (
          <TouchableOpacity
            className="absolute bottom-24 right-6 w-14 h-14 rounded-2xl items-center justify-center shadow-lg"
            style={{
              backgroundColor: colors.primary,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
            }}
            onPress={() => setShowTaskModal(true)}
          >
            <Plus size={28} color="white" />
          </TouchableOpacity>
        )}

        {/* Task Form Modal */}
        <TaskFormModal
          visible={showTaskModal}
          onClose={() => setShowTaskModal(false)}
        />
      </SafeAreaView>
    </TaskProvider>
  );
}

export default function HomeScreen() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}