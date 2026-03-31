import { createBrowserRouter } from 'react-router';
import App from './App.jsx';
import HomePage from './pages/HomePage';
import ReviewsPage from './pages/ReviewsPage';
import EstablishmentsPage from './pages/EstablishmentsPage';
import EstablishmentPage from './pages/EstablishmentPage';
import SubmitReviewPage from './pages/SubmitReviewPage';
import ProfilePage from './pages/ProfilePage';
import ProfileRedirect from './pages/ProfileRedirect';
import NotFoundPage from './pages/NotFoundPage';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

export const routes = createBrowserRouter([
  {
    // App Shell
    element: <App />,
    children: [
      {
        // Main Layout Routes
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: '/reviews', element: <ReviewsPage /> },
          { path: '/establishments', element: <EstablishmentsPage /> },
          { path: '/establishments/:slug', element: <EstablishmentPage /> },
          { path: '/profile/:username', element: <ProfilePage /> },
          {
            // Protected Routes
            element: <ProtectedRoute />,
            children: [
              { path: '/profile', element: <ProfileRedirect /> },
              { path: '/submit-review', element: <SubmitReviewPage /> },
            ],
          },
          // Catch-all Route
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
