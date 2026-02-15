import { reviewsData } from '../data';
import { useState } from "react";
import { Search } from 'lucide-react';
import './SelectRestaurant.css';
import { useNavigate } from "react-router-dom";

function RestaurantSearch() {
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const [selectedRestaurant, setSelectedRestaurant] = useState("");
	const restaurants = [...new Set(reviewsData.map(r => r.restaurant))];
	const filteredRestaurants = restaurants.filter(r =>
		r.toLowerCase().includes(query.toLowerCase())
	);

	return (
		<main>
			<h1 className="title">Which restaurant would you like to review?</h1>

			<div className="searchWrapper">
				<div className="searchBar">
					<input
						type="text"
						placeholder="Search for a restaurant..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="searchInput"
					/>
			
				<button
					id="searchButton"
					onClick={() =>
						navigate("/submitReview")
					}
				>
					<Search size={20} />
				</button>
			</div>

				{query && (
					<ul className="searchResults">
						{filteredRestaurants.map((restaurant) => (
							<li
								key={restaurant}
								onClick={() => {
									setSelectedRestaurant(restaurant);
									setQuery(restaurant);
								}}
							>
								{restaurant}
							</li>
						))}
					</ul>
				)}
			</div>
		</main>
	);
}


export default RestaurantSearch;