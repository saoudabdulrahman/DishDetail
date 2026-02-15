import { useMemo, useState } from 'react';
import { clearAuth, loadAuth, saveAuth } from './storage';
import { updateUser as updateStorageUser } from './userStorage';
import { AuthContext } from './context';

export default function AuthProvider({ children }) {
	const [user, setUser] = useState(() => loadAuth());

	const value = useMemo(() => {
		return {
			user,
			login: (userData, rememberMe) => {
				saveAuth(userData, rememberMe);
				setUser(userData);
			},
			logout: () => {
				clearAuth();
				setUser(null);
			},
			updateProfile: (updates) => {
				if (!user) return;
				const updatedUser = { ...user, ...updates };
				
				try {
					updateStorageUser(user.username, updates);
				} catch (e) {
					console.error("Failed to update user storage", e);
				}

				const isRemembered = !!localStorage.getItem('dishdetail_auth');
				saveAuth(updatedUser, isRemembered);
				setUser(updatedUser);
			}
		};
	}, [user]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
