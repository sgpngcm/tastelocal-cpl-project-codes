const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const escapeXml = (value = '') => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const createSvgDataUri = ({
  title,
  subtitle = '',
  palette = ['#EE7A1B', '#B94810'],
  badge = 'TasteLocal',
}) => {
  const [start, end] = palette;
  const safeTitle = escapeXml(title || 'TasteLocal');
  const safeSubtitle = escapeXml(subtitle || 'Singapore food experiences');
  const safeBadge = escapeXml(badge);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)" rx="36" />
      <circle cx="1060" cy="150" r="180" fill="rgba(255,255,255,0.08)" />
      <circle cx="130" cy="680" r="230" fill="rgba(255,255,255,0.08)" />
      <circle cx="910" cy="620" r="88" fill="rgba(255,255,255,0.12)" />
      <rect x="72" y="72" width="220" height="44" rx="22" fill="rgba(255,255,255,0.2)" />
      <text x="104" y="100" font-size="24" font-family="Arial, sans-serif" font-weight="700" fill="#ffffff">${safeBadge}</text>
      <text x="72" y="360" font-size="72" font-family="Georgia, serif" font-weight="700" fill="#ffffff">${safeTitle}</text>
      <text x="72" y="430" font-size="30" font-family="Arial, sans-serif" fill="rgba(255,255,255,0.88)">${safeSubtitle}</text>
      <path d="M72 500 C 220 560, 340 540, 500 600" stroke="rgba(255,255,255,0.18)" stroke-width="12" fill="none" stroke-linecap="round"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const splitUrl = (url = '') => {
  const [pathPart, queryPart = ''] = String(url).split('?');
  return {
    path: pathPart,
    query: queryPart ? `?${queryPart}` : '',
  };
};

const replaceExt = (path, newExt) => {
  if (!path) return path;
  return path.replace(/\.(png|jpe?g|webp|avif)$/i, newExt);
};

export const resolveMediaUrl = (source) => {
  if (!source) return '';
  if (/^(https?:)?\/\//.test(source) || source.startsWith('data:') || source.startsWith('blob:')) {
    return source;
  }
  const normalized = source.startsWith('/') ? source : `/${source}`;
  return API_BASE ? `${API_BASE}${normalized}` : normalized;
};

export const buildOptimizedImageCandidates = (source) => {
  if (!source) return [];

  if (/^(https?:)?\/\//.test(source) || source.startsWith('data:') || source.startsWith('blob:')) {
    return [source];
  }

  const { path, query } = splitUrl(source);

  if (!/\.(png|jpe?g|webp|avif)$/i.test(path)) {
    return [resolveMediaUrl(source)];
  }

  const avif = `${replaceExt(path, '.avif')}${query}`;
  const webp = `${replaceExt(path, '.webp')}${query}`;
  const original = `${path}${query}`;

  return Array.from(
    new Set([avif, webp, original].map((item) => resolveMediaUrl(item)))
  );
};

export const resolveOptimizedMediaUrl = (source) => {
  const candidates = buildOptimizedImageCandidates(source);
  return candidates[0] || '';
};

export const getAvatarPlaceholder = (name = 'TasteLocal User') => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'TL';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="avatar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#EE7A1B" />
          <stop offset="100%" stop-color="#16A34A" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="100" fill="url(#avatar)" />
      <circle cx="100" cy="76" r="34" fill="rgba(255,255,255,0.18)" />
      <text x="100" y="122" text-anchor="middle" font-size="58" font-family="Arial, sans-serif" font-weight="700" fill="#ffffff">${escapeXml(initials)}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const getExperienceFallback = (experience = {}) =>
  createSvgDataUri({
    title: experience.title || 'Food Experience',
    subtitle: `${experience.vendor_name || 'TasteLocal'} • ${experience.category_display || 'Singapore'}`,
    badge: 'Curated Experience',
    palette: ['#EE7A1B', '#933A15'],
  });

export const getVendorFallback = (vendor = {}) =>
  createSvgDataUri({
    title: vendor.business_name || 'Local Vendor',
    subtitle: vendor.cuisine_type_display || 'Singapore culinary host',
    badge: 'Trusted Vendor',
    palette: ['#16A34A', '#14532D'],
  });

export const getBlogFallback = (post = {}) =>
  createSvgDataUri({
    title: post.title || 'TasteLocal Stories',
    subtitle: post.category?.name || 'Guides, culture, and local tips',
    badge: 'TasteLocal Journal',
    palette: ['#B94810', '#773114'],
  });

export const getImageSources = (source) => {
  const candidates = buildOptimizedImageCandidates(source);
  return {
    avif: candidates.find((item) => item.toLowerCase().includes('.avif')) || '',
    webp: candidates.find((item) => item.toLowerCase().includes('.webp')) || '',
    fallback: candidates[candidates.length - 1] || '',
  };
};