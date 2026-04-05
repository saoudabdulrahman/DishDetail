import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import HomePage from './HomePage';
import { renderWithProviders } from '../test/render.jsx';

describe('HomePage', () => {
  it('renders hero and loads featured section', async () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/The Finest/)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Featured Restaurants')).toBeInTheDocument();
    });
  });
});
