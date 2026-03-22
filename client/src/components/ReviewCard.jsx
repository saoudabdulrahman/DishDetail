import { useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
} from 'lucide-react';
import StarRating from './StarRating';
import { formatDate } from '../utils/date';

// variant: 'feature' (large left card) | 'stack' (horizontal right cards) | 'feed' (main review feed)
export default function ReviewCard({ review, restaurant, variant = 'stack' }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  if (variant === 'feature') {
    return (
      <Link
        to={`/establishments/${restaurant.slug}#${review._id}`}
        className="group relative col-span-12 block h-125 overflow-hidden rounded-sm lg:col-span-7"
      >
        {review.reviewImage ?
          <img
            src={review.reviewImage}
            alt={`Food or ambiance from ${restaurant.restaurantName}`}
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
          />
        : <div className="bg-surface-container-high h-full w-full" />}

        <div className="from-surface-container-lowest absolute inset-0 bg-linear-to-t to-transparent opacity-90" />

        <div className="absolute bottom-0 left-0 p-10">
          <div className="mb-4 flex items-center space-x-2">
            <span className="bg-primary text-on-primary rounded-xl px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
              {restaurant.cuisineType ?? 'Featured'}
            </span>
            <span className="text-primary flex items-center text-sm font-bold">
              <Star size={12} fill="currentColor" className="text-sm" />
              {Number(review.rating).toFixed(1)}
            </span>
          </div>

          <h3 className="font-headline text-on-surface mb-4 text-5xl font-black tracking-tight">
            {restaurant.restaurantName}
          </h3>

          <p className="font-body text-on-surface-variant mb-2 max-w-md">
            {review.title || 'Untitled Review'}
          </p>
          <p className="font-body text-on-surface-variant mb-6 max-w-md text-sm opacity-75">
            {review.reviewer} · {formatDate(review.date)}
          </p>

          <div className="text-primary flex items-center space-x-2 font-bold">
            <span>Read Review</span>
            <ArrowRight className="transition-transform group-hover:translate-x-2" />
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'feed') {
    const href = `/establishments/${restaurant.slug}#${review._id}`;

    return (
      <Link
        to={href}
        className="bg-surface-container-high group block overflow-hidden rounded-sm"
      >
        <div className="flex flex-col md:flex-row">
          {review.reviewImage && (
            <div className="relative h-56 shrink-0 overflow-hidden md:h-auto md:min-h-72 md:w-64">
              <img
                src={review.reviewImage}
                alt={`Food or ambiance from ${restaurant.restaurantName}`}
                className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImgLoaded(true)}
              />
            </div>
          )}

          <div
            className={`flex flex-col justify-between p-8 ${review.reviewImage ? 'md:flex-1' : 'w-full'}`}
          >
            <div>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-headline text-on-surface text-2xl font-bold">
                    {restaurant.restaurantName}
                  </h3>
                  <p className="text-primary text-sm font-bold tracking-tighter uppercase">
                    {restaurant.cuisine}
                  </p>
                </div>
                <div className="bg-surface-container-lowest text-primary flex shrink-0 items-center space-x-1 rounded-xl px-3 py-1 font-bold">
                  <Star size={14} fill="currentColor" />
                  <span>{Number(review.rating).toFixed(1)}</span>
                </div>
              </div>

              {review.body && (
                <p className="font-body text-on-surface-variant mb-6 leading-relaxed">
                  &quot;{review.body.slice(0, 200)}&quot;
                  {review.body.length > 200 ? '…' : ''}
                </p>
              )}
            </div>

            <div className="border-outline-variant/10 flex items-center justify-between border-t pt-6">
              {/* Reviewer info — navigates via the parent Link, no extra wrapper needed */}
              <div className="flex items-center space-x-3">
                {review.reviewerAvatar ?
                  <img
                    src={review.reviewerAvatar}
                    alt={review.reviewer}
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                : <div className="bg-surface-bright text-primary flex h-10 w-10 items-center justify-center rounded-xl font-bold">
                    {review.reviewer?.slice(0, 2).toUpperCase()}
                  </div>
                }
                <div>
                  <p className="text-sm font-bold">{review.reviewer}</p>
                  <p className="text-on-surface-variant text-[10px] tracking-widest uppercase">
                    {formatDate(review.date)}
                  </p>
                </div>
              </div>

              {/* Action buttons — stop propagation so they don't double-navigate */}
              <div
                className="flex items-center space-x-6"
                onClick={(e) => e.preventDefault()}
              >
                <Link
                  to={href}
                  className="group/btn flex items-center space-x-2 transition-transform active:scale-90"
                >
                  <ThumbsUp
                    className="text-on-surface-variant group-hover/btn:text-primary transition-colors"
                    size={20}
                  />
                  <span className="text-on-surface-variant group-hover/btn:text-on-surface text-xs font-bold">
                    {review.helpfulCount ?? 0}
                  </span>
                </Link>
                <Link
                  to={href}
                  className="group/btn flex items-center space-x-2 transition-transform active:scale-90"
                >
                  <ThumbsDown
                    className="text-on-surface-variant group-hover/btn:text-primary transition-colors"
                    size={20}
                  />
                </Link>
                <Link
                  to={href}
                  className="group/btn flex items-center space-x-2 transition-transform active:scale-90"
                >
                  <MessageCircle
                    className="text-on-surface-variant group-hover/btn:text-primary transition-colors"
                    size={20}
                  />
                  <span className="text-on-surface-variant group-hover/btn:text-on-surface text-xs font-bold">
                    {review.comments?.length ?? 0}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // variant === 'stack'
  return (
    <Link
      to={`/establishments/${restaurant.slug}#${review._id}`}
      className="bg-surface-container-high group flex flex-1 overflow-hidden rounded-sm"
    >
      {review.reviewImage && (
        <div className="relative w-2/5 shrink-0">
          <img
            src={review.reviewImage}
            alt={`Food or ambiance from ${restaurant.restaurantName}`}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-center p-6">
        <span className="text-primary font-label mb-1 text-[10px] font-bold tracking-widest uppercase">
          {restaurant.cuisineType ?? restaurant.restaurantName}
        </span>

        <h4 className="font-headline mb-2 text-2xl font-bold">
          {review.title || 'Untitled Review'}
        </h4>

        <div className="text-primary mb-1">
          <StarRating rating={review.rating} />
        </div>

        <p className="text-on-surface-variant mb-4 text-xs">
          {review.reviewer} · {formatDate(review.date)}
        </p>

        <span className="text-on-surface-variant hover:text-primary text-xs font-bold uppercase transition-colors">
          Read Review →
        </span>
      </div>
    </Link>
  );
}
