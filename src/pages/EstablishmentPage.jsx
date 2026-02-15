import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Phone, Globe, ArrowLeft } from 'lucide-react';
import { restaurantsData, reviewsData } from '../data.js';
import StarRating from '../components/StarRating';
import './EstablishmentPage.css';

const DetailReviewCard = ({ review }) => {
	return (
		<article className="detail-review-card">
			<div className="detail-review-header">
				<div className="reviewer-info">
					<img
						src={review.reviewerAvatar}
						alt={review.reviewer}
						className="reviewer-avatar"
					/>
					<div>
						<h4 className="reviewer-name">{review.reviewer}</h4>
						<p className="review-date">{review.date}</p>
					</div>
				</div>
				<StarRating rating={review.rating} />
			</div>
			<p className="detail-review-body">{review.body}</p>
			{review.reviewImage && (
				<div className="detail-review-image-container">
					<img
						src={review.reviewImage}
						alt="Review photo"
						className="detail-review-image"
					/>
				</div>
			)}
		</article>
	);
};

export default function EstablishmentPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const restaurantId = Number(id);

	const restaurant = restaurantsData.find((r) => r.id === restaurantId);
	const reviews = reviewsData.filter((r) => r.restaurantId === restaurantId);

	const avgRating =
		reviews.length > 0 ?
			(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
				1,
			)
		:	(restaurant?.rating ?? 0);

	if (!restaurant) {
		return (
			<main className="error-container">
				<p>Restaurant not found</p>
				<button onClick={() => navigate('/establishments')} className="back-btn">
					<ArrowLeft size={18} /> Go Back
				</button>
			</main>
		);
	}

	return (
		<main className="establishment-detail">
			<button onClick={() => navigate('/establishments')} className="back-btn">
				<ArrowLeft size={18} /> Back to Establishments
			</button>

			<div className="detail-banner">
				<img
					src={restaurant.restaurantImage}
					alt={restaurant.restaurantName}
					className="detail-banner-img"
				/>
			</div>

			<div className="detail-header">
				<div className="detail-header-top">
					<div>
						<h2>{restaurant.restaurantName}</h2>
						<p className="detail-cuisine">{restaurant.cuisine}</p>
					</div>
					<div className="detail-rating-badge">
						<Star className="star-filled" />
						<span>{avgRating}</span>
					</div>
				</div>
				<p className="detail-description">{restaurant.description}</p>
			</div>

			<div className="detail-quick-info">
				<div className="detail-info-item">
					<MapPin size={18} />
					<div>
						<p className="detail-info-label">Address</p>
						<p className="detail-info-value">{restaurant.address}</p>
					</div>
				</div>
				<div className="detail-info-item">
					<Clock size={18} />
					<div>
						<p className="detail-info-label">Hours</p>
						<p className="detail-info-value">{restaurant.hours}</p>
					</div>
				</div>
				<div className="detail-info-item">
					<Phone size={18} />
					<div>
						<p className="detail-info-label">Phone</p>
						<p className="detail-info-value">{restaurant.phone}</p>
					</div>
				</div>
				<div className="detail-info-item">
					<Globe size={18} />
					<div>
						<p className="detail-info-label">Website</p>
						<p className="detail-info-value">{restaurant.website}</p>
					</div>
				</div>
			</div>

			<section className="detail-reviews-section">
				<div className="detail-reviews-section-header">
					<h2>Reviews</h2>
					<span className="detail-reviews-count">
						{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
					</span>
				</div>

				{reviews.length > 0 ?
					<div className="detail-reviews-list">
						{reviews.map((review) => (
							<DetailReviewCard key={review.id} review={review} />
						))}
					</div>
				:	<p className="no-reviews">No reviews yet. Be the first to review!</p>}
			</section>
		</main>
	);
}
