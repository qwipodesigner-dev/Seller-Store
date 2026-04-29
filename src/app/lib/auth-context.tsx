import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Phase 1 ships only two roles: super-admin and seller. The previous
// "admin_seller" role (Qwipo staff acting as a specific seller via the
// SellerPicker) has been removed.
export type Role = "admin" | "seller";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  businessName?: string;
  avatarInitials: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "qwipo.auth.user";
// Legacy key from the admin_seller impersonation flow — we proactively wipe
// it on load so stale storage doesn't linger.
const LEGACY_ACTIVE_SELLER_KEY = "qwipo.auth.activeSeller";

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.id === "string" &&
      (parsed.role === "admin" || parsed.role === "seller")
    ) {
      return parsed as AuthUser;
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Clean up legacy impersonation state from earlier builds.
    try {
      localStorage.removeItem(LEGACY_ACTIVE_SELLER_KEY);
    } catch {
      /* noop */
    }
    return readStoredUser();
  });

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setUser(readStoredUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = (u: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_ACTIVE_SELLER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
