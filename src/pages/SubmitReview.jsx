import ReviewCard from '../components/ReviewCard';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { reviewsData } from '../data';
import './SubmitReview.css';
import { useLocation } from "react-router-dom";

function SubmitReview() {
	const [rating, setRating] = useState(0);
	const [hover, setHover] = useState(0);
	const { state } = useLocation();
	const restaurant = state?.restaurant;
	const featured = [...reviewsData]
		.sort((a, b) => b.rating - a.rating)
		.slice(0, 4);

	return (
		<main className="submitLayout">
			<div className="box">
				<h1 id="title">
					Submit a Review for {restaurant || "Selected Restaurant"}
				</h1>

				<div className="star-rating">
					{[1, 2, 3, 4, 5].map((star) => (
						<Star
							key={star}
							size={32}
							className={star <= (hover || rating) ? 'star filled' : 'star'}
							onClick={() => setRating(star)}
							onMouseEnter={() => setHover(star)}
							onMouseLeave={() => setHover(0)}
						/>
					))}
				</div>

				<textarea placeholder="Write your review here..." id="reviewbox" />
				<input type="submit" value="Submit review" id="submitButton" />
			</div>

			<aside className="suggested">
				<h2>Hear what others are saying:</h2>

				<section className="featuredGrid">
					{featured.map((review) => (
						<ReviewCard key={review.id} review={review} />
					))}
				</section>
			</aside>
		</main>

	);
}

export default SubmitReview;