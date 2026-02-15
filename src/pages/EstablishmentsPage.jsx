import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EstablishmentCard from '../components/EstablishmentCard';
import { restaurantsData } from '../data.js';
import './EstablishmentsPage.css';

export default function EstablishmentsPage() {
	const [searchParams] = useSearchParams();
	const [minRating, setMinRating] = useState(0);
	const query = (searchParams.get('q') || '').toLowerCase();

	const filteredEstablishments = useMemo(() => {
		return restaurantsData.filter((restaurant) => {
			if (restaurant.rating < minRating) return false;
			
			if (!query) return true;

			const nameMatch =
				restaurant?.restaurantName?.toLowerCase().includes(query) ?? false;
			const cuisineMatch =
				restaurant?.cuisine?.toLowerCase().includes(query) ?? false;
			const descMatch =
				restaurant?.description?.toLowerCase().includes(query) ?? false;

			return nameMatch || cuisineMatch || descMatch;
		});
	}, [query, minRating]);

	return (
		<main>
			<h2 className="establishments-header">Establishments</h2>
			
			<div className="filter-bar">
				<label>
					<span>Filter by Rating: </span>
					<select 
						value={minRating} 
						onChange={(e) => setMinRating(Number(e.target.value))}
					>
						<option value={0}>All Ratings</option>
						<option value={5}>5 Stars</option>
						<option value={4}>4+ Stars</option>
						<option value={3}>3+ Stars</option>
					</select>
				</label>
			</div>

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
