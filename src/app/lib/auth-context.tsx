import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Role = "admin" | "seller" | "admin_seller";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  businessName?: string;
  avatarInitials: string;
}

// For admin_seller: which seller they are currently acting as
export interface ActiveSellerContext {
  sellerId: string;
  sellerName: string;
  businessName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  activeSeller: ActiveSellerContext | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  setActiveSeller: (seller: ActiveSellerContext | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "qwipo.auth.user";
const ACTIVE_SELLER_KEY = "qwipo.auth.activeSeller";

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.id === "string" &&
      (parsed.role === "admin" || parsed.role === "seller" || parsed.role === "admin_seller")
    ) {
      return parsed as AuthUser;
    }
    return null;
  } catch {
    return null;
  }
}

function readActiveSeller(): ActiveSellerContext | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SELLER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveSellerContext;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [activeSeller, setActiveSellerState] = useState<ActiveSellerContext | null>(
    () => readActiveSeller(),
  );

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setUser(readStoredUser());
      if (e.key === ACTIVE_SELLER_KEY) setActiveSellerState(readActiveSeller());
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
    localStorage.removeItem(ACTIVE_SELLER_KEY);
    setUser(null);
    setActiveSellerState(null);
  };

  const setActiveSeller = (seller: ActiveSellerContext | null) => {
    if (seller) {
      localStorage.setItem(ACTIVE_SELLER_KEY, JSON.stringify(seller));
    } else {
      localStorage.removeItem(ACTIVE_SELLER_KEY);
    }
    setActiveSellerState(seller);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        activeSeller,
        login,
        logout,
        setActiveSeller,
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
