import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { FiSave } from 'react-icons/fi';
import { resolveMediaUrl } from '../../utils/media';

export default function VendorProfileSetup() {
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [form, setForm] = useState({
    business_name: '',
    description: '',
    cuisine_type: 'local',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    website: '',
    email: '',
    opening_hours: '',
  });
  const [coverFile, setCoverFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    vendorAPI.getMyProfile()
      .then((r) => {
        const d = r.data;
        if (d?.id || d?.business_name) {
          setIsEdit(true);
          setExistingProfile(d);
          setForm({
            business_name: d.business_name || '',
            description: d.description || '',
            cuisine_type: d.cuisine_type || 'local',
            address: d.address || '',
            latitude: d.latitude || '',
            longitude: d.longitude || '',
            phone: d.phone || '',
            website: d.website || '',
            email: d.email || '',
            opening_hours: d.opening_hours || '',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) formData.append(k, v);
      });
      if (coverFile) formData.append('cover_image', coverFile);
      if (logoFile) formData.append('logo', logoFile);

      if (isEdit) {
        await vendorAPI.updateMyProfile(formData);
        toast.success('Vendor profile updated successfully.');
      } else {
        await vendorAPI.create(formData);
        toast.success('Vendor profile created successfully. Awaiting admin approval.');
      }

      navigate('/vendor/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save vendor profile.');
    } finally {
      setLoading(false);
    }
  };

  const cuisines = [
    ['local', 'Local Cuisine'],
    ['chinese', 'Chinese'],
    ['malay', 'Malay'],
    ['indian', 'Indian'],
    ['peranakan', 'Peranakan'],
    ['seafood', 'Seafood'],
    ['street_food', 'Street Food'],
    ['hawker', 'Hawker'],
    ['fine_dining', 'Fine Dining'],
    ['cafe', 'Café & Coffee'],
    ['bakery', 'Bakery & Desserts'],
    ['vegetarian', 'Vegetarian/Vegan'],
    ['fusion', 'Fusion'],
    ['japanese', 'Japanese'],
    ['korean', 'Korean'],
    ['western', 'Western'],
    ['thai', 'Thai'],
    ['other', 'Other'],
  ];

  return (
    <div className="page-container max-w-3xl mx-auto">
      <h1 className="section-title mb-8">{isEdit ? 'Manage Vendor Profile' : 'Set Up Vendor Profile'}</h1>

      {existingProfile?.is_approved !== undefined && (
        <div className={`mb-6 rounded-xl p-4 border ${
          existingProfile.is_approved
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <p className="font-medium">
            Status: {existingProfile.is_approved ? 'Approved' : 'Pending approval'}
          </p>
          {!existingProfile.is_approved && (
            <p className="text-sm mt-1">Your profile is saved and waiting for admin approval.</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
          <input
            type="text"
            required
            value={form.business_name}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type *</label>
          <select
            value={form.cuisine_type}
            onChange={(e) => setForm({ ...form, cuisine_type: e.target.value })}
            className="input-field"
          >
            {cuisines.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <textarea
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="input-field"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              className="input-field"
              placeholder="e.g., 1.3521"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              className="input-field"
              placeholder="e.g., 103.8198"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="input-field"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
          <input
            type="text"
            value={form.opening_hours}
            onChange={(e) => setForm({ ...form, opening_hours: e.target.value })}
            className="input-field"
            placeholder="e.g., Mon-Sun: 10am-10pm"
          />
        </div>

        {(existingProfile?.cover_image || existingProfile?.logo) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {existingProfile?.cover_image && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Current Cover Image</p>
                <img
                  src={resolveMediaUrl(existingProfile.cover_image)}
                  alt=""
                  className="w-full h-40 object-cover rounded-xl border"
                />
              </div>
            )}
            {existingProfile?.logo && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Current Logo</p>
                <img
                  src={resolveMediaUrl(existingProfile.logo)}
                  alt=""
                  className="w-32 h-32 object-cover rounded-xl border bg-white"
                />
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="input-field"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center gap-2 w-full justify-center"
        >
          <FiSave />
          {loading ? 'Saving...' : isEdit ? 'Update Profile' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}