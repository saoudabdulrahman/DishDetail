import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import './EstablishmentCard.css';

export default function EstablishmentCard({ restaurant }) {
	return (
		<Link to={`/establishments/${restaurant.id}`} className="card-link">
			<article className="establishment-item">
				<div className="restaurant-image-container">
					<img
						src={restaurant.restaurantImage}
						alt={`Food or ambiance from ${restaurant.restaurantName}`}
						className="restaurant-img"
					/>
				</div>
				<div className="establishment-item-content">
					<div className="establishment-item-header">
						<h3>{restaurant.restaurantName}</h3>
						<StarRating rating={restaurant.rating} />
					</div>
					<p className="establishment-cuisine">{restaurant.cuisine}</p>
					<p className="establishment-description">{restaurant.description}</p>
				</div>
			</article>
		</Link>
	);
}
