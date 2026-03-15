import { useMemo, useState } from 'react';
import { clearAuth, loadAuth, saveAuth } from './storage';
import { updateUser as updateStorageUser } from './userStorage';
import { AuthContext } from './context';

/**
 * AuthProvider serves as the single source of truth for user authentication state.
 * It manages the synchronization between the React application state and browser storage,
 * ensuring that the user session persists across page reloads while providing
 * a unified interface for login, logout, and profile updates.
 */
export default function AuthProvider({ children }) {
	const [user, setUser] = useState(() => loadAuth());
	const [authModal, setAuthModal] = useState(null); // 'login' | 'signup' | null

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
					const isRemembered = !!localStorage.getItem('dishdetail_auth');
					saveAuth(updated, isRemembered);
					setUser(updated);
				} catch (e) {
					console.error('Failed to update user profile', e);
				}
			},
		};
	}, [user, authModal]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
