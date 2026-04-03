import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import ReviewCard from '../components/ReviewCard';
import StarRating from '../components/StarRating';
import { api } from '../api';
import { useAuth } from '../auth/useAuth';
import { usePageTitle } from '../utils/usePageTitle.js';

export default function SubmitReviewPage() {
  usePageTitle('Submit a Review');
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();

  const [selectedRestaurant, setSelectedRestaurant] = useState(
    state?.restaurant || null,
  );
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [featured, setFeatured] = useState([]);

  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api().getEstablishments(), api().getReviews()])
      .then(([estRes, revRes]) => {
        if (cancelled) return;
        setRestaurants(estRes.establishments);
        setFeatured(
          [...revRes.reviews].sort((a, b) => b.rating - a.rating).slice(0, 4),
        );
      })
      .catch(() => toast.error('Failed to load restaurant list.'));
    return () => {
      cancelled = true;
    };
  }, []);

  const restaurantById = useMemo(
    () => new Map(restaurants.map((r) => [r._id, r])),
    [restaurants],
  );

  const filteredRestaurants = useMemo(
    () =>
      restaurants.filter((r) =>
        r.restaurantName.toLowerCase().includes(query.toLowerCase()),
      ),
    [restaurants, query],
  );

  const handleSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setQuery(restaurant.restaurantName);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isSubmitting) return;
    if (!selectedRestaurant) {
      setError('Please select a restaurant to review.');
      return;
    }
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (!reviewTitle.trim()) {
      setError('Please enter a review title.');
      return;
    }
    if (!reviewText.trim()) {
      setError('Please write a review.');
      return;
    }

    setIsSubmitting(true);
    const promise = api().createReview(selectedRestaurant.slug, {
      title: reviewTitle,
      rating,
      reviewer: user?.username || 'Anonymous',
      reviewerAvatar: user?.avatar,
      body: reviewText,
      reviewImage: null,
    });

    toast.promise(promise, {
      loading: 'Submitting your review...',
      success: 'Review submitted successfully!',
      error: 'Failed to submit review.',
    });

    try {
      const { review } = await promise;
      navigate(`/establishments/${selectedRestaurant.slug}#${review._id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-6 pt-24 pb-20 md:px-24">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        {/* Form Panel */}
        <div className="bg-surface-container flex-1 rounded-2xl p-8">
          {/* Header */}
          <div className="mb-8">
            <span className="text-secondary font-label text-xs font-bold tracking-[0.2em] uppercase">
              Share Your Experience
            </span>
            <h1 className="font-headline text-on-surface mt-1 text-3xl font-black tracking-tight">
              {selectedRestaurant ?
                `Review ${selectedRestaurant.restaurantName}`
              : 'Find a Restaurant'}
            </h1>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="font-ui border-error text-error bg-error/10 mb-6 rounded-xl border px-5 py-2 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Restaurant Search */}
            <div className="relative">
              <Combobox value={selectedRestaurant} onChange={handleSelect}>
                <div className="relative flex items-center">
                  <Search
                    size={16}
                    className="text-on-surface-variant pointer-events-none absolute left-5 z-10"
                  />
                  <ComboboxInput
                    displayValue={(restaurant) =>
                      restaurant?.restaurantName || ''
                    }
                    placeholder="Search for a restaurant to review…"
                    onChange={(e) => {
                      setQuery(e.target.value);
                      if (selectedRestaurant) {
                        setSelectedRestaurant(null);
                      }
                    }}
                    className="font-ui bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/40 focus:ring-primary w-full rounded-xl border-none py-3 pr-5 pl-11 text-sm transition-all duration-200 outline-none focus:ring-1"
                  />
                </div>

                {/* Search Results */}
                <ComboboxOptions className="bg-surface-container-high absolute top-full z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-2xl py-2 empty:hidden">
                  {filteredRestaurants.map((restaurant) => (
                    <ComboboxOption
                      key={restaurant._id}
                      value={restaurant}
                      className="font-ui text-on-surface hover:bg-surface-container-highest data-focus:bg-surface-container-highest cursor-pointer px-5 py-2.5 text-sm transition-colors duration-150"
                    >
                      {restaurant.restaurantName}
                    </ComboboxOption>
                  ))}
                </ComboboxOptions>
              </Combobox>
            </div>

            {/* Review Fields */}
            {selectedRestaurant && (
              <div className="flex animate-[fadeIn_0.3s_ease] flex-col gap-5">
                {/* Star rating */}
                <StarRating
                  rating={rating}
                  interactive
                  onChange={setRating}
                  starClassName="h-8 w-8"
                />

                {/* Review Title */}
                <input
                  type="text"
                  placeholder="Review title…"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="font-ui bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/40 focus:ring-primary w-full rounded-xl border-none px-5 py-3 text-sm font-semibold transition-all duration-200 outline-none focus:ring-1"
                />

                {/* Review Body */}
                <textarea
                  placeholder="Write your review here…"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={5}
                  className="font-ui bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/40 focus:ring-primary field-sizing-content w-full resize-none rounded-2xl border-none px-5 py-3 text-sm wrap-anywhere transition-all duration-200 outline-none focus:ring-1"
                />

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="gold-gradient text-on-secondary font-ui cursor-pointer rounded-xl border-none px-8 py-3 text-sm font-bold shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-28 lg:w-96">
          <div className="mb-5">
            <span className="text-secondary font-label text-xs font-bold tracking-[0.2em] uppercase">
              Top Rated
            </span>
            <h2 className="font-headline text-on-surface mt-1 text-2xl font-bold">
              Hear What Others Are Saying
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {featured.map((review) => {
              const restaurant = restaurantById.get(review.establishment);
              if (!restaurant) return null;
              return (
                <ReviewCard
                  key={review._id}
                  review={review}
                  restaurant={restaurant}
                  variant="stack"
                />
              );
            })}
          </div>
        </aside>
      </div>
    </main>
  );
}
