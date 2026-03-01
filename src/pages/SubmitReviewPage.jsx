import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Star, Search } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import { api } from '../api';
import { useAuth } from '../auth/useAuth';
import './SubmitReviewPage.css';

function SubmitReviewPage() {
	const navigate = useNavigate();
	const { state } = useLocation();
	const { user } = useAuth();

	const [selectedRestaurant, setSelectedRestaurant] = useState(
		state?.restaurant || null,
	);
	const [query, setQuery] = useState('');
	const [restaurants, setRestaurants] = useState([]);
	const [featured, setFeatured] = useState([]);

	const [rating, setRating] = useState(0);
	const [hover, setHover] = useState(0);
	const [reviewText, setReviewText] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		let cancelled = false;
		Promise.all([api().getEstablishments(), api().getReviews()])
			.then(([estRes, revRes]) => {
				if (cancelled) return;
				setRestaurants(estRes.establishments);
				const top = [...revRes.reviews]
					.sort((a, b) => b.rating - a.rating)
					.slice(0, 4);
				setFeatured(top);
			})
			.catch(() => {
				// ignore; page still usable
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const filteredRestaurants = useMemo(() => {
		return restaurants.filter((r) =>
			r.restaurantName.toLowerCase().includes(query.toLowerCase()),
		);
	}, [restaurants, query]);

	const handleSelect = (restaurant) => {
		setSelectedRestaurant(restaurant);
		setQuery(restaurant.restaurantName);
		setError('');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		if (!selectedRestaurant) {
			setError('Please select a restaurant to review.');
			return;
		}

		if (rating === 0) {
			setError('Please select a star rating.');
			return;
		}

		if (!reviewText.trim()) {
			setError('Please write a review.');
			return;
		}

		try {
			await api().createReview(selectedRestaurant._id, {
				rating,
				reviewer: user?.username || 'Anonymous',
				reviewerAvatar: user?.avatar,
				body: reviewText,
				reviewImage: null,
			});
			navigate(`/establishments/${selectedRestaurant._id}`);
		} catch (err) {
			setError(err.message || 'Failed to submit review.');
		}
	};

	return (
		<main className="submit-review-page">
			<div className="box">
				<h1 id="title">
					{selectedRestaurant ?
						`Submit a Review for ${selectedRestaurant.restaurantName}`
					:	'Find a restaurant to review'}
				</h1>

				{error && <div className="error-message">{error}</div>}

				<form onSubmit={handleSubmit} className="review-container">
					<div className="search-wrapper">
						<div className="search-bar">
							<Search id="search-icon" size={24} />
							<input
								type="text"
								placeholder="Search for a restaurant..."
								value={query}
								onChange={(e) => {
									setQuery(e.target.value);
									setSelectedRestaurant(null);
								}}
								className="search-input"
							/>
						</div>

						{query && !selectedRestaurant && (
							<ul className="search-results">
								{filteredRestaurants.map((restaurant) => (
									<li
										key={restaurant._id}
										onClick={() => handleSelect(restaurant)}
									>
										{restaurant.restaurantName}
									</li>
								))}
							</ul>
						)}
					</div>

					{selectedRestaurant && (
						<div className="review-details">
							<div className="star-rating" onMouseLeave={() => setHover(0)}>
								{[1, 2, 3, 4, 5].map((star) => (
									<Star
										key={star}
										size={32}
										className={
											star <= (hover || rating) ? 'star filled' : 'star'
										}
										onClick={() => setRating(star)}
										onMouseEnter={() => setHover(star)}
									/>
								))}
							</div>

							<textarea
								placeholder="Write your review here..."
								id="review-box"
								value={reviewText}
								onChange={(e) => setReviewText(e.target.value)}
							/>
							<input type="submit" value="Submit review" id="submit-button" />
						</div>
					)}
				</form>
			</div>

			<aside className="suggested">
				<h2>Hear what others are saying:</h2>
				<section className="featured-grid">
					{featured.map((review) => (
						<ReviewCard
							key={review._id}
							review={review}
							restaurant={restaurants.find(
								(r) => r._id === review.establishment,
							)}
						/>
					))}
				</section>
			</aside>
		</main>
	);
}

export default SubmitReviewPage;
