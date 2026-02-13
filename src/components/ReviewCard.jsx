import { Star } from 'lucide-react';
import './ReviewCard.css';

const StarRating = ({ rating }) => {
	return (
		<span className="stars">
			{[...Array(5)].map((_, i) => (
				<Star key={i} className={i < rating ? 'starFilled' : 'starEmpty'} />
			))}
		</span>
	);
};

export default function ReviewCard({ review }) {
	const handleClick = () => {
		alert(
			`You clicked on "${review.restaurant}". This would navigate to the full review page.`,
		);
	};

	return (
		<article className="reviewItem" onClick={handleClick}>
			<div className="reviewItemHeader">
				<h3>{review.restaurant}</h3>
				<StarRating rating={review.rating} />
			</div>
			<p className="reviewMeta">
				Reviewed by <strong>{review.reviewer}</strong> · {review.date}
			</p>
			<p>{review.body}</p>
		</article>
	);
}
