import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import ReviewCard from '../components/ReviewCard';
import { api } from '../api';
import './ReviewsPage.css';

export default function ReviewsPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').toLowerCase();
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchReviews = async () => {
      setLoading(true);
      setError('');
      try {
        const [estRes, revRes] = await Promise.all([
          api().getEstablishments(),
          api().getReviews({ q: query }),
        ]);
        if (!cancelled) {
          setRestaurants(estRes.establishments);
          setReviews(revRes.reviews);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setError('Failed to load reviews.');
          toast.error('Failed to load reviews.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReviews();

    return () => {
      cancelled = true;
    };
  }, [query]);

  const restaurantMap = useMemo(() => {
    return new Map(restaurants.map((r) => [r._id, r]));
  }, [restaurants]);

  const filteredReviews = useMemo(() => {
    return reviews
      .map((review) => {
        const restaurant = restaurantMap.get(review.establishment);
        return { review, restaurant };
      })
      .filter(({ restaurant }) => !!restaurant);
  }, [reviews, restaurantMap]);

  return (
    <main>
      <h2 className="review-header">Latest Reviews</h2>
      <section className="card-grid">
        {loading ?
          <p>Loading…</p>
        : error ?
          <p>{error}</p>
        : filteredReviews.length > 0 ?
          filteredReviews.map(({ review, restaurant }) => (
            <ReviewCard
              key={review._id}
              review={review}
              restaurant={restaurant}
            />
          ))
        : <p>No reviews found.</p>}
      </section>
    </main>
  );
}
