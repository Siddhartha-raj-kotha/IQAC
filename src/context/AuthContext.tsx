"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, getUserByCredentials, changeUserPassword, PasswordChangeResult, Role } from "@/lib/mockData";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPass: string, newPass: string) => Promise<PasswordChangeResult>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  changePassword: async () => ({ success: false, error: "Not initialized" }),
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("iqac_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const found = getUserByCredentials(email.trim(), password.trim());
    if (found) {
      setUser(found);
      localStorage.setItem("iqac_user", JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("iqac_user");
    router.push("/login");
  };

  const changePassword = async (currentPass: string, newPass: string): Promise<PasswordChangeResult> => {
    if (!user) return { success: false, error: "Not authenticated" };
    const res = changeUserPassword(user.id, currentPass, newPass);
    if (res.success) {
      const updatedUser: User = { ...user, password: newPass };
      setUser(updatedUser);
      localStorage.setItem("iqac_user", JSON.stringify(updatedUser));
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const roleHome: Record<Role, string> = {
  faculty: "/faculty",
  hod: "/hod",
  principal: "/principal",
  admin: "/admin",
};
