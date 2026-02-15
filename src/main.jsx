import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './auth/AuthProvider';
import ScrollToTop from './components/ScrollToTop';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<ScrollToTop />
				<App />
			</AuthProvider>
		</BrowserRouter>
	</StrictMode>,
);
