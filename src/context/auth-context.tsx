"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { User, Role } from "@prisma/client";

type AuthContextType = {
  user: User | null;
  role: Role | undefined;
  setUser: (user: User) => void;
  updateUserLocal: (data: Partial<User>) => void; 
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  user: initialUser,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const [user, setUserState] = useState<User>(initialUser);

  // Fungsi untuk ganti user secara total
  const setUser = useCallback((newUser: User) => {
    setUserState(newUser);
  }, []);

  // Fungsi untuk update field tertentu saja (misal: cuma ganti image)
  const updateUserLocal = useCallback((data: Partial<User>) => {
    setUserState((prev) => {
      if (!prev) return prev;
      return { ...prev, ...data };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      role: user?.role, 
      setUser, 
      updateUserLocal 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}