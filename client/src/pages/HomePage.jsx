import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import ReviewCard from '../components/ReviewCard';
import { api } from '../api';
import { useAuth } from '../auth/useAuth';
import { usePageTitle } from '../utils/usePageTitle.js';

const EMPTY_ARRAY = [];

export default function HomePage() {
  usePageTitle('Home');
  const { user, setAuthModal } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState('recent');

  const { data: estData, isError: isEstError } = useQuery({
    queryKey: ['establishments', { q: '', minRating: 0 }],
    queryFn: () => api().getEstablishments(),
  });

  const { data: revData, isError: isRevError } = useQuery({
    queryKey: ['reviews', { q: '' }],
    queryFn: () => api().getReviews(),
  });

  useEffect(() => {
    if (isEstError || isRevError) {
      toast.error('Failed to load homepage data.');
    }
  }, [isEstError, isRevError]);

  const restaurants = estData?.establishments || EMPTY_ARRAY;
  const reviews = revData?.reviews || EMPTY_ARRAY;

  const restaurantById = useMemo(
    () => new Map(restaurants.map((r) => [r._id, r])),
    [restaurants],
  );

  const featured = useMemo(() => {
    return [...reviews]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map((review) => ({
        review,
        restaurant: restaurantById.get(review.establishment),
      }))
      .filter(({ restaurant }) => restaurant);
  }, [reviews, restaurantById]);

  const stackPool = featured.slice(1, 5);
  const itemsPerPage = 2;
  const totalPages = Math.ceil(stackPool.length / itemsPerPage);
  const effectivePage = Math.min(currentPage, Math.max(0, totalPages - 1));

  const currentStackItems = stackPool.slice(
    effectivePage * itemsPerPage,
    (effectivePage + 1) * itemsPerPage,
  );

  const handleNext = () =>
    setCurrentPage((prev) => (prev + 1) % Math.max(1, totalPages));
  const handlePrev = () =>
    setCurrentPage((prev) => (prev - 1 + totalPages) % Math.max(1, totalPages));

  const cuisines = useMemo(() => {
    const counts = {};

    reviews.forEach((review) => {
      const restaurant = restaurantById.get(review.establishment);
      if (!restaurant?.cuisine) return;

      const values =
        Array.isArray(restaurant.cuisine) ?
          restaurant.cuisine
        : [restaurant.cuisine];

      values.forEach((value) => {
        if (!value) return;
        counts[value] = (counts[value] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5)
      .map(([cuisine]) => cuisine);
  }, [reviews, restaurantById]);

  const topCritics = useMemo(() => {
    const counts = {};
    reviews.forEach((r) => {
      counts[r.reviewer] = (counts[r.reviewer] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([name, count]) => ({ name, count }));
  }, [reviews]);

  const featuredIds = useMemo(
    () => new Set(featured.map(({ review }) => review._id)),
    [featured],
  );

  const feedReviews = useMemo(() => {
    let result = reviews.filter((r) => !featuredIds.has(r._id));

    if (sortBy === 'recent')
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sortBy === 'highest') result.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'trending')
      result.sort((a, b) => (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0));

    return result.slice(0, 2);
  }, [reviews, sortBy, featuredIds]);

  return (
    <main className="px-fluid-container mx-auto max-w-7xl pt-24 pb-20">
      <section className="mb-20 text-center md:text-left">
        <h1 className="font-headline text-on-surface text-fluid-8xl mb-6 font-black tracking-tighter">
          The Finest <span className="text-primary italic">Palate</span>
          <br />
          Curated.
        </h1>
        <p className="font-body text-on-surface-variant text-fluid-body mb-10 max-w-xl leading-relaxed">
          Experience dining through the lens of critics and connoisseurs. We
          don&apos;t just review food, we archive excellence.
        </p>
        <div className="inline-flex w-full flex-col flex-wrap gap-4 sm:w-auto sm:flex-row">
          <button
            onClick={() =>
              !user ? setAuthModal('login') : navigate('/submit-review')
            }
            className="gold-gradient text-on-primary font-ui w-full cursor-pointer rounded-xl border-none px-8 py-4 font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 sm:w-auto"
          >
            Write a Review
          </button>
          <Link
            to="/establishments"
            className="bg-surface-container-high border-outline-variant/15 text-primary hover:bg-surface-container-highest font-ui w-full rounded-xl border px-8 py-4 font-bold transition-colors active:scale-95 sm:w-auto"
          >
            Browse Establishments
          </Link>
        </div>
      </section>
      <section className="mb-32">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="text-secondary font-label text-xs font-bold tracking-[0.2em] uppercase">
              The Spotlight
            </span>
            <h2 className="font-headline text-fluid-4xl mt-2 font-bold">
              Featured Restaurants
            </h2>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handlePrev}
              disabled={totalPages <= 1}
              className="border-outline-variant/20 hover:bg-surface-container font-ui flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border transition-colors active:scale-90 disabled:opacity-30"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={handleNext}
              disabled={totalPages <= 1}
              className="border-outline-variant/20 hover:bg-surface-container font-ui flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border transition-colors active:scale-90 disabled:opacity-30"
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        {featured.length > 0 ?
          <div className="editorial-grid">
            <ReviewCard
              review={featured[0].review}
              restaurant={featured[0].restaurant}
              variant="feature"
            />
            <div className="col-span-12 flex flex-col space-y-6 lg:col-span-5">
              {currentStackItems.map(({ review, restaurant }) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  restaurant={restaurant}
                  variant="stack"
                />
              ))}
            </div>
          </div>
        : <div className="editorial-grid">
            <div className="bg-surface-container-high col-span-12 h-125 animate-pulse rounded-sm lg:col-span-7" />
            <div className="col-span-12 flex flex-col space-y-6 lg:col-span-5">
              <div className="bg-surface-container-high h-56 animate-pulse rounded-sm" />
              <div className="bg-surface-container-high h-56 animate-pulse rounded-sm" />
            </div>
          </div>
        }
      </section>
      <div className="flex flex-col gap-16 lg:flex-row">
        {/* Feed Section */}
        <div className="flex-1">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="font-headline text-fluid-4xl font-bold">
              Latest Critiques
            </h2>
            <div className="bg-surface-container-low flex w-full items-center space-x-4 rounded-xl px-4 py-2 sm:w-auto">
              <span className="text-on-surface-variant font-ui text-xs font-bold uppercase">
                Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-primary font-ui cursor-pointer border-none bg-transparent text-xs font-bold uppercase focus:ring-0"
              >
                <option value="recent" className="bg-surface-container-high">
                  Most Recent
                </option>
                <option value="highest" className="bg-surface-container-high">
                  Highest Rated
                </option>
                <option value="trending" className="bg-surface-container-high">
                  Trending
                </option>
              </select>
            </div>
          </div>
          <div className="space-y-12">
            {feedReviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                restaurant={restaurantById.get(review.establishment)}
                variant="feed"
              />
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link
              to="/reviews"
              className="bg-surface-container-high hover:bg-surface-container-highest text-primary border-outline-variant/20 font-ui rounded-xl border px-12 py-4 font-bold transition-all active:scale-95"
            >
              Load More
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-80">
          <div className="sticky top-28 space-y-12">
            {/* Popular Tastes */}
            <div className="bg-surface-container-low rounded-sm p-8">
              <h4 className="font-headline mb-6 text-xl font-bold">
                Popular Tastes
              </h4>
              <div className="flex flex-wrap gap-3">
                {cuisines.map((cuisine) => (
                  <Link
                    key={cuisine}
                    to={`/reviews?cuisine=${encodeURIComponent(cuisine)}`}
                    className="bg-surface-container-highest text-on-surface-variant hover:bg-primary hover:text-on-primary font-ui cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200"
                  >
                    {cuisine}
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Critics */}
            <div>
              <h4 className="font-headline mb-6 text-xl font-bold">
                Top Critics
              </h4>
              <div className="space-y-6">
                {topCritics.map((critic) => (
                  <div
                    key={critic.name}
                    className="flex items-center justify-between"
                  >
                    <Link
                      to={`/profile/${critic.name}`}
                      className="hover:bg-surface-container-low -ml-1 flex items-center space-x-3 rounded-xl p-1 pr-3 no-underline transition-colors"
                    >
                      <div className="bg-surface-bright text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold">
                        {critic.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-ui text-on-surface text-sm font-bold">
                          {critic.name}
                        </p>
                        <p className="text-on-surface-variant font-ui text-[10px] tracking-widest uppercase">
                          {critic.count}{' '}
                          {critic.count === 1 ? 'review' : 'reviews'}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
