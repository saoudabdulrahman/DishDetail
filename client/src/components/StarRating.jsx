import { Star, StarHalf } from 'lucide-react';

export default function StarRating({ rating }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <span
      className="text-primary font-ui relative inline-flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {/* Base layer: 5 empty stars */}
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className="h-3 w-3"
          strokeWidth={0}
          fill="currentColor"
          style={{ opacity: 0.2 }}
        />
      ))}
      {/* Overlay layer: filled + half stars, absolutely positioned */}
      <span className="absolute inset-0 flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={i}
            className="h-3 w-3"
            strokeWidth={0}
            fill="currentColor"
          />
        ))}
        {hasHalf && (
          <StarHalf className="h-3 w-3" strokeWidth={0} fill="currentColor" />
        )}
      </span>
    </span>
  );
}
