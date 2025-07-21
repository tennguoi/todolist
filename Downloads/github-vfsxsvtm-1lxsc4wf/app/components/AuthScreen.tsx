import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { Image } from "react-native";

const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password || (isSignUp && !name)) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      let success = false;

      if (isSignUp) {
        success = await signUp(email, password, name);
      } else {
        success = await signIn(email, password);
      }

      if (!success) {
        Alert.alert(
          "Error",
          isSignUp ? "Registration failed. Please check your information and try again." : "Invalid email or password. Please check your credentials and try again.",
        );
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const success = await signInWithGoogle();
      if (!success) {
        Alert.alert("Error", "Google Sign-In failed");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong with Google Sign-In");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-red-500 rounded-2xl items-center justify-center mb-4">
              <Text className="text-white text-2xl font-bold">T</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </Text>
            <Text className="text-gray-600 text-center">
              {isSignUp
                ? "Sign up to start organizing your tasks"
                : "Sign in to continue to your tasks"}
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            {isSignUp && (
              <View className="relative">
                <View className="absolute left-3 top-3 z-10">
                  <User size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-lg px-12 py-3 text-base"
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <Mail size={20} color="#9CA3AF" />
              </View>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg px-12 py-3 text-base"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <Lock size={20} color="#9CA3AF" />
              </View>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg px-12 pr-12 py-3 text-base"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                className="absolute right-3 top-3"
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`mt-6 py-4 rounded-lg items-center ${
              isLoading ? "bg-gray-400" : "bg-red-500"
            }`}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text className="text-white text-base font-semibold">
              {isLoading
                ? "Please wait..."
                : isSignUp
                  ? "Create Account"
                  : "Sign In"}
            </Text>
          </TouchableOpacity>

          {/* Google Sign-In Button */}
          <View className="mt-4">
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500 text-sm">or</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center py-3 px-4 border border-gray-300 rounded-lg bg-white"
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Image
                source={{
                  uri: "https://developers.google.com/identity/images/g-logo.png",
                }}
                className="w-5 h-5 mr-3"
              />
              <Text className="text-gray-700 font-medium">
                Continue with Google
              </Text>
            </TouchableOpacity>
          </View>

          {/* Toggle Auth Mode */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text className="text-red-500 font-semibold">
                {isSignUp ? "Sign In" : "Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;
