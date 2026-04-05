import { useMemo, useState, useEffect } from 'react';
import { clearAuth, loadAuth, saveAuth } from './storage';
import { updateUser as updateStorageUser } from './userStorage';
import { AuthContext } from './context';
import { api } from '../api';

export default function AuthProvider({ children }) {
  const initialAuth = useMemo(() => loadAuth(), []);
  const [user, setUser] = useState(() => initialAuth?.user ?? null);
  const [token, setToken] = useState(() => initialAuth?.token ?? null);
  const [rememberMe, setRememberMe] = useState(
    () => initialAuth?.rememberMe ?? false,
  );
  // Allowed values: 'login' | 'signup' | null.
  const [authModal, setAuthModal] = useState(null);

  useEffect(() => {
    if (!initialAuth?.token) {
      return;
    }
    let cancelled = false;

    api()
      .me()
      .then((data) => {
        if (!cancelled) {
          setUser(data.user);
        }
      })
      .catch(() => {
        if (cancelled) return;
        clearAuth();
        setUser(null);
        setToken(null);
        setRememberMe(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialAuth?.token]);

  const value = useMemo(() => {
    return {
      user,
      token,
      authModal,
      setAuthModal,
      login: (userData, tokenValue, rememberMe) => {
        saveAuth(userData, tokenValue, rememberMe);
        setUser(userData);
        setToken(tokenValue);
        setRememberMe(rememberMe);
      },
      logout: async () => {
        await api().logout();
        clearAuth();
        setUser(null);
        setToken(null);
        setRememberMe(false);
      },
      updateProfile: async (updates) => {
        if (!user?.id) return;
        try {
          const updated = await updateStorageUser(user.id, updates);
          setUser(updated);
          if (token) {
            saveAuth(updated, token, rememberMe);
          }
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
    };
  }, [user, token, rememberMe, authModal]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
