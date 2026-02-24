import { createBrowserRouter } from 'react-router';
import App from './App.jsx';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ReviewsPage from './pages/ReviewsPage';
import EstablishmentsPage from './pages/EstablishmentsPage';
import EstablishmentPage from './pages/EstablishmentPage';
import SubmitReview from './pages/SubmitReview';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import MainLayout from './components/MainLayout';
import GuestRoute from './components/GuestRoute';
import ProtectedRoute from './components/ProtectedRoute';

export const routes = createBrowserRouter([
	{
		element: <App />,
		children: [
			{
				element: <GuestRoute />,
				children: [
					{ path: '/login', element: <LoginPage /> },
					{ path: '/signup', element: <SignupPage /> },
				],
			},
			{
				element: <MainLayout />,
				children: [
					{ index: true, element: <HomePage /> },
					{ path: '/reviews', element: <ReviewsPage /> },
					{ path: '/establishments', element: <EstablishmentsPage /> },
					{ path: '/establishments/:id', element: <EstablishmentPage /> },
					{
						element: <ProtectedRoute />,
						children: [
							{ path: '/profile', element: <ProfilePage /> },
							{ path: '/submit-review', element: <SubmitReview /> },
						],
					},
					{ path: '*', element: <NotFoundPage /> },
				],
			},
		],
	},
]);
