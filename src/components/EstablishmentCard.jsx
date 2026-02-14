import { Star } from 'lucide-react';
import './EstablishmentCard.css';

const StarRating = ({ rating }) => {
	return (
		<span className="stars">
			{[...Array(5)].map((_, i) => (
				<Star key={i} className={i < rating ? 'starFilled' : 'starEmpty'} />
			))}
		</span>
	);
};

export default function EstablishmentCard({ restaurant }) {
	const handleClick = () => {
		alert(
			`You clicked on "${restaurant.restaurantName}". This would navigate to the establishment page.`,
		);
	};

	return (
		<article className="establishmentItem" onClick={handleClick}>
			<div className="restaurantImageContainer">
				<img
					src={restaurant.restaurantImage}
					alt={`Food or ambiance from ${restaurant.restaurantName}`}
					className="restaurantImg"
				/>
			</div>
			<div className="establishmentItemContent">
				<div className="establishmentItemHeader">
					<h3>{restaurant.restaurantName}</h3>
					<StarRating rating={restaurant.rating} />
				</div>
				<p className="establishmentCuisine">{restaurant.cuisine}</p>
				<p className="establishmentDescription">{restaurant.description}</p>
			</div>
		</article>
	);
}
