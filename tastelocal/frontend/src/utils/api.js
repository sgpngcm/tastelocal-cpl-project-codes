import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        const response = await axios.post(`${API_BASE}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login/', data),
  register: (data) => api.post('/auth/register/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.put('/auth/password/change/', data),
  adminStats: () => api.get('/auth/admin/stats/'),
  adminUsers: (params) => api.get('/auth/admin/users/', { params }),
  adminUserDetail: (id, data) => api.patch(`/auth/admin/users/${id}/`, data),
};

// Vendor API
export const vendorAPI = {
  list: (params) => api.get('/vendors/', { params }),
  detail: (id) => api.get(`/vendors/${id}/`),
  create: (data) => api.post('/vendors/create/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateMyProfile: (data) => api.patch('/vendors/my-profile/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyProfile: () => api.get('/vendors/my-profile/'),
  mapData: () => api.get('/vendors/map/'),
  cuisineTypes: () => api.get('/vendors/cuisines/'),
  uploadPhoto: (data) => api.post('/vendors/photos/upload/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  adminAll: (params) => api.get('/vendors/admin/all/', { params }),
  adminApprove: (id, data) => api.post(`/vendors/admin/${id}/approve/`, data),
  adminFeature: (id) => api.post(`/vendors/admin/${id}/feature/`),
};

// Experience API
export const experienceAPI = {
  list: (params) => api.get('/experiences/', { params }),
  detail: (id) => api.get(`/experiences/${id}/`),
  featured: () => api.get('/experiences/featured/'),
  categories: () => api.get('/experiences/categories/'),
  tags: () => api.get('/experiences/tags/'),
  create: (data) => api.post('/experiences/create/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.patch(`/experiences/${id}/edit/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  myListings: () => api.get('/experiences/my-listings/'),
};

// Booking API
export const bookingAPI = {
  create: (data) => api.post('/bookings/create/', data),
  myBookings: (params) => api.get('/bookings/my-bookings/', { params }),
  detail: (id) => api.get(`/bookings/${id}/`),
  cancel: (id) => api.put(`/bookings/${id}/cancel/`, { status: 'cancelled' }),
  vendorBookings: () => api.get('/bookings/vendor-bookings/'),
  vendorUpdateStatus: (id, data) => api.post(`/bookings/${id}/update-status/`, data),
  adminAll: (params) => api.get('/bookings/admin/all/', { params }),
};

// Review API
export const reviewAPI = {
  forExperience: (experienceId) => api.get(`/reviews/experience/${experienceId}/`),
  create: (data) => api.post('/reviews/create/', data),
  myReviews: () => api.get('/reviews/my-reviews/'),
  update: (id, data) => api.patch(`/reviews/${id}/`, data),
  delete: (id) => api.delete(`/reviews/${id}/`),
  adminAll: (params) => api.get('/reviews/admin/all/', { params }),
  adminModerate: (id, data) => api.post(`/reviews/admin/${id}/moderate/`, data),
};

// Itinerary API
export const itineraryAPI = {
  list: () => api.get('/itineraries/'),
  create: (data) => api.post('/itineraries/', data),
  detail: (id) => api.get(`/itineraries/${id}/`),
  update: (id, data) => api.put(`/itineraries/${id}/`, data),
  delete: (id) => api.delete(`/itineraries/${id}/`),
  shared: (uuid) => api.get(`/itineraries/shared/${uuid}/`),
  addItem: (itinId, data) => api.post(`/itineraries/${itinId}/items/`, data),
  removeItem: (itemId) => api.delete(`/itineraries/items/${itemId}/delete/`),
};

// Pages API
export const pageAPI = {
  get: (slug) => api.get(`/pages/${slug}/`),
  submitContact: (data) => api.post('/pages/contact/', data),
};

// Blog API
export const blogAPI = {
  list: (params) => api.get('/blog/', { params }),
  detail: (slug) => api.get(`/blog/${slug}/`),
  categories: () => api.get('/blog/categories/'),
};

// Config API
export const configAPI = {
  get: () => api.get('/config/'),
};
