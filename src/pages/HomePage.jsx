import ReviewCard from '../components/ReviewCard';
import { reviewsData } from '../data';

function HomePage({ searchQuery }) {
	const filteredReviews = reviewsData.filter((review) => {
		const query = searchQuery.toLowerCase();
		const titleMatch = review.restaurant.toLowerCase().includes(query);
		const bodyMatch = review.body.toLowerCase().includes(query);
		return !query || titleMatch || bodyMatch;
	});

	return (
		<main>
			<h2 className="reviewHeader">Latest Reviews</h2>
			<section className="reviewContainer">
				{filteredReviews.length > 0 ?
					filteredReviews.map((review) => (
						<ReviewCard key={review.id} review={review} />
					))
				:	<p>No reviews found.</p>}
			</section>
		</main>
	);
}

export default HomePage;
