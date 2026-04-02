import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface Driver {
  id: string;
  driverName: string;
  driverEmail: string;
  driverPhone: string;
  // ... other fields from the Prisma Driver model
  [key: string]: any;
}

interface AuthContextValue {
  driver: Driver | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("driver_token");
    const storedDriver = localStorage.getItem("driver_data");

    if (storedToken && storedDriver) {
      try {
        setToken(storedToken);
        setDriver(JSON.parse(storedDriver));
      } catch {
        localStorage.removeItem("driver_token");
        localStorage.removeItem("driver_data");
      }
    }

    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/driver-auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Login failed" }));
      throw new Error(error.message || "Login failed");
    }

    const json = await res.json();
    // Backend wraps in { success, data, message }
    const data: { access_token: string; driver: Driver } = json.data ?? json;

    localStorage.setItem("driver_token", data.access_token);
    localStorage.setItem("driver_data", JSON.stringify(data.driver));

    setToken(data.access_token);
    setDriver(data.driver);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("driver_token");
    localStorage.removeItem("driver_data");
    setToken(null);
    setDriver(null);
  }, []);

  const isAuthenticated = token !== null && driver !== null;

  return (
    <AuthContext.Provider value={{ driver, token, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
