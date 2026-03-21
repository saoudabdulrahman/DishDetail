import { Star } from 'lucide-react';

export default function StarRating({ rating }) {
  return (
    <span
      className="text-primary flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className="h-3 w-3"
          fill={i < rating ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  );
}
