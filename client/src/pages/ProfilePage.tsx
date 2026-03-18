import { useEffect, useMemo, useState } from 'react';
import type { Establishment, Review } from '@dishdetail/shared';
import { useAuth } from '../auth/useAuth';
import { api } from '../api';
import ReviewCard from '../components/ReviewCard';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [restaurants, setRestaurants] = useState<Establishment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([api().getEstablishments(), api().getReviews()])
      .then(([estRes, revRes]) => {
        if (cancelled) return;
        setRestaurants(estRes.establishments);
        setReviews(revRes.reviews);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const userReviews = useMemo(() => {
    if (!user) return [];
    return reviews.filter((r) => r.reviewer === user.username);
  }, [reviews, user]);

  const handleSave = async () => {
    await updateProfile({ avatar: avatarUrl, bio });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setAvatarUrl(user?.avatar || '');
    setBio(user?.bio || '');
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <main className="profile-page">
      <div className="profile-header">
        <div className="profile-info">
          {isEditing ?
            <div className="edit-profile-form">
              <label>
                Avatar URL:
                <input
                  type="text"
                  placeholder="https://example.com/avatar.jpg"
                  id="avatar-input"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </label>
              <label>
                Bio:
                <textarea
                  placeholder="Tell us about yourself..."
                  id="bio-box"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </label>
              <div className="edit-actions">
                <button
                  onClick={() => {
                    void handleSave();
                  }}
                  className="save-button"
                >
                  Save
                </button>
                <button onClick={handleCancel} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          : <>
              <img
                src={user.avatar || undefined}
                alt={user.username}
                className="profile-avatar"
              />
              <div className="profile-details">
                <h2>{user.username}</h2>
                <p className="profile-bio">{user.bio || 'No bio yet.'}</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="edit-profile-button"
                >
                  Edit Profile
                </button>
              </div>
            </>
          }
        </div>
      </div>

      <section className="user-reviews-section">
        <h3>Your Reviews ({userReviews.length})</h3>
        {userReviews.length > 0 ?
          <div className="reviews-grid">
            {userReviews.map((review) => {
              const restaurant = restaurants.find(
                (r) => r._id === review.establishment,
              ) as Establishment;
              return (
                <ReviewCard
                  key={review._id}
                  review={review}
                  restaurant={restaurant}
                />
              );
            })}
          </div>
        : <p className="no-reviews">You {"haven't"} written any reviews yet.</p>
        }
      </section>
    </main>
  );
}
