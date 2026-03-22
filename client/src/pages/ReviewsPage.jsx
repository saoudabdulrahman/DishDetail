import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import ReviewCard from '../components/ReviewCard';
import { api } from '../api';

export default function ReviewsPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').toLowerCase();
  const cuisineFilter = searchParams.get('cuisine') || '';
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
      .filter(({ restaurant }) => !!restaurant)
      .filter(({ restaurant }) =>
        cuisineFilter ? restaurant.cuisine === cuisineFilter : true,
      );
  }, [reviews, restaurantMap, cuisineFilter]);

  return (
    <main className="mx-auto max-w-7xl px-6 pt-24 pb-20 md:px-24">
      {/* Page header */}
      <div className="mb-10 text-center">
        <span className="text-secondary font-label text-xs font-bold tracking-[0.2em] uppercase">
          {cuisineFilter ? cuisineFilter : 'All Critics'}
        </span>
        <h1 className="font-headline text-on-surface mt-2 text-5xl font-black tracking-tighter md:text-6xl">
          {cuisineFilter ? `${cuisineFilter} Reviews` : 'Latest Reviews'}
        </h1>
      </div>

      <section className="space-y-12">
        {loading ?
          <p className="font-ui text-on-surface-variant text-center text-sm">
            Loading…
          </p>
        : error ?
          <p className="font-ui text-error text-center text-sm">{error}</p>
        : filteredReviews.length > 0 ?
          filteredReviews.map(({ review, restaurant }) => (
            <ReviewCard
              key={review._id}
              review={review}
              restaurant={restaurant}
              variant="feed"
            />
          ))
        : <p className="font-ui text-on-surface-variant text-center text-sm">
            No reviews found.
          </p>
        }
      </section>
    </main>
  );
}
