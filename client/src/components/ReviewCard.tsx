import { useState } from 'react';
import { Link } from 'react-router';
import StarRating from './StarRating';
import { formatDate } from '../utils/date';
import './ReviewCard.css';
import type { Review, Establishment } from '@dishdetail/shared';

export default function ReviewCard({
  review,
  restaurant,
}: {
  review: Review;
  restaurant: Establishment;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      to={`/establishments/${restaurant.slug}#${review._id}`}
      className="card-link"
    >
      <article className="review-item">
        {review.reviewImage && (
          <div className="restaurant-image-container shimmer">
            <img
              src={review.reviewImage}
              alt={`Food or ambiance from ${restaurant.restaurantName}`}
              className={`restaurant-img ${imgLoaded ? 'loaded' : ''}`}
              onLoad={() => setImgLoaded(true)}
            />
          </div>
        )}
        <div
          className={`review-item-content ${!review.reviewImage ? 'no-image' : ''}`}
        >
          <div className="review-item-header">
            <h3>{review.title || 'Untitled Review'}</h3>
            <StarRating rating={review.rating} />
          </div>
          <p className="review-meta">
            {restaurant.restaurantName} · {review.reviewer} ·{' '}
            {formatDate(review.date)}
          </p>
          <p className="review-body">
            {review.body.length > 80 ?
              review.body.substring(0, 80).split(' ').slice(0, -1).join(' ') +
              ' ...'
            : review.body}
          </p>
        </div>
      </article>
    </Link>
  );
}
