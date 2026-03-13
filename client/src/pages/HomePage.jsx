import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ChefHat, Search, Star, UtensilsCrossed } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import { api } from '../api';
import './HomePage.css';

export default function HomePage() {
	const [restaurants, setRestaurants] = useState([]);
	const [reviews, setReviews] = useState([]);

	useEffect(() => {
		let cancelled = false;
		Promise.all([api().getEstablishments(), api().getReviews()])
			.then(([estRes, revRes]) => {
				if (cancelled) return;
				setRestaurants(estRes.establishments);
				setReviews(revRes.reviews);
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, []);

	const restaurantById = useMemo(
		() => new Map(restaurants.map((r) => [r._id, r])),
		[restaurants],
	);

	const featured = useMemo(() => {
		return [...reviews]
			.sort((a, b) => b.rating - a.rating)
			.slice(0, 4)
			.map((review) => ({
				review,
				restaurant: restaurantById.get(review.establishment),
			}))
			.filter(({ restaurant }) => restaurant);
	}, [reviews, restaurantById]);

	const avgRating =
		reviews.length > 0 ?
			(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
				1,
			)
		:	'0.0';

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
				<Link to="/reviews" className="hero-cta">
					<Search size={24} />
					Browse Reviews
				</Link>
				<Link to="/submit-review" className="hero-cta">
					<Star size={24} />
					Submit Review
				</Link>
			</section>

			<div className="stats-row">
				<div className="stat">
					<span className="stat-number">{reviews.length}</span>
					<span className="stat-label">Reviews</span>
				</div>
				<div className="stat">
					<span className="stat-number">
						{new Set(reviews.map((r) => r.establishment)).size}
					</span>
					<span className="stat-label">Restaurants</span>
				</div>
				<div className="stat">
					<span className="stat-number">{avgRating}</span>
					<span className="stat-label">Avg Rating</span>
				</div>
			</div>

			<div className="section-header">
				<h2>Top Rated</h2>
				<Link
					to="/reviews"
					className="see-all"
					aria-label="See all top rated reviews"
				>
					See all &rarr;
				</Link>
			</div>

			<section className="card-grid top-rated-grid">
				{featured.map(({ review, restaurant }) => (
					<ReviewCard
						key={review._id}
						review={review}
						restaurant={restaurant}
					/>
				))}
			</section>

			<div className="section-header">
				<h2>How It Works</h2>
			</div>

			<section className="how-it-works">
				<div className="step">
					<div className="step-icon" aria-hidden="true">
						<Search size={20} />
					</div>
					<h3>Search</h3>
					<p>Find restaurants by name, cuisine, or location.</p>
				</div>

				<div className="step">
					<div className="step-icon" aria-hidden="true">
						<UtensilsCrossed size={20} />
					</div>
					<h3>Dine</h3>
					<p>Visit the restaurant and enjoy the experience.</p>
				</div>

				<div className="step">
					<div className="step-icon" aria-hidden="true">
						<Star size={20} />
					</div>
					<h3>Rate</h3>
					<p>Leave an honest rating and detailed review.</p>
				</div>

				<div className="step">
					<div className="step-icon" aria-hidden="true">
						<ChefHat size={20} />
					</div>
					<h3>Share</h3>
					<p>Help others discover great dining spots.</p>
				</div>
			</section>
		</main>
	);
}
