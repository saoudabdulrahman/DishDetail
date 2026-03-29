import { useEffect, useMemo, useState } from 'react';
import type { Establishment, Review } from '@dishdetail/shared';
import { useParams, useNavigate } from 'react-router';
import { Star, MapPin, Clock, Phone, Globe, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../api';
import DetailReviewCard from '../components/DetailReviewCard';
import './EstablishmentPage.css';

export default function EstablishmentPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Establishment | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [visibleCount, setVisibleCount] = useState(2);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sortedReviews = useMemo(() => {
    return [...reviews].sort(
      (a, b) =>
        b.rating - a.rating ||
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [reviews]);

  useEffect(() => {
    if (sortedReviews.length > 0 && window.location.hash) {
      const id = window.location.hash.substring(1);
      const index = sortedReviews.findIndex((r) => r._id === id);
      if (index >= visibleCount) {
        setVisibleCount(index + 1);
      }

      // Small delay to ensure the content is rendered before scrolling
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
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
        const res = await api().getEstablishment(slug!);
        if (!cancelled) {
          setRestaurant(res?.establishment || null);
          setReviews(res?.reviews || []);
        }
      } catch (e: unknown) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Failed to load.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchEstablishment();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleUpdateReview = async (
    reviewId: string,
    updates: Partial<Review>,
  ) => {
    const promise = api().updateReview(reviewId, updates);

    toast.promise(promise, {
      loading: 'Updating review...',
      success: 'Review updated.',
      error: 'Failed to update review.',
    });
    try {
      const { review } = await promise;
      setReviews((prev) => prev.map((r) => (r._id === reviewId ? review : r)));
    } catch (e: unknown) {
      console.error(e);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const promise = api().deleteReview(reviewId);

    toast.promise(promise, {
      loading: 'Deleting review...',
      success: 'Review deleted.',
      error: 'Failed to delete review.',
    });
    try {
      await promise;
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (e: unknown) {
      console.error(e);
    }
  };

  const displayedReviews = sortedReviews.slice(0, visibleCount);

  const avgRating =
    reviews.length > 0 ?
      (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1,
      )
    : (restaurant?.rating ?? 0);

  if (loading) {
    return (
      <main className="error-container">
        <p>Loading…</p>
      </main>
    );
  }

  if (error || !restaurant) {
    return (
      <main className="error-container">
        <p>{error || 'Restaurant not found'}</p>
        <button
          onClick={() => {
            void navigate('/establishments');
          }}
          className="back-button"
        >
          <ArrowLeft size={18} /> Go Back
        </button>
      </main>
    );
  }

  return (
    <main className="establishment-detail">
      <button
        onClick={() => {
          void navigate('/establishments');
        }}
        className="back-button"
      >
        <ArrowLeft size={18} /> Back to Establishments
      </button>

      <div className="detail-banner shimmer">
        <img
          src={restaurant.restaurantImage || undefined}
          alt={restaurant.restaurantName}
          className={`detail-banner-img ${imgLoaded ? 'loaded' : ''}`}
          onLoad={() => setImgLoaded(true)}
        />
      </div>

      <div className="detail-header">
        <div className="detail-header-top">
          <div>
            <h2>{restaurant.restaurantName}</h2>
            <p className="detail-cuisine">{restaurant.cuisine}</p>
          </div>
          <div className="detail-rating-badge">
            <Star className="star-filled" aria-hidden="true" />
            <span>{avgRating}</span>
          </div>
        </div>
        <p className="detail-description">{restaurant.description}</p>
      </div>

      <div className="detail-quick-info">
        <div className="detail-info-item">
          <MapPin size={18} />
          <div>
            <p className="detail-info-label">Address</p>
            <p className="detail-info-value">{restaurant.address}</p>
          </div>
        </div>
        <div className="detail-info-item">
          <Clock size={18} />
          <div>
            <p className="detail-info-label">Hours</p>
            <p className="detail-info-value">{restaurant.hours}</p>
          </div>
        </div>
        <div className="detail-info-item">
          <Phone size={18} />
          <div>
            <p className="detail-info-label">Phone</p>
            <p className="detail-info-value">{restaurant.phone}</p>
          </div>
        </div>
        <div className="detail-info-item">
          <Globe size={18} />
          <div>
            <p className="detail-info-label">Website</p>
            <p className="detail-info-value">{restaurant.website}</p>
          </div>
        </div>
      </div>

      <section className="detail-reviews-section">
        <div className="detail-reviews-section-header">
          <h2>Reviews</h2>
          <span className="detail-reviews-count">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {reviews.length > 0 ?
          <div className="detail-reviews-list">
            {displayedReviews.map((review) => (
              <DetailReviewCard
                key={review._id}
                review={review}
                onUpdate={(id, updates) => {
                  void handleUpdateReview(id, updates);
                }}
                onDelete={(id) => {
                  void handleDeleteReview(id);
                }}
              />
            ))}
            {visibleCount < reviews.length && (
              <div className="load-more-container">
                <button
                  onClick={() => setVisibleCount((c) => c + 3)}
                  className="load-more-button"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        : <p className="no-reviews">No reviews yet. Be the first to review!</p>}
      </section>
    </main>
  );
}
