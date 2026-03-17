import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { experienceAPI, bookingAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/UI';
import { toast } from 'react-toastify';
import { FiCalendar, FiUsers, FiCheck } from 'react-icons/fi';

export default function BookingPage() {
  const { experienceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ booking_date: '', booking_time: '', num_guests: 1, special_requests: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    experienceAPI.detail(experienceId).then(r => setExperience(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [experienceId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await bookingAPI.create({ experience: experienceId, ...form });
      toast.success('Booking confirmed! Check your email for details.');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Booking failed.');
    }
    setSubmitting(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!experience) return <div className="page-container text-center"><h2>Experience not found</h2></div>;

  const totalPrice = experience.price * form.num_guests;

  return (
    <div className="page-container max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > s ? <FiCheck /> : s}
            </div>
            <span className="text-sm text-gray-600 hidden sm:inline">{s === 1 ? 'Select Date' : s === 2 ? 'Confirm' : 'Done'}</span>
            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-primary-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="font-display text-xl font-bold mb-2">{experience.title}</h2>
        <p className="text-gray-500 text-sm mb-6">by {experience.vendor?.business_name}</p>

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><FiCalendar className="inline mr-1" />Select Date</label>
              <input type="date" required value={form.booking_date} onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
                min={experience.available_from} max={experience.available_to} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
              <input type="time" value={form.booking_time} onChange={(e) => setForm({ ...form, booking_time: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><FiUsers className="inline mr-1" />Number of Guests</label>
              <input type="number" min={1} max={experience.capacity} required value={form.num_guests}
                onChange={(e) => setForm({ ...form, num_guests: parseInt(e.target.value) || 1 })} className="input-field" />
              <p className="text-xs text-gray-400 mt-1">Max {experience.capacity} guests • {experience.available_spots} spots available</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
              <textarea value={form.special_requests} onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
                className="input-field" rows={3} placeholder="Dietary requirements, accessibility needs, etc." />
            </div>
            <button onClick={() => { if (!form.booking_date) { toast.error('Please select a date'); return; } setStep(2); }} className="btn-primary w-full">Continue to Review</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>
            <div className="bg-warm-50 rounded-xl p-5 space-y-3 text-sm mb-6">
              <div className="flex justify-between"><span className="text-gray-500">Experience</span><span className="font-medium">{experience.title}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{form.booking_date}</span></div>
              {form.booking_time && <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium">{form.booking_time}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Guests</span><span className="font-medium">{form.num_guests}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Price per person</span><span className="font-medium">SGD {Number(experience.price).toFixed(0)}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-3"><span className="font-semibold text-gray-900">Total</span><span className="font-bold text-primary-600 text-lg">SGD {totalPrice.toFixed(0)}</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">{submitting ? 'Confirming...' : 'Confirm Booking'}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"><FiCheck size={40} className="text-green-600" /></div>
            <h3 className="font-display text-2xl font-bold mb-2">Booking Confirmed!</h3>
            <p className="text-gray-500 mb-6">A confirmation email has been sent to {user?.email}.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/tourist/bookings')} className="btn-primary">View My Bookings</button>
              <button onClick={() => navigate('/experiences')} className="btn-secondary">Explore More</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
