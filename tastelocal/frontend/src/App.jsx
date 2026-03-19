import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ExperienceListPage = lazy(() => import('./pages/ExperienceListPage'));
const ExperienceDetailPage = lazy(() => import('./pages/ExperienceDetailPage'));
const VendorListPage = lazy(() => import('./pages/VendorListPage'));
const VendorDetailPage = lazy(() => import('./pages/VendorDetailPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const BlogListPage = lazy(() => import('./pages/BlogListPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const StaticPage = lazy(() => import('./pages/StaticPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

// Tourist
const TouristDashboard = lazy(() => import('./pages/tourist/TouristDashboard'));
const TouristBookings = lazy(() => import('./pages/tourist/TouristBookings'));
const TouristItineraries = lazy(() => import('./pages/tourist/TouristItineraries'));
const TouristReviews = lazy(() => import('./pages/tourist/TouristReviews'));
const BookingPage = lazy(() => import('./pages/tourist/BookingPage'));

// Vendor
const VendorDashboard = lazy(() => import('./pages/vendor/VendorDashboard'));
const VendorListings = lazy(() => import('./pages/vendor/VendorListings'));
const VendorBookings = lazy(() => import('./pages/vendor/VendorBookings'));
const VendorProfileSetup = lazy(() => import('./pages/vendor/VendorProfileSetup'));
const CreateExperience = lazy(() => import('./pages/vendor/CreateExperience'));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminVendors = lazy(() => import('./pages/admin/AdminVendors'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));

function PageFallback() {
  return (
    <div className="page-container py-20">
      <div className="mx-auto max-w-3xl text-center text-gray-500">Loading page...</div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />

          <main className="flex-1">
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/experiences" element={<ExperienceListPage />} />
                <Route path="/experiences/:id" element={<ExperienceDetailPage />} />
                <Route path="/vendors" element={<VendorListPage />} />
                <Route path="/vendors/:id" element={<VendorDetailPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/blog" element={<BlogListPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/page/contact" element={<ContactPage />} />
                <Route path="/page/:slug" element={<StaticPage />} />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/tourist/dashboard"
                  element={
                    <ProtectedRoute roles={['tourist']}>
                      <TouristDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tourist/bookings"
                  element={
                    <ProtectedRoute roles={['tourist']}>
                      <TouristBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tourist/itineraries"
                  element={
                    <ProtectedRoute roles={['tourist']}>
                      <TouristItineraries />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tourist/reviews"
                  element={
                    <ProtectedRoute roles={['tourist']}>
                      <TouristReviews />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/book/:experienceId"
                  element={
                    <ProtectedRoute roles={['tourist']}>
                      <BookingPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/vendor/dashboard"
                  element={
                    <ProtectedRoute roles={['vendor']}>
                      <VendorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/setup"
                  element={
                    <ProtectedRoute roles={['vendor']}>
                      <VendorProfileSetup />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/listings"
                  element={
                    <ProtectedRoute roles={['vendor']}>
                      <VendorListings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/bookings"
                  element={
                    <ProtectedRoute roles={['vendor']}>
                      <VendorBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/experiences/create"
                  element={
                    <ProtectedRoute roles={['vendor']}>
                      <CreateExperience />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/experiences/:id/edit"
                  element={
                    <ProtectedRoute roles={['vendor']}>
                      <CreateExperience />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/vendors"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminVendors />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reviews"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminReviews />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>

          <Footer />
        </div>

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </Router>
    </AuthProvider>
  );
}

export default App;