import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { experienceAPI, bookingAPI, vendorAPI } from '../../utils/api';
import { FiBookOpen, FiCalendar, FiPlus, FiSettings, FiMapPin, FiPhone, FiMail, FiGlobe } from 'react-icons/fi';
import { getVendorFallback, resolveMediaUrl } from '../../utils/media';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ listings: 0, bookings: 0, hasProfile: false });
  const [vendorProfile, setVendorProfile] = useState(null);

  useEffect(() => {
    Promise.all([
      experienceAPI.myListings().catch(() => ({ data: [] })),
      bookingAPI.vendorBookings().catch(() => ({ data: [] })),
      vendorAPI.getMyProfile().catch(() => null),
    ]).then(([l, b, p]) => {
      const profile = p?.data || null;
      setVendorProfile(profile);

      setStats({
        listings: (l.data.results || l.data)?.length || 0,
        bookings: (b.data.results || b.data)?.length || 0,
        hasProfile: !!profile?.id,
      });
    });
  }, []);

  const coverImage = resolveMediaUrl(vendorProfile?.cover_image) || getVendorFallback(vendorProfile || {});
  const logoImage = resolveMediaUrl(vendorProfile?.logo);

  return (
    <div className="page-container">
      <h1 className="section-title mb-2">Vendor Dashboard</h1>
      <p className="text-gray-500 mb-8">
        Welcome back, {user?.first_name || user?.username}! 👨‍🍳
      </p>

      {!stats.hasProfile && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Complete Your Profile</h3>
          <p className="text-sm text-yellow-700 mb-3">
            Set up your vendor profile to start listing food experiences.
          </p>
          <Link to="/vendor/setup" className="btn-primary text-sm">Set Up Profile</Link>
        </div>
      )}

      {stats.hasProfile && vendorProfile && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8 border border-gray-100">
          <div className="h-52 w-full overflow-hidden bg-gray-100">
            <img src={coverImage} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
              <div className="flex items-start gap-4">
                {logoImage ? (
                  <img
                    src={logoImage}
                    alt=""
                    className="w-20 h-20 rounded-2xl object-cover border bg-white"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-primary-50 border flex items-center justify-center text-2xl">
                    🍽️
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{vendorProfile.business_name}</h2>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      vendorProfile.is_approved
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {vendorProfile.is_approved ? 'Approved' : 'Pending approval'}
                    </span>
                    {vendorProfile.is_featured && (
                      <span className="text-xs px-3 py-1 rounded-full font-medium bg-primary-100 text-primary-700">
                        Featured
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-primary-700 font-medium mb-2">
                    {vendorProfile.cuisine_type_display}
                  </p>
                  <p className="text-gray-600 max-w-3xl">
                    {vendorProfile.description}
                  </p>
                </div>
              </div>

              <Link to="/vendor/setup" className="btn-primary whitespace-nowrap">
                <FiSettings className="inline mr-2" />
                Manage Profile
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm text-gray-600">
              {vendorProfile.address && (
                <div className="flex items-start gap-2">
                  <FiMapPin className="mt-0.5 text-primary-600" />
                  <span>{vendorProfile.address}</span>
                </div>
              )}
              {vendorProfile.phone && (
                <div className="flex items-start gap-2">
                  <FiPhone className="mt-0.5 text-primary-600" />
                  <span>{vendorProfile.phone}</span>
                </div>
              )}
              {vendorProfile.email && (
                <div className="flex items-start gap-2">
                  <FiMail className="mt-0.5 text-primary-600" />
                  <span>{vendorProfile.email}</span>
                </div>
              )}
              {vendorProfile.website && (
                <div className="flex items-start gap-2">
                  <FiGlobe className="mt-0.5 text-primary-600" />
                  <a
                    href={vendorProfile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-600 hover:underline break-all"
                  >
                    {vendorProfile.website}
                  </a>
                </div>
              )}
            </div>

            {vendorProfile.opening_hours && (
              <div className="mt-4 text-sm text-gray-600">
                <span className="font-medium text-gray-800">Opening hours:</span>{' '}
                {vendorProfile.opening_hours}
              </div>
            )}
          </div>
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
          <p className="text-lg font-semibold">
            {stats.hasProfile ? 'Manage Profile' : 'Set Up Profile'}
          </p>
          <p className="text-gray-500 text-sm">
            {stats.hasProfile ? 'Edit your business details' : 'Create your vendor profile'}
          </p>
        </Link>
      </div>

      <Link to="/vendor/experiences/create" className="btn-primary inline-flex items-center gap-2">
        <FiPlus />
        Create New Experience
      </Link>
    </div>
  );
}