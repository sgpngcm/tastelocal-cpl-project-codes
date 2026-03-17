import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiEye } from 'react-icons/fi';
import { blogAPI } from '../utils/api';
import { LoadingSpinner } from '../components/UI';
import { getBlogFallback, resolveMediaUrl } from '../utils/media';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogAPI.detail(slug).then((response) => setPost(response.data)).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  if (!post) return <div className="page-container py-20 text-center"><h2>Post not found</h2></div>;

  return (
    <div className="page-container max-w-4xl">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"><FiArrowLeft /> Back to blog</Link>
      <div className="mt-4 overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-warm-200/60">
        <img src={resolveMediaUrl(post.cover_image) || getBlogFallback(post)} alt={post.title} className="aspect-[16/7] w-full object-cover" />
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            {post.category && <span className="badge bg-primary-50 text-primary-700">{post.category.name}</span>}
            <span className="inline-flex items-center gap-1"><FiCalendar /> {new Date(post.created_at).toLocaleDateString()}</span>
            <span className="inline-flex items-center gap-1"><FiEye /> {post.views_count} views</span>
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold text-gray-900">{post.title}</h1>
          {post.author && <p className="mt-3 text-gray-500">By {post.author.display_name || post.author.first_name}</p>}
          <div className="prose mt-8 max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">{post.content}</div>
        </div>
      </div>
    </div>
  );
}
