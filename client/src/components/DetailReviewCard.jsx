import { useState } from 'react';
import { Link } from 'react-router';
import { Star, Edit, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/useAuth';
import { formatDate } from '../utils/date';
import { cn } from '../utils/cn';
import StarRating from './StarRating';

const inputCls =
  'font-ui bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/40 w-full rounded-xl border-none px-5 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-primary';

const textareaCls =
  'font-ui bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/40 w-full rounded-2xl border-none px-5 py-3 text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-primary resize-none field-sizing-content';

const iconBtnCls =
  'flex cursor-pointer items-center justify-center rounded-xl border-none bg-transparent p-2 text-on-surface-variant transition-colors duration-200 hover:bg-surface-container-highest hover:text-primary';

function EditActions({ onSave, onCancel, saveLabel = 'Save' }) {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={onCancel}
        className="font-ui bg-surface-container-highest text-on-surface-variant hover:bg-error/20 hover:text-error cursor-pointer rounded-xl border-none px-5 py-2 text-sm font-semibold transition-all duration-200"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="font-ui bg-primary text-on-primary cursor-pointer rounded-xl border-none px-5 py-2 text-sm font-semibold transition-all duration-200 hover:brightness-110"
      >
        {saveLabel}
      </button>
    </div>
  );
}

function CommentItem({
  comment,
  user,
  onEdit,
  onDelete,
  editingId,
  editText,
  setEditText,
  onSaveEdit,
  onCancelEdit,
}) {
  const isEditing = editingId === comment._id;
  const isAuthor = user?.username === comment.author;

  return (
    <div className="flex gap-3">
      <div className="bg-surface-container-highest text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold">
        {comment.author?.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-ui text-on-surface text-sm font-semibold">
            {comment.author}
          </span>
          <span className="font-ui text-on-surface-variant text-[10px] tracking-widest uppercase">
            {formatDate(comment.date)}
          </span>
          {comment.isEdited && (
            <span className="font-ui text-on-surface-variant text-[10px] italic">
              (edited)
            </span>
          )}
        </div>

        {isEditing ?
          <div className="flex flex-col gap-2">
            <textarea
              className={textareaCls}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
            />
            <EditActions
              onSave={() => onSaveEdit(comment._id)}
              onCancel={onCancelEdit}
            />
          </div>
        : <>
            <p className="font-body text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap">
              {comment.body}
            </p>
            {isAuthor && (
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => onEdit(comment)}
                  className="font-ui text-on-surface-variant hover:text-primary cursor-pointer border-none bg-transparent text-xs transition-colors hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(comment._id)}
                  className="font-ui text-on-surface-variant hover:text-error cursor-pointer border-none bg-transparent text-xs transition-colors hover:underline"
                >
                  Delete
                </button>
              </div>
            )}
          </>
        }
      </div>
    </div>
  );
}

