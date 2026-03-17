import { useState, useEffect } from 'react';
import { reviewAPI } from '../../utils/api';
import { LoadingSpinner } from '../../components/UI';
import StarRating from '../../components/StarRating';
import { toast } from 'react-toastify';
import { FiCheck, FiX } from 'react-icons/fi';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = filter !== '' ? { is_approved: filter } : {};
    reviewAPI.adminAll(params).then(r => setReviews(r.data.results || r.data)).catch(() => []).finally(() => setLoading(false));
  }, [filter]);

  const handleModerate = async (id, approved) => {
    try {
      await reviewAPI.adminModerate(id, { approved });
      setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: approved } : r));
      toast.success(`Review ${approved ? 'approved' : 'rejected'}.`);
    } catch { toast.error('Failed.'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">Review Moderation</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field max-w-[180px]">
          <option value="">All</option>
          <option value="false">Pending</option>
          <option value="true">Approved</option>
        </select>
      </div>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold">{r.experience_title}</p>
                <p className="text-sm text-gray-500">by {r.tourist?.display_name || 'Tourist'} • {new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={r.rating} size={14} showValue={false} />
                <span className={`badge ${r.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {r.is_approved ? 'Approved' : 'Pending'}
                </span>
              </div>
            </div>
            {r.title && <p className="font-medium text-gray-800">{r.title}</p>}
            <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
            <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
              {!r.is_approved && <button onClick={() => handleModerate(r.id, true)} className="text-sm text-green-600 flex items-center gap-1"><FiCheck />Approve</button>}
              {r.is_approved && <button onClick={() => handleModerate(r.id, false)} className="text-sm text-red-600 flex items-center gap-1"><FiX />Reject</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
