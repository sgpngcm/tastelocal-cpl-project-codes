import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiClock, FiGlobe, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { vendorAPI } from '../utils/api';
import StarRating from '../components/StarRating';
import { LoadingSpinner } from '../components/UI';
import { getVendorFallback, resolveMediaUrl } from '../utils/media';

export default function VendorDetailPage() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorAPI.detail(id).then((response) => setVendor(response.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const gallery = useMemo(() => {
    if (!vendor) return [];
    const items = [vendor.cover_image, ...(vendor.photos || []).map((item) => item.image)]
      .map((item) => resolveMediaUrl(item))
      .filter(Boolean);
    return items.length ? items : [getVendorFallback(vendor)];
  }, [vendor]);

  if (loading) return <LoadingSpinner />;
  if (!vendor) return <div className="page-container py-20 text-center"><h2>Vendor not found</h2></div>;

  return (
    <div className="page-container">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-warm-200/60">
        <div className="relative aspect-[16/6] overflow-hidden">
          <img src={gallery[0]} alt={vendor.business_name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-white/75">{vendor.cuisine_type_display}</p>
            <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">{vendor.business_name}</h1>
            {vendor.avg_rating > 0 && <div className="mt-3"><StarRating rating={vendor.avg_rating} total={vendor.total_reviews} /></div>}
          </div>
        </div>

        <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-base leading-8 text-gray-700">{vendor.description}</p>
            {gallery.length > 1 && (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {gallery.slice(1, 4).map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt={`${vendor.business_name} ${index + 2}`} className="h-40 w-full rounded-[1.5rem] object-cover" />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[1.75rem] bg-warm-50 p-6">
            <h2 className="font-display text-2xl font-semibold text-gray-900">Visit details</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-gray-600">
              <p className="flex gap-3"><FiMapPin className="mt-1 shrink-0 text-primary-500" /> {vendor.address}</p>
              {vendor.phone && <p className="flex gap-3"><FiPhone className="mt-1 shrink-0 text-primary-500" /> {vendor.phone}</p>}
              {vendor.opening_hours && <p className="flex gap-3"><FiClock className="mt-1 shrink-0 text-primary-500" /> {vendor.opening_hours}</p>}
              {vendor.website && <p className="flex gap-3"><FiGlobe className="mt-1 shrink-0 text-primary-500" /> <a href={vendor.website} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">{vendor.website}</a></p>}
              {vendor.email && <p className="flex gap-3"><FiMail className="mt-1 shrink-0 text-primary-500" /> {vendor.email}</p>}
            </div>
            <Link to={`/experiences?search=${encodeURIComponent(vendor.business_name)}`} className="btn-primary mt-6 block w-full text-center">See hosted experiences</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
