import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, ColorSchemeName } from "react-native";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  colors: {
    background: string;
    surface: string;
    primary: string;
    text: string;
    textSecondary: string;
    border: string;
    card: string;
    success: string;
    warning: string;
    error: string;
  };
}

const lightColors = {
  background: "#F9FAFB",
  surface: "#FFFFFF",
  primary: "#EF4444",
  text: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  card: "#FFFFFF",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
};

const darkColors = {
  background: "#111827",
  surface: "#1F2937",
  primary: "#EF4444",
  text: "#F9FAFB",
  textSecondary: "#9CA3AF",
  border: "#374151",
  card: "#1F2937",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>("system");
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );

  useEffect(() => {
    loadTheme();
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });
    return () => subscription?.remove();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem("theme", newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const isDark =
    theme === "dark" || (theme === "system" && systemColorScheme === "dark");

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