export default function DetailReviewCard({ review, onDelete, onUpdate }) {
  const { user, setAuthModal } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [editTitle, setEditTitle] = useState(review.title || '');
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
  const isEstablishmentOwner = user && user.role === 'owner';

  const handleSave = () => {
    onUpdate(review._id, {
      title: editTitle,
      body: editBody,
      rating: editRating,
      isEdited: true,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this review?'))
      onDelete(review._id);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(review.title || '');
    setEditBody(review.body);
    setEditRating(review.rating);
  };

  const handleVote = (type) => {
    if (!user) {
      toast.error('You must be logged in to vote on reviews.');
      return;
    }
    let newHelpful = helpfulCount,
      newUnhelpful = unhelpfulCount,
      newVote = userVote;
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
    onUpdate(review._id, {
      helpfulCount: newHelpful,
      unhelpfulCount: newUnhelpful,
    });
  };

  const handleSaveResponse = () => {
    if (!responseBody.trim()) return;
    onUpdate(review._id, {
      ownerResponse: { date: new Date().toISOString(), body: responseBody },
    });
    toast.success('Response saved.');
    setIsEditingResponse(false);
  };

  const handleDeleteResponse = () => {
    if (window.confirm('Delete your response?')) {
      onUpdate(review._id, { ownerResponse: null });
      toast.success('Response deleted.');
    }
  };

  const startEditResponse = () => {
    setResponseBody(review.ownerResponse?.body || '');
    setIsEditingResponse(true);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = {
      author: user.username,
      date: new Date().toISOString(),
      body: commentText,
    };
    try {
      await onUpdate(review._id, {
        comments: [...(review.comments || []), newComment],
      });
      toast.success('Comment added.');
      setCommentText('');
    } catch {
      // onUpdate already shows a toast on failure — nothing extra needed
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await onUpdate(review._id, {
          comments: review.comments.filter((c) => c._id !== commentId),
        });
        toast.success('Comment deleted.');
      } catch {
        // onUpdate already shows a toast on failure
      }
    }
  };

  const saveEditComment = async (commentId) => {
    try {
      await onUpdate(review._id, {
        comments: review.comments.map((c) =>
          c._id === commentId ?
            { ...c, body: editCommentText, isEdited: true }
          : c,
        ),
      });
      setEditingCommentId(null);
      setEditCommentText('');
      toast.success('Comment updated.');
    } catch {
      // onUpdate already shows a toast on failure
    }
  };

  // Edit Mode
  if (isEditing) {
    return (
      <article className="bg-surface-container rounded-2xl p-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                className="cursor-pointer transition-transform hover:scale-110"
                fill={
                  star <= (hoverRating || editRating) ? 'currentColor' : 'none'
                }
                color="var(--color-primary)"
                onClick={() => setEditRating(star)}
                onMouseEnter={() => setHoverRating(star)}
              />
            ))}
          </div>
          <input
            type="text"
            className={inputCls}
            placeholder="Review title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <textarea
            className={textareaCls}
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={4}
          />
          <EditActions onSave={handleSave} onCancel={handleCancel} />
        </div>
      </article>
    );
  }

  return (
    <article id={review._id} className="bg-surface-container rounded-2xl p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <Link
          to={`/profile/${review.reviewer}`}
          className="hover:bg-surface-container-highest -ml-1 flex items-center gap-3 rounded-xl p-1 pr-3 no-underline transition-colors"
        >
          <div className="bg-surface-bright text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold">
            {review.reviewer?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-ui text-on-surface text-sm font-semibold">
              {review.reviewer}
              {review.isEdited && (
                <span className="text-on-surface-variant font-ui ml-1.5 text-xs font-normal italic">
                  (edited)
                </span>
              )}
            </p>
            <p className="font-ui text-on-surface-variant text-[10px] tracking-widest uppercase">
              {formatDate(review.date)}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <StarRating rating={review.rating} />
          {isOwner && (
            <div className="border-outline-variant/30 flex gap-1 border-l pl-3">
              <button
                className={iconBtnCls}
                onClick={() => setIsEditing(true)}
                aria-label="Edit review"
              >
                <Edit size={15} />
              </button>
              <button
                className={cn(iconBtnCls, 'hover:text-error')}
                onClick={handleDelete}
                aria-label="Delete review"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Body */}
      {review.title && (
        <h4 className="font-headline text-on-surface mb-3 text-lg font-bold">
          {review.title}
        </h4>
      )}

      <blockquote className="border-primary/50 bg-surface-container-low rounded-r-xl border-l-4 py-4 pr-4 pl-5">
        <p className="font-body text-on-surface-variant leading-relaxed whitespace-pre-wrap">
          {review.body}
        </p>
      </blockquote>

      {/* Review Image */}
      {review.reviewImage && (
        <div className="mt-4 overflow-hidden rounded-lg">
          <img
            src={review.reviewImage}
            alt="Review photo"
            className={`max-h-52 w-auto object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
          />
        </div>
      )}

      {/* Helpfulness Bar */}
      <div className="bg-surface-container-low mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
        <div>
          <h5 className="font-headline text-on-surface text-sm font-bold">
            Was this review helpful?
          </h5>
          <p className="font-ui text-on-surface-variant mt-0.5 text-xs">
            Help others discover the best dining experiences.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => handleVote('helpful')}
            className={cn(
              'font-ui flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2 text-sm font-semibold transition-all duration-200',
              userVote === 'helpful' ?
                'bg-primary text-on-primary border-primary'
              : 'border-primary/20 text-primary hover:bg-primary hover:text-on-primary',
            )}
          >
            <ThumbsUp size={14} />
            Valuable{helpfulCount > 0 && ` (${helpfulCount})`}
          </button>
          <button
            onClick={() => handleVote('unhelpful')}
            className={cn(
              'font-ui flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2 text-sm font-semibold transition-all duration-200',
              userVote === 'unhelpful' ?
                'bg-surface-container-highest text-on-surface border-outline-variant'
              : 'border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface',
            )}
          >
            <ThumbsDown size={14} />
            Not for me{unhelpfulCount > 0 && ` (${unhelpfulCount})`}
          </button>
        </div>
      </div>

      {/* Owner Response */}
      {(review.ownerResponse ||
        (isEstablishmentOwner && isEditingResponse)) && (
        <div className="border-primary/40 bg-surface-container-high mt-6 rounded-lg border-l-4 p-4">
          <p className="text-primary font-ui mb-2 text-xs font-bold tracking-widest uppercase">
            Response from Owner
            {review.ownerResponse?.date && (
              <span className="text-on-surface-variant font-ui ml-2 font-normal tracking-normal normal-case">
                · {formatDate(review.ownerResponse.date)}
              </span>
            )}
          </p>
          {isEditingResponse ?
            <div className="flex flex-col gap-3">
              <textarea
                className={textareaCls}
                value={responseBody}
                onChange={(e) => setResponseBody(e.target.value)}
                placeholder="Write your response..."
                rows={3}
              />
              <EditActions
                onSave={handleSaveResponse}
                onCancel={() => setIsEditingResponse(false)}
              />
            </div>
          : <>
              <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                {review.ownerResponse.body}
              </p>
              {isEstablishmentOwner && (
                <div className="mt-2 flex justify-end gap-3">
                  <button
                    onClick={startEditResponse}
                    className="font-ui text-on-surface-variant hover:text-primary cursor-pointer border-none bg-transparent text-xs transition-colors hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteResponse}
                    className="font-ui text-on-surface-variant hover:text-error cursor-pointer border-none bg-transparent text-xs transition-colors hover:underline"
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
        <button
          onClick={startEditResponse}
          className="font-ui bg-surface-container-high text-primary mt-4 cursor-pointer rounded-xl border-none px-5 py-2 text-sm font-semibold transition-all duration-200 hover:brightness-110"
        >
          Respond to Review
        </button>
      )}

      {/* Comments */}
      <div
        id={`comments-${review._id}`}
        className="border-outline-variant/15 mt-6 border-t pt-6"
      >
        {/* Section Header */}
        <h5 className="font-headline text-on-surface mb-5 text-base font-bold">
          Discussion
          {review.comments?.length > 0 && (
            <span className="text-primary font-ui ml-2 align-middle text-sm font-semibold">
              ({review.comments.length})
            </span>
          )}
        </h5>

        {/* Comment Input */}
        {user ?
          <form onSubmit={handleAddComment} className="mb-6 flex gap-3">
            <div className="bg-surface-container-highest text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold">
              {user.username?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                className={inputCls}
                placeholder="Join the discussion…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="font-ui bg-primary text-on-primary cursor-pointer rounded-xl border-none px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </form>
        : <p className="font-ui text-on-surface-variant mb-5 text-sm">
            <button
              onClick={() => setAuthModal('login')}
              className="text-primary font-ui cursor-pointer border-none bg-transparent p-0 font-semibold hover:underline"
            >
              Log in
            </button>{' '}
            to join the discussion.
          </p>
        }

        {/* Comments List */}
        {review.comments && review.comments.length > 0 && (
          <div className="space-y-5">
            {review.comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                user={user}
                onEdit={(c) => {
                  setEditingCommentId(c._id);
                  setEditCommentText(c.body);
                }}
                onDelete={handleDeleteComment}
                editingId={editingCommentId}
                editText={editCommentText}
                setEditText={setEditCommentText}
                onSaveEdit={saveEditComment}
                onCancelEdit={() => setEditingCommentId(null)}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
