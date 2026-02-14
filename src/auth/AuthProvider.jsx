import { useMemo, useState } from 'react';
import { clearAuth, loadAuth, saveAuth } from './storage';
import { AuthContext } from './context';

export default function AuthProvider({ children }) {
	const [user, setUser] = useState(() => loadAuth());

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
