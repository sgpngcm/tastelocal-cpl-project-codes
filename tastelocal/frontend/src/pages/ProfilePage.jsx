import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiCamera, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { getAvatarPlaceholder, resolveMediaUrl } from '../utils/media';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', bio: '', country: '', city: '' });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        country: user.country || '',
        city: user.city || '',
      });
      setPreview(resolveMediaUrl(user.profile_image) || getAvatarPlaceholder(user.display_name || user.username));
    }
  }, [user]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (imageFile) formData.append('profile_image', imageFile);
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data);
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <h1 className="section-title mb-8">My Profile</h1>
      <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-warm-200/60">
        <div className="mb-8 flex flex-col gap-6 border-b border-gray-100 pb-8 sm:flex-row sm:items-center">
          <div className="relative">
            <img src={preview || getAvatarPlaceholder(user?.display_name || user?.username)} alt="" className="h-28 w-28 rounded-full border-4 border-primary-100 object-cover" />
            <label className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition hover:bg-primary-600">
              <FiCamera size={15} />
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="font-display text-3xl font-semibold text-gray-900">{user?.display_name || user?.username}</h2>
            <p className="mt-2 text-gray-500 capitalize">{user?.role} • Joined {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'recently'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium text-gray-700">First name</label><input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="input-field" /></div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Last name</label><input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="input-field" /></div>
          </div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Phone</label><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Country</label><input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input-field" /></div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">City</label><input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" /></div>
          </div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Bio</label><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className="input-field" placeholder="Tell people what kind of food or travel moments you love." /></div>
          <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"><FiSave /> {loading ? 'Saving...' : 'Save changes'}</button>
        </form>
      </div>
    </div>
  );
}
