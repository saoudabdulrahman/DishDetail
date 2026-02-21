import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { routes } from './routes';
import AuthProvider from './auth/AuthProvider';
import './index.css';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<AuthProvider>
			<RouterProvider router={routes} />
		</AuthProvider>
	</StrictMode>,
);
