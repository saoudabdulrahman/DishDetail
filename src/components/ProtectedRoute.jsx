import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../auth/useAuth';

const ProtectedRoute = ({ children }) => {
	const { user } = useAuth();
	const location = useLocation();

	if (!user) {
		return <Navigate to="/login" state={{ from: location.pathname }} replace />;
	}

	return children ? children : <Outlet />;
};

export default ProtectedRoute;
