import { useState } from 'react';
import { Star, Edit, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import StarRating from './StarRating';
import './DetailReviewCard.css';

export default function DetailReviewCard({ review, onDelete, onUpdate }) {
	const { user } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [editBody, setEditBody] = useState(review.body);
	const [editRating, setEditRating] = useState(review.rating);
	const [hoverRating, setHoverRating] = useState(0);

	const [commentText, setCommentText] = useState('');
	const [editingCommentId, setEditingCommentId] = useState(null);
	const [editCommentText, setEditCommentText] = useState('');

	const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
	const [unhelpfulCount, setUnhelpfulCount] = useState(
		review.unhelpfulCount || 0,
	);
	const [userVote, setUserVote] = useState(null);

	const [isEditingResponse, setIsEditingResponse] = useState(false);
	const [responseBody, setResponseBody] = useState('');

	const isOwner = user && user.username === review.reviewer;
	const isEstablishmentOwner =
		user && (user.username === 'owner' || user.role === 'owner');

	const handleSave = () => {
		onUpdate(review.id, { body: editBody, rating: editRating });
		setIsEditing(false);
	};

	const handleDelete = () => {
		if (window.confirm('Are you sure you want to delete this review?')) {
			onDelete(review.id);
		}
	};

	const handleCancel = () => {
		setIsEditing(false);
		setEditBody(review.body);
		setEditRating(review.rating);
	};

	const handleVote = (type) => {
		if (!user) {
			alert('Please log in to vote.');
			return;
		}

		let newHelpful = helpfulCount;
		let newUnhelpful = unhelpfulCount;
		let newVote = userVote;

		if (type === 'helpful') {
			if (userVote === 'helpful') {
				newHelpful--;
				newVote = null;
			} else {
				if (userVote === 'unhelpful') newUnhelpful--;
				newHelpful++;
				newVote = 'helpful';
			}
		} else {
			if (userVote === 'unhelpful') {
				newUnhelpful--;
				newVote = null;
			} else {
				if (userVote === 'helpful') newHelpful--;
				newUnhelpful++;
				newVote = 'unhelpful';
			}
		}

		setHelpfulCount(newHelpful);
		setUnhelpfulCount(newUnhelpful);
		setUserVote(newVote);

		onUpdate(review.id, {
			helpfulCount: newHelpful,
			unhelpfulCount: newUnhelpful,
		});
	};

	const handleSaveResponse = () => {
		if (!responseBody.trim()) return;
		onUpdate(review.id, {
			ownerResponse: {
				date: new Date().toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
				}),
				body: responseBody,
			},
		});
		setIsEditingResponse(false);
	};

	const handleDeleteResponse = () => {
		if (window.confirm('Delete your response?')) {
			onUpdate(review.id, { ownerResponse: null });
		}
	};

	const startEditResponse = () => {
		setResponseBody(review.ownerResponse?.body || '');
		setIsEditingResponse(true);
	};

	const handleAddComment = (e) => {
		e.preventDefault();
		if (!commentText.trim()) return;

		const newComment = {
			id: Date.now(),
			author: user.username,
			date: new Date().toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			}),
			body: commentText,
		};

		const updatedComments = [...(review.comments || []), newComment];
		onUpdate(review.id, { comments: updatedComments });
		setCommentText('');
	};

	const handleDeleteComment = (commentId) => {
		if (window.confirm('Delete this comment?')) {
			const updatedComments = review.comments.filter((c) => c.id !== commentId);
			onUpdate(review.id, { comments: updatedComments });
		}
	};

	const startEditComment = (comment) => {
		setEditingCommentId(comment.id);
		setEditCommentText(comment.body);
	};

	const saveEditComment = (commentId) => {
		const updatedComments = review.comments.map((c) =>
			c.id === commentId ? { ...c, body: editCommentText, isEdited: true } : c,
		);
		onUpdate(review.id, { comments: updatedComments });
		setEditingCommentId(null);
		setEditCommentText('');
	};

	if (isEditing) {
		return (
			<article className="detail-review-card editing">
				<div className="edit-review-form">
					<div
						className="star-rating"
						onMouseLeave={() => setHoverRating(0)}
						style={{ display: 'flex', gap: '4px' }}
					>
						{[1, 2, 3, 4, 5].map((star) => (
							<Star
								key={star}
								size={24}
								className={
									star <= (hoverRating || editRating) ?
										'star-filled'
									:	'star-empty'
								}
								fill={
									star <= (hoverRating || editRating) ?
										'var(--primary)'
									:	'none'
								}
								color="var(--primary)"
								onClick={() => setEditRating(star)}
								onMouseEnter={() => setHoverRating(star)}
								style={{ cursor: 'pointer' }}
							/>
						))}
					</div>
					<textarea
						className="edit-review-textarea"
						value={editBody}
						onChange={(e) => setEditBody(e.target.value)}
						rows={4}
					/>
					<div className="edit-actions">
						<button className="save-button" onClick={handleSave}>
							Save
						</button>
						<button className="cancel-button" onClick={handleCancel}>
							Cancel
						</button>
					</div>
				</div>
			</article>
		);
	}

	return (
		<article className="detail-review-card">
			<div className="detail-review-header">
				<div className="reviewer-info">
					<img
						src={review.reviewerAvatar}
						alt={review.reviewer}
						className="reviewer-avatar"
					/>
					<div>
						<h4 className="reviewer-name">
							{review.reviewer}
							{review.isEdited && (
								<span className="edited-badge">(edited)</span>
							)}
						</h4>
						<p className="review-date">{review.date}</p>
					</div>
				</div>
				<div
					className="review-actions-container"
					style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
				>
					<StarRating rating={review.rating} />
					{isOwner && (
						<div className="review-actions">
							<button
								className="icon-button"
								onClick={() => setIsEditing(true)}
								aria-label="Edit review"
							>
								<Edit size={16} />
							</button>
							<button
								className="icon-button delete"
								onClick={handleDelete}
								aria-label="Delete review"
							>
								<Trash2 size={16} />
							</button>
						</div>
					)}
				</div>
			</div>
			<p className="detail-review-body">{review.body}</p>
			{review.reviewImage && (
				<div className="detail-review-image-container">
					<img
						src={review.reviewImage}
						alt="Review photo"
						className="detail-review-image"
					/>
				</div>
			)}

			<div className="helpfulness-actions">
				<button
					className={`vote-button ${userVote === 'helpful' ? 'active' : ''}`}
					onClick={() => handleVote('helpful')}
				>
					<ThumbsUp size={14} /> Helpful ({helpfulCount})
				</button>
				<button
					className={`vote-button ${userVote === 'unhelpful' ? 'active' : ''}`}
					onClick={() => handleVote('unhelpful')}
				>
					<ThumbsDown size={14} /> Unhelpful ({unhelpfulCount})
				</button>
			</div>

			{(review.ownerResponse ||
				(isEstablishmentOwner && isEditingResponse)) && (
				<div className="owner-response">
					<h5>
						Response from Owner{' '}
						{review.ownerResponse?.date && `- ${review.ownerResponse.date}`}
					</h5>

					{isEditingResponse ?
						<div className="edit-comment-box">
							<textarea
								className="comment-input"
								value={responseBody}
								onChange={(e) => setResponseBody(e.target.value)}
								placeholder="Write your response..."
								rows={3}
							/>
							<div className="comment-actions">
								<button className="save-button" onClick={handleSaveResponse}>
									Save
								</button>
								<button
									className="cancel-button"
									onClick={() => setIsEditingResponse(false)}
								>
									Cancel
								</button>
							</div>
						</div>
					:	<>
							<p>{review.ownerResponse.body}</p>
							{isEstablishmentOwner && (
								<div className="owner-actions">
									<button
										className="comment-action-button"
										onClick={startEditResponse}
									>
										Edit
									</button>
									<button
										className="comment-action-button delete"
										onClick={handleDeleteResponse}
									>
										Delete
									</button>
								</div>
							)}
						</>
					}
				</div>
			)}

			{isEstablishmentOwner && !review.ownerResponse && !isEditingResponse && (
				<button className="respond-button" onClick={startEditResponse}>
					Respond to Review
				</button>
			)}

			<div className="comments-section">
				{review.comments && review.comments.length > 0 && (
					<div className="comments-list">
						<h4 className="comments-header">
							Comments ({review.comments.length})
						</h4>
						{review.comments.map((comment) => (
							<div key={comment.id} className="comment-item">
								<div className="comment-header">
									<span className="comment-author">{comment.author}</span>
									<span className="comment-date">
										{comment.date}
										{comment.isEdited && (
											<span className="edited-badge">(edited)</span>
										)}
									</span>
								</div>

								{editingCommentId === comment.id ?
									<div className="edit-comment-box">
										<textarea
											className="comment-input"
											value={editCommentText}
											onChange={(e) => setEditCommentText(e.target.value)}
										/>
										<div className="comment-actions">
											<button
												className="comment-action-button"
												onClick={() => saveEditComment(comment.id)}
											>
												Save
											</button>
											<button
												className="comment-action-button"
												onClick={() => setEditingCommentId(null)}
											>
												Cancel
											</button>
										</div>
									</div>
								:	<>
										<p className="comment-body">{comment.body}</p>
										{user && user.username === comment.author && (
											<div className="comment-actions">
												<button
													className="comment-action-button"
													onClick={() => startEditComment(comment)}
												>
													Edit
												</button>
												<button
													className="comment-action-button delete"
													onClick={() => handleDeleteComment(comment.id)}
												>
													Delete
												</button>
											</div>
										)}
									</>
								}
							</div>
						))}
					</div>
				)}

				{user ?
					<form onSubmit={handleAddComment} className="add-comment-form">
						<input
							type="text"
							className="comment-input"
							placeholder="Add a comment..."
							value={commentText}
							onChange={(e) => setCommentText(e.target.value)}
						/>
						<button
							type="submit"
							className="submit-comment-button"
							disabled={!commentText.trim()}
						>
							Post
						</button>
					</form>
				:	<p style={{ fontSize: '0.9rem', color: '#999', marginTop: '1rem' }}>
						Log in to leave a comment.
					</p>
				}
			</div>
		</article>
	);
}
