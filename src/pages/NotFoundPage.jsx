import { Link } from 'react-router';
import { UtensilsCrossed } from 'lucide-react';
import './NotFoundPage.css';

export default function NotFoundPage() {
	return (
		<main className="not-found-page">
			<div className="not-found-content">
				<UtensilsCrossed
					size={80}
					className="not-found-icon"
					strokeWidth={1.5}
				/>
				<h2>404</h2>
				<h3>Looks like this page is off the menu!</h3>
				<p className="not-found-subtext">
					The restaurant, review, or page you are looking for doesn't exist or
					might have been moved.
				</p>
				<Link to="/" className="home-button">
					Return to Home
				</Link>
			</div>
		</main>
	);
}
