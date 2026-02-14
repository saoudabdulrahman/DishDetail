import ReviewCard from '../components/ReviewCard';
import { reviewsData, restaurantsData } from '../data';

export default function ReviewsPage({ searchQuery }) {
	const restaurantMap = new Map(
		restaurantsData.map((restaurant) => [restaurant.id, restaurant]),
	);

	const filteredReviews = reviewsData
		.map((review) => {
			const restaurant = restaurantMap.get(review.restaurantId);
			return { review, restaurant };
		})
		.filter(({ review, restaurant }) => {
			const query = searchQuery.toLowerCase();
			const nameMatch = restaurant
				? restaurant.restaurantName.toLowerCase().includes(query)
				: false;
			const bodyMatch = review.body.toLowerCase().includes(query);
			return !query || nameMatch || bodyMatch;
		});

	return (
		<main>
			<h2 className="reviewHeader">Latest Reviews</h2>
			<section className="reviewContainer">
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
