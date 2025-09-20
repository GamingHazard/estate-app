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
}

export const lightTheme: ThemeColors = {
  background: "whitesmoke",
  text: "#1F2937",
  primary: "#2563eb",
  secondary: "#64748b",
  card: "#FFFFFF",
  border: "#e2e8f0",
  tabActive: "#2563eb",
  tabInactive: "#64748b",
  bg: "#1F2937",
  textMuted: "#6B7280",
};

export const darkTheme: ThemeColors = {
  background: "#1a1a1a",
  text: "#FFFFFF",
  primary: "#3b82f6",
  secondary: "#94a3b8",
  card: "#262626",
  border: "#404040",
  tabActive: "#3b82f6",
  tabInactive: "#94a3b8",
  bg: "#4B5563",
  textMuted: "#9CA3AF",
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
