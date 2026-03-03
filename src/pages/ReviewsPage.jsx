import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import ReviewCard from '../components/ReviewCard';
import { reviewsData, restaurantsData } from '../data';
import './ReviewsPage.css';

export default function ReviewsPage() {
	const [searchParams] = useSearchParams();
	const query = (searchParams.get('q') || '').toLowerCase();

	const restaurantMap = useMemo(() => {
		return new Map(
			restaurantsData.map((restaurant) => [restaurant.id, restaurant]),
		);
	}, []);

	const filteredReviews = useMemo(() => {
		return reviewsData
			.map((review) => {
				const restaurant = restaurantMap.get(review.restaurantId);
				return { review, restaurant };
			})
			.filter(({ review, restaurant }) => {
				if (!query) return true;

				const nameMatch =
					restaurant?.restaurantName?.toLowerCase().includes(query) ?? false;
				const bodyMatch = review?.body?.toLowerCase().includes(query) ?? false;

				return nameMatch || bodyMatch;
			});
	}, [query, restaurantMap]);

	return (
		<main>
			<h2 className="review-header">Latest Reviews</h2>
			<section className="card-grid">
				{filteredReviews.length > 0 ?
					filteredReviews.map(({ review, restaurant }, index) => (
						<div
							key={review.id}
							className={`animate-slide-up stagger-${index % 7}`}
						>
							<ReviewCard review={review} restaurant={restaurant} />
						</div>
					))
				:	<p>No reviews found.</p>}
			</section>
		</main>
	);
}
