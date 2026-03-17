import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { pageAPI } from '../utils/api';
import { LoadingSpinner } from '../components/UI';

export default function StaticPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    pageAPI.get(slug).then(r => setPage(r.data)).catch(() => setPage(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  if (!page) return <div className="page-container text-center py-20"><h2 className="text-xl">Page not found</h2></div>;

  return (
    <div className="page-container max-w-3xl mx-auto">
      <h1 className="section-title mb-8">{page.title}</h1>
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">{page.content}</div>
      </div>
      <p className="text-xs text-gray-400 mt-4">Last updated: {new Date(page.updated_at).toLocaleDateString()}</p>
    </div>
  );
}
