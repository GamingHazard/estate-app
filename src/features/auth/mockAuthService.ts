import { AuthResult, AuthService, LoginInput } from "./authTypes";

const MOCK_ACCOUNTS = [
  {
    id: "mock-user",
    username: "testuser",
    email: "testuseremail@gmail.com",
    password: "123456",
    role: "user" as const,
  },
  {
    id: "mock-landlord",
    username: "testadmin",
    email: "testadmin@gmail.com",
    password: "123456",
    role: "landlord" as const,
  },
];

export const mockAuthService: AuthService = {
  async login({ identifier, password }: LoginInput): Promise<AuthResult> {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const account = MOCK_ACCOUNTS.find(
      (candidate) =>
        candidate.username === normalizedIdentifier ||
        candidate.email === normalizedIdentifier,
    );

    if (!account || account.password !== password) {
      return {
        success: false,
        message: "Invalid username/email or password.",
      };
    }

    return {
      success: true,
      user: {
        id: account.id,
        username: account.username,
        email: account.email,
        role: account.role,
      },
    };
  },

  async logout() {
    return Promise.resolve();
  },
};
