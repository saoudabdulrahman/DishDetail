import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../auth/useAuth';
import './GuestRoute.css'

const GuestRoute = ({ children }) => {
	const { user } = useAuth();

	if (user) {
		return <Navigate to="/" replace />;
	}

	return <div className="auth-layout">{children ? children : <Outlet />}</div>;
};

export default GuestRoute;
