import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Search,
  Star,
  UtensilsCrossed,
} from 'lucide-react';
import { toast } from 'sonner';
import ReviewCard from '../components/ReviewCard';
import { api } from '../api';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState('recent');
  const [email, setEmail] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([api().getEstablishments(), api().getReviews()])
      .then(([estRes, revRes]) => {
        if (cancelled) return;
        setRestaurants(estRes.establishments);
        setReviews(revRes.reviews);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Failed to load homepage data.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const restaurantById = useMemo(
    () => new Map(restaurants.map((r) => [r._id, r])),
    [restaurants],
  );

  const featured = useMemo(() => {
    return [...reviews]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10)
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

  const cuisines = useMemo(
    () => [...new Set(restaurants.map((r) => r.cuisine).filter(Boolean))],
    [restaurants],
  );

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

  const feedReviews = useMemo(() => {
    let result = [...reviews];

    if (sortBy === 'recent')
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === 'highest') result.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'trending')
      result.sort((a, b) => (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0));

    return result.slice(1, 3);
  }, [reviews, sortBy]);

  const handleSubscribe = () => {
    if (!email.trim()) return;
    toast.success("You're subscribed! Welcome to The Weekly Menu.");
    setEmail('');
  };

  return (
    <main className="mx-auto max-w-7xl px-6 pt-24 pb-20 md:px-24">
      <section className="mb-20 text-center md:text-left">
        <h1 className="font-headline text-on-surface mb-6 text-6xl font-black tracking-tighter md:text-8xl">
          The Finest <span className="text-primary italic">Palate</span>
          <br />
          Curated.
        </h1>
        <p className="font-body text-on-surface-variant mb-10 max-w-xl text-lg leading-relaxed">
          Experience dining through the lens of critics and connoisseurs. We
          don&apos;t just review food; we archive excellence.
        </p>
        <div className="inline-flex flex-wrap gap-4">
          <Link
            to="/submit-review"
            className="gold-gradient text-on-primary rounded-full px-8 py-4 font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Write a Review
          </Link>
          <Link
            to="/reviews"
            className="bg-surface-container-high border-outline-variant/15 text-primary hover:bg-surface-container-highest rounded-full border px-8 py-4 font-bold transition-colors active:scale-95"
          >
            Browse Michelin Guides
          </Link>
        </div>
      </section>

      <section className="mb-32">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="text-primary font-label text-xs font-bold tracking-[0.2em] uppercase">
              The Spotlight
            </span>
            <h2 className="font-headline mt-2 text-4xl font-bold">
              Featured Restaurants
            </h2>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handlePrev}
              disabled={totalPages <= 1}
              className="border-outline-variant/20 hover:bg-surface-container flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border transition-colors active:scale-90 disabled:opacity-30"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={handleNext}
              disabled={totalPages <= 1}
              className="border-outline-variant/20 hover:bg-surface-container flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border transition-colors active:scale-90 disabled:opacity-30"
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
            <div className="bg-surface-container-high col-span-12 h-125 animate-pulse rounded-lg lg:col-span-7" />
            <div className="col-span-12 flex flex-col space-y-6 lg:col-span-5">
              <div className="bg-surface-container-high h-56 animate-pulse rounded-lg" />
              <div className="bg-surface-container-high h-56 animate-pulse rounded-lg" />
            </div>
          </div>
        }
      </section>

      <div className="flex flex-col gap-16 lg:flex-row">
        {/* Feed */}
        <div className="flex-1">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="font-headline text-4xl font-bold">
              Latest Critiques
            </h2>
            <div className="bg-surface-container-low flex items-center space-x-4 rounded-full px-4 py-2">
              <span className="text-on-surface-variant text-xs font-bold uppercase">
                Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-primary cursor-pointer border-none bg-transparent text-xs font-bold uppercase focus:ring-0"
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
              className="bg-surface-container-high hover:bg-surface-container-highest text-primary border-outline-variant/20 rounded-full border px-12 py-4 font-bold transition-all active:scale-95"
            >
              Load More Editorial
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-80">
          <div className="sticky top-28 space-y-12">
            {/* Popular Tastes */}
            <div className="bg-surface-container-low rounded-lg p-8">
              <h4 className="font-headline mb-6 text-xl font-bold">
                Popular Tastes
              </h4>
              <div className="flex flex-wrap gap-3">
                {cuisines.map((cuisine) => (
                  <Link
                    key={cuisine}
                    to={`/reviews?cuisine=${encodeURIComponent(cuisine)}`}
                    className="bg-surface-container-highest text-on-surface-variant hover:bg-primary hover:text-on-primary cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition-all duration-200"
                  >
                    {cuisine}
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-surface-bright/60 border-outline-variant/10 relative overflow-hidden rounded-lg border p-8 backdrop-blur-lg">
              <div className="relative z-10">
                <h4 className="font-headline mb-2 text-xl font-bold">
                  The Weekly Menu
                </h4>
                <p className="text-on-surface-variant mb-6 text-sm">
                  Curated tables and hidden gems delivered to your inbox.
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                  placeholder="Email address"
                  className="bg-surface-container-lowest focus:ring-primary mb-4 w-full rounded-full border-none px-5 py-3 text-sm transition-all outline-none focus:ring-1"
                />
                <button
                  onClick={handleSubscribe}
                  className="gold-gradient text-on-primary w-full cursor-pointer rounded-full py-3 text-sm font-bold transition-transform active:scale-95"
                >
                  Subscribe
                </button>
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
                    <div className="flex items-center space-x-3">
                      <div className="bg-surface-container-highest text-primary flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold">
                        {critic.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{critic.name}</p>
                        <p className="text-on-surface-variant text-[10px] tracking-widest uppercase">
                          {critic.count}{' '}
                          {critic.count === 1 ? 'review' : 'reviews'}
                        </p>
                      </div>
                    </div>
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
