import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiPhone, FiGlobe } from 'react-icons/fi';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', password2: '',
    first_name: '', last_name: '', role: 'tourist', phone: '', country: '', city: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        Object.values(errors).flat().forEach(msg => toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg)));
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-warm-50">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="text-5xl">🍜</span>
          <h1 className="font-display text-3xl font-bold mt-4 text-gray-900">Join TasteLocal</h1>
          <p className="text-gray-500 mt-2">Create your account and start exploring</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Role Selection */}
          <div className="flex gap-3 mb-6">
            {[
              { value: 'tourist', label: 'Tourist', icon: '🧳', desc: 'Discover & book food experiences' },
              { value: 'vendor', label: 'Vendor', icon: '👨‍🍳', desc: 'List your food business' },
            ].map(({ value, label, icon, desc }) => (
              <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${form.role === value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <span className="text-2xl">{icon}</span>
                <p className="font-semibold mt-1">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" name="first_name" required value={form.first_name} onChange={handleChange} className="input-field" placeholder="First name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" name="last_name" required value={form.last_name} onChange={handleChange} className="input-field" placeholder="Last name" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" name="username" required value={form.username} onChange={handleChange} className="input-field pl-10" placeholder="Choose a username" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" name="email" required value={form.email} onChange={handleChange} className="input-field pl-10" placeholder="your@email.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" name="password" required value={form.password} onChange={handleChange} className="input-field pl-10" placeholder="Min. 8 chars" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm</label>
                <input type="password" name="password2" required value={form.password2} onChange={handleChange} className="input-field" placeholder="Confirm password" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="phone" value={form.phone} onChange={handleChange} className="input-field pl-10" placeholder="+65 9xxx xxxx" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <div className="relative">
                  <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="country" value={form.country} onChange={handleChange} className="input-field pl-10" placeholder="Country" />
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3 disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
