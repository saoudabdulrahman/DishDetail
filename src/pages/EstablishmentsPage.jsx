import EstablishmentCard from '../components/EstablishmentCard';
import { restaurantsData } from '../data.js';

export default function EstablishmentsPage({ searchQuery }) {
	const filteredEstablishments = restaurantsData.filter((restaurant) => {
		const query = searchQuery.toLowerCase();
		const nameMatch = restaurant.restaurantName.toLowerCase().includes(query);
		const cuisineMatch = restaurant.cuisine.toLowerCase().includes(query);
		const descMatch = restaurant.description.toLowerCase().includes(query);
		return !query || nameMatch || cuisineMatch || descMatch;
	});

	return (
		<main>
			<h2 className="establishmentsHeader">Establishments</h2>
			<section className="establishmentsContainer">
				{filteredEstablishments.length > 0 ?
					filteredEstablishments.map((restaurant) => (
						<EstablishmentCard key={restaurant.id} restaurant={restaurant} />
					))
				:	<p>No establishments found.</p>}
			</section>
		</main>
	);
}
