import { createBrowserRouter } from 'react-router';
import App from './App.jsx';
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
          {
            index: true,
            lazy: () =>
              import('./pages/HomePage').then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: '/reviews',
            lazy: () =>
              import('./pages/ReviewsPage').then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: '/establishments',
            lazy: () =>
              import('./pages/EstablishmentsPage').then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: '/establishments/:slug',
            lazy: () =>
              import('./pages/EstablishmentPage').then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: '/profile/:username',
            lazy: () =>
              import('./pages/ProfilePage').then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: '/about',
            lazy: () =>
              import('./pages/AboutPage').then((m) => ({
                Component: m.default,
              })),
          },
          {
            // Protected Routes
            element: <ProtectedRoute />,
            children: [
              {
                path: '/profile',
                lazy: () =>
                  import('./pages/ProfileRedirect').then((m) => ({
                    Component: m.default,
                  })),
              },
              {
                path: '/submit-review',
                lazy: () =>
                  import('./pages/SubmitReviewPage').then((m) => ({
                    Component: m.default,
                  })),
              },
            ],
          },
          // Catch-all Route
          {
            path: '*',
            lazy: () =>
              import('./pages/NotFoundPage').then((m) => ({
                Component: m.default,
              })),
          },
        ],
      },
    ],
  },
]);
