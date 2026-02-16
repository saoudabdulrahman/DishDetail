import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../auth/useAuth';

const GuestRoute = ({ children }) => {
	const { user } = useAuth();

	if (user) {
		return <Navigate to="/" replace />;
	}

	return children ? children : <Outlet />;
};

export default GuestRoute;
