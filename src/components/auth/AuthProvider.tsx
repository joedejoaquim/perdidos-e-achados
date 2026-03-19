"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { User } from "@/types";

type AuthContextValue = {
  error: string | null;
  ready: boolean;
  setError: (value: string | null) => void;
  setUser: (value: User | null) => void;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUser(initialUser);
    setError(null);
  }, [initialUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      error,
      ready: true,
      setError,
      setUser,
      user,
    }),
    [error, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useOptionalAuthContext() {
  return useContext(AuthContext);
}
