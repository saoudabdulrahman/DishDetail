import { createBrowserRouter } from 'react-router';
import App from './App.jsx';
import HomePage from './pages/HomePage';
import ReviewsPage from './pages/ReviewsPage';
import EstablishmentsPage from './pages/EstablishmentsPage';
import EstablishmentPage from './pages/EstablishmentPage';
import SubmitReviewPage from './pages/SubmitReviewPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

export const routes = createBrowserRouter([
	{
		element: <App />,
		children: [
			{
				element: <MainLayout />,
				children: [
					{ index: true, element: <HomePage /> },
					{ path: '/reviews', element: <ReviewsPage /> },
					{ path: '/establishments', element: <EstablishmentsPage /> },
					{ path: '/establishments/:slug', element: <EstablishmentPage /> },
					{
						element: <ProtectedRoute />,
						children: [
							{ path: '/profile', element: <ProfilePage /> },
							{ path: '/submit-review', element: <SubmitReviewPage /> },
						],
					},
					{ path: '*', element: <NotFoundPage /> },
				],
			},
		],
	},
]);
