import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Star, MapPin, Clock, Phone, Globe, ArrowLeft } from 'lucide-react';
import { api } from '../api';
import DetailReviewCard from '../components/DetailReviewCard';
import './EstablishmentPage.css';

export default function EstablishmentPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const restaurantId = id;
	const [restaurant, setRestaurant] = useState(null);
	const [reviews, setReviews] = useState([]);
	const [visibleCount, setVisibleCount] = useState(2);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError('');
		api()
			.getEstablishment(restaurantId)
			.then(({ establishment, reviews }) => {
				if (cancelled) return;
				setRestaurant(establishment);
				setReviews(reviews);
			})
			.catch((e) => {
				if (!cancelled) setError(e.message || 'Failed to load.');
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [restaurantId]);

	const handleUpdateReview = async (reviewId, updates) => {
		try {
			const { review } = await api().updateReview(reviewId, updates);
			setReviews((prev) =>
				prev.map((r) => (r._id === reviewId ? review : r)),
			);
		} catch (e) {
			alert(e.message || 'Failed to update review.');
		}
	};

	const handleDeleteReview = async (reviewId) => {
		try {
			await api().deleteReview(reviewId);
			setReviews((prev) => prev.filter((r) => r._id !== reviewId));
		} catch (e) {
			alert(e.message || 'Failed to delete review.');
		}
	};

	const sortedReviews = [...reviews].sort(
		(a, b) => b.rating - a.rating || new Date(b.date) - new Date(a.date),
	);
	const displayedReviews = sortedReviews.slice(0, visibleCount);

	const avgRating =
		reviews.length > 0 ?
			(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
				1,
			)
		:	(restaurant?.rating ?? 0);

	if (loading) {
		return (
			<main className="error-container">
				<p>Loading…</p>
			</main>
		);
	}

	if (error || !restaurant) {
		return (
			<main className="error-container">
				<p>{error || 'Restaurant not found'}</p>
				<button
					onClick={() => navigate('/establishments')}
					className="back-button"
				>
					<ArrowLeft size={18} /> Go Back
				</button>
			</main>
		);
	}

	return (
		<main className="establishment-detail">
			<button
				onClick={() => navigate('/establishments')}
				className="back-button"
			>
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
						<Star className="star-filled" aria-hidden="true" />
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
						{displayedReviews.map((review) => (
							<DetailReviewCard
							key={review._id}
								review={review}
								onUpdate={handleUpdateReview}
								onDelete={handleDeleteReview}
							/>
						))}
						{visibleCount < reviews.length && (
							<div className="load-more-container">
								<button
									onClick={() => setVisibleCount((c) => c + 3)}
									className="load-more-button"
								>
									Load More
								</button>
							</div>
						)}
					</div>
				:	<p className="no-reviews">No reviews yet. Be the first to review!</p>}
			</section>
		</main>
	);
}
