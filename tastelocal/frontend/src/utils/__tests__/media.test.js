import { describe, expect, it, vi } from 'vitest';

vi.stubGlobal('importMeta', { env: { VITE_API_URL: 'http://localhost:8000' } });

import {
  resolveMediaUrl,
  getAvatarPlaceholder,
  getExperienceFallback,
  getVendorFallback,
  getBlogFallback,
} from '../media';

describe('media helpers', () => {
  it('returns external URLs unchanged', () => {
    expect(resolveMediaUrl('https://cdn.example.com/file.jpg')).toBe('https://cdn.example.com/file.jpg');
  });

  it('normalizes relative media URLs', () => {
    expect(resolveMediaUrl('media/vendors/cover.jpg')).toBe('/media/vendors/cover.jpg');
  });

  it('creates avatar placeholder data uri', () => {
    expect(getAvatarPlaceholder('Jimmy Ng')).toContain('data:image/svg+xml');
  });

  it('creates visual fallbacks for experiences, vendors, and blog posts', () => {
    expect(getExperienceFallback({ title: 'Night Food Tour' })).toContain('data:image/svg+xml');
    expect(getVendorFallback({ business_name: 'Satay House' })).toContain('data:image/svg+xml');
    expect(getBlogFallback({ title: 'Where to eat in Tiong Bahru' })).toContain('data:image/svg+xml');
  });
});
