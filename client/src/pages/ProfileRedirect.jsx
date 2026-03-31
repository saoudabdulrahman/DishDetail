import { Navigate } from 'react-router';
import { useAuth } from '../auth/useAuth';

export default function ProfileRedirect() {
  const { user } = useAuth();
  return <Navigate to={`/profile/${user.username}`} replace />;
}
