import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse, server } from '../test/server';
import { renderWithProviders } from '../test/render.jsx';
import EstablishmentsPage from './EstablishmentsPage';

describe('EstablishmentsPage', () => {
  it('shows empty state on successful fetch with no establishments', async () => {
    renderWithProviders(<EstablishmentsPage />);
    await waitFor(() => {
      expect(screen.getByText('No establishments found.')).toBeInTheDocument();
    });
  });

  it('shows error state when request fails', async () => {
    server.use(
      http.get('/api/establishments', () =>
        HttpResponse.json({ error: 'Failed' }, { status: 500 }),
      ),
    );

    renderWithProviders(<EstablishmentsPage />);
    await waitFor(() => {
      expect(
        screen.getByText('Failed to load establishments.'),
      ).toBeInTheDocument();
    });
  });
});
