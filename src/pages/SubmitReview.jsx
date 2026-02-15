import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import { reviewsData, restaurantsData } from '../data';
import './SubmitReview.css';

function SubmitReview() {
	const navigate = useNavigate();
	const { state } = useLocation();
	const restaurant = state?.restaurant;

	const [rating, setRating] = useState(0);
	const [hover, setHover] = useState(0);

	useEffect(() => {
		if (!restaurant) {
			navigate('/select-restaurant');
		}
	}, [restaurant, navigate]);

	const featured = [...reviewsData]
		.sort((a, b) => b.rating - a.rating)
		.slice(0, 4);

	if (!restaurant) return null;

	return (
		<main className="submit-layout">
			<div className="box">
				<h1 id="title">
					Submit a Review for {restaurant.restaurantName}
				</h1>

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
				/>
				<input type="submit" value="Submit review" id="submit-button" />
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