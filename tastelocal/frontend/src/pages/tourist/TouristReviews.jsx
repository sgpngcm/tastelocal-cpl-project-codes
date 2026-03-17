import { useState, useEffect } from 'react';
import { reviewAPI } from '../../utils/api';
import { LoadingSpinner, EmptyState } from '../../components/UI';
import StarRating from '../../components/StarRating';

export default function TouristReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewAPI.myReviews().then(r => setReviews(r.data.results || r.data)).catch(() => []).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <h1 className="section-title mb-8">My Reviews</h1>
      {reviews.length === 0 ? <EmptyState icon="⭐" title="No reviews yet" description="Complete a booking to leave a review!" /> : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{r.experience_title}</h3>
                  <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <StarRating rating={r.rating} size={14} showValue={false} />
              </div>
              {r.title && <p className="font-medium text-gray-800 mb-1">{r.title}</p>}
              <p className="text-sm text-gray-600">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
