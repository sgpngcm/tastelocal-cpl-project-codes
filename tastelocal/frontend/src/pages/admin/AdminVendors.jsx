import { useState, useEffect } from 'react';
import { vendorAPI } from '../../utils/api';
import { LoadingSpinner } from '../../components/UI';
import { toast } from 'react-toastify';
import { FiCheck, FiX, FiStar } from 'react-icons/fi';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = filter !== '' ? { is_approved: filter } : {};
    vendorAPI.adminAll(params).then(r => setVendors(r.data.results || r.data)).catch(() => []).finally(() => setLoading(false));
  }, [filter]);

  const handleApprove = async (id, approved) => {
    try {
      await vendorAPI.adminApprove(id, { approved });
      setVendors(vendors.map(v => v.id === id ? { ...v, is_approved: approved } : v));
      toast.success(`Vendor ${approved ? 'approved' : 'rejected'}.`);
    } catch { toast.error('Failed to update.'); }
  };

  const handleFeature = async (id) => {
    try {
      const res = await vendorAPI.adminFeature(id);
      setVendors(vendors.map(v => v.id === id ? { ...v, is_featured: res.data.is_featured } : v));
      toast.success('Updated.');
    } catch { toast.error('Failed.'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">Vendor Management</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field max-w-[180px]">
          <option value="">All</option>
          <option value="false">Pending Approval</option>
          <option value="true">Approved</option>
        </select>
      </div>
      <div className="space-y-4">
        {vendors.map((v) => (
          <div key={v.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{v.business_name}</h3>
                <p className="text-sm text-gray-500">{v.cuisine_type} • {v.user?.display_name || v.user?.username}</p>
                <p className="text-sm text-gray-400 mt-1">{v.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${v.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {v.is_approved ? 'Approved' : 'Pending'}
                </span>
                {v.is_featured && <span className="badge bg-primary-100 text-primary-700">Featured</span>}
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              {!v.is_approved && (
                <button onClick={() => handleApprove(v.id, true)} className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"><FiCheck />Approve</button>
              )}
              {v.is_approved && (
                <button onClick={() => handleApprove(v.id, false)} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"><FiX />Reject</button>
              )}
              <button onClick={() => handleFeature(v.id)} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 ml-4">
                <FiStar />{v.is_featured ? 'Unfeature' : 'Feature'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
