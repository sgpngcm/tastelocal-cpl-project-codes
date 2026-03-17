import { useState, useEffect } from 'react';
import { bookingAPI } from '../../utils/api';
import { LoadingSpinner, EmptyState } from '../../components/UI';
import { toast } from 'react-toastify';
import { FiCalendar, FiUsers, FiCheck, FiX } from 'react-icons/fi';

const STATUS_COLORS = { pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };

export default function VendorBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingAPI.vendorBookings().then(r => setBookings(r.data.results || r.data)).catch(() => []).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await bookingAPI.vendorUpdateStatus(id, { status });
      setBookings(bookings.map(b => b.id === id ? res.data : b));
      toast.success(`Booking ${status}.`);
    } catch { toast.error('Failed to update.'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <h1 className="section-title mb-8">Booking Requests</h1>
      {bookings.length === 0 ? <EmptyState icon="📅" title="No bookings yet" description="Bookings from tourists will appear here." /> : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{b.experience?.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">Guest: {b.tourist?.display_name || b.tourist?.first_name}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><FiCalendar />{b.booking_date}</span>
                    <span className="flex items-center gap-1"><FiUsers />{b.num_guests} guest(s)</span>
                    <span className="font-semibold text-primary-600">SGD {Number(b.total_price).toFixed(0)}</span>
                  </div>
                  {b.special_requests && <p className="text-sm text-gray-400 mt-2 italic">Note: {b.special_requests}</p>}
                </div>
                <span className={`badge ${STATUS_COLORS[b.status]} capitalize`}>{b.status}</span>
              </div>
              {b.status === 'confirmed' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button onClick={() => updateStatus(b.id, 'completed')} className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"><FiCheck />Mark Completed</button>
                  <button onClick={() => updateStatus(b.id, 'cancelled')} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 ml-4"><FiX />Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
