import { describe, expect, it, vi } from 'vitest';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubmitReviewPage from './SubmitReviewPage';
import { AuthContext } from '../auth/context';
import { server, http, HttpResponse } from '../test/server';
import { createTestQueryClient } from '../test/render';

const navigateMock = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ state: null }),
  };
});

describe('SubmitReviewPage', () => {
  it('shows validation when no restaurant is selected', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('/api/establishments', () =>
        HttpResponse.json({
          establishments: [
            { _id: 'e1', slug: 'test-bistro', restaurantName: 'Test Bistro' },
          ],
        }),
      ),
    );

    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <AuthContext.Provider
          value={{ user: { username: 'alice' }, setAuthModal: vi.fn() }}
        >
          <SubmitReviewPage />
        </AuthContext.Provider>
      </QueryClientProvider>,
    );

    await user.type(
      screen.getByPlaceholderText('Search for a restaurant to review…'),
      'Test',
    );
    await user.click(screen.getByText('Test Bistro'));
    await user.click(screen.getByRole('button', { name: 'Submit Review' }));
    expect(
      screen.getByText('Please select a star rating.'),
    ).toBeInTheDocument();
  });
});
