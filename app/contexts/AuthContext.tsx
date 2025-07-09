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
const API_BASE_URL = "http://localhost:3000/api";

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
  isOnline: boolean;
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
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    checkAuthState();
    setupAxiosInterceptors();
  }, []);

  const setupAxiosInterceptors = () => {
    // Request interceptor
    axios.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token expiration
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, sign out user
          await signOut();
        }
        return Promise.reject(error);
      }
    );
  };

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (userData && token) {
        // Verify token with backend
        try {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await axios.get(`${API_BASE_URL}/auth/verify`);
          
          if (response.data.success) {
            setUser(JSON.parse(userData));
            setIsOnline(true);
          } else {
            throw new Error("Token verification failed");
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          // Clear invalid token
          await AsyncStorage.removeItem("user");
          await AsyncStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
          setIsOnline(false);
        }
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
        setIsOnline(true);
        return true;
      } else {
        console.error("Sign in failed:", response.data.message);
        return false;
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setIsOnline(false);
      
      // Only use mock authentication in development mode
      if (__DEV__ && process.env.NODE_ENV === 'development') {
        console.warn("Using mock authentication - for development only");
        if (email && password.length >= 6) {
          const userData = {
            id: "mock-1",
            email,
            name: email.split("@")[0],
          };
          await AsyncStorage.setItem("user", JSON.stringify(userData));
          await AsyncStorage.setItem("token", "mock-token");
          setUser(userData);
          return true;
        }
      }
      
      return false;
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
        setIsOnline(true);
        return true;
      } else {
        console.error("Sign up failed:", response.data.message);
        return false;
      }
    } catch (error) {
      console.error("Sign up error:", error);
      setIsOnline(false);
      
      // Only use mock registration in development mode
      if (__DEV__ && process.env.NODE_ENV === 'development') {
        console.warn("Using mock registration - for development only");
        if (email && password.length >= 6 && name) {
          const userData = {
            id: `mock-${Date.now()}`,
            email,
            name,
          };
          await AsyncStorage.setItem("user", JSON.stringify(userData));
          await AsyncStorage.setItem("token", "mock-token");
          setUser(userData);
          return true;
        }
      }
      
      return false;
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
          const userData = response.data.data.user;
          const token = response.data.data.token;

          // Store user data and token
          await AsyncStorage.setItem("user", JSON.stringify(userData));
          await AsyncStorage.setItem("token", token);

          // Set default axios header for future requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          setUser(userData);
          setIsOnline(true);
          return true;
        } else {
          console.error("Google sign in failed:", response.data.message);
          return false;
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
    try {
      // Call backend to invalidate token
      try {
        await axios.post(`${API_BASE_URL}/auth/signout`);
      } catch (error) {
        console.error("Error signing out from backend:", error);
      }

      // Sign out from Google if signed in with Google
      try {
        const currentUser = await GoogleSignin.getCurrentUser();
        if (currentUser) {
          await GoogleSignin.signOut();
        }
      } catch (error) {
        console.error("Error signing out from Google:", error);
      }

      // Clear stored data
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");

      // Clear axios default header
      delete axios.defaults.headers.common["Authorization"];

      setUser(null);
      setIsOnline(false);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signUp, signInWithGoogle, signOut, isOnline }}
    >
      {children}
    </AuthContext.Provider>
  );
};