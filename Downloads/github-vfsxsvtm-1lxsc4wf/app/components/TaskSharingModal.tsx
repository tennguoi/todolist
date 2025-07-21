import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import {
  X,
  Share,
  Users,
  Mail,
  Copy,
  UserPlus,
  Trash2,
} from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Task } from "../contexts/TaskContext";

interface TaskSharingModalProps {
  visible: boolean;
  onClose: () => void;
  task: Task | null;
}

interface SharedUser {
  id: string;
  email: string;
  name: string;
  role: "viewer" | "editor" | "owner";
}

const TaskSharingModal = ({
  visible,
  onClose,
  task,
}: TaskSharingModalProps) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<"viewer" | "editor">(
    "viewer",
  );
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([
    {
      id: "1",
      email: "john@example.com",
      name: "John Doe",
      role: "editor",
    },
    {
      id: "2",
      email: "jane@example.com",
      name: "Jane Smith",
      role: "viewer",
    },
  ]);

  const handleShareTask = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // In a real app, this would make an API call
    const newUser: SharedUser = {
      id: Date.now().toString(),
      email: email.trim(),
      name: email.split("@")[0],
      role: selectedRole,
    };

    setSharedUsers([...sharedUsers, newUser]);
    setEmail("");
    Alert.alert("Success", `Task shared with ${email}`);
  };

  const handleRemoveUser = (userId: string) => {
    Alert.alert(
      "Remove Access",
      "Are you sure you want to remove this user's access?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setSharedUsers(sharedUsers.filter((user) => user.id !== userId));
          },
        },
      ],
    );
  };

  const handleCopyLink = () => {
    // In a real app, this would copy a shareable link
    Alert.alert("Link Copied", "Shareable link copied to clipboard");
  };

  const roles = [
    {
      value: "viewer",
      label: "Viewer",
      description: "Can view task details",
    },
    {
      value: "editor",
      label: "Editor",
      description: "Can view and edit task",
    },
  ];

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <View
          className="flex-row justify-between items-center p-4 border-b"
          style={{
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          }}
        >
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Share Task
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Task Info */}
          <View
            className="rounded-lg p-4 mb-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text
              className="font-bold text-lg mb-2"
              style={{ color: colors.text }}
            >
              {task.title}
            </Text>
            {task.description && (
              <Text style={{ color: colors.textSecondary }}>
                {task.description}
              </Text>
            )}
          </View>

          {/* Share with Email */}
          <View
            className="rounded-lg p-4 mb-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="font-bold mb-3" style={{ color: colors.text }}>
              Share with People
            </Text>

            <View className="mb-4">
              <Text className="mb-2" style={{ color: colors.text }}>
                Email Address
              </Text>
              <View
                className="flex-row items-center border rounded-lg px-3 py-3 mb-3"
                style={{ borderColor: colors.border }}
              >
                <Mail size={20} color={colors.textSecondary} />
                <TextInput
                  className="flex-1 ml-2 text-base"
                  placeholder="Enter email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ color: colors.text }}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            {/* Role Selection */}
            <View className="mb-4">
              <Text className="mb-2" style={{ color: colors.text }}>
                Permission Level
              </Text>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  className={`flex-row items-center justify-between p-3 rounded-lg mb-2 border ${
                    selectedRole === role.value ? "border-2" : ""
                  }`}
                  style={{
                    borderColor:
                      selectedRole === role.value
                        ? colors.primary
                        : colors.border,
                    backgroundColor:
                      selectedRole === role.value
                        ? `${colors.primary}10`
                        : "transparent",
                  }}
                  onPress={() =>
                    setSelectedRole(role.value as "viewer" | "editor")
                  }
                >
                  <View>
                    <Text
                      className="font-medium"
                      style={{
                        color:
                          selectedRole === role.value
                            ? colors.primary
                            : colors.text,
                      }}
                    >
                      {role.label}
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      {role.description}
                    </Text>
                  </View>
                  {selectedRole === role.value && (
                    <View
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center py-3 rounded-lg"
              style={{ backgroundColor: colors.primary }}
              onPress={handleShareTask}
            >
              <UserPlus size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Share Task</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Share Options */}
          <View
            className="rounded-lg p-4 mb-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="font-bold mb-3" style={{ color: colors.text }}>
              Quick Share
            </Text>

            <TouchableOpacity
              className="flex-row items-center py-3 border-b"
              style={{ borderBottomColor: colors.border }}
              onPress={handleCopyLink}
            >
              <Copy size={20} color={colors.textSecondary} />
              <Text className="ml-3" style={{ color: colors.text }}>
                Copy shareable link
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-3"
              onPress={() => {
                // In a real app, this would open the share sheet
                Alert.alert("Share", "Opening share options...");
              }}
            >
              <Share size={20} color={colors.textSecondary} />
              <Text className="ml-3" style={{ color: colors.text }}>
                Share via other apps
              </Text>
            </TouchableOpacity>
          </View>

          {/* Shared Users List */}
          <View
            className="rounded-lg p-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="font-bold mb-3" style={{ color: colors.text }}>
              People with Access
            </Text>

            {sharedUsers.map((user) => (
              <View
                key={user.id}
                className="flex-row items-center justify-between py-3 border-b"
                style={{ borderBottomColor: colors.border }}
              >
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-medium"
                      style={{ color: colors.text }}
                    >
                      {user.name}
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      {user.email}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <Text
                    className="text-sm mr-3 px-2 py-1 rounded"
                    style={{
                      color: colors.primary,
                      backgroundColor: `${colors.primary}20`,
                    }}
                  >
                    {user.role}
                  </Text>
                  {user.role !== "owner" && (
                    <TouchableOpacity onPress={() => handleRemoveUser(user.id)}>
                      <Trash2 size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default TaskSharingModal;
