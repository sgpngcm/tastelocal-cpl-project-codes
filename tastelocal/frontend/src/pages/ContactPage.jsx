import { useState } from 'react';
import { pageAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { FiSend, FiMapPin, FiMail, FiPhone } from 'react-icons/fi';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await pageAPI.submitContact(form);
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch { toast.error('Failed to send message. Please try again.'); }
    setLoading(false);
  };

  return (
    <div className="page-container">
      <h1 className="section-title mb-2">Contact Us</h1>
      <p className="text-gray-500 mb-8">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Your name" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="your@email.com" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field" placeholder="How can we help?" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field" placeholder="Tell us more..." /></div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2"><FiSend />{loading ? 'Sending...' : 'Send Message'}</button>
          </form>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Get in Touch</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-3"><FiMapPin className="text-primary-500 mt-0.5 shrink-0" /><span>1 Orchard Road, #10-01<br />Singapore 238824</span></div>
              <div className="flex items-center gap-3"><FiMail className="text-primary-500 shrink-0" /><a href="mailto:tastelocal2@gmail.com" className="hover:text-primary-600">tastelocal2@gmail.com</a></div>
              <div className="flex items-center gap-3"><FiPhone className="text-primary-500 shrink-0" /><span>+65 6100 8888</span></div>
            </div>
          </div>
          <div className="bg-primary-50 rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold mb-2 text-primary-800">Office Hours</h3>
            <p className="text-sm text-primary-700">Monday – Friday<br />9:00 AM – 6:00 PM (SGT)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
