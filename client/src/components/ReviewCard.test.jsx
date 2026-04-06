import { describe, expect, it, vi } from 'vitest';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import ReviewCard from './ReviewCard';
import { AuthContext } from '../auth/context';
import { createTestQueryClient } from '../test/render';

vi.mock('../api', () => ({
  api: () => ({
    updateReview: vi.fn().mockResolvedValue({}),
  }),
}));

const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: { error: (...a) => toastError(...a) },
}));

const baseReview = {
  _id: 'r1',
  title: 'Amazing',
  body: 'Great food',
  rating: 5,
  reviewer: 'alice',
  date: '2026-01-01T00:00:00.000Z',
  helpfulCount: 1,
  unhelpfulCount: 0,
  comments: [],
};

const restaurant = {
  _id: 'e1',
  slug: 'test-bistro',
  restaurantName: 'Test Bistro',
  cuisine: ['French'],
};

function renderCard({
  review = baseReview,
  rest = restaurant,
  variant = 'feed',
  user = null,
} = {}) {
  const testQueryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            user,
            logout: vi.fn(),
            setAuthModal: vi.fn(),
            authModal: null,
          }}
        >
          <ReviewCard review={review} restaurant={rest} variant={variant} />
        </AuthContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ReviewCard', () => {
  it('renders feed variant content', () => {
    renderCard();
    expect(screen.getByText('Test Bistro')).toBeInTheDocument();
    expect(screen.getByText('"Great food"')).toBeInTheDocument();
  });

  it('renders stack variant content', () => {
    renderCard({ variant: 'stack' });
    expect(screen.getByText('Amazing')).toBeInTheDocument();
    expect(screen.getByText('Read Review →')).toBeInTheDocument();
  });

  it('renders feature variant content', () => {
    renderCard({ variant: 'feature' });
    expect(screen.getByText('Test Bistro')).toBeInTheDocument();
    expect(screen.getByText('Read Review')).toBeInTheDocument();
  });

  it('helpful vote updates count optimistically', async () => {
    renderCard({ user: { username: 'bob' } });

    expect(screen.getByText('1')).toBeInTheDocument();

    const voteDivs = document.querySelectorAll(
      '.cursor-pointer.flex.items-center.space-x-2',
    );
    await userEvent.click(voteDivs[0]);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('blocks vote and shows toast error for unauthenticated user', async () => {
    renderCard({ user: null });

    const voteDivs = document.querySelectorAll(
      '.cursor-pointer.flex.items-center.space-x-2',
    );
    await userEvent.click(voteDivs[0]);

    expect(toastError).toHaveBeenCalled();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays comment count when comments exist', () => {
    renderCard({
      review: { ...baseReview, comments: [{ _id: 'c1' }, { _id: 'c2' }] },
    });
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('truncates long review body with ellipsis', () => {
    const longBody = 'A'.repeat(250);
    renderCard({ review: { ...baseReview, body: longBody } });

    const expected = `"${'A'.repeat(200)}\u2026"`;
    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
