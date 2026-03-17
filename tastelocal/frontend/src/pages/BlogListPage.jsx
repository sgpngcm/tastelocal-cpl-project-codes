import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiEye } from 'react-icons/fi';
import { blogAPI } from '../utils/api';
import { LoadingSpinner } from '../components/UI';
import { getBlogFallback, resolveMediaUrl } from '../utils/media';

export default function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogAPI.categories()
      .then((response) => {
        const payload = response?.data;
        setCategories(Array.isArray(payload) ? payload : payload?.results || []);
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = activeCategory ? { 'category__slug': activeCategory } : {};

    blogAPI.list(params)
      .then((response) => {
        const payload = response?.data;
        setPosts(Array.isArray(payload) ? payload : payload?.results || []);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="page-container">
      <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-warm-200/60 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-500">Stories</p>
        <h1 className="section-title mt-2">A more magazine-like editorial surface</h1>
        <p className="mt-3 max-w-3xl text-gray-500">
          Blog cards now benefit from the same richer visual fallback system as experiences and vendors,
          making seed content feel complete even before real photography is uploaded.
        </p>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory('')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              !activeCategory
                ? 'bg-primary-500 text-white'
                : 'bg-warm-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              onClick={() => setActiveCategory(category.slug)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCategory === category.slug
                  ? 'bg-primary-500 text-white'
                  : 'bg-warm-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <LoadingSpinner />
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-md shadow-warm-200/50 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={resolveMediaUrl(post.cover_image) || getBlogFallback(post)}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute inset-x-5 bottom-5 text-white">
                    {post.category && (
                      <span className="badge bg-white/15 text-white backdrop-blur">{post.category.name}</span>
                    )}
                    <h3 className="mt-3 font-display text-2xl font-semibold leading-tight line-clamp-2">
                      {post.title}
                    </h3>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <p className="text-sm leading-7 text-gray-600 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <FiCalendar /> {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FiEye /> {post.views_count} views
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] bg-white p-10 text-center shadow-md shadow-warm-200/50">
            <h2 className="font-display text-2xl font-semibold text-gray-900">No blog posts yet</h2>
            <p className="mt-2 text-gray-500">Published stories will appear here once seed data or admin content is available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
