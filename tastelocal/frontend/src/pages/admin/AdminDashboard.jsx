import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { LoadingSpinner } from '../../components/UI';
import { FiUsers, FiCalendar, FiStar, FiMapPin, FiAlertCircle } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.adminStats().then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <div className="page-container"><p>Failed to load statistics.</p></div>;

  const cards = [
    { label: 'Total Users', value: stats.total_users, icon: <FiUsers />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Tourists', value: stats.total_tourists, icon: <FiUsers />, color: 'bg-green-50 text-green-600' },
    { label: 'Vendors', value: stats.total_vendors, icon: <FiMapPin />, color: 'bg-purple-50 text-purple-600' },
    { label: 'Experiences', value: stats.total_experiences, icon: <FiStar />, color: 'bg-orange-50 text-orange-600' },
    { label: 'Total Bookings', value: stats.total_bookings, icon: <FiCalendar />, color: 'bg-cyan-50 text-cyan-600' },
    { label: 'Total Reviews', value: stats.total_reviews, icon: <FiStar />, color: 'bg-yellow-50 text-yellow-600' },
  ];

  return (
    <div className="page-container">
      <h1 className="section-title mb-8">Admin Dashboard</h1>

      {/* Alerts */}
      {(stats.pending_vendors > 0 || stats.pending_reviews > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <FiAlertCircle className="text-yellow-600 shrink-0" size={20} />
          <div className="text-sm">
            {stats.pending_vendors > 0 && <span className="text-yellow-800 font-medium">{stats.pending_vendors} vendor(s) awaiting approval. </span>}
            {stats.pending_reviews > 0 && <span className="text-yellow-800 font-medium">{stats.pending_reviews} review(s) pending moderation.</span>}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-2`}>{icon}</div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/users" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <h3 className="font-semibold mb-1">Manage Users</h3>
          <p className="text-sm text-gray-500">View and manage all registered users</p>
        </Link>
        <Link to="/admin/vendors" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <h3 className="font-semibold mb-1">Vendor Approvals</h3>
          <p className="text-sm text-gray-500">{stats.pending_vendors} pending approval(s)</p>
        </Link>
        <Link to="/admin/reviews" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <h3 className="font-semibold mb-1">Review Moderation</h3>
          <p className="text-sm text-gray-500">{stats.pending_reviews} pending review(s)</p>
        </Link>
      </div>

      {/* Booking Status Breakdown */}
      {stats.bookings_by_status?.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <h3 className="font-semibold mb-4">Bookings by Status</h3>
          <div className="flex flex-wrap gap-4">
            {stats.bookings_by_status.map(({ status, count }) => (
              <div key={status} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{
                  backgroundColor: status === 'completed' ? '#22c55e' : status === 'confirmed' ? '#3b82f6' : status === 'pending' ? '#eab308' : '#ef4444'
                }} />
                <span className="text-sm capitalize">{status}: <strong>{count}</strong></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.popular_cuisines?.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <h3 className="font-semibold mb-4">Popular Cuisine Types</h3>
          <div className="space-y-2">
            {stats.popular_cuisines.map(({ cuisine_type, count }) => (
              <div key={cuisine_type} className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div className="bg-primary-400 h-full rounded-full" style={{ width: `${(count / stats.total_vendors) * 100}%` }} />
                </div>
                <span className="text-sm w-24 capitalize">{cuisine_type?.replace('_', ' ')}</span>
                <span className="text-sm font-semibold w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
