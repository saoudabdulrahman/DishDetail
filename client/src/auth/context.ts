import { createContext } from 'react';
import type { PublicUser } from '@dishdetail/shared';

export interface AuthContextType {
  user: PublicUser | null;
  authModal: 'login' | 'signup' | null;
  setAuthModal: React.Dispatch<React.SetStateAction<'login' | 'signup' | null>>;
  login: (userData: PublicUser, rememberMe: boolean) => void;
  logout: () => void;
  updateProfile: (updates: Partial<PublicUser>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
