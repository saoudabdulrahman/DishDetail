import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearAuth, loadAuth, saveAuth } from "./storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(loadAuth());
  }, []);

  const value = useMemo(() => {
    return {
      user,
      login: (username, rememberMe) => {
        const newUser = { username };
        saveAuth(newUser, rememberMe);
        setUser(newUser);
      },
      logout: () => {
        clearAuth();
        setUser(null);
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
