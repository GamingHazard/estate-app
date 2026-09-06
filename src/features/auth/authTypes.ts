export type UserRole = "user" | "landlord" | "propertyManager";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
};

export type LoginInput = {
  identifier: string;
  password: string;
};

export type AuthResult =
  | { success: true; user: AuthUser }
  | { success: false; message: string };

export interface AuthService {
  login(input: LoginInput): Promise<AuthResult>;
  logout(): Promise<void>;
}
