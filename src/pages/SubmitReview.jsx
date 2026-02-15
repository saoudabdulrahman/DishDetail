import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import { reviewsData, restaurantsData } from '../data';
import { useAuth } from '../auth/useAuth';
import './SubmitReview.css';

function SubmitReview() {
	const navigate = useNavigate();
	const { state } = useLocation();
	const { user } = useAuth();
	const restaurant = state?.restaurant;

	const [rating, setRating] = useState(0);
	const [hover, setHover] = useState(0);
	const [reviewText, setReviewText] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		if (!restaurant) {
			navigate('/select-restaurant');
		} else if (!user) {
			navigate('/login');
		}
	}, [restaurant, user, navigate]);

	const handleSubmit = (e) => {
		e.preventDefault();
		setError('');

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
			restaurantId: restaurant.id,
			rating,
			reviewer: user?.username || 'Anonymous',
			reviewerAvatar: `https://i.pravatar.cc/150?u=${user?.username}`,
			date: new Date().toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			}),
			body: reviewText,
			reviewImage: null, // Or add logic for image upload if supported later
		};

		reviewsData.unshift(newReview); // Add to beginning of list
		navigate(`/establishments/${restaurant.id}`);
	};

	const featured = [...reviewsData]
		.sort((a, b) => b.rating - a.rating)
		.slice(0, 4);

	if (!restaurant || !user) return null;

	return (
		<main className="submit-review-page">
			<div className="box">
				<h1 id="title">
					Submit a Review for {restaurant.restaurantName}
				</h1>

				{error && <div className="error-message">{error}</div>}

				<form onSubmit={handleSubmit} className="review-container">
					<div className="star-rating" onMouseLeave={() => setHover(0)}>
						{[1, 2, 3, 4, 5].map((star) => (
							<Star
								key={star}
								size={32}
								className={star <= (hover || rating) ? 'star filled' : 'star'}
								onClick={() => setRating(star)}
								onMouseEnter={() => setHover(star)}
							/>
						))}
					</div>

					<textarea
						placeholder="Write your review here..."
						id="review-box"
						className="review-box"
						value={reviewText}
						onChange={(e) => setReviewText(e.target.value)}
					/>
					<input type="submit" value="Submit review" id="submit-button" />
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