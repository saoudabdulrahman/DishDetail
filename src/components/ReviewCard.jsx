import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import './ReviewCard.css';

export default function ReviewCard({ review, restaurant }) {
	return (
		<Link to={`/establishments/${restaurant.id}`} className="card-link">
			<article className="reviewItem">
				<div className="restaurantImageContainer">
					<img
						src={review.reviewImage}
						alt={`Food or ambiance from ${restaurant.restaurantName}`}
						className="restaurantImg"
					/>
				</div>
				<div className="reviewItemContent">
					<div className="reviewItemHeader">
						<h3>{restaurant.restaurantName}</h3>
						<StarRating rating={review.rating} />
					</div>
					<p className="reviewMeta">
						Reviewed by <strong>{review.reviewer}</strong> · {review.date}
					</p>
					<p className="reviewBody">{review.body}</p>
				</div>
			</article>
		</Link>
	);
}
