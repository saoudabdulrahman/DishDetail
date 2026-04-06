import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  ArrowLeft,
  Edit3,
  X,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../api';
import DetailReviewCard from '../components/DetailReviewCard';
import { cn } from '../utils/cn';
import { usePageTitle } from '../utils/usePageTitle.js';
import { useAuth } from '../auth/useAuth';
import { updateEstablishmentSchema } from '../validation/forms';

const EMPTY_ARRAY = [];

export default function EstablishmentPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, refreshAuth } = useAuth();

  const [visibleCount, setVisibleCount] = useState(2);
  const [imgLoaded, setImgLoaded] = useState(false);

  const [isClaiming, setIsClaiming] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState('');
  const [editData, setEditData] = useState({});
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  const {
    data,
    isLoading: loading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ['establishment', slug],
    queryFn: () => api().getEstablishment(slug),
  });

  const restaurant = data?.establishment;
  const reviews = data?.reviews || EMPTY_ARRAY;
  const error = isError ? queryError?.message || 'Failed to load.' : '';

  usePageTitle(restaurant?.restaurantName || 'Loading...');

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
      const timer = setTimeout(() => {
        if (index >= visibleCount) setVisibleCount(index + 1);
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [sortedReviews, visibleCount]);

  const handleUpdateReview = async (reviewId, updates) => {
    const promise = api().updateReview(reviewId, updates);
    toast.promise(promise, {
      loading: 'Updating review...',
      success: 'Review updated.',
      error: 'Failed to update review.',
    });
    try {
      const { review } = await promise;
      queryClient.setQueryData(['establishment', slug], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          reviews: oldData.reviews.map((r) =>
            r._id === reviewId ? review : r,
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
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
      queryClient.setQueryData(['establishment', slug], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          reviews: oldData.reviews.filter((r) => r._id !== reviewId),
        };
      });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    } catch (error) {
      console.error(error);
    }
  };

  const handleClaim = async () => {
    if (isClaiming) return;
    setIsClaiming(true);
    try {
      const { token } = await api().claimEstablishment(slug);
      if (token) {
        await refreshAuth(token);
      }
      toast.success('Restaurant claimed successfully!');
      queryClient.invalidateQueries({ queryKey: ['establishment', slug] });
    } catch (err) {
      toast.error(err.message || 'Failed to claim restaurant.');
    } finally {
      setIsClaiming(false);
    }
  };

  const startEditing = () => {
    setEditData({
      restaurantName: restaurant.restaurantName,
      cuisine: restaurant.cuisine?.join(', ') || '',
      description: restaurant.description || '',
      address: restaurant.address || '',
      hours: restaurant.hours || '',
      phone: restaurant.phone || '',
      website: restaurant.website || '',
    });
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditError('');
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setEditError('Image size must be less than 5MB.');
        return;
      }
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setEditImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setEditImageFile(null);
      setEditImagePreview(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditError('');
    if (isUpdating) return;

    const parsed = updateEstablishmentSchema.safeParse(editData);
    if (!parsed.success) {
      setEditError(parsed.error.issues[0].message);
      return;
    }

    setIsUpdating(true);
    try {
      const payload = {
        ...parsed.data,
        cuisine:
          parsed.data.cuisine ?
            parsed.data.cuisine
              .split(',')
              .map((c) => c.trim())
              .filter(Boolean)
          : undefined,
      };

      if (editImageFile) {
        const res = await api().uploadImage(editImageFile);
        payload.restaurantImage = res.url;
      }

      const { establishment } = await api().updateEstablishment(slug, payload);
      toast.success('Restaurant updated successfully!');
      setIsEditing(false);
      queryClient.setQueryData(['establishment', slug], (oldData) => ({
        ...oldData,
        establishment,
      }));
      if (establishment.slug !== slug) {
        navigate(`/establishments/${establishment.slug}`, { replace: true });
      }
    } catch (err) {
      setEditError(err.message || 'Failed to update restaurant.');
    } finally {
      setIsUpdating(false);
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

  const isOwner =
    restaurant.owner?._id === user?.id || restaurant.owner === user?.id;
  const canClaim =
    restaurant.owner === null && user !== null && !user.ownedEstablishment;

  // Main page
  return (
    <main className="px-fluid-container mx-auto max-w-7xl pt-24 pb-20">
      {/* Top Actions */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <button
          onClick={() => navigate('/establishments')}
          className="font-ui bg-surface-container text-on-surface-variant hover:text-on-surface inline-flex cursor-pointer items-center gap-2 rounded-xl border-none px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
        >
          <ArrowLeft size={16} /> Back to Establishments
        </button>

        <div className="flex items-center gap-3">
          {canClaim && (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="font-ui bg-primary text-on-primary inline-flex cursor-pointer items-center gap-2 rounded-xl border-none px-5 py-2.5 text-sm font-bold shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60"
            >
              <Check size={16} />{' '}
              {isClaiming ? 'Claiming...' : 'Claim this restaurant'}
            </button>
          )}

          {isOwner && !isEditing && (
            <button
              onClick={startEditing}
              className="font-ui bg-secondary text-on-secondary inline-flex cursor-pointer items-center gap-2 rounded-xl border-none px-5 py-2.5 text-sm font-bold shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
            >
              <Edit3 size={16} /> Edit Details
            </button>
          )}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="mb-8 h-80 overflow-hidden rounded-2xl md:h-96">
        <img
          src={editImagePreview || restaurant.restaurantImage}
          alt={restaurant.restaurantName}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-500',
            imgLoaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={() => setImgLoaded(true)}
        />
      </div>

      {/* Owner Edit Panel or Display Header/Info */}
      {isEditing ?
        <div className="bg-surface-container mb-10 rounded-2xl p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-headline text-fluid-2xl font-bold">
              Edit Restaurant Details
            </h2>
            <button
              onClick={() => setIsEditing(false)}
              className="text-on-surface-variant hover:text-on-surface cursor-pointer border-none bg-transparent"
              title="Cancel Editing"
            >
              <X size={24} />
            </button>
          </div>

          {editError && (
            <div className="font-ui border-error text-error bg-error/10 mb-6 rounded-xl border px-5 py-3 text-sm font-semibold">
              {editError}
            </div>
          )}

          <form onSubmit={handleUpdate} className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="restaurantName"
                className="text-on-surface-variant font-ui mb-2 block text-sm font-semibold"
              >
                Restaurant Name
              </label>
              <input
                id="restaurantName"
                name="restaurantName"
                type="text"
                value={editData.restaurantName}
                onChange={handleEditChange}
                className="font-ui bg-surface-container-high text-on-surface focus:ring-primary w-full rounded-xl border-none px-5 py-3 text-sm outline-none focus:ring-1"
              />
            </div>
            <div>
              <label
                htmlFor="cuisine"
                className="text-on-surface-variant font-ui mb-2 block text-sm font-semibold"
              >
                Cuisine Tags (comma separated)
              </label>
              <input
                id="cuisine"
                name="cuisine"
                type="text"
                value={editData.cuisine}
                onChange={handleEditChange}
                className="font-ui bg-surface-container-high text-on-surface focus:ring-primary w-full rounded-xl border-none px-5 py-3 text-sm outline-none focus:ring-1"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="text-on-surface-variant font-ui mb-2 block text-sm font-semibold"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                rows={4}
                className="font-ui bg-surface-container-high text-on-surface focus:ring-primary field-sizing-content w-full resize-none rounded-2xl border-none px-5 py-3 text-sm outline-none focus:ring-1"
              />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="address"
                  className="text-on-surface-variant font-ui mb-2 block text-sm font-semibold"
                >
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={editData.address}
                  onChange={handleEditChange}
                  className="font-ui bg-surface-container-high text-on-surface focus:ring-primary w-full rounded-xl border-none px-5 py-3 text-sm outline-none focus:ring-1"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="text-on-surface-variant font-ui mb-2 block text-sm font-semibold"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={editData.phone}
                  onChange={handleEditChange}
                  className="font-ui bg-surface-container-high text-on-surface focus:ring-primary w-full rounded-xl border-none px-5 py-3 text-sm outline-none focus:ring-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="hours"
                  className="text-on-surface-variant font-ui mb-2 block text-sm font-semibold"
                >
                  Hours
                </label>
                <input
                  id="hours"
                  name="hours"
                  type="text"
                  value={editData.hours}
                  onChange={handleEditChange}
                  className="font-ui bg-surface-container-high text-on-surface focus:ring-primary w-full rounded-xl border-none px-5 py-3 text-sm outline-none focus:ring-1"
                />
              </div>
              <div>
                <label
                  htmlFor="website"
                  className="text-on-surface-variant font-ui mb-2 block text-sm font-semibold"
                >
                  Website URL
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={editData.website}
                  onChange={handleEditChange}
                  className="font-ui bg-surface-container-high text-on-surface focus:ring-primary w-full rounded-xl border-none px-5 py-3 text-sm outline-none focus:ring-1"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="editImage"
                className="text-on-surface-variant font-ui mb-2 block text-sm font-semibold"
              >
                Cover Image (Optional)
              </label>
              <input
                id="editImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="font-ui bg-surface-container-high text-on-surface focus:ring-primary file:bg-primary file:text-on-primary w-full cursor-pointer rounded-xl border-none px-5 py-3 text-sm file:mr-4 file:cursor-pointer file:rounded-xl file:border-none file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:brightness-110 focus:ring-1"
              />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="font-ui bg-surface-container-high text-on-surface hover:bg-surface-container-highest cursor-pointer rounded-xl border-none px-6 py-3 text-sm font-bold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="gold-gradient text-on-secondary font-ui cursor-pointer rounded-xl border-none px-8 py-3 text-sm font-bold shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-95 disabled:opacity-60"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      : <>
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
        </>
      }

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
