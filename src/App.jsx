import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import './App.css';

function App() {
	const [searchQuery, setSearchQuery] = useState('');

	return (
		<div className="app-container">
			<Header onSearch={(q) => setSearchQuery(q)} />

			<Routes>
				<Route path="/" element={<HomePage searchQuery={searchQuery} />} />
			</Routes>

			<Footer />
		</div>
	);
}

export default App;
