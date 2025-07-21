import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import axios from "axios";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: "YOUR_WEB_CLIENT_ID.googleusercontent.com", // Replace with your actual web client ID
  offlineAccess: true,
});

// API Base URL - Replace with your actual backend URL
// For mobile development, use your computer's IP address instead of localhost
// const API_BASE_URL = "http://10.0.2.2:3000/api"; // For Android emulator
const API_BASE_URL = "http://localhost:3000/api"; // For iOS simulator
// const API_BASE_URL = "http://YOUR_COMPUTER_IP:3000/api"; // For physical device

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  googleId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    // Interceptor để tự động đăng xuất khi gặp 401
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        if (error.response && error.response.status === 401) {
          try {
            await signOut();
          } catch (e) {
            // ignore
          }
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (userData && token) {
        // Set axios default header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
        email,
        password,
      });

      if (response.data.success) {
        const userData = response.data.data.user;
        const token = response.data.data.token;

        // Store user data and token
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        await AsyncStorage.setItem("token", token);

        // Set default axios header for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser(userData);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Sign in error:", error);
      
      // Check if it's a network error or server error
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error?.message || "Invalid credentials";
        console.error("Server error:", errorMessage);
        return false;
      } else if (error.request) {
        // Network error - no response received
        console.error("Network error:", error.message);
        return false;
      } else {
        // Other error
        console.error("Other error:", error.message);
        return false;
      }
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
  ): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email,
        password,
        name,
      });

      if (response.data.success) {
        const userData = response.data.data.user;
        const token = response.data.data.token;

        // Store user data and token
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        await AsyncStorage.setItem("token", token);

        // Set default axios header for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser(userData);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      // Check if it's a network error or server error
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error?.message || "Registration failed";
        console.error("Server error:", errorMessage);
        return false;
      } else if (error.request) {
        // Network error - no response received
        console.error("Network error:", error.message);
        return false;
      } else {
        // Other error
        console.error("Other error:", error.message);
        return false;
      }
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.data) {
        // Send Google user info to your backend
        const response = await axios.post(`${API_BASE_URL}/auth/google`, {
          googleId: userInfo.data.user.id,
          email: userInfo.data.user.email,
          name: userInfo.data.user.name,
          avatar: userInfo.data.user.photo,
          idToken: userInfo.data.idToken,
        });

        if (response.data.success) {
          const userData = response.data.user;
          const token = response.data.token;

          // Store user data and token
          await AsyncStorage.setItem("user", JSON.stringify(userData));
          await AsyncStorage.setItem("token", token);

          // Set default axios header for future requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          setUser(userData);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Google Sign-In error:", error);
      if (typeof error === "object" && error && "code" in error) {
        const err = error as { code: string };
        if (err.code === statusCodes.SIGN_IN_CANCELLED) {
          console.log("User cancelled the login flow");
        } else if (err.code === statusCodes.IN_PROGRESS) {
          console.log("Sign in is in progress already");
        } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          console.log("Play services not available");
        }
      }
      return false;
    }
  };

  const signOut = async () => {
    // Set user to null immediately to update UI
    setUser(null);

    // Clear local storage
    const keysToRemove = ["user", "token"];
    await AsyncStorage.multiRemove(keysToRemove);

    // Clear axios authorization header
    delete axios.defaults.headers.common["Authorization"];

    // Attempt to sign out from Google, but don't block if it fails
    try {
      if (await GoogleSignin.getCurrentUser()) {
        await GoogleSignin.signOut();
      }
    } catch (error) {
      console.error("Google Sign-Out error:", error);
    }

    // Attempt to notify backend, but don't block if it fails
    try {
      await axios.post(`${API_BASE_URL}/auth/signout`);
    } catch (error) {
      console.error("Backend Sign-Out error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};