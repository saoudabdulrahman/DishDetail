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
					filteredReviews.map(({ review, restaurant }) => (
						<ReviewCard
							key={review.id}
							review={review}
							restaurant={restaurant}
						/>
					))
				:	<p>No reviews found.</p>}
			</section>
		</main>
	);
}
