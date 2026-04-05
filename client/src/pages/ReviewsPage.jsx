import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import ReviewCard from '../components/ReviewCard';
import { api } from '../api';
import { usePageTitle } from '../utils/usePageTitle.js';

export default function ReviewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').toLowerCase();
  const cuisineFilter = searchParams.get('cuisine') || '';
  usePageTitle(cuisineFilter ? `${cuisineFilter} Reviews` : 'Latest Reviews');
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleCuisineChange = (e) => {
    const cuisine = e.target.value;
    setSearchParams(
      (prev) => {
        if (!cuisine) {
          prev.delete('cuisine');
        } else {
          prev.set('cuisine', cuisine);
        }
        return prev;
      },
      { replace: true },
    );
  };

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

  const cuisines = useMemo(
    () =>
      [
        ...new Set(restaurants.flatMap((r) => r.cuisine).filter(Boolean)),
      ].sort(),
    [restaurants],
  );

  const filteredReviews = useMemo(() => {
    return reviews
      .map((review) => {
        const restaurant = restaurantMap.get(review.establishment);
        return { review, restaurant };
      })
      .filter(({ restaurant }) => !!restaurant)
      .filter(({ restaurant }) =>
        cuisineFilter ? restaurant.cuisine.includes(cuisineFilter) : true,
      );
  }, [reviews, restaurantMap, cuisineFilter]);

  return (
    <main className="px-fluid-container mx-auto max-w-7xl pt-24 pb-20">
      {/* Page Header */}
      <section className="mb-12 text-center md:text-left">
        <span className="text-secondary font-label text-xs font-bold tracking-[0.2em] uppercase">
          {cuisineFilter ? cuisineFilter : 'All Critics'}
        </span>
        <h1 className="font-headline text-on-surface text-fluid-7xl mt-2 font-black tracking-tighter">
          {cuisineFilter ? `${cuisineFilter} Reviews` : 'Latest Reviews'}
        </h1>
      </section>
      {/* Filter Bar */}
      <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row sm:flex-wrap md:justify-start">
        <div className="bg-surface-container-low flex w-full items-center justify-between space-x-4 rounded-xl px-4 py-2 sm:w-auto">
          <span className="text-on-surface-variant font-ui text-xs font-bold uppercase">
            Filter:
          </span>
          <select
            value={cuisineFilter}
            onChange={handleCuisineChange}
            aria-label="Filter reviews by cuisine"
            className="text-primary font-ui max-w-[50%] cursor-pointer truncate border-none bg-transparent text-right text-xs font-bold uppercase focus:ring-0 sm:max-w-37.5"
          >
            <option value="" className="bg-surface-container-high">
              All Tastes
            </option>
            {cuisines.map((c) => (
              <option key={c} value={c} className="bg-surface-container-high">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Cards */}
      <section className="space-y-4">
        {loading ?
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container-high h-36 animate-pulse rounded-sm"
            />
          ))
        : error ?
          <p className="font-ui text-error col-span-full text-center text-sm">
            {error}
          </p>
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
