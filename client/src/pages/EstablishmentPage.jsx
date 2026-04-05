import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Star, MapPin, Clock, Phone, Globe, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../api';
import DetailReviewCard from '../components/DetailReviewCard';
import { cn } from '../utils/cn';
import { usePageTitle } from '../utils/usePageTitle.js';

export default function EstablishmentPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  usePageTitle(restaurant?.restaurantName || 'Loading...');
  const [reviews, setReviews] = useState([]);
  const [visibleCount, setVisibleCount] = useState(2);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sortedReviews = useMemo(() => {
    return [...reviews].sort(
      (a, b) => b.rating - a.rating || new Date(b.date) - new Date(a.date),
    );
  }, [reviews]);

  useEffect(() => {
    // Auto-expand visible reviews when URL hash points to a hidden review.
    if (sortedReviews.length > 0 && window.location.hash) {
      const id = window.location.hash.substring(1);
      const index = sortedReviews.findIndex((r) => r._id === id);
      if (index >= visibleCount) setVisibleCount(index + 1);
      const timer = setTimeout(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [sortedReviews, visibleCount]);

  useEffect(() => {
    let cancelled = false;
    const fetchEstablishment = async () => {
      setLoading(true);
      setError('');
      try {
        const { establishment, reviews } = await api().getEstablishment(slug);
        if (!cancelled) {
          setRestaurant(establishment);
          setReviews(reviews);
        }
      } catch (error) {
        if (!cancelled) setError(error || 'Failed to load.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchEstablishment();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleUpdateReview = async (reviewId, updates) => {
    const promise = api().updateReview(reviewId, updates);
    toast.promise(promise, {
      loading: 'Updating review...',
      success: 'Review updated.',
      error: 'Failed to update review.',
    });
    try {
      const { review } = await promise;
      setReviews((prev) => prev.map((r) => (r._id === reviewId ? review : r)));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const promise = api().deleteReview(reviewId);
    toast.promise(promise, {
      loading: 'Deleting review...',
      success: 'Review deleted.',
      error: 'Failed to delete review.',
    });
    try {
      await promise;
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (error) {
      console.error(error);
    }
  };

  const displayedReviews = sortedReviews.slice(0, visibleCount);
  const avgRating =
    reviews.length > 0 ?
      (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1,
      )
    : (restaurant?.rating ?? 0);

  // Loading state
  if (loading) {
    return (
      <main className="px-fluid-container mx-auto max-w-7xl pt-24 pb-20">
        <div className="bg-surface-container-high mb-8 h-80 animate-pulse rounded-2xl" />
        <div className="bg-surface-container-high mb-4 h-10 w-1/3 animate-pulse rounded-xl" />
        <div className="bg-surface-container-high mb-8 h-6 w-2/3 animate-pulse rounded-xl" />
        <div className="bg-surface-container-high h-32 animate-pulse rounded-2xl" />
      </main>
    );
  }

  // Error state
  if (error || !restaurant) {
    return (
      <main className="px-fluid-container mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center gap-6 pt-24 pb-20">
        <p className="font-ui text-on-surface-variant text-lg">
          {error || 'Restaurant not found'}
        </p>
        <button
          onClick={() => navigate('/establishments')}
          className="font-ui bg-surface-container-high text-on-surface inline-flex cursor-pointer items-center gap-2 rounded-xl border-none px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </main>
    );
  }

  // Main page
  return (
    <main className="px-fluid-container mx-auto max-w-7xl pt-24 pb-20">
      {/* Back Button */}
      <button
        onClick={() => navigate('/establishments')}
        className="font-ui bg-surface-container text-on-surface-variant hover:text-on-surface mb-8 inline-flex cursor-pointer items-center gap-2 rounded-xl border-none px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
      >
        <ArrowLeft size={16} /> Back to Establishments
      </button>
      {/* Hero Banner */}
      <div className="mb-8 h-80 overflow-hidden rounded-2xl md:h-96">
        <img
          src={restaurant.restaurantImage}
          alt={restaurant.restaurantName}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-500',
            imgLoaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={() => setImgLoaded(true)}
        />
      </div>
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="font-headline text-on-surface text-fluid-5xl font-black tracking-tight">
              {restaurant.restaurantName}
            </h1>
            <div className="mt-1 flex flex-wrap gap-1">
              {(restaurant.cuisine ?? []).map((c) => (
                <span
                  key={c}
                  className="bg-surface-container-highest text-primary font-ui rounded px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-primary text-on-primary flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 font-bold">
            <Star size={16} fill="currentColor" aria-hidden="true" />
            <span className="font-ui text-lg">{avgRating}</span>
          </div>
        </div>
        <p className="font-body text-on-surface-variant max-w-2xl leading-relaxed">
          {restaurant.description}
        </p>
      </div>
      {/* Quick Info Grid */}
      <div className="bg-surface-container mb-10 grid grid-cols-1 gap-4 rounded-2xl p-4 sm:grid-cols-2 sm:gap-6 sm:p-6 lg:grid-cols-4">
        {[
          { icon: MapPin, label: 'Address', value: restaurant.address },
          { icon: Clock, label: 'Hours', value: restaurant.hours },
          { icon: Phone, label: 'Phone', value: restaurant.phone },
          { icon: Globe, label: 'Website', value: restaurant.website },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <Icon
              size={18}
              className="text-primary mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="font-ui text-on-surface-variant mb-0.5 text-[10px] font-semibold tracking-widest uppercase">
                {label}
              </p>
              <p className="font-ui text-on-surface text-sm font-medium break-all">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Reviews Section */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-headline text-fluid-3xl font-bold">Reviews</h2>
          <span className="font-ui text-on-surface-variant text-sm font-semibold">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {reviews.length > 0 ?
          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <DetailReviewCard
                key={review._id}
                review={review}
                onUpdate={handleUpdateReview}
                onDelete={handleDeleteReview}
              />
            ))}
            {visibleCount < reviews.length && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setVisibleCount((c) => c + 3)}
                  className="font-ui bg-surface-container-high text-primary border-outline-variant/20 hover:bg-surface-container-highest cursor-pointer rounded-xl border px-12 py-4 font-bold transition-all duration-200 active:scale-95"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        : <div className="bg-surface-container rounded-2xl p-10 text-center">
            <p className="font-ui text-on-surface-variant text-sm">
              No reviews yet. Be the first to review!
            </p>
          </div>
        }
      </section>
    </main>
  );
}
