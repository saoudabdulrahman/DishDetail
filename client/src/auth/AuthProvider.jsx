import { useMemo, useState } from 'react';
//import { clearAuth, loadAuth, saveAuth } from './storage';
import { updateUser as updateStorageUser } from './userStorage';
import { AuthContext } from './context';
import { useEffect } from 'react';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Allowed values: 'login' | 'signup' | null.
  const [authModal, setAuthModal] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/auth/me', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => setUser(null));
  }, []);

  const value = useMemo(() => {
    return {
      user,
      authModal,
      setAuthModal,
      login: (userData) => {
        // backend already set cookie
        setUser(userData);
      },
      logout: async () => {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
        setUser(null);
      },
      updateProfile: async (updates) => {
        if (!user?.id) return;
        try {
          const updated = await updateStorageUser(user.id, updates);
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
