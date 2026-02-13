import { Link } from 'react-router-dom';
import { ChefHat, Search, Star, UtensilsCrossed } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import { reviewsData } from '../data';
import './HomePage.css';

export default function HomePage() {
	const featured = [...reviewsData]
		.sort((a, b) => b.rating - a.rating)
		.slice(0, 4);

	return (
		<main>
			<section className="hero">
				<h2>
					Discover &amp; Share <span className="highlight">Honest Reviews</span>
				</h2>
				<p>
					Find the best restaurants near you, read real reviews from fellow
					diners, and share your own dining experiences with the community.
				</p>
				<Link to="/reviews" className="heroCta">
					<Search size={18} />
					Browse Reviews
				</Link>
			</section>

			<div className="statsRow">
				<div className="stat">
					<span className="statNumber">{reviewsData.length}</span>
					<span className="statLabel">Reviews</span>
				</div>
				<div className="stat">
					<span className="statNumber">
						{new Set(reviewsData.map((r) => r.restaurant)).size}
					</span>
					<span className="statLabel">Restaurants</span>
				</div>
				<div className="stat">
					<span className="statNumber">
						{(
							reviewsData.reduce((sum, r) => sum + r.rating, 0) /
							reviewsData.length
						).toFixed(1)}
					</span>
					<span className="statLabel">Avg Rating</span>
				</div>
			</div>

			<div className="sectionHeader">
				<h2>Top Rated</h2>
				<Link to="/reviews" className="seeAll">
					See all &rarr;
				</Link>
			</div>

			<section className="featuredGrid">
				{featured.map((review) => (
					<ReviewCard key={review.id} review={review} />
				))}
			</section>

			<div className="sectionHeader">
				<h2>How It Works</h2>
			</div>

			<section className="howItWorks">
				<div className="step">
					<div className="stepIcon">
						<Search size={20} />
					</div>
					<h3>Search</h3>
					<p>Find restaurants by name, cuisine, or location.</p>
				</div>

				<div className="step">
					<div className="stepIcon">
						<UtensilsCrossed size={20} />
					</div>
					<h3>Dine</h3>
					<p>Visit the restaurant and enjoy the experience.</p>
				</div>

				<div className="step">
					<div className="stepIcon">
						<Star size={20} />
					</div>
					<h3>Rate</h3>
					<p>Leave an honest rating and detailed review.</p>
				</div>

				<div className="step">
					<div className="stepIcon">
						<ChefHat size={20} />
					</div>
					<h3>Share</h3>
					<p>Help others discover great dining spots.</p>
				</div>
			</section>
		</main>
	);
}
