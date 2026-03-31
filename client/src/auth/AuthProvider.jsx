import { useMemo, useState } from 'react';
import { clearAuth, loadAuth, saveAuth } from './storage';
import { updateUser as updateStorageUser } from './userStorage';
import { AuthContext } from './context';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadAuth());
  // Allowed values: 'login' | 'signup' | null.
  const [authModal, setAuthModal] = useState(null);

  const value = useMemo(() => {
    return {
      user,
      authModal,
      setAuthModal,
      login: (userData, rememberMe) => {
        saveAuth(userData, rememberMe);
        setUser(userData);
      },
      logout: () => {
        clearAuth();
        setUser(null);
      },
      updateProfile: async (updates) => {
        if (!user?.id) return;
        try {
          const updated = await updateStorageUser(user.id, updates);
          // Keep the existing persistence mode when writing back updated user data.
          const isRemembered = !!localStorage.getItem('dishdetail_auth');
          saveAuth(updated, isRemembered);
          setUser(updated);
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
    };
  }, [user, authModal]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
