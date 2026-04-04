import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import type { User, UserRole } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole, company?: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const mapUser = (u: any): User => ({
  id: u._id || u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  skills: u.skills || [],
  bio: u.bio || "",
  location: u.location || "",
  experience: u.experience || "",
  company: u.company || "",
  avatar: u.avatar || "",
  online: u.online || false,
});

// Use localStorage so sessions persist across page refreshes and tab restores.
const storage = localStorage;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = storage.getItem("devhirex_token");
      if (token) {
        try {
          const res = await api.get("/api/auth/me");
          const mappedUser = mapUser(res.data.user);
          setUser(mappedUser);
          connectSocket(mappedUser.id);
        } catch {
          storage.removeItem("devhirex_token");
          storage.removeItem("devhirex_user");
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    storage.removeItem("devhirex_token");
    storage.removeItem("devhirex_user");
    disconnectSocket();
  }, []);

  // Listen for session expiration (e.g. logging into same account from another tab/browser)
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    
    const handleSessionExpired = (expiredEmail?: string) => {
      // Only log out if specifically targeting this user's email ID
      if (expiredEmail && user.email === expiredEmail) {
        alert("You have been logged out because this account (Email ID) was logged in from another location.");
        logout();
      } else if (!expiredEmail) {
        // Fallback if the backend sends an empty emit for some reason
        logout();
      }
    };
    
    socket.on("session_expired", handleSessionExpired);
    return () => {
      socket.off("session_expired", handleSessionExpired);
    };
  }, [user, logout]);

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    const res = await api.post("/api/auth/login", { email, password, role });
    const { token, user: u } = res.data;
    storage.setItem("devhirex_token", token);
    const mappedUser = mapUser({ ...u, online: true });
    setUser(mappedUser);
    storage.setItem("devhirex_user", JSON.stringify(mappedUser));
    connectSocket(mappedUser.id);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, role: UserRole, company?: string) => {
    const res = await api.post("/api/auth/signup", { name, email, password, role, company });
    const { token, user: u } = res.data;
    storage.setItem("devhirex_token", token);
    const mappedUser = mapUser({ ...u, online: true });
    setUser(mappedUser);
    storage.setItem("devhirex_user", JSON.stringify(mappedUser));
    connectSocket(mappedUser.id);
  }, []);

  const switchRole = useCallback((_role: UserRole) => {
    // Role switching is not supported with real auth
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, signup, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
