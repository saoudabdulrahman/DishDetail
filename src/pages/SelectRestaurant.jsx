import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { restaurantsData } from '../data';
import './SelectRestaurant.css';

function SelectRestaurant() {
	const navigate = useNavigate();
	const [query, setQuery] = useState('');
	const [selectedRestaurant, setSelectedRestaurant] = useState(null);

	const filteredRestaurants = restaurantsData.filter((r) =>
		r.restaurantName.toLowerCase().includes(query.toLowerCase()),
	);

	const handleSelect = (restaurant) => {
		setSelectedRestaurant(restaurant);
		setQuery(restaurant.restaurantName);
	};

	const handleSearch = () => {
		if (selectedRestaurant) {
			navigate('/submit-review', {
				state: { restaurant: selectedRestaurant },
			});
		}
	};

	return (
		<main className="select-restaurant-page">
			<h1 className="title">Which restaurant would you like to review?</h1>

			<div className="search-wrapper">
				<div className="search-bar">
					<input
						type="text"
						placeholder="Search for a restaurant..."
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							setSelectedRestaurant(null); // Clear selection on edit
						}}
						className="search-input"
					/>

					<button id="search-button" onClick={handleSearch}>
						<Search size={20} />
					</button>
				</div>

				{query && !selectedRestaurant && (
					<ul className="search-results">
						{filteredRestaurants.map((restaurant) => (
							<li
								key={restaurant.id}
								onClick={() => handleSelect(restaurant)}
							>
								{restaurant.restaurantName}
							</li>
						))}
					</ul>
				)}
			</div>
		</main>
	);
}

export default SelectRestaurant;