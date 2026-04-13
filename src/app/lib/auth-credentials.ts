import type { AuthUser } from "./auth-context";

interface CredentialRecord {
  password: string;
  user: AuthUser;
}

// Demo credentials. Phase 1 is UI-only, so auth is fully client-side.
export const DEMO_CREDENTIALS: Record<string, CredentialRecord> = {
  "admin@qwipo.com": {
    password: "admin@123",
    user: {
      id: "admin-1",
      name: "Qwipo Master Admin",
      email: "admin@qwipo.com",
      role: "admin",
      avatarInitials: "MA",
    },
  },
  "seller@qwipo.com": {
    password: "seller@123",
    user: {
      id: "seller-1",
      name: "Rajesh Kumar",
      email: "seller@qwipo.com",
      role: "seller",
      businessName: "ABC Distributors",
      avatarInitials: "RK",
    },
  },
  "adminseller@qwipo.com": {
    password: "adminseller@123",
    user: {
      id: "admin-seller-1",
      name: "Omkar Charankar",
      email: "adminseller@qwipo.com",
      role: "admin_seller",
      avatarInitials: "OC",
    },
  },
};

export function validateCredentials(
  emailOrPhone: string,
  password: string,
): AuthUser | null {
  const key = emailOrPhone.trim().toLowerCase();
  const record = DEMO_CREDENTIALS[key];
  if (!record) return null;
  if (record.password !== password) return null;
  return record.user;
}
