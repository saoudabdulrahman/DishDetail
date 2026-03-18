import { Star } from 'lucide-react';
import './StarRating.css';

export default function StarRating({ rating }: { rating: number }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={i < rating ? 'star-filled' : 'star-empty'} />
      ))}
    </span>
  );
}
