import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCalendar, FiCheckCircle, FiClock, FiMapPin, FiTag, FiUsers } from 'react-icons/fi';
import { experienceAPI, reviewAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { LoadingSpinner } from '../components/UI';
import { getAvatarPlaceholder, getExperienceFallback, resolveMediaUrl } from '../utils/media';

const splitLines = (value = '') => value.split(/\n|•|-/).map((line) => line.trim()).filter(Boolean);

export default function ExperienceDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, isTourist } = useAuth();
  const [experience, setExperience] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    Promise.all([
      experienceAPI.detail(id),
      reviewAPI.forExperience(id).catch(() => ({ data: { results: [] } })),
    ])
      .then(([experienceRes, reviewRes]) => {
        setExperience(experienceRes.data);
        setReviews(reviewRes.data.results || reviewRes.data || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const gallery = useMemo(() => {
    if (!experience) return [];
    const items = [experience.image, ...(experience.images || []).map((item) => item.image)]
      .map((item) => resolveMediaUrl(item))
      .filter(Boolean);
    return items.length ? items : [getExperienceFallback(experience)];
  }, [experience]);

  if (loading) return <LoadingSpinner />;
  if (!experience) return <div className="page-container py-20 text-center"><h2 className="text-xl">Experience not found</h2></div>;

  const includedItems = splitLines(experience.what_included);
  const bringItems = splitLines(experience.what_to_bring);

  return (
    <div className="page-container">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-warm-200/60">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[340px] lg:min-h-[540px]">
            <img src={gallery[0]} alt={experience.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-primary-500/90 text-white">{experience.category_display}</span>
                {experience.is_featured && <span className="badge bg-white/20 text-white backdrop-blur">Featured</span>}
              </div>
              <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">{experience.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/85">
                <Link to={`/vendors/${experience.vendor?.id}`} className="underline-offset-4 hover:underline">Hosted by {experience.vendor?.business_name}</Link>
                {experience.avg_rating > 0 && <StarRating rating={experience.avg_rating} total={experience.total_reviews} />}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between bg-[linear-gradient(180deg,#FFF9F4_0%,#FFFFFF_100%)] p-6 md:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-500">Booking snapshot</p>
              <div className="mt-4 flex items-end gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">From</p>
                  <p className="text-4xl font-bold text-primary-600">{experience.currency} {Number(experience.price || 0).toFixed(0)}</p>
                </div>
                <p className="pb-1 text-sm text-gray-500">per person</p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/80 bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-gray-400">Duration</p><p className="mt-2 font-semibold text-gray-900">{experience.duration_hours} hours</p></div>
                <div className="rounded-2xl border border-white/80 bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-gray-400">Capacity</p><p className="mt-2 font-semibold text-gray-900">Up to {experience.capacity} guests</p></div>
                <div className="rounded-2xl border border-white/80 bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-gray-400">Start time</p><p className="mt-2 font-semibold text-gray-900">{experience.start_time || 'Flexible'}</p></div>
                <div className="rounded-2xl border border-white/80 bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-gray-400">Available spots</p><p className="mt-2 font-semibold text-accent-700">{experience.available_spots}</p></div>
              </div>

              {experience.meeting_point && (
                <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Meeting point</p>
                  <p className="mt-2 text-sm leading-7 text-gray-700">{experience.meeting_point}</p>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-3">
              {isAuthenticated && isTourist ? (
                <Link to={`/book/${experience.id}`} className="btn-primary block w-full text-center">Book now</Link>
              ) : isAuthenticated ? (
                <p className="rounded-2xl bg-white p-4 text-center text-sm text-gray-500">Only tourist accounts can book experiences.</p>
              ) : (
                <Link to="/login" className="btn-primary block w-full text-center">Sign in to book</Link>
              )}
              <Link to={`/vendors/${experience.vendor?.id}`} className="btn-secondary block w-full text-center">View vendor profile</Link>
            </div>
          </div>
        </div>
      </div>

      {gallery.length > 1 && (
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {gallery.slice(1, 4).map((image, index) => (
            <div key={`${image}-${index}`} className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white shadow-md shadow-warm-200/50">
              <img src={image} alt={`${experience.title} ${index + 2}`} className="h-56 w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex gap-1 border-b border-gray-200">
            {['about', 'details', 'reviews'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-t-2xl px-5 py-3 text-sm font-medium capitalize transition ${activeTab === tab ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab} {tab === 'reviews' ? `(${reviews.length})` : ''}
              </button>
            ))}
          </div>

          <div className="rounded-b-[1.75rem] rounded-tr-[1.75rem] bg-white p-6 shadow-lg shadow-warm-200/50 md:p-8">
            {activeTab === 'about' && (
              <div>
                <p className="text-base leading-8 text-gray-700 whitespace-pre-wrap">{experience.description}</p>
                {experience.tags?.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {experience.tags.map((tag) => (
                      <span key={tag.id} className="badge bg-primary-50 text-primary-700"><FiTag size={12} className="mr-1" /> {tag.name}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-warm-50 p-5"><h3 className="flex items-center gap-2 font-semibold text-gray-900"><FiCalendar /> Availability</h3><p className="mt-3 text-sm leading-7 text-gray-600">{experience.available_from} — {experience.available_to}</p></div>
                  {experience.meeting_point && <div className="rounded-2xl bg-warm-50 p-5"><h3 className="flex items-center gap-2 font-semibold text-gray-900"><FiMapPin /> Meeting point</h3><p className="mt-3 text-sm leading-7 text-gray-600">{experience.meeting_point}</p></div>}
                </div>
                {includedItems.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900"><FiCheckCircle /> What's included</h3>
                    <ul className="mt-4 grid gap-3 md:grid-cols-2">
                      {includedItems.map((item) => <li key={item} className="rounded-2xl border border-warm-200 bg-white px-4 py-3 text-sm text-gray-700">{item}</li>)}
                    </ul>
                  </div>
                )}
                {bringItems.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900"><FiUsers /> What to bring</h3>
                    <ul className="mt-4 grid gap-3 md:grid-cols-2">
                      {bringItems.map((item) => <li key={item} className="rounded-2xl border border-warm-200 bg-white px-4 py-3 text-sm text-gray-700">{item}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-gray-500">No reviews yet. Be the first to leave one.</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="rounded-[1.5rem] border border-warm-200 bg-warm-50 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-3">
                          <img src={resolveMediaUrl(review.tourist?.profile_image) || getAvatarPlaceholder(review.tourist?.display_name || 'Tourist')} alt="" className="h-12 w-12 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold text-gray-900">{review.tourist?.display_name || 'Tourist'}</p>
                            <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} size={14} showValue={false} />
                      </div>
                      {review.title && <p className="mt-4 font-medium text-gray-900">{review.title}</p>}
                      <p className="mt-2 text-sm leading-7 text-gray-600">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-white p-6 shadow-lg shadow-warm-200/50">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-500">Hosted by</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-gray-900">{experience.vendor?.business_name}</h2>
          <p className="mt-3 text-sm leading-7 text-gray-600">{experience.vendor?.address}</p>
          <div className="mt-6 grid gap-3 text-sm text-gray-600">
            <div className="rounded-2xl bg-warm-50 p-4"><FiMapPin className="mb-2 text-primary-500" /> {experience.vendor?.cuisine_type_display || 'Local host'}</div>
            <div className="rounded-2xl bg-warm-50 p-4"><FiClock className="mb-2 text-primary-500" /> {experience.vendor?.avg_rating > 0 ? `${experience.vendor.avg_rating.toFixed(1)} average host rating` : 'Freshly curated host profile'}</div>
          </div>
          <Link to={`/vendors/${experience.vendor?.id}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700">Go to vendor profile</Link>
        </div>
      </div>
    </div>
  );
}
