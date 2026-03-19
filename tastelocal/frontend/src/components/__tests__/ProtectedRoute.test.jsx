import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import ProtectedRoute from '../ProtectedRoute';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const { useAuth } = await import('../../context/AuthContext');

function renderWithRouter(element) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/protected" element={element} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('shows loading state while auth is loading', () => {
    useAuth.mockReturnValue({ loading: true, isAuthenticated: false, user: null });
    renderWithRouter(
      <ProtectedRoute>
        <div>Secret Area</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    useAuth.mockReturnValue({ loading: false, isAuthenticated: false, user: null });
    renderWithRouter(
      <ProtectedRoute>
        <div>Secret Area</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children for authorized users', () => {
    useAuth.mockReturnValue({
      loading: false,
      isAuthenticated: true,
      user: { role: 'tourist', is_superuser: false },
    });
    renderWithRouter(
      <ProtectedRoute roles={['tourist']}>
        <div>Secret Area</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Secret Area')).toBeInTheDocument();
  });
});
