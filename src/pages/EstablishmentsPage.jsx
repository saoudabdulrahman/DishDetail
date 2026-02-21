import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import EstablishmentCard from '../components/EstablishmentCard';
import { restaurantsData } from '../data.js';
import './EstablishmentsPage.css';
import { ChevronDown } from 'lucide-react';

export default function EstablishmentsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const minRating = Number(searchParams.get('minRating') || 0);
	const query = (searchParams.get('q') || '').toLowerCase();

	const handleRatingChange = (e) => {
		const rating = e.target.value;
		setSearchParams(
			(prev) => {
				if (rating === '0') {
					prev.delete('minRating');
				} else {
					prev.set('minRating', rating);
				}
				return prev;
			},
			{ replace: true },
		);
	};

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
				<label htmlFor="rating-filter">Filter by Rating: </label>
				<div className="rating-filter-container">
					<select
						id="rating-filter"
						className="rating-filter"
						value={minRating}
						onChange={handleRatingChange}
						aria-label="Filter establishments by minimum rating"
					>
						<option value={0}>All Ratings</option>
						<option value={5}>5 Stars</option>
						<option value={4}>4+ Stars</option>
						<option value={3}>3+ Stars</option>
					</select>

					<ChevronDown className="select-icon" size={18} aria-hidden="true" />
				</div>
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
