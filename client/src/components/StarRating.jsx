import { useMemo, useState } from 'react';
import { Star, StarHalf } from 'lucide-react';

export default function StarRating({
  rating = 0,
  interactive = false,
  onChange,
  className = '',
  starClassName = 'h-3 w-3',
}) {
  const [hover, setHover] = useState(0);
  const normalizedRating = useMemo(
    () => Math.max(0, Math.min(5, Number(rating) || 0)),
    [rating],
  );

  if (interactive) {
    const activeRating = hover || normalizedRating;

    return (
      <div
        className={`text-primary font-ui inline-flex items-center gap-2 ${className}`.trim()}
        onMouseLeave={() => setHover(0)}
        role="radiogroup"
        aria-label="Select a rating from 1 to 5 stars"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="cursor-pointer transition-transform duration-150 hover:scale-110"
            onClick={() => onChange?.(star)}
            onMouseEnter={() => setHover(star)}
            role="radio"
            aria-checked={star === normalizedRating}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={starClassName}
              fill={star <= activeRating ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>
    );
  }

  const fullStars = Math.floor(normalizedRating);
  const hasHalf = normalizedRating - fullStars >= 0.5;

  return (
    <span
      className={`text-primary font-ui relative inline-flex items-center gap-0.5 ${className}`.trim()}
      aria-label={`${normalizedRating} out of 5 stars`}
    >
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={starClassName}
          strokeWidth={0}
          fill="currentColor"
          style={{ opacity: 0.2 }}
        />
      ))}
      <span className="absolute inset-0 flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={i}
            className={starClassName}
            strokeWidth={0}
            fill="currentColor"
          />
        ))}
        {hasHalf && (
          <StarHalf
            className={starClassName}
            strokeWidth={0}
            fill="currentColor"
          />
        )}
      </span>
    </span>
  );
}
