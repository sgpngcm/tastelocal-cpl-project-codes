import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI, reviewAPI } from '../../utils/api';
import { LoadingSpinner, EmptyState } from '../../components/UI';
import StarRating from '../../components/StarRating';
import { toast } from 'react-toastify';
import { FiCalendar, FiUsers, FiX, FiStar } from 'react-icons/fi';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const initialReviewForm = {
  experience: '',
  rating: 5,
  title: '',
  comment: '',
};

export default function TouristBookings() {
  const [bookings, setBookings] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [submittingReview, setSubmittingReview] = useState(false);

  const reviewedExperienceIds = useMemo(
    () => new Set(myReviews.map((r) => r.experience)),
    [myReviews]
  );

  const loadData = async (statusFilter = filter) => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const [bookingRes, reviewRes] = await Promise.all([
        bookingAPI.myBookings(params),
        reviewAPI.myReviews(),
      ]);

      setBookings(bookingRes.data.results || bookingRes.data || []);
      setMyReviews(reviewRes.data.results || reviewRes.data || []);
    } catch {
      setBookings([]);
      setMyReviews([]);
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(filter);
  }, [filter]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
      );
      toast.success('Booking cancelled.');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to cancel booking.');
    }
  };

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setReviewForm({
      experience: booking.experience?.id || '',
      rating: 5,
      title: '',
      comment: '',
    });
  };

  const closeReviewModal = () => {
    setSelectedBooking(null);
    setReviewForm(initialReviewForm);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.experience) {
      toast.error('Experience not found for this booking.');
      return;
    }
    if (!reviewForm.comment.trim()) {
      toast.error('Please enter your review comment.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await reviewAPI.create({
        experience: reviewForm.experience,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      });

      setMyReviews((prev) => [res.data, ...prev]);
      toast.success('Review submitted successfully.');
      closeReviewModal();
    } catch (error) {
      const msg =
        error?.response?.data?.non_field_errors?.[0] ||
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        'Failed to submit review.';
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">My Bookings</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field max-w-[180px]"
        >
          <option value="">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No bookings yet"
          description="Start exploring food experiences!"
          action={
            <Link to="/experiences" className="btn-primary">
              Browse Experiences
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const experienceId = b.experience?.id;
            const alreadyReviewed = reviewedExperienceIds.has(experienceId);

            return (
              <div
                key={b.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4"
              >
                <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={b.experience?.image || 'https://placehold.co/200x100/F19340/fff?text=Exp'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        to={`/experiences/${b.experience?.id}`}
                        className="font-display text-lg font-semibold hover:text-primary-600"
                      >
                        {b.experience?.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {b.experience?.vendor?.business_name || b.experience?.vendor_name}
                      </p>
                    </div>
                    <span className={`badge ${STATUS_COLORS[b.status]} capitalize`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiCalendar />
                      {b.booking_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiUsers />
                      {b.num_guests} guest(s)
                    </span>
                    <span className="font-semibold text-primary-600">
                      SGD {Number(b.total_price).toFixed(0)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    {(b.status === 'confirmed' || b.status === 'pending') && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <FiX />
                        Cancel Booking
                      </button>
                    )}

                    {b.status === 'completed' && !alreadyReviewed && (
                      <button
                        onClick={() => openReviewModal(b)}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium"
                      >
                        <FiStar />
                        Write Review
                      </button>
                    )}

                    {b.status === 'completed' && alreadyReviewed && (
                      <span className="text-sm text-green-600 font-medium">
                        Review submitted
                      </span>
                    )}

                    {b.status === 'confirmed' && (
                      <span className="text-xs text-gray-400">
                        Review will be available after the booking is marked completed.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedBooking.experience?.title}
                </p>
              </div>
              <button
                onClick={closeReviewModal}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="label">Rating</label>
                <div className="flex items-center gap-3">
                  <StarRating rating={reviewForm.rating} size={22} showValue={false} />
                  <select
                    value={reviewForm.rating}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        rating: Number(e.target.value),
                      }))
                    }
                    className="input-field max-w-[120px]"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) =>
                    setReviewForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Optional review title"
                />
              </div>

              <div>
                <label className="label">Comment</label>
                <textarea
                  rows={5}
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Share your experience..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="btn-secondary"
                  disabled={submittingReview}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}