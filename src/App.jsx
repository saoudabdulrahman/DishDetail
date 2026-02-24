import { Outlet, ScrollRestoration } from 'react-router';
import './App.css';

function App() {
	return (
		<div className="app-container">
			<Outlet />
			<ScrollRestoration />
		</div>
	);
}

export default App;
