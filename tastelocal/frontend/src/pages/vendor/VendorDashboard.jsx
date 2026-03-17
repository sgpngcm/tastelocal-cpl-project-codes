import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { experienceAPI, bookingAPI, vendorAPI } from '../../utils/api';
import { FiBookOpen, FiCalendar, FiPlus, FiSettings } from 'react-icons/fi';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ listings: 0, bookings: 0, hasProfile: false });

  useEffect(() => {
    Promise.all([
      experienceAPI.myListings().catch(() => ({ data: [] })),
      bookingAPI.vendorBookings().catch(() => ({ data: [] })),
      vendorAPI.getMyProfile().catch(() => null),
    ]).then(([l, b, p]) => {
      setStats({
        listings: (l.data.results || l.data)?.length || 0,
        bookings: (b.data.results || b.data)?.length || 0,
        hasProfile: !!p?.data?.id,
      });
    });
  }, []);

  return (
    <div className="page-container">
      <h1 className="section-title mb-2">Vendor Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back, {user?.first_name || user?.username}! 👨‍🍳</p>

      {!stats.hasProfile && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Complete Your Profile</h3>
          <p className="text-sm text-yellow-700 mb-3">Set up your vendor profile to start listing food experiences.</p>
          <Link to="/vendor/setup" className="btn-primary text-sm">Set Up Profile</Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/vendor/listings" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <FiBookOpen className="text-2xl text-primary-500 mb-3" />
          <p className="text-3xl font-bold">{stats.listings}</p>
          <p className="text-gray-500 text-sm">My Listings</p>
        </Link>
        <Link to="/vendor/bookings" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <FiCalendar className="text-2xl text-blue-500 mb-3" />
          <p className="text-3xl font-bold">{stats.bookings}</p>
          <p className="text-gray-500 text-sm">Booking Requests</p>
        </Link>
        <Link to="/vendor/setup" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <FiSettings className="text-2xl text-gray-500 mb-3" />
          <p className="text-lg font-semibold">Profile Settings</p>
          <p className="text-gray-500 text-sm">Manage your vendor profile</p>
        </Link>
      </div>

      <Link to="/vendor/experiences/create" className="btn-primary inline-flex items-center gap-2"><FiPlus />Create New Experience</Link>
    </div>
  );
}
