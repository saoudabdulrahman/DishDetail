import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test/render.jsx';
import EstablishmentPage from './EstablishmentPage';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: () => ({ slug: 'test-bistro' }),
    useNavigate: () => vi.fn(),
  };
});

describe('EstablishmentPage', () => {
  it('renders establishment details from API response', async () => {
    renderWithProviders(<EstablishmentPage />);
    await waitFor(() => {
      expect(screen.getByText('Test Bistro')).toBeInTheDocument();
    });
  });
});
