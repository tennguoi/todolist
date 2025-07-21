import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  Bell,
  Palette,
  User,
  Shield,
  HelpCircle,
  X,
  Save,
  LogOut,
} from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const { theme, setTheme, colors, isDark } = useTheme();
  const { settings, updateSettings } = useNotification();
  const { user, signOut } = useAuth();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [tempReminderTime, setTempReminderTime] = useState(
    settings.reminderTime.toString(),
  );
  const [tempDailyTime, setTempDailyTime] = useState(
    settings.dailyReminderTime,
  );

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const handleSaveNotificationSettings = () => {
    updateSettings({
      reminderTime: parseInt(tempReminderTime) || 60,
      dailyReminderTime: tempDailyTime,
    });
    setShowNotificationModal(false);
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;

    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            setIsSigningOut(true);
            try {
              await signOut();
              // The AuthProvider will handle navigation
            } catch (error) {
              // Even if sign out fails, the UI will be updated
              // due to the optimistic nature of the new signOut function.
              Alert.alert("Error", "Could not sign out completely, but you have been logged out locally.");
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ],
    );
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
            Settings
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Section */}
        <View
          className="mx-4 mt-4 rounded-lg p-4"
          style={{ backgroundColor: colors.surface }}
        >
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Profile
          </Text>
          <TouchableOpacity
            className="flex-row items-center justify-between py-3"
            onPress={() => setShowProfileModal(true)}
          >
            <View className="flex-row items-center">
              <User size={20} color={colors.textSecondary} />
              <View className="ml-3">
                <Text className="font-medium" style={{ color: colors.text }}>
                  {user?.name || "User"}
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {user?.email}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Appearance Section */}
        <View
          className="mx-4 mt-4 rounded-lg p-4"
          style={{ backgroundColor: colors.surface }}
        >
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Appearance
          </Text>

          <View className="mb-4">
            <Text className="font-medium mb-3" style={{ color: colors.text }}>
              Theme
            </Text>
            {themeOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = theme === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  className={`flex-row items-center justify-between py-3 px-3 rounded-lg mb-2 ${
                    isSelected ? "border-2" : "border"
                  }`}
                  style={{
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected
                      ? `${colors.primary}10`
                      : "transparent",
                  }}
                  onPress={() => setTheme(option.value as any)}
                >
                  <View className="flex-row items-center">
                    <IconComponent
                      size={20}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      className="ml-3 font-medium"
                      style={{
                        color: isSelected ? colors.primary : colors.text,
                      }}
                    >
                      {option.label}
                    </Text>
                  </View>
                  {isSelected && (
                    <View
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notifications Section */}
        <View
          className="mx-4 mt-4 rounded-lg p-4"
          style={{ backgroundColor: colors.surface }}
        >
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Notifications
          </Text>

          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center">
              <Bell size={20} color={colors.textSecondary} />
              <Text className="ml-3 font-medium" style={{ color: colors.text }}>
                Enable Notifications
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={(value) => updateSettings({ enabled: value })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.enabled ? "white" : colors.textSecondary}
            />
          </View>

          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center">
              <Bell size={20} color={colors.textSecondary} />
              <Text className="ml-3 font-medium" style={{ color: colors.text }}>
                Daily Reminder
              </Text>
            </View>
            <Switch
              value={settings.dailyReminder}
              onValueChange={(value) =>
                updateSettings({ dailyReminder: value })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.dailyReminder ? "white" : colors.textSecondary}
            />
          </View>

          <TouchableOpacity
            className="flex-row items-center justify-between py-3"
            onPress={() => setShowNotificationModal(true)}
          >
            <View className="flex-row items-center">
              <Bell size={20} color={colors.textSecondary} />
              <Text className="ml-3 font-medium" style={{ color: colors.text }}>
                Notification Settings
              </Text>
            </View>
            <Text style={{ color: colors.textSecondary }}>Configure</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy & Security */}
        <View
          className="mx-4 mt-4 rounded-lg p-4"
          style={{ backgroundColor: colors.surface }}
        >
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: colors.text }}
          >
            Privacy & Security
          </Text>

          <TouchableOpacity className="flex-row items-center py-3">
            <Shield size={20} color={colors.textSecondary} />
            <Text className="ml-3 font-medium" style={{ color: colors.text }}>
              Privacy Policy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-3">
            <HelpCircle size={20} color={colors.textSecondary} />
            <Text className="ml-3 font-medium" style={{ color: colors.text }}>
              Help & Support
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between py-3"
            onPress={handleSignOut}
            disabled={isSigningOut}
            style={{ 
              opacity: isSigningOut ? 0.6 : 1,
              // Thêm background để dễ test touch
              backgroundColor: isSigningOut ? colors.border : 'transparent',
              borderRadius: 8,
              paddingHorizontal: 12
            }}
            activeOpacity={0.7} // Thêm feedback khi touch
          >
            <View className="flex-row items-center">
              <LogOut size={20} color={colors.textSecondary} />
              <Text className="ml-3 font-medium" style={{ color: colors.text }}>
                {isSigningOut ? "Đang đăng xuất..." : "Sign Out"}
              </Text>
            </View>
            {isSigningOut && (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Notification Settings Modal */}
      <Modal
        visible={showNotificationModal}
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
              Notification Settings
            </Text>
            <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="mb-6">
              <Text
                className="text-base font-medium mb-2"
                style={{ color: colors.text }}
              >
                Reminder Time (minutes before due date)
              </Text>
              <TextInput
                className="border rounded-lg px-3 py-3 text-base"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.text,
                }}
                placeholder="60"
                value={tempReminderTime}
                onChangeText={setTempReminderTime}
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View className="mb-6">
              <Text
                className="text-base font-medium mb-2"
                style={{ color: colors.text }}
              >
                Daily Reminder Time (HH:MM)
              </Text>
              <TextInput
                className="border rounded-lg px-3 py-3 text-base"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.text,
                }}
                placeholder="09:00"
                value={tempDailyTime}
                onChangeText={setTempDailyTime}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <TouchableOpacity
              className="py-4 rounded-lg items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={handleSaveNotificationSettings}
            >
              <View className="flex-row items-center">
                <Save size={20} color="white" />
                <Text className="text-white text-base font-semibold ml-2">
                  Save Settings
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default SettingsScreen;