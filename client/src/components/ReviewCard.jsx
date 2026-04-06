import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/useAuth';
import { api } from '../api';
import StarRating from './StarRating';
import { formatDate } from '../utils/date';
import { cn } from '../utils/cn';

const optimizeCloudinaryUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  if (url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  }
  return url;
};

export default function ReviewCard({ review, restaurant, variant = 'stack' }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [unhelpfulCount, setUnhelpfulCount] = useState(
    review.unhelpfulCount || 0,
  );
  const [userVote, setUserVote] = useState(null);

  const handleVote = async (e, type) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('You must be logged in to vote on reviews.');
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

    try {
      await api().updateReview(review._id, {
        helpfulCount: newHelpful,
        unhelpfulCount: newUnhelpful,
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to update vote.');
    }
  };

  const handleCommentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/establishments/${restaurant.slug}#comments-${review._id}`);
  };

  // Feature card
  if (variant === 'feature') {
    return (
      <Link
        to={`/establishments/${restaurant.slug}#${review._id}`}
        className="group relative col-span-12 block h-125 overflow-hidden rounded-sm lg:col-span-7"
      >
        {review.reviewImage ?
          <img
            src={optimizeCloudinaryUrl(review.reviewImage)}
            alt={`Food or ambiance from ${restaurant.restaurantName}`}
            className={cn(
              'h-full w-full object-cover transition-transform duration-700 group-hover:scale-110',
              imgLoaded ? 'opacity-100' : 'opacity-0',
            )}
            onLoad={() => setImgLoaded(true)}
          />
        : <div className="bg-surface-container-high h-full w-full" />}
        <div className="from-surface-container-lowest absolute inset-0 bg-linear-to-t to-transparent opacity-90" />
        <div className="absolute bottom-0 left-0 p-10">
          <div className="mb-4 flex items-center space-x-2">
            <div className="flex flex-wrap gap-1">
              {(restaurant.cuisine ?? []).map((c) => (
                <span
                  key={c}
                  className="bg-primary text-on-primary font-ui rounded-xl px-3 py-1 text-[10px] font-bold tracking-widest uppercase"
                >
                  {c}
                </span>
              ))}
            </div>
            <span className="text-primary font-ui flex items-center text-sm font-bold">
              <StarRating rating={Number(review.rating)} />
            </span>
          </div>

          <h3 className="font-headline text-on-surface text-fluid-5xl mb-4 font-black tracking-tight">
            {restaurant.restaurantName}
          </h3>

          <p className="font-body text-on-surface-variant mb-2 max-w-md">
            {review.title || 'Untitled Review'}
          </p>
          <p className="font-body text-on-surface-variant mb-6 max-w-md text-sm opacity-75">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                navigate(`/profile/${review.reviewer}`);
              }}
              className="hover:text-primary font-inherit cursor-pointer border-none bg-transparent p-0 text-inherit transition-colors"
            >
              {review.reviewer}
            </button>{' '}
            · {formatDate(review.date)}
          </p>

          <div className="text-primary font-ui flex items-center space-x-2 font-bold">
            <span className="font-ui">Read Review</span>
            <ArrowRight className="transition-transform group-hover:translate-x-2" />
          </div>
        </div>
      </Link>
    );
  }

  // Feed card
  if (variant === 'feed') {
    const href = `/establishments/${restaurant.slug}#${review._id}`;

    return (
      <Link
        to={href}
        className="bg-surface-container-high group font-ui relative block overflow-hidden rounded-sm"
      >
        <div className="flex flex-col md:flex-row">
          {review.reviewImage && (
            <div className="relative aspect-video shrink-0 overflow-hidden md:aspect-auto md:h-auto md:min-h-72 md:w-64">
              <img
                src={optimizeCloudinaryUrl(review.reviewImage)}
                alt={`Food or ambiance from ${restaurant.restaurantName}`}
                className={cn(
                  'absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
                  imgLoaded ? 'opacity-100' : 'opacity-0',
                )}
                onLoad={() => setImgLoaded(true)}
              />
            </div>
          )}

          <div
            className={cn(
              'flex flex-col justify-between p-6 sm:p-8',
              review.reviewImage ? 'md:flex-1' : 'w-full',
            )}
          >
            <div>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-headline text-on-surface text-fluid-2xl font-bold">
                    {restaurant.restaurantName}
                  </h3>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {(restaurant.cuisine ?? []).map((c) => (
                      <span
                        key={c}
                        className="font-ui text-primary text-[10px] font-bold tracking-widest uppercase"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-surface-container-lowest text-primary flex shrink-0 items-center space-x-2 rounded-xl px-4 py-2 font-bold">
                  <StarRating rating={Number(review.rating)} />
                </div>
              </div>

              {review.body && (
                <p className="font-body text-on-surface-variant mb-6 leading-relaxed">
                  &quot;{review.body.slice(0, 200)}
                  {review.body.length > 200 ? '…' : ''}&quot;
                </p>
              )}
            </div>

            <div className="border-outline-variant/10 flex items-center justify-between border-t pt-6">
              <button
                type="button"
                className="hover:bg-surface-container-highest -ml-1 flex cursor-pointer items-center space-x-3 rounded-xl border-none bg-transparent p-1 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/profile/${review.reviewer}`);
                }}
              >
                <div className="bg-surface-bright text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold">
                  {review.reviewer?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-ui text-sm font-bold">{review.reviewer}</p>
                  <p className="text-on-surface-variant font-ui text-[10px] tracking-widest uppercase">
                    {formatDate(review.date)}
                  </p>
                </div>
              </button>

              {/* Prevent clicks on actions from triggering the parent link. */}
              <div
                role="presentation"
                className="flex items-center gap-3 sm:gap-6"
                onClick={(e) => e.preventDefault()}
              >
                <button
                  type="button"
                  className="group/btn flex cursor-pointer items-center space-x-2 border-none bg-transparent p-0 transition-transform active:scale-90"
                  onClick={(e) => handleVote(e, 'helpful')}
                >
                  <ThumbsUp
                    className={cn(
                      'transition-colors',
                      userVote === 'helpful' ? 'text-primary' : (
                        'text-on-surface-variant group-hover/btn:text-primary'
                      ),
                    )}
                    size={20}
                  />
                  {(helpfulCount || 0) > 0 && (
                    <span
                      className={cn(
                        'font-ui text-xs font-bold',
                        userVote === 'helpful' ? 'text-primary' : (
                          'text-on-surface-variant group-hover/btn:text-on-surface'
                        ),
                      )}
                    >
                      {helpfulCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className="group/btn flex cursor-pointer items-center space-x-2 border-none bg-transparent p-0 transition-transform active:scale-90"
                  onClick={(e) => handleVote(e, 'unhelpful')}
                >
                  <ThumbsDown
                    className={cn(
                      'transition-colors',
                      userVote === 'unhelpful' ? 'text-primary' : (
                        'text-on-surface-variant group-hover/btn:text-primary'
                      ),
                    )}
                    size={20}
                  />
                  {(unhelpfulCount || 0) > 0 && (
                    <span
                      className={cn(
                        'font-ui text-xs font-bold',
                        userVote === 'unhelpful' ? 'text-primary' : (
                          'text-on-surface-variant group-hover/btn:text-on-surface'
                        ),
                      )}
                    >
                      {unhelpfulCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className="group/btn flex cursor-pointer items-center space-x-2 border-none bg-transparent p-0 transition-transform active:scale-90"
                  onClick={handleCommentClick}
                >
                  <MessageCircle
                    className="text-on-surface-variant group-hover/btn:text-primary transition-colors"
                    size={20}
                  />
                  {(review.comments?.length || 0) > 0 && (
                    <span className="text-on-surface-variant group-hover/btn:text-on-surface font-ui text-xs font-bold">
                      {review.comments.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Stack card
  return (
    <Link
      to={`/establishments/${restaurant.slug}#${review._id}`}
      className="bg-surface-container-high group font-ui flex flex-1 overflow-hidden rounded-sm"
    >
      {review.reviewImage && (
        <div className="relative w-2/5 shrink-0">
          <img
            src={optimizeCloudinaryUrl(review.reviewImage)}
            alt={`Food or ambiance from ${restaurant.restaurantName}`}
            className={cn(
              'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
              imgLoaded ? 'opacity-100' : 'opacity-0',
            )}
            onLoad={() => setImgLoaded(true)}
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-center p-6">
        <div className="mb-1 flex flex-wrap gap-1">
          {(restaurant.cuisine ?? []).map((c) => (
            <span
              key={c}
              className="text-primary font-label text-[10px] font-bold tracking-widest uppercase"
            >
              {c}
            </span>
          ))}
        </div>

        <h4 className="font-headline text-fluid-2xl mb-2 font-bold">
          {review.title || 'Untitled Review'}
        </h4>

        <div className="text-primary mb-1">
          <StarRating rating={review.rating} />
        </div>

        <p className="text-on-surface-variant font-ui mb-4 text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/profile/${review.reviewer}`);
            }}
            className="hover:text-primary font-inherit cursor-pointer border-none bg-transparent p-0 text-inherit transition-colors"
          >
            {review.reviewer}
          </button>{' '}
          · {formatDate(review.date)}
        </p>

        <span className="text-on-surface-variant hover:text-primary font-ui text-xs font-bold uppercase transition-colors">
          Read Review →
        </span>
      </div>
    </Link>
  );
}
