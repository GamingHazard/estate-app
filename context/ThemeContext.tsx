import React, { createContext, useContext, useState, useCallback } from "react";
import { useColorScheme } from "react-native";

type ThemeType = "light" | "dark";

interface ThemeColors {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  card: string;
  border: string;
  tabActive: string;
  tabInactive: string;
  bg: string;
  textMuted: string;
  destructive: string;
  muted: string;
  warning: string;
  error: string;
}

export const lightTheme: ThemeColors = {
  background: "whitesmoke",
  text: "#1F2937",
  primary: "#2563eb",
  secondary: "#64748b",
  card: "white",
  border: "#e2e8f0",
  tabActive: "#2563eb",
  tabInactive: "#64748b",
  bg: "#1F2937",
  textMuted: "#6B7280",
  destructive: "#ef4444",
  muted: "#9CA3AF",
  warning: "#f59e0b",
  error: "#dc2626",
};

export const darkTheme: ThemeColors = {
  background: "#1a1a1a",
  text: "white",
  primary: "#3b82f6",
  secondary: "#94a3b8",
  card: "#404040",
  border: "#404040",
  tabActive: "#3b82f6",
  tabInactive: "#94a3b8",
  bg: "#4B5563",
  textMuted: "#9CA3AF",
  destructive: "#ef4444",
  muted: "#6B7280",
  warning: "#f59e0b",
  error: "#dc2626",
};

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>(deviceTheme || "light");

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const colors = theme === "light" ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};