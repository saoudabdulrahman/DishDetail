import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import EstablishmentCard from '../components/EstablishmentCard';
import { restaurantsData } from '../data.js';

export default function EstablishmentsPage() {
	const [searchParams] = useSearchParams();
	const query = (searchParams.get('q') || '').toLowerCase();

	const filteredEstablishments = useMemo(() => {
		return restaurantsData.filter((restaurant) => {
			if (!query) return true;

			const nameMatch =
				restaurant?.restaurantName?.toLowerCase().includes(query) ?? false;
			const cuisineMatch =
				restaurant?.cuisine?.toLowerCase().includes(query) ?? false;
			const descMatch =
				restaurant?.description?.toLowerCase().includes(query) ?? false;

			return nameMatch || cuisineMatch || descMatch;
		});
	}, [query]);

	return (
		<main>
			<h2 className="establishmentsHeader">Establishments</h2>
			<section className="card-grid">
				{filteredEstablishments.length > 0 ?
					filteredEstablishments.map((restaurant) => (
						<EstablishmentCard key={restaurant.id} restaurant={restaurant} />
					))
				:	<p>No establishments found.</p>}
			</section>
		</main>
	);
}
