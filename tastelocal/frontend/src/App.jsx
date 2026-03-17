import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ExperienceListPage from './pages/ExperienceListPage';
import ExperienceDetailPage from './pages/ExperienceDetailPage';
import VendorListPage from './pages/VendorListPage';
import VendorDetailPage from './pages/VendorDetailPage';
import MapPage from './pages/MapPage';
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';
import StaticPage from './pages/StaticPage';
import ContactPage from './pages/ContactPage';

// Tourist Pages
import TouristDashboard from './pages/tourist/TouristDashboard';
import TouristBookings from './pages/tourist/TouristBookings';
import TouristItineraries from './pages/tourist/TouristItineraries';
import TouristReviews from './pages/tourist/TouristReviews';
import BookingPage from './pages/tourist/BookingPage';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorListings from './pages/vendor/VendorListings';
import VendorBookings from './pages/vendor/VendorBookings';
import VendorProfileSetup from './pages/vendor/VendorProfileSetup';
import CreateExperience from './pages/vendor/CreateExperience';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVendors from './pages/admin/AdminVendors';
import AdminReviews from './pages/admin/AdminReviews';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              {/* Public */}
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

              {/* Authenticated */}
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Tourist */}
              <Route path="/tourist/dashboard" element={<ProtectedRoute roles={['tourist']}><TouristDashboard /></ProtectedRoute>} />
              <Route path="/tourist/bookings" element={<ProtectedRoute roles={['tourist']}><TouristBookings /></ProtectedRoute>} />
              <Route path="/tourist/itineraries" element={<ProtectedRoute roles={['tourist']}><TouristItineraries /></ProtectedRoute>} />
              <Route path="/tourist/reviews" element={<ProtectedRoute roles={['tourist']}><TouristReviews /></ProtectedRoute>} />
              <Route path="/book/:experienceId" element={<ProtectedRoute roles={['tourist']}><BookingPage /></ProtectedRoute>} />

              {/* Vendor */}
              <Route path="/vendor/dashboard" element={<ProtectedRoute roles={['vendor']}><VendorDashboard /></ProtectedRoute>} />
              <Route path="/vendor/setup" element={<ProtectedRoute roles={['vendor']}><VendorProfileSetup /></ProtectedRoute>} />
              <Route path="/vendor/listings" element={<ProtectedRoute roles={['vendor']}><VendorListings /></ProtectedRoute>} />
              <Route path="/vendor/bookings" element={<ProtectedRoute roles={['vendor']}><VendorBookings /></ProtectedRoute>} />
              <Route path="/vendor/experiences/create" element={<ProtectedRoute roles={['vendor']}><CreateExperience /></ProtectedRoute>} />
              <Route path="/vendor/experiences/:id/edit" element={<ProtectedRoute roles={['vendor']}><CreateExperience /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/vendors" element={<ProtectedRoute roles={['admin']}><AdminVendors /></ProtectedRoute>} />
              <Route path="/admin/reviews" element={<ProtectedRoute roles={['admin']}><AdminReviews /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </Router>
    </AuthProvider>
  );
}

export default App;
