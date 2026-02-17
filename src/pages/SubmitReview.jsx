import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Star, Search } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import { reviewsData, restaurantsData } from '../data';
import { useAuth } from '../auth/useAuth';
import './SubmitReview.css';

function SubmitReview() {
	const navigate = useNavigate();
	const { state } = useLocation();
	const { user } = useAuth();

	const [selectedRestaurant, setSelectedRestaurant] = useState(
		state?.restaurant || null,
	);
	const [query, setQuery] = useState('');

	const [rating, setRating] = useState(0);
	const [hover, setHover] = useState(0);
	const [reviewText, setReviewText] = useState('');
	const [error, setError] = useState('');

	const filteredRestaurants = restaurantsData.filter((r) =>
		r.restaurantName.toLowerCase().includes(query.toLowerCase()),
	);

	const handleSelect = (restaurant) => {
		setSelectedRestaurant(restaurant);
		setQuery(restaurant.restaurantName);
		setError('');
	};

	const handleSubmit = (e) => {
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

		const newReview = {
			id: Math.max(...reviewsData.map((r) => r.id), 0) + 1,
			restaurantId: selectedRestaurant.id,
			rating,
			reviewer: user?.username || 'Anonymous',
			reviewerAvatar: `https://i.pravatar.cc/150?u=${user?.username}`,
			date: new Date().toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			}),
			body: reviewText,
			reviewImage: null,
		};

		reviewsData.unshift(newReview);
		navigate(`/establishments/${selectedRestaurant.id}`);
	};

	const featured = [...reviewsData]
		.sort((a, b) => b.rating - a.rating)
		.slice(0, 4);

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
										key={restaurant.id}
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
							key={review.id}
							review={review}
							restaurant={restaurantsData.find(
								(r) => r.id === review.restaurantId,
							)}
						/>
					))}
				</section>
			</aside>
		</main>
	);
}

export default SubmitReview;
