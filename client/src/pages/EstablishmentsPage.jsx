import { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import EstablishmentCard from '../components/EstablishmentCard';
import { api } from '../api';
import { toast } from 'sonner';
import { usePageTitle } from '../utils/usePageTitle.js';

export default function EstablishmentsPage() {
  usePageTitle('Establishments');
  const [searchParams, setSearchParams] = useSearchParams();
  const minRating = Number(searchParams.get('minRating') || 0);
  const query = (searchParams.get('q') || '').toLowerCase();
  const cuisineFilter = searchParams.get('cuisine') || '';
  const page = Number(searchParams.get('page')) || 1;

  const {
    data,
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ['establishments', { q: query, minRating, page, cuisineFilter }],
    queryFn: async () => {
      return api().getEstablishments({
        q: query,
        minRating,
        page,
        cuisine: cuisineFilter,
      });
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error('Failed to load establishments.');
    }
  }, [isError]);

  const establishments = data?.establishments || [];
  const totalEstablishments = data?.total || 0;
  const limit = data?.limit || 20;
  const error = isError ? 'Failed to load establishments.' : '';

  const handleRatingChange = (e) => {
    const rating = e.target.value;
    setSearchParams(
      (prev) => {
        if (rating === '0') {
          prev.delete('minRating');
        } else {
          prev.set('minRating', rating);
        }
        prev.delete('page');
        return prev;
      },
      { replace: true },
    );
  };

  const handleCuisineChange = (e) => {
    const cuisine = e.target.value;
    setSearchParams(
      (prev) => {
        if (!cuisine) {
          prev.delete('cuisine');
        } else {
          prev.set('cuisine', cuisine);
        }
        prev.delete('page');
        return prev;
      },
      { replace: true },
    );
  };

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      prev.set('page', String(newPage));
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cuisines = useMemo(
    () =>
      [
        ...new Set(establishments.flatMap((r) => r.cuisine).filter(Boolean)),
      ].sort(),
    [establishments],
  );

  const totalPages = Math.ceil(totalEstablishments / limit);

  return (
    <main className="px-fluid-container mx-auto max-w-7xl pt-24 pb-20">
      {/* Page Header */}
      <section className="mb-12 text-center md:text-left">
        <span className="text-secondary font-label text-xs font-bold tracking-[0.2em] uppercase">
          Curated Venues
        </span>
        <h1 className="font-headline text-on-surface text-fluid-7xl mt-2 font-black tracking-tighter">
          Establishments
        </h1>
      </section>
      {/* Filter Bar */}
      <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row sm:flex-wrap md:justify-start">
        <div className="bg-surface-container-low flex w-full items-center justify-between space-x-4 rounded-xl px-4 py-2 sm:w-auto">
          <span className="text-on-surface-variant font-ui text-xs font-bold uppercase">
            Filter by Rating:
          </span>
          <select
            id="rating-filter"
            value={minRating}
            onChange={handleRatingChange}
            aria-label="Filter establishments by minimum rating"
            className="text-primary font-ui cursor-pointer border-none bg-transparent text-xs font-bold uppercase focus:ring-0"
          >
            <option value={0} className="bg-surface-container-high">
              All Ratings
            </option>
            <option value={5} className="bg-surface-container-high">
              5 Stars
            </option>
            <option value={4} className="bg-surface-container-high">
              4+ Stars
            </option>
            <option value={3} className="bg-surface-container-high">
              3+ Stars
            </option>
          </select>
        </div>

        <div className="bg-surface-container-low flex w-full items-center justify-between space-x-4 rounded-xl px-4 py-2 sm:w-auto">
          <span className="text-on-surface-variant font-ui text-xs font-bold uppercase">
            Cuisine:
          </span>
          <select
            id="cuisine-filter"
            value={cuisineFilter}
            onChange={handleCuisineChange}
            aria-label="Filter establishments by cuisine"
            className="text-primary font-ui max-w-[50%] cursor-pointer truncate border-none bg-transparent text-xs font-bold uppercase focus:ring-0 sm:max-w-37.5"
          >
            <option value="" className="bg-surface-container-high">
              All Cuisines
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
        : establishments.length > 0 ?
          establishments.map((restaurant) => (
            <EstablishmentCard key={restaurant._id} restaurant={restaurant} />
          ))
        : <p className="font-ui text-on-surface-variant col-span-full text-center text-sm">
            No establishments found.
          </p>
        }
      </section>

      {/* Pagination Controls */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center space-x-4">
          <button
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            className="text-primary font-ui disabled:text-on-surface-variant/50 text-sm font-bold uppercase disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-on-surface-variant font-ui text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="text-primary font-ui disabled:text-on-surface-variant/50 text-sm font-bold uppercase disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
