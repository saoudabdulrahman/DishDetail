import { Star } from 'lucide-react';
import './StarRating.css';

export default function StarRating({ rating }) {
	return (
		<span className="stars">
			{[...Array(5)].map((_, i) => (
				<Star key={i} className={i < rating ? 'starFilled' : 'starEmpty'} />
			))}
		</span>
	);
}
