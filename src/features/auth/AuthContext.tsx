import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthResult, AuthUser, LoginInput, RegisterInput } from "./authTypes";
import { apiRequest } from "../../shared/queryClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_STORAGE_KEY = "userProfile";
const TOKEN_STORAGE_KEY = "authToken";

type AuthContextValue = {
  user: AuthUser | null;
  isGuest: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<AuthResult>;
  register: (data: RegisterInput) => Promise<AuthResult>;
  updateUser: (user: AuthUser) => Promise<void>;
  openAuth: () => void;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const persistSession = async (user: AuthUser, token?: string) => {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    if (token) {
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  };

  const normalizeUser = (value: AuthUser): AuthUser => ({
    ...value,
    username: value.username || value.email,
  });

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const [savedProfile, savedToken] = await Promise.all([
          AsyncStorage.getItem(USER_STORAGE_KEY),
          AsyncStorage.getItem(TOKEN_STORAGE_KEY),
        ]);

        if (savedProfile && savedToken) {
          setUser(JSON.parse(savedProfile) as AuthUser);
          setIsGuest(false);
        } else if (savedProfile) {
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
          setIsGuest(false);
        }
      } catch (error) {
        console.error("Unable to restore saved user profile:", error);
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
      }
    };

    void restoreUser();
  }, []);

  const login = async (input: LoginInput): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/auth/login", input);
      const result = await response.json();

      if (result.user && result.token) {
        const user = normalizeUser(result.user);
        await persistSession(user, result.token);
        setUser(user);

        console.log("Login successful:", user);
        setIsGuest(false);
        return { success: true, user };
      }

      return {
        success: false,
        message: result?.message || "Login did not return a valid session.",
      };
    } catch (error) {
      console.error("Login session could not be saved:", error);
      const message =
        error instanceof Error
          ? `Unable to save your login session: ${error.message}`
          : "Unable to save your login session.";
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };
  const register = async (data: RegisterInput): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const resp = await apiRequest("POST", "/auth/register", data);
      const result = await resp.json();
      if (result?.success && result.user) {
        const user = normalizeUser(result.user);
        await persistSession(user, result.token);
        setUser(user);
        setIsGuest(false);
      }
      return result as AuthResult;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updatedUser: AuthUser) => {
    const user = normalizeUser(updatedUser);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    setUser(user);
    setIsGuest(false);
  };

  const continueAsGuest = () => {
    setUser(null);
    setIsGuest(true);
  };

  const openAuth = () => {
    setUser(null);
    setIsGuest(false);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
      setIsGuest(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        isLoading,
        login,
        register,
        updateUser,
        openAuth,
        continueAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
