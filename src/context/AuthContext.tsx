"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, userService } from "@/services";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  signUp: (params: { name: string; email: string; password: string; phone?: string }) => Promise<{ needsEmailConfirmation: boolean }>;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const current = await userService.getCurrentUser();
    setUser(current);
  };

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    userService
      .getCurrentUser()
      .then((current) => {
        if (mounted) setUser(current);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        userService.getCurrentUser().then((current) => mounted && setUser(current));
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signUp: AuthContextValue["signUp"] = async (params) => {
    return authService.signUp(params);
  };

  const login = async (email: string, password: string, remember: boolean) => {
    const loggedUser = await authService.login(email, password, remember);
    setUser(loggedUser);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const sendPasswordReset = async (email: string) => {
    await authService.sendPasswordReset(email);
  };

  const updatePassword = async (newPassword: string) => {
    await authService.updatePassword(newPassword);
  };

  const updateUser = async (data: Partial<User>) => {
    const updated = await userService.updateUser(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isLoading,
        signUp,
        login,
        logout,
        sendPasswordReset,
        updatePassword,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
