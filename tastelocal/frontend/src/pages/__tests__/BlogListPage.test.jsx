import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import BlogListPage from '../BlogListPage';

vi.mock('../../utils/api', () => ({
  blogAPI: {
    categories: vi.fn(),
    list: vi.fn(),
  },
}));

vi.mock('../../utils/media', () => ({
  getBlogFallback: () => 'data:image/svg+xml,test',
  resolveMediaUrl: (value) => value || '',
}));

const { blogAPI } = await import('../../utils/api');

describe('BlogListPage', () => {
  it('renders posts and handles paginated categories', async () => {
    blogAPI.categories.mockResolvedValue({
      data: {
        count: 2,
        results: [
          { id: 1, name: 'Guides', slug: 'guides' },
          { id: 2, name: 'Culture', slug: 'culture' },
        ],
      },
    });
    blogAPI.list.mockResolvedValue({
      data: {
        count: 1,
        results: [
          {
            id: 1,
            slug: 'tiang-bahru-breakfast',
            title: 'Tiong Bahru breakfast guide',
            excerpt: 'A practical guide to local breakfast favourites.',
            cover_image: '',
            created_at: '2026-03-01T00:00:00Z',
            views_count: 12,
            category: { name: 'Guides', slug: 'guides' },
          },
        ],
      },
    });

    render(
      <MemoryRouter>
        <BlogListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tiong Bahru breakfast guide')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Guides' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Culture' })).toBeInTheDocument();
  });
});
