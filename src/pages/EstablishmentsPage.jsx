import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import EstablishmentCard from '../components/EstablishmentCard';
import { api } from '../api';
import './EstablishmentsPage.css';
import { ChevronDown } from 'lucide-react';

export default function EstablishmentsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const minRating = Number(searchParams.get('minRating') || 0);
	const query = (searchParams.get('q') || '').toLowerCase();
	const [establishments, setEstablishments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let cancelled = false;

		const fetchEstablishments = async () => {
			setLoading(true);
			setError('');
			try {
				const { establishments: fetchedEstablishments } =
					await api().getEstablishments({ q: query, minRating });
				if (!cancelled) setEstablishments(fetchedEstablishments);
			} catch (e) {
				if (!cancelled) setError(e.message || 'Failed to load establishments.');
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		fetchEstablishments();

		return () => {
			cancelled = true;
		};
	}, [query, minRating]);

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
				{loading ?
					<p>Loading…</p>
				: error ?
					<p>{error}</p>
				: establishments.length > 0 ?
					establishments.map((restaurant) => (
						<EstablishmentCard key={restaurant._id} restaurant={restaurant} />
					))
				:	<p>No establishments found.</p>}
			</section>
		</main>
	);
}
