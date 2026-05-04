import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { applyDataMode as applyAdminCatalogDataMode } from "./admin-catalog";
import { applyDataMode as applyMockStoreDataMode } from "./mock-store";

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
  /**
   * Data presentation mode used for demos:
   *  - "demo"  (default) → all mock master data (sellers, companies,
   *                        categories, etc.) is pre-seeded so screens look
   *                        populated.
   *  - "empty"           → every master collection is wiped on login so the
   *                        UI shows its inception-day empty states.
   * Currently used to distinguish the two super-admin demo logins.
   */
  dataMode?: "demo" | "empty";
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

/**
 * Re-initialise every mock data store to match the user's `dataMode`.
 * Called on login and on first boot when a stored user is rehydrated.
 */
function applyDataMode(mode: "demo" | "empty") {
  applyAdminCatalogDataMode(mode);
  applyMockStoreDataMode(mode);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Clean up legacy impersonation state from earlier builds.
    try {
      localStorage.removeItem(LEGACY_ACTIVE_SELLER_KEY);
    } catch {
      /* noop */
    }
    const stored = readStoredUser();
    // Rehydrate data mode for the stored session so reloads honour it.
    if (stored) applyDataMode(stored.dataMode ?? "demo");
    return stored;
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
    applyDataMode(u.dataMode ?? "demo");
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
