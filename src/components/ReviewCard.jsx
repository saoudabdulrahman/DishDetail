import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import './ReviewCard.css';

export default function ReviewCard({ review, restaurant }) {
	return (
		<Link to={`/establishments/${restaurant.id}`} className="card-link">
			<article className="review-item">
				<div className="restaurant-image-container">
					<img
						src={review.reviewImage}
						alt={`Food or ambiance from ${restaurant.restaurantName}`}
						className="restaurant-img"
					/>
				</div>
				<div className="review-item-content">
					<div className="review-item-header">
						<h3>{restaurant.restaurantName}</h3>
						<StarRating rating={review.rating} />
					</div>
					<p className="review-meta">
						Reviewed by <strong>{review.reviewer}</strong> · {review.date}
					</p>
					<p className="review-body">
						{review.body.length > 150
							? review.body.substring(0, 150) + '...'
							: review.body}
					</p>
				</div>
			</article>
		</Link>
	);
}
