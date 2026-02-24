import { Outlet, ScrollRestoration } from 'react-router';
import AuthModal from './components/AuthModal';
import './App.css';

function App() {
	return (
		<div className="app-container">
			<Outlet />
			<ScrollRestoration />
			<AuthModal />
		</div>
	);
}

export default App;
