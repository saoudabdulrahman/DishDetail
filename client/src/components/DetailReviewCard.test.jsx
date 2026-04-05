import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';
import { AuthContext } from '../auth/context';
import DetailReviewCard from './DetailReviewCard';

const toastError = vi.fn();
const toastSuccess = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    error: (...a) => toastError(...a),
    success: (...a) => toastSuccess(...a),
  },
}));

const baseReview = {
  _id: 'r1',
  title: 'Amazing',
  body: 'Great food',
  rating: 5,
  reviewer: 'alice',
  date: '2026-01-01T00:00:00.000Z',
  helpfulCount: 2,
  unhelpfulCount: 1,
  comments: [],
};

function renderCard({
  review = baseReview,
  user = { username: 'bob', role: 'critic' },
  onUpdate = vi.fn(),
  onDelete = vi.fn(),
} = {}) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          user,
          logout: vi.fn(),
          setAuthModal: vi.fn(),
          authModal: null,
        }}
      >
        <DetailReviewCard
          review={review}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('DetailReviewCard', () => {
  it('renders review content and discussion section', () => {
    renderCard();
    expect(screen.getByText('Amazing')).toBeInTheDocument();
    expect(screen.getByText('Great food')).toBeInTheDocument();
    expect(screen.getByText('Discussion')).toBeInTheDocument();
  });

  it('shows edit and delete controls only for the review owner', () => {
    renderCard({ user: { username: 'bob', role: 'critic' } });
    expect(screen.queryByLabelText('Edit review')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Delete review')).not.toBeInTheDocument();
  });

  it('owner can enter edit mode and save changes', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    renderCard({ user: { username: 'alice', role: 'critic' }, onUpdate });

    await user.click(screen.getByLabelText('Edit review'));

    const titleInput = screen.getByPlaceholderText('Review title');
    expect(titleInput).toHaveValue('Amazing');

    await user.clear(titleInput);
    await user.type(titleInput, 'Even Better');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onUpdate).toHaveBeenCalledWith(
      'r1',
      expect.objectContaining({ title: 'Even Better', isEdited: true }),
    );
  });

  it('cancel in edit mode restores original values', async () => {
    const user = userEvent.setup();
    renderCard({ user: { username: 'alice', role: 'critic' } });

    await user.click(screen.getByLabelText('Edit review'));
    const titleInput = screen.getByPlaceholderText('Review title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Changed Title');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText('Amazing')).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Review title'),
    ).not.toBeInTheDocument();
  });

  it('helpfulness vote calls onUpdate with correct counts', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    renderCard({ onUpdate });

    await user.click(screen.getByRole('button', { name: /Valuable/ }));

    expect(onUpdate).toHaveBeenCalledWith('r1', {
      helpfulCount: 3,
      unhelpfulCount: 1,
    });
  });

  it('toggling the same vote back removes it', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    renderCard({ onUpdate });

    const valuableBtn = screen.getByRole('button', { name: /Valuable/ });
    await user.click(valuableBtn); // vote helpful → count 3
    await user.click(valuableBtn); // un-vote → count 2

    expect(onUpdate).toHaveBeenLastCalledWith('r1', {
      helpfulCount: 2,
      unhelpfulCount: 1,
    });
  });

  it('blocks voting and shows error toast for unauthenticated user', async () => {
    const user = userEvent.setup();
    renderCard({ user: null });

    await user.click(screen.getByRole('button', { name: /Valuable/ }));

    expect(toastError).toHaveBeenCalled();
  });

  it('shows comment input for authenticated users', () => {
    renderCard();
    expect(
      screen.getByPlaceholderText('Join the discussion…'),
    ).toBeInTheDocument();
  });

  it('shows login prompt instead of comment input for unauthenticated users', () => {
    renderCard({ user: null });
    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Join the discussion…'),
    ).not.toBeInTheDocument();
  });

  it('posting a comment calls onUpdate with the new comment appended', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderCard({ user: { username: 'bob', role: 'critic' }, onUpdate });

    await user.type(
      screen.getByPlaceholderText('Join the discussion…'),
      'Nice review!',
    );
    await user.click(screen.getByRole('button', { name: 'Post' }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(
        'r1',
        expect.objectContaining({
          comments: expect.arrayContaining([
            expect.objectContaining({ author: 'bob', body: 'Nice review!' }),
          ]),
        }),
      );
    });
  });

  it('renders existing comments', () => {
    renderCard({
      review: {
        ...baseReview,
        comments: [
          {
            _id: 'c1',
            author: 'carol',
            body: 'Great review!',
            date: '2026-01-02T00:00:00.000Z',
          },
        ],
      },
    });
    expect(screen.getByText('Great review!')).toBeInTheDocument();
    expect(screen.getByText('carol')).toBeInTheDocument();
  });

  it('shows owner response when present', () => {
    renderCard({
      review: {
        ...baseReview,
        ownerResponse: {
          body: 'Thank you for visiting!',
          date: '2026-01-03T00:00:00.000Z',
        },
      },
    });
    expect(screen.getByText('Thank you for visiting!')).toBeInTheDocument();
    expect(screen.getByText('Response from Owner')).toBeInTheDocument();
  });

  it('shows "Respond to Review" button for establishment owner with no response yet', () => {
    renderCard({ user: { username: 'owner1', role: 'owner' } });
    expect(
      screen.getByRole('button', { name: 'Respond to Review' }),
    ).toBeInTheDocument();
  });
});
