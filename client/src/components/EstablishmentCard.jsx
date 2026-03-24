import { useState } from 'react';
import { Link } from 'react-router';
import StarRating from './StarRating';
import { cn } from '../utils/cn';

export default function EstablishmentCard({ restaurant }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      to={`/establishments/${restaurant.slug}`}
      className="bg-surface-container-high group relative block overflow-hidden rounded-sm"
    >
      {Number(restaurant.rating) >= 4.7 && (
        <div className="bg-primary text-on-primary font-ui absolute top-4 left-4 z-10 rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase shadow-md">
          Top Rated
        </div>
      )}
      <article className="flex flex-col sm:flex-row">
        {/* Image — fixed width column like feed ReviewCard */}
        {restaurant.restaurantImage && (
          <div className="relative h-48 shrink-0 overflow-hidden sm:h-auto sm:min-h-56 sm:w-48">
            <img
              src={restaurant.restaurantImage}
              alt={`Food or ambiance from ${restaurant.restaurantName}`}
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
                imgLoaded ? 'opacity-100' : 'opacity-0',
              )}
              onLoad={() => setImgLoaded(true)}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-6">
          <div>
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-headline text-on-surface text-xl leading-tight font-bold">
                  {restaurant.restaurantName}
                </h3>
                <p className="text-primary font-ui mt-0.5 text-xs font-bold tracking-widest uppercase">
                  {restaurant.cuisine}
                </p>
                {restaurant.address && (
                  <p className="text-on-surface-variant font-ui mt-1 text-xs">
                    {restaurant.address}
                  </p>
                )}
              </div>
              <div className="bg-surface-container-lowest text-primary flex shrink-0 items-center space-x-2 rounded-xl px-4 py-2">
                <StarRating rating={Number(restaurant.rating ?? 0)} />
              </div>
            </div>

            {restaurant.description && (
              <p className="font-body text-on-surface-variant line-clamp-2 text-sm leading-relaxed">
                {restaurant.description}
              </p>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
