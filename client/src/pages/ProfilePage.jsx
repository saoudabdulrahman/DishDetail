import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../auth/useAuth';
import { api } from '../api';
import ReviewCard from '../components/ReviewCard';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);

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
        toast.error('Failed to load data. Please try again.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const restaurantById = useMemo(
    () => new Map(restaurants.map((r) => [r._id, r])),
    [restaurants],
  );

  const userReviews = useMemo(
    () => reviews.filter((r) => r.reviewer === user.username),
    [reviews, user.username],
  );

  const handleSave = async () => {
    const promise = updateProfile({ avatar: avatarUrl, bio });
    toast.promise(promise, {
      loading: 'Updating profile...',
      success: 'Profile updated successfully!',
      error: 'Failed to update profile. Please try again.',
    });
    try {
      await promise;
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setAvatarUrl(user.avatar || '');
    setBio(user.bio || '');
    setIsEditing(false);
  };

  return (
    <main className="mx-auto max-w-7xl px-6 pt-24 pb-20 md:px-24">
      {/* ── Profile header ──────────────────────────────────────────────── */}
      <div className="bg-surface-container mb-12 rounded-2xl p-8">
        {isEditing ?
          /* Edit mode */
          <div className="flex flex-col gap-5">
            <div className="mb-2">
              <span className="text-secondary font-label text-xs font-bold tracking-[0.2em] uppercase">
                Editing Profile
              </span>
              <h2 className="font-headline text-on-surface mt-1 text-3xl font-black tracking-tight">
                {user.username}
              </h2>
            </div>

            <label className="font-ui text-on-surface-variant flex flex-col gap-1.5 text-sm font-semibold">
              Avatar URL
              <input
                type="text"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="font-ui bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/40 focus:ring-primary w-full rounded-xl border-none px-5 py-2.5 text-sm transition-all duration-200 outline-none focus:ring-1"
              />
            </label>

            <label className="font-ui text-on-surface-variant flex flex-col gap-1.5 text-sm font-semibold">
              Bio
              <textarea
                placeholder="Tell us about yourself…"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="font-ui bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/40 focus:ring-primary field-sizing-content w-full resize-none rounded-2xl border-none px-5 py-3 text-sm transition-all duration-200 outline-none focus:ring-1"
              />
            </label>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="gold-gradient text-on-secondary cursor-pointer rounded-xl border-none px-6 py-2.5 text-sm font-bold shadow-lg transition-all duration-200 hover:brightness-110 active:scale-95"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="font-ui bg-surface-container-high text-on-surface-variant hover:text-on-surface cursor-pointer rounded-xl border-none px-6 py-2.5 text-sm font-semibold transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        : /* View mode */
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {user.avatar ?
              <img
                src={user.avatar}
                alt={user.username}
                className="border-surface-container-highest h-36 w-36 shrink-0 rounded-xl border-4 object-cover"
              />
            : <div className="bg-surface-container-highest text-primary flex h-36 w-36 shrink-0 items-center justify-center rounded-xl text-3xl font-black">
                {user.username?.slice(0, 2).toUpperCase()}
              </div>
            }

            <div className="flex-1 text-center sm:text-left">
              <span className="text-secondary font-label text-xs font-bold tracking-[0.2em] uppercase">
                Critic Profile
              </span>
              <h1 className="font-headline text-on-surface mt-1 mb-3 text-4xl font-black tracking-tight">
                {user.username}
              </h1>
              <p className="font-body text-on-surface-variant mb-6 max-w-xl leading-relaxed whitespace-pre-wrap">
                {user.bio || 'No bio yet.'}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="font-ui bg-surface-container-high text-on-surface hover:bg-surface-container-highest cursor-pointer rounded-xl border-none px-6 py-2.5 text-sm font-semibold transition-colors duration-200"
              >
                Edit Profile
              </button>
            </div>
          </div>
        }
      </div>

      {/* ── User reviews ────────────────────────────────────────────────── */}
      <section>
        <div className="border-outline-variant/15 mb-8 flex items-center justify-between border-b pb-4">
          <div>
            <span className="text-secondary font-label text-xs font-bold tracking-[0.2em] uppercase">
              Your Writing
            </span>
            <h2 className="font-headline text-on-surface mt-1 text-3xl font-bold">
              Your Reviews
            </h2>
          </div>
          <span className="font-ui text-on-surface-variant text-sm font-semibold">
            {userReviews.length}{' '}
            {userReviews.length === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {userReviews.length > 0 ?
          <div className="space-y-4">
            {userReviews.map((review) => {
              const restaurant = restaurantById.get(review.establishment);
              if (!restaurant) return null;
              return (
                <ReviewCard
                  key={review._id}
                  review={review}
                  restaurant={restaurant}
                  variant="feed"
                />
              );
            })}
          </div>
        : <div className="bg-surface-container rounded-2xl p-12 text-center">
            <p className="font-body text-on-surface-variant italic">
              You haven&apos;t written any reviews yet.
            </p>
          </div>
        }
      </section>
    </main>
  );
}
