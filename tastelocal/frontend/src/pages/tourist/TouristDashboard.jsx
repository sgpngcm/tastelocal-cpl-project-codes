import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI, itineraryAPI, reviewAPI } from '../../utils/api';
import { FiCalendar, FiMap, FiStar, FiSearch, FiArrowRight } from 'react-icons/fi';

export default function TouristDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ bookings: 0, itineraries: 0, reviews: 0 });

  useEffect(() => {
    Promise.all([
      bookingAPI.myBookings().catch(() => ({ data: { results: [] } })),
      itineraryAPI.list().catch(() => ({ data: [] })),
      reviewAPI.myReviews().catch(() => ({ data: { results: [] } })),
    ]).then(([b, i, r]) => {
      const bookings = b.data.results || b.data;
      setStats({ bookings: Array.isArray(bookings) ? bookings.length : 0, itineraries: (i.data.results || i.data)?.length || 0, reviews: (r.data.results || r.data)?.length || 0 });
    });
  }, []);

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="section-title">Welcome, {user?.first_name || user?.username}! 🍽️</h1>
        <p className="text-gray-500 mt-2">Ready to discover your next food adventure?</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'My Bookings', count: stats.bookings, icon: <FiCalendar />, link: '/tourist/bookings', color: 'bg-blue-50 text-blue-600' },
          { label: 'My Itineraries', count: stats.itineraries, icon: <FiMap />, link: '/tourist/itineraries', color: 'bg-green-50 text-green-600' },
          { label: 'My Reviews', count: stats.reviews, icon: <FiStar />, link: '/tourist/reviews', color: 'bg-yellow-50 text-yellow-600' },
        ].map(({ label, count, icon, link, color }) => (
          <Link key={label} to={link} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-xl mb-3`}>{icon}</div>
            <p className="text-3xl font-bold text-gray-900">{count}</p>
            <p className="text-gray-500 text-sm">{label}</p>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/experiences" className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-8 text-white hover:shadow-lg transition-all group">
          <FiSearch size={32} className="mb-3" />
          <h3 className="font-display text-xl font-bold mb-2">Discover Experiences</h3>
          <p className="text-primary-100 text-sm">Browse food tours, cooking classes, and more</p>
          <FiArrowRight className="mt-4 group-hover:translate-x-2 transition-transform" />
        </Link>
        <Link to="/map" className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl p-8 text-white hover:shadow-lg transition-all group">
          <FiMap size={32} className="mb-3" />
          <h3 className="font-display text-xl font-bold mb-2">Explore the Map</h3>
          <p className="text-accent-100 text-sm">Find food vendors near you</p>
          <FiArrowRight className="mt-4 group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
