import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import './EstablishmentCard.css';

export default function EstablishmentCard({ restaurant }) {
	return (
		<Link to={`/establishments/${restaurant.id}`} className="card-link">
			<article className="establishmentItem">
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
		</Link>
	);
}
