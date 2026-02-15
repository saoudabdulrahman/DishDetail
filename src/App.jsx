import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ReviewsPage from './pages/ReviewsPage';
import EstablishmentsPage from './pages/EstablishmentsPage';
import EstablishmentPage from './pages/EstablishmentPage';
import SubmitReview from './pages/SubmitReview';
import SelectRestaurant from './pages/SelectRestaurant';
import './App.css';

function App() {
	return (
		<div className="app-container">
			<Header />

			<Routes>
				<Route index element={<HomePage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/signup" element={<SignupPage />} />
				<Route path="/reviews" element={<ReviewsPage />} />
				<Route path="/establishments" element={<EstablishmentsPage />} />
				<Route path="/establishments/:id" element={<EstablishmentPage />} />
				<Route path="/submitReview" element={<SubmitReview />} />
				<Route path="/selectRestaurant" element={<SelectRestaurant />} />
				<Route path="*" element={<p>Page not found</p>} />
			</Routes>

			<Footer />
		</div>
	);
}

export default App;
