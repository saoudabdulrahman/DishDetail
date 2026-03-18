import { useState } from 'react';
import { Link } from 'react-router';
import StarRating from './StarRating';
import './EstablishmentCard.css';
import type { Establishment } from '@dishdetail/shared';

export default function EstablishmentCard({
  restaurant,
}: {
  restaurant: Establishment;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link to={`/establishments/${restaurant.slug}`} className="card-link">
      <article className="establishment-item">
        <div className="restaurant-image-container shimmer">
          <img
            src={restaurant.restaurantImage || undefined}
            alt={restaurant.restaurantName}
            className={imgLoaded ? 'loaded' : ''}
            onLoad={() => setImgLoaded(true)}
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
