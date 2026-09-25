export type UserRole = "user" | "landlord" | "propertyManager";

export type AuthUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: { url?: string; publicId?: string };
};

export type LoginInput = {
  identifier: string;
  password: string;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone: number;
  dob: any;
  gender: string;
  nin?: string;
};

export type AuthResult =
  | { success: true; user: AuthUser }
  | { success: false; message: string };
