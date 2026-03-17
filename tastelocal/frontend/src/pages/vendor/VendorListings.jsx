import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiPlus } from 'react-icons/fi';
import { experienceAPI } from '../../utils/api';
import { EmptyState, LoadingSpinner } from '../../components/UI';
import { getExperienceFallback, resolveMediaUrl } from '../../utils/media';

export default function VendorListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    experienceAPI.myListings().then((response) => setListings(response.data.results || response.data || [])).catch(() => setListings([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="section-title">My Listings</h1>
        <Link to="/vendor/experiences/create" className="btn-primary inline-flex items-center gap-2"><FiPlus /> New Experience</Link>
      </div>
      {listings.length === 0 ? (
        <EmptyState icon="📝" title="No listings yet" description="Create your first food experience listing." action={<Link to="/vendor/experiences/create" className="btn-primary">Create Experience</Link>} />
      ) : (
        <div className="space-y-4">
          {listings.map((experience) => (
            <div key={experience.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-white/70 bg-white p-5 shadow-md shadow-warm-200/40 md:flex-row md:items-center">
              <img src={resolveMediaUrl(experience.image) || getExperienceFallback(experience)} alt="" className="h-28 w-full rounded-2xl object-cover md:w-32" />
              <div className="flex-1">
                <h3 className="font-display text-2xl font-semibold text-gray-900">{experience.title}</h3>
                <p className="mt-2 text-sm text-gray-500">SGD {Number(experience.price).toFixed(0)} • {experience.duration_hours}h • {experience.capacity} capacity</p>
                <span className={`badge mt-3 ${experience.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{experience.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              <Link to={`/vendor/experiences/${experience.id}/edit`} className="inline-flex items-center gap-2 rounded-2xl bg-warm-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-primary-50 hover:text-primary-700"><FiEdit2 /> Edit</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
