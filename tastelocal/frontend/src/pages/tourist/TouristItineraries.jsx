import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itineraryAPI } from '../../utils/api';
import { LoadingSpinner, EmptyState } from '../../components/UI';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiShare2, FiCalendar } from 'react-icons/fi';

export default function TouristItineraries() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    itineraryAPI.list().then(r => setItineraries(r.data.results || r.data)).catch(() => []).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await itineraryAPI.create({ title: newTitle, description: newDesc, is_public: true });
      setItineraries([res.data, ...itineraries]);
      setShowCreate(false);
      setNewTitle(''); setNewDesc('');
      toast.success('Itinerary created!');
    } catch { toast.error('Failed to create itinerary.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this itinerary?')) return;
    try {
      await itineraryAPI.delete(id);
      setItineraries(itineraries.filter(i => i.id !== id));
      toast.success('Itinerary deleted.');
    } catch { toast.error('Failed to delete.'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">My Itineraries</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2"><FiPlus />New Itinerary</button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl p-6 shadow-md mb-6 animate-fade-in-up">
          <h3 className="font-semibold mb-4">Create New Itinerary</h3>
          <input type="text" required placeholder="Itinerary title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="input-field mb-3" />
          <textarea placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="input-field mb-3" rows={2} />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">Create</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      {itineraries.length === 0 ? <EmptyState icon="🗺️" title="No itineraries yet" description="Create your first food itinerary to plan your Singapore food adventure!" /> : (
        <div className="space-y-4">
          {itineraries.map((itin) => (
            <div key={itin.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold">{itin.title}</h3>
                  {itin.description && <p className="text-sm text-gray-500 mt-1">{itin.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><FiCalendar />{new Date(itin.created_at).toLocaleDateString()}</span>
                    <span>{itin.items?.length || 0} experiences</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {itin.is_public && (
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/itinerary/${itin.share_uuid}`); toast.success('Link copied!'); }}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Copy share link"><FiShare2 /></button>
                  )}
                  <button onClick={() => handleDelete(itin.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><FiTrash2 /></button>
                </div>
              </div>
              {itin.items?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  {itin.items.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                      <span>{item.experience?.title || 'Experience'}</span>
                      {item.planned_time && <span className="text-gray-400">at {item.planned_time}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
