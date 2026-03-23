import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../auth/useAuth';
import { api } from '../api';
import ReviewCard from '../components/ReviewCard';
import './ProfilePage.css';

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

  const userReviews = useMemo(() => {
    return reviews.filter((r) => r.reviewer === user.username);
  }, [reviews, user.username]);

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
                <button onClick={handleSave} className="save-button">
                  Save
                </button>
                <button onClick={handleCancel} className="cancel-button">
                  Cancel
                </button>
              </div>
            </div>
          : <>
              <img
                src={user.avatar}
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
              );
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
