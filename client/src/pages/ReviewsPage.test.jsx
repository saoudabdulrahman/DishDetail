import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test/render.jsx';
import ReviewsPage from './ReviewsPage';

describe('ReviewsPage', () => {
  it('shows no reviews state when list is empty', async () => {
    renderWithProviders(<ReviewsPage />);
    await waitFor(() => {
      expect(screen.getByText('No reviews found.')).toBeInTheDocument();
    });
  });
});
