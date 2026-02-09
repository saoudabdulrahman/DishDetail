import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ReviewCard from './components/ReviewCard';
import { reviewsData } from './data';
import './App.css';

function App() {
	const [searchQuery, setSearchQuery] = useState('');

	// Filter logic
	const filteredReviews = reviewsData.filter((review) => {
		const query = searchQuery.toLowerCase();
		const titleMatch = review.restaurant.toLowerCase().includes(query);
		const bodyMatch = review.body.toLowerCase().includes(query);
		return !query || titleMatch || bodyMatch;
	});

	return (
		<div className="app-container">
			{/* Pass the setSearchQuery function down to Header */}
			<Header onSearch={(q) => setSearchQuery(q)} />

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

			<Footer />
		</div>
	);
}

export default App;
