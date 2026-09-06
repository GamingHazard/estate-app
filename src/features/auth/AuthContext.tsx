import React, { createContext, useContext, useState } from "react";
import { AuthResult, AuthService, AuthUser, LoginInput } from "./authTypes";
import { mockAuthService } from "./mockAuthService";

type AuthContextValue = {
  user: AuthUser | null;
  isGuest: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<AuthResult>;
  openAuth: () => void;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactNode;
  service?: AuthService;
};

export const AuthProvider = ({
  children,
  service = mockAuthService,
}: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (input: LoginInput) => {
    setIsLoading(true);
    try {
      const result = await service.login(input);
      if (result.success) {
        setUser(result.user);
        setIsGuest(false);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
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
      await service.logout();
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
