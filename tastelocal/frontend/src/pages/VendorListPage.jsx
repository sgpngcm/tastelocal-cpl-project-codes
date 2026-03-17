import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiSearch } from 'react-icons/fi';
import { vendorAPI } from '../utils/api';
import StarRating from '../components/StarRating';
import { EmptyState, LoadingSpinner } from '../components/UI';
import { getVendorFallback, resolveMediaUrl } from '../utils/media';

export default function VendorListPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cuisine, setCuisine] = useState('');
  const [search, setSearch] = useState('');
  const [cuisines, setCuisines] = useState([]);

  useEffect(() => {
    vendorAPI.cuisineTypes().then((response) => setCuisines(response.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (cuisine) params.cuisine_type = cuisine;
    if (search.trim()) params.search = search.trim();
    vendorAPI.list(params)
      .then((response) => setVendors(response.data.results || response.data || []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [cuisine, search]);

  return (
    <div className="page-container">
      <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-warm-200/60 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-500">Hosts</p>
            <h1 className="section-title mt-2">Local vendors now feel more editorial and trustworthy</h1>
            <p className="mt-3 max-w-3xl text-gray-500">The upgraded cards lean on stronger cover images, cuisine framing, and tighter location cues so vendor discovery feels more premium.</p>
          </div>
          <Link to="/map" className="inline-flex items-center gap-2 rounded-full bg-warm-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700">
            <FiMapPin /> View on map
          </Link>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search business name, neighbourhood, or description" className="input-field pl-11" />
          </div>
          <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="input-field">
            <option value="">All cuisines</option>
            {cuisines.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <LoadingSpinner />
        ) : vendors.length === 0 ? (
          <EmptyState icon="👨‍🍳" title="No vendors found" description="Try a broader search or a different cuisine filter." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {vendors.map((vendor) => (
              <Link key={vendor.id} to={`/vendors/${vendor.id}`} className="group overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-md shadow-warm-200/50 transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={resolveMediaUrl(vendor.cover_image) || getVendorFallback(vendor)} alt={vendor.business_name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute inset-x-5 bottom-5 text-white">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/75">{vendor.cuisine_type_display}</p>
                    <h3 className="mt-2 font-display text-3xl font-semibold leading-tight">{vendor.business_name}</h3>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <p className="flex items-start gap-2 text-sm leading-7 text-gray-500"><FiMapPin className="mt-1 shrink-0 text-primary-500" size={15} /> {vendor.address}</p>
                  {vendor.avg_rating > 0 && <StarRating rating={vendor.avg_rating} size={14} total={vendor.total_reviews} />}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
                    {vendor.is_featured ? <span className="badge bg-primary-50 text-primary-700">Featured vendor</span> : <span className="text-gray-400">Verified local host</span>}
                    <span className="font-semibold text-primary-600">Open profile</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
