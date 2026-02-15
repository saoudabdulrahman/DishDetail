import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Phone, Globe, ArrowLeft } from 'lucide-react';
import { restaurantsData, reviewsData } from '../data.js';
import StarRating from '../components/StarRating';
import './EstablishmentPage.css';

const DetailReviewCard = ({ review }) => {
	return (
		<article className="detailReviewCard">
			<div className="detailReviewHeader">
				<div className="reviewerInfo">
					<img
						src={review.reviewerAvatar}
						alt={review.reviewer}
						className="reviewerAvatar"
					/>
					<div>
						<h4 className="reviewerName">{review.reviewer}</h4>
						<p className="reviewDate">{review.date}</p>
					</div>
				</div>
				<StarRating rating={review.rating} />
			</div>
			<p className="detailReviewBody">{review.body}</p>
			{review.reviewImage && (
				<div className="detailReviewImageContainer">
					<img
						src={review.reviewImage}
						alt="Review photo"
						className="detailReviewImage"
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
			<main className="errorContainer">
				<p>Restaurant not found</p>
				<button onClick={() => navigate('/establishments')} className="backBtn">
					<ArrowLeft size={18} /> Go Back
				</button>
			</main>
		);
	}

	return (
		<main className="establishmentDetail">
			<button onClick={() => navigate('/establishments')} className="backBtn">
				<ArrowLeft size={18} /> Back to Establishments
			</button>

			<div className="detailBanner">
				<img
					src={restaurant.restaurantImage}
					alt={restaurant.restaurantName}
					className="detailBannerImg"
				/>
			</div>

			<div className="detailHeader">
				<div className="detailHeaderTop">
					<div>
						<h2>{restaurant.restaurantName}</h2>
						<p className="detailCuisine">{restaurant.cuisine}</p>
					</div>
					<div className="detailRatingBadge">
						<Star className="starFilled" />
						<span>{avgRating}</span>
					</div>
				</div>
				<p className="detailDescription">{restaurant.description}</p>
			</div>

			<div className="detailQuickInfo">
				<div className="detailInfoItem">
					<MapPin size={18} />
					<div>
						<p className="detailInfoLabel">Address</p>
						<p className="detailInfoValue">{restaurant.address}</p>
					</div>
				</div>
				<div className="detailInfoItem">
					<Clock size={18} />
					<div>
						<p className="detailInfoLabel">Hours</p>
						<p className="detailInfoValue">{restaurant.hours}</p>
					</div>
				</div>
				<div className="detailInfoItem">
					<Phone size={18} />
					<div>
						<p className="detailInfoLabel">Phone</p>
						<p className="detailInfoValue">{restaurant.phone}</p>
					</div>
				</div>
				<div className="detailInfoItem">
					<Globe size={18} />
					<div>
						<p className="detailInfoLabel">Website</p>
						<p className="detailInfoValue">{restaurant.website}</p>
					</div>
				</div>
			</div>

			<section className="detailReviewsSection">
				<div className="detailReviewsSectionHeader">
					<h2>Reviews</h2>
					<span className="detailReviewsCount">
						{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
					</span>
				</div>

				{reviews.length > 0 ?
					<div className="detailReviewsList">
						{reviews.map((review) => (
							<DetailReviewCard key={review.id} review={review} />
						))}
					</div>
				:	<p className="noReviews">No reviews yet. Be the first to review!</p>}
			</section>
		</main>
	);
}
