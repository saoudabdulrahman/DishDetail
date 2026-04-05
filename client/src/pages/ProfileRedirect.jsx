import { Navigate } from 'react-router';
import { useAuth } from '../auth/useAuth';

export default function ProfileRedirect() {
  const { user } = useAuth();
  if (!user) return null;
  return <Navigate to={`/profile/${user.username}`} replace />;
}
