export type UserRole = "user" | "landlord" | "propertyManager";

export type AuthUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  bio?: string;
  publicContact?: { showPhone: boolean; showEmail: boolean };
  dob?: string;
  nin?: string;
  gender?: string;
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
};  QA1WS2ED3R4FTG5YH6U78888888\

export type AuthResult =
  | { success: true; user: AuthUser }
  | { success: false; message: string };


  |