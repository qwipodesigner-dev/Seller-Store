import type { AuthUser } from "./auth-context";

interface CredentialRecord {
  otp: string; // demo OTP
  user: AuthUser;
}

// Demo credentials keyed by mobile number. Phase 1 is UI-only.
export const DEMO_CREDENTIALS: Record<string, CredentialRecord> = {
  "9900000001": {
    otp: "1234",
    user: {
      id: "admin-1",
      name: "Qwipo Super Admin",
      email: "admin@qwipo.com",
      role: "admin",
      avatarInitials: "SA",
    },
  },
  "9900000002": {
    otp: "1234",
    user: {
      id: "seller-1",
      name: "Rajesh Kumar",
      email: "seller@qwipo.com",
      role: "seller",
      businessName: "ABC Distributors",
      avatarInitials: "RK",
    },
  },
};

export function validateCredentials(
  mobile: string,
  otp: string,
): AuthUser | null {
  const key = mobile.trim().replace(/\D/g, ""); // strip non-digits
  const record = DEMO_CREDENTIALS[key];
  if (!record) return null;
  if (record.otp !== otp) return null;
  return record.user;
}
