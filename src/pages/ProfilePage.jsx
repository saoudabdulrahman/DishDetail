import { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { reviewsData, restaurantsData } from '../data';
import ReviewCard from '../components/ReviewCard';
import './ProfilePage.css';

export default function ProfilePage() {
	const { user, updateProfile } = useAuth();

	const [isEditing, setIsEditing] = useState(false);
	const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
	const [bio, setBio] = useState(user?.bio || '');

	const userReviews = reviewsData.filter((r) => r.reviewer === user.username);

	const handleSave = () => {
		updateProfile({ avatar: avatarUrl, bio });
		setIsEditing(false);
	};

	const handleCancel = () => {
		setAvatarUrl(user.avatar || '');
		setBio(user.bio || '');
		setIsEditing(false);
	};

	return (
		<main className="profile-page animate-fade-in">
			<div className="profile-header animate-slide-up stagger-0">
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
					:	<>
							<img
								src={user.avatar}
								alt={user.username}
								className="profile-avatar animate-scale-in stagger-1"
							/>
							<div className="profile-details animate-slide-up stagger-2">
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

			<section className="user-reviews-section animate-slide-up stagger-3">
				<h3>Your Reviews ({userReviews.length})</h3>
				{userReviews.length > 0 ?
					<div className="reviews-grid">
						{userReviews.map((review, index) => {
							const restaurant = restaurantsData.find(
								(r) => r.id === review.restaurantId,
							);
							return (
								<div
									key={review.id}
									className={`animate-slide-up stagger-${(index % 4) + 4}`}
								>
									<ReviewCard review={review} restaurant={restaurant} />
								</div>
							);
						})}
					</div>
				:	<p className="no-reviews">You haven't written any reviews yet.</p>}
			</section>
		</main>
	);
}
