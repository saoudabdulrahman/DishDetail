import { Link } from 'react-router';
import { UtensilsCrossed } from 'lucide-react';
import { usePageTitle } from '../utils/usePageTitle.js';

export default function NotFoundPage() {
  usePageTitle('Page Not Found');
  return (
    <main className="px-fluid-container flex min-h-[60vh] items-center justify-center py-20 text-center">
      <div className="flex max-w-md flex-col items-center">
        <UtensilsCrossed
          size={72}
          strokeWidth={1.5}
          className="text-primary mb-6 opacity-60"
        />
        <h1 className="font-headline text-on-surface text-fluid-8xl mb-2 font-black tracking-tighter">
          404
        </h1>
        <h2 className="font-headline text-on-surface text-fluid-2xl mb-3 font-bold">
          Looks like this page is off the menu!
        </h2>
        <p className="font-body text-on-surface-variant mb-8 leading-relaxed">
          The restaurant, review, or page you&apos;re looking for doesn&apos;t
          exist or might have been moved.
        </p>
        <Link
          to="/"
          className="gold-gradient text-on-secondary font-ui rounded-xl px-8 py-3 font-bold shadow-lg transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95"
        >
          Return to Home
        </Link>
      </div>
    </main>
  );
}
