import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import AuthProvider from '../auth/AuthProvider';

export function renderWithProviders(
  ui,
  { route = '/', initialEntries = [route] } = {},
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}
