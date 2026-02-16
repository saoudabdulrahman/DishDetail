import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../auth/useAuth';

const ProtectedRoute = ({ children }) => {
	const { user } = useAuth();

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return children ? children : <Outlet />;
};

export default ProtectedRoute;
