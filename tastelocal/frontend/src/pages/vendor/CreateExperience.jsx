import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { experienceAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { FiSave } from 'react-icons/fi';

export default function CreateExperience() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState({
    title: '', description: '', category: 'food_tour', price: '', capacity: 10,
    duration_hours: 2, available_from: '', available_to: '', start_time: '',
    meeting_point: '', what_included: '', what_to_bring: '', is_active: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      experienceAPI.detail(id).then(r => {
        const d = r.data;
        setForm({ title: d.title, description: d.description, category: d.category, price: d.price, capacity: d.capacity,
          duration_hours: d.duration_hours, available_from: d.available_from, available_to: d.available_to,
          start_time: d.start_time || '', meeting_point: d.meeting_point || '', what_included: d.what_included || '',
          what_to_bring: d.what_to_bring || '', is_active: d.is_active });
      }).catch(() => {});
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') formData.append(k, v); });
      if (imageFile) formData.append('image', imageFile);
      if (isEdit) await experienceAPI.update(id, formData);
      else await experienceAPI.create(formData);
      toast.success(isEdit ? 'Experience updated!' : 'Experience created!');
      navigate('/vendor/listings');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save.');
    }
    setLoading(false);
  };

  const categories = [
    ['food_tour', 'Food Tour'], ['cooking_class', 'Cooking Class'], ['tasting_menu', 'Tasting Menu'],
    ['street_food', 'Street Food Walk'], ['fine_dining', 'Fine Dining'], ['market_tour', 'Market Tour'],
    ['cafe_hopping', 'Café Hopping'], ['workshop', 'Food Workshop'], ['festival', 'Food Festival'], ['other', 'Other'],
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <div className="page-container max-w-2xl mx-auto">
      <h1 className="section-title mb-8">{isEdit ? 'Edit' : 'Create'} Experience</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input type="text" name="title" required value={form.title} onChange={handleChange} className="input-field" placeholder="e.g., Hawker Centre Discovery Walk" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea name="description" required rows={5} value={form.description} onChange={handleChange} className="input-field" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="input-field">
              {categories.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (SGD) *</label>
            <input type="number" name="price" required step="0.01" value={form.price} onChange={handleChange} className="input-field" /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input type="number" name="capacity" min={1} value={form.capacity} onChange={handleChange} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration (hrs)</label>
            <input type="number" name="duration_hours" step="0.5" value={form.duration_hours} onChange={handleChange} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input type="time" name="start_time" value={form.start_time} onChange={handleChange} className="input-field" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Available From *</label>
            <input type="date" name="available_from" required value={form.available_from} onChange={handleChange} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Available To *</label>
            <input type="date" name="available_to" required value={form.available_to} onChange={handleChange} className="input-field" /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Meeting Point</label>
          <input type="text" name="meeting_point" value={form.meeting_point} onChange={handleChange} className="input-field" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">What's Included</label>
          <textarea name="what_included" rows={3} value={form.what_included} onChange={handleChange} className="input-field" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">What to Bring</label>
          <textarea name="what_to_bring" rows={2} value={form.what_to_bring} onChange={handleChange} className="input-field" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Experience Image</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="input-field" /></div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 text-primary-500" />
          <label className="text-sm text-gray-700">Active (visible to tourists)</label>
        </div>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 w-full justify-center"><FiSave />{loading ? 'Saving...' : 'Save Experience'}</button>
      </form>
    </div>
  );
}
