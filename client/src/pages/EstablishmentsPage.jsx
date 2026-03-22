import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import EstablishmentCard from '../components/EstablishmentCard';
import { api } from '../api';
import { toast } from 'sonner';

export default function EstablishmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const minRating = Number(searchParams.get('minRating') || 0);
  const query = (searchParams.get('q') || '').toLowerCase();
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchEstablishments = async () => {
      setLoading(true);
      setError('');
      try {
        const { establishments: fetchedEstablishments } =
          await api().getEstablishments({ q: query, minRating });
        if (!cancelled) setEstablishments(fetchedEstablishments);
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setError('Failed to load establishments.');
          toast.error('Failed to load establishments.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEstablishments();

    return () => {
      cancelled = true;
    };
  }, [query, minRating]);

  const handleRatingChange = (e) => {
    const rating = e.target.value;
    setSearchParams(
      (prev) => {
        if (rating === '0') {
          prev.delete('minRating');
        } else {
          prev.set('minRating', rating);
        }
        return prev;
      },
      { replace: true },
    );
  };

  return (
    <main className="mx-auto max-w-7xl px-6 pt-24 pb-20 md:px-24">
      {/* Page header */}
      <section className="mb-12 text-center md:text-left">
        <span className="text-primary font-label text-xs font-bold tracking-[0.2em] uppercase">
          Curated Venues
        </span>
        <h1 className="font-headline text-on-surface mt-2 text-5xl font-black tracking-tighter md:text-7xl">
          Establishments
        </h1>
      </section>

      {/* Filter bar */}
      <div className="mb-10 flex justify-center md:justify-start">
        <div className="bg-surface-container-low flex items-center space-x-4 rounded-xl px-4 py-2">
          <span className="text-on-surface-variant text-xs font-bold uppercase">
            Filter by Rating:
          </span>
          <select
            id="rating-filter"
            value={minRating}
            onChange={handleRatingChange}
            aria-label="Filter establishments by minimum rating"
            className="text-primary cursor-pointer border-none bg-transparent text-xs font-bold uppercase focus:ring-0"
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
    </main>
  );
}
