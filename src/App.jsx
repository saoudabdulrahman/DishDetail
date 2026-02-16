import { Routes, Route } from 'react-router';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ReviewsPage from './pages/ReviewsPage';
import EstablishmentsPage from './pages/EstablishmentsPage';
import EstablishmentPage from './pages/EstablishmentPage';
import SubmitReview from './pages/SubmitReview';
import SelectRestaurant from './pages/SelectRestaurant';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import './App.css';
import MainLayout from './components/MainLayout';

function App() {
	return (
		<div className="app-container">
			<Routes>
				<Route element={<GuestRoute />}>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/signup" element={<SignupPage />} />
				</Route>

				<Route element={<MainLayout />}>
					<Route index element={<HomePage />} />
					<Route path="/reviews" element={<ReviewsPage />} />
					<Route path="/establishments" element={<EstablishmentsPage />} />
					<Route path="/establishments/:id" element={<EstablishmentPage />} />

					<Route element={<ProtectedRoute />}>
						<Route path="/profile" element={<ProfilePage />} />
						<Route path="/submit-review" element={<SubmitReview />} />
						<Route path="/select-restaurant" element={<SelectRestaurant />} />
					</Route>

					<Route path="*" element={<main>Page not found</main>} />
				</Route>
			</Routes>
		</div>
	);
}

export default App;
