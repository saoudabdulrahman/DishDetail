import ReviewCard from '../components/ReviewCard';
import { ChefHat, Search, Star, StarHalf, UtensilsCrossed } from 'lucide-react';
import { reviewsData } from '../data';
import './SubmitReview.css';

function AddReview() {

	return (
		<main>
			<section className="hero">
				<h1>Submit a Review</h1>
				<textarea placeholder="Write your review here..." className="reviewbox"/>
			
				<input type="submit" value="Submit"></input>
			</section>
		</main>
	);
}
