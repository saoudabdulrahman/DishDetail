import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../auth/useAuth';
import { api } from '../api';
import ReviewCard from '../components/ReviewCard';
import { usePageTitle } from '../utils/usePageTitle.js';
import { profileSchema } from '../validation/forms';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: authUser, updateProfile } = useAuth();

  const isOwnProfile = authUser?.username === username;

  const [fetchedUser, setFetchedUser] = useState(null);
  const [loading, setLoading] = useState(!isOwnProfile);
  const [notFound, setNotFound] = useState(false);
  const [lastUsername, setLastUsername] = useState(username);

  // Reset state during render if the username changes
  if (username !== lastUsername) {
    setLastUsername(username);
    setFetchedUser(null);
    setLoading(!isOwnProfile);
    setNotFound(false);
  }

  const profileUser = isOwnProfile ? authUser : fetchedUser;

  usePageTitle(
    profileUser?.username ? `${profileUser.username}'s Profile` : 'Profile',
  );

  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(authUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(authUser?.avatar || '');
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  // Fetch the profile user from API when viewing someone else's profile
  useEffect(() => {
    if (isOwnProfile) return;

    let cancelled = false;
    api()
      .getUserByUsername(username)
      .then(({ user }) => {
        if (cancelled) return;
        setFetchedUser(user);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setNotFound(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [username, isOwnProfile]);

  // Fetch restaurants and reviews for the review list
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

  const profileReviews = useMemo(
    () => reviews.filter((r) => r.reviewer === username),
    [reviews, username],
  );

  const handleSave = async () => {
    setError('');
    const parsed = profileSchema.safeParse({ avatarUrl, bio });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    const promise = updateProfile({
      avatar: parsed.data.avatarUrl,
      bio: parsed.data.bio,
    });
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
    setBio(authUser?.bio || '');
    setAvatarUrl(authUser?.avatar || '');
    setIsEditing(false);
  };

  // Loading state
  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 pt-24 pb-20 md:px-24">
        <div className="bg-surface-container mb-12 animate-pulse rounded-2xl p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="bg-surface-container-highest h-36 w-36 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-3">
              <div className="bg-surface-container-high h-4 w-24 rounded" />
              <div className="bg-surface-container-high h-10 w-48 rounded" />
              <div className="bg-surface-container-high h-4 w-32 rounded" />
              <div className="bg-surface-container-high h-16 w-full max-w-xl rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Not found state
  if (notFound || !profileUser) {
    return (
      <main className="mx-auto max-w-7xl px-6 pt-24 pb-20 md:px-24">
        <div className="bg-surface-container rounded-2xl p-12 text-center">
          <h1 className="font-headline text-on-surface mb-4 text-4xl font-black tracking-tight">
            User Not Found
          </h1>
          <p className="font-body text-on-surface-variant mb-6">
            The profile you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            to="/"
            className="font-ui bg-primary text-on-primary inline-block rounded-xl px-6 py-3 text-sm font-semibold transition-transform hover:brightness-110 active:scale-95"
          >
            Go Home &rarr;
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="px-fluid-container mx-auto max-w-7xl pt-24 pb-20">
      {/* Profile Header */}
      <div className="bg-surface-container mb-12 rounded-2xl p-6 sm:p-8">
        {
          isOwnProfile && isEditing ?
            // Edit Form (own profile only)
            <div className="flex flex-col gap-5">
              <div className="mb-2">
                <span className="text-secondary font-label text-xs font-bold tracking-[0.2em] uppercase">
                  Editing Profile
                </span>
                <h2 className="font-headline text-on-surface text-fluid-3xl mt-1 font-black tracking-tight">
                  {authUser.username}
                </h2>
              </div>
              {error && (
                <div className="font-ui border-error text-error bg-error/10 rounded-xl border px-5 py-2 text-sm">
                  {error}
                </div>
              )}

              <label className="font-ui text-on-surface-variant flex flex-col gap-1.5 text-sm font-semibold">
                Avatar URL
                <input
                  type="url"
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="font-ui bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/40 focus:ring-primary w-full rounded-2xl border-none px-5 py-3 text-sm transition-all duration-200 outline-none focus:ring-1"
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

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <button
                  onClick={handleSave}
                  className="gold-gradient text-on-secondary font-ui w-full cursor-pointer rounded-xl border-none px-6 py-2.5 text-sm font-bold shadow-lg transition-all duration-200 hover:brightness-110 active:scale-95 sm:w-auto"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="font-ui bg-surface-container-high text-on-surface-variant hover:text-on-surface w-full cursor-pointer rounded-xl border-none px-6 py-2.5 text-sm font-semibold transition-colors duration-200 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
            // Profile Summary
          : <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <div className="bg-surface-container-highest text-primary flex h-24 w-24 shrink-0 items-center justify-center rounded-xl text-3xl font-black sm:h-36 sm:w-36">
                {profileUser.username?.slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <span className="text-secondary font-label text-xs font-bold tracking-[0.2em] uppercase">
                  {profileUser.role === 'owner' ?
                    'Owner Profile'
                  : 'Critic Profile'}
                </span>
                <h1 className="font-headline text-on-surface text-fluid-4xl mt-1 mb-2 font-black tracking-tight">
                  {profileUser.username}
                </h1>
                <p className="font-ui text-on-surface-variant mb-4 text-sm font-semibold">
                  {profileReviews.length}{' '}
                  {profileReviews.length === 1 ? 'Review' : 'Reviews'} Published
                </p>
                <p className="font-body text-on-surface-variant mb-6 max-w-xl leading-relaxed whitespace-pre-wrap">
                  {profileUser.bio || 'No bio yet.'}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => {
                      setBio(authUser?.bio || '');
                      setIsEditing(true);
                    }}
                    className="font-ui bg-surface-container-high text-on-surface hover:bg-surface-container-highest w-full cursor-pointer rounded-xl border-none px-6 py-2.5 text-sm font-semibold transition-colors duration-200 sm:w-auto"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

        }
      </div>
      {/* User Reviews */}
      <section>
        <div className="border-outline-variant/15 mb-8 flex flex-col items-center justify-between gap-4 border-b pb-4 sm:flex-row sm:items-end">
          <div className="text-center sm:text-left">
            <span className="text-secondary font-label text-xs font-bold tracking-[0.2em] uppercase">
              {isOwnProfile ? 'Your Writing' : 'Their Writing'}
            </span>
            <h2 className="font-headline text-on-surface text-fluid-3xl mt-1 font-bold">
              {isOwnProfile ?
                'Your Reviews'
              : `${profileUser.username}'s Reviews`}
            </h2>
          </div>
          <span className="font-ui text-on-surface-variant text-sm font-semibold">
            {profileReviews.length}{' '}
            {profileReviews.length === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {profileReviews.length > 0 ?
          <div className="space-y-4">
            {profileReviews.map((review) => {
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
            <p className="font-body text-on-surface-variant mb-6 italic">
              {isOwnProfile ?
                "You haven't written any reviews yet."
              : `${profileUser.username} hasn't written any reviews yet.`}
            </p>
            {isOwnProfile && (
              <Link
                to="/submit-review"
                className="font-ui bg-primary text-on-primary inline-block rounded-xl px-6 py-3 text-sm font-semibold transition-transform hover:brightness-110 active:scale-95"
              >
                Write your first review &rarr;
              </Link>
            )}
          </div>
        }
      </section>
    </main>
  );
}
