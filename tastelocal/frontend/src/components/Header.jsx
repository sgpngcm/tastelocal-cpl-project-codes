import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiBookOpen,
  FiCalendar,
  FiChevronDown,
  FiGrid,
  FiHome,
  FiLogOut,
  FiMap,
  FiMenu,
  FiSearch,
  FiStar,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { getAvatarPlaceholder, resolveMediaUrl } from '../utils/media';

export default function Header() {
  const { user, isAuthenticated, isAdmin, isVendor, isTourist, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isVendor) return '/vendor/dashboard';
    return '/tourist/dashboard';
  };

  const avatar =
    resolveMediaUrl(user?.profile_image) ||
    getAvatarPlaceholder(user?.display_name || user?.username || 'TasteLocal');

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="group flex items-center gap-3">
            <img
              src="/TasteLocal_logo.png"
              alt="TasteLocal Logo"
              className="h-10 w-auto object-contain"
            />
            <div>
              <span className="block font-display text-2xl font-bold text-primary-600 transition group-hover:text-primary-700">
                TasteLocal
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {[
              ['/', 'Home'],
              ['/experiences', 'Experiences'],
              ['/vendors', 'Vendors'],
              ['/map', 'Map'],
              ['/blog', 'Blog'],
            ].map(([href, label]) => (
              <Link
                key={href}
                to={href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-primary-50 hover:text-primary-700"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2 transition hover:bg-warm-100"
                >
                  <img src={avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.first_name || user.username}
                    </p>
                    <p className="text-xs capitalize text-gray-500">{user.role}</p>
                  </div>
                  <FiChevronDown
                    className={`text-gray-500 transition ${profileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {profileOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setProfileOpen(false)}
                      aria-label="Close menu"
                    />
                    <div className="absolute right-0 z-20 mt-2 w-60 rounded-[1.5rem] border border-white/80 bg-white p-2 shadow-2xl shadow-warm-200/70">
                      <div className="rounded-2xl bg-warm-50 px-4 py-3">
                        <p className="font-semibold text-gray-900">
                          {user.display_name || user.username}
                        </p>
                        <p className="text-xs capitalize text-gray-500">{user.role}</p>
                      </div>
                      <div className="mt-2 space-y-1">
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-gray-700 transition hover:bg-primary-50 hover:text-primary-700"
                        >
                          <FiGrid size={16} /> Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-gray-700 transition hover:bg-primary-50 hover:text-primary-700"
                        >
                          <FiUser size={16} /> My profile
                        </Link>
                        {isTourist && (
                          <>
                            <Link
                              to="/tourist/bookings"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-gray-700 transition hover:bg-primary-50 hover:text-primary-700"
                            >
                              <FiCalendar size={16} /> My bookings
                            </Link>
                            <Link
                              to="/tourist/itineraries"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-gray-700 transition hover:bg-primary-50 hover:text-primary-700"
                            >
                              <FiMap size={16} /> My itineraries
                            </Link>
                            <Link
                              to="/tourist/reviews"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-gray-700 transition hover:bg-primary-50 hover:text-primary-700"
                            >
                              <FiStar size={16} /> My reviews
                            </Link>
                          </>
                        )}
                        {isVendor && (
                          <>
                            <Link
                              to="/vendor/listings"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-gray-700 transition hover:bg-primary-50 hover:text-primary-700"
                            >
                              <FiBookOpen size={16} /> My listings
                            </Link>
                            <Link
                              to="/vendor/bookings"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-gray-700 transition hover:bg-primary-50 hover:text-primary-700"
                            >
                              <FiCalendar size={16} /> Booking requests
                            </Link>
                          </>
                        )}
                      </div>
                      <div className="mt-2 border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-xl px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                        >
                          <FiLogOut size={16} /> Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 transition hover:text-primary-600"
                >
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-4">
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-xl p-2 transition hover:bg-warm-100 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <div className="space-y-1 px-4 py-4">
            {isAuthenticated && (
              <div className="mb-3 flex items-center gap-3 rounded-2xl bg-warm-50 p-3">
                <img src={avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-gray-900">{user.first_name || user.username}</p>
                  <p className="text-xs capitalize text-gray-500">{user.role}</p>
                </div>
              </div>
            )}

            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-700 hover:bg-primary-50"
            >
              <FiHome size={18} /> Home
            </Link>
            <Link
              to="/experiences"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-700 hover:bg-primary-50"
            >
              <FiSearch size={18} /> Experiences
            </Link>
            <Link
              to="/vendors"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-700 hover:bg-primary-50"
            >
              <FiBookOpen size={18} /> Vendors
            </Link>
            <Link
              to="/map"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-700 hover:bg-primary-50"
            >
              <FiMap size={18} /> Map
            </Link>
            <Link
              to="/blog"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-700 hover:bg-primary-50"
            >
              <FiBookOpen size={18} /> Blog
            </Link>

            {isAuthenticated ? (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-700 hover:bg-primary-50"
                >
                  <FiGrid size={18} /> Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-700 hover:bg-primary-50"
                >
                  <FiUser size={18} /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-red-600 hover:bg-red-50"
                >
                  <FiLogOut size={18} /> Sign out
                </button>
              </div>
            ) : (
              <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary flex-1 text-center text-sm !py-2"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary flex-1 text-center text-sm !py-2"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}