import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCalendar, FiMapPin, FiSearch, FiStar, FiUsers } from 'react-icons/fi';
import { experienceAPI, vendorAPI } from '../utils/api';
import ExperienceCard from '../components/ExperienceCard';
import { LoadingSpinner } from '../components/UI';
import { getExperienceFallback, resolveMediaUrl } from '../utils/media';

const CUISINE_ICONS = {
  local: '🍛', chinese: '🥟', malay: '🍚', indian: '🍛', peranakan: '🦐',
  seafood: '🦀', street_food: '🍢', hawker: '🍜', fine_dining: '🍽️',
  cafe: '☕', bakery: '🧁', vegetarian: '🥗', fusion: '🍱', thai: '🍲',
  japanese: '🍣', korean: '🥘', western: '🍔', other: '🍴',
};

const NEIGHBORHOODS = [
  { title: 'Chinatown', query: 'Chinatown', note: 'Heritage lanes, dim sum, roast meats, and dessert stops.' },
  { title: 'Little India', query: 'Little India', note: 'Spice trails, banana leaf feasts, and cooking classes.' },
  { title: 'Katong', query: 'Katong', note: 'Peranakan favourites, shophouse charm, and pastry finds.' },
  { title: 'Kampong Glam', query: 'Kampong Glam', note: 'Malay classics, café culture, and evening food walks.' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      experienceAPI.featured().catch(() => ({ data: [] })),
      vendorAPI.cuisineTypes().catch(() => ({ data: [] })),
    ])
      .then(([featuredRes, cuisinesRes]) => {
        setFeatured(featuredRes.data || []);
        setCuisines(cuisinesRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const showcaseCards = useMemo(() => {
    const fallbacks = [
      { id: 'discover-1', title: 'Morning Hawker Trail', vendor_name: 'TasteLocal', category_display: 'Food Tour' },
      { id: 'discover-2', title: 'Tea & Pastry Ritual', vendor_name: 'TasteLocal', category_display: 'Tasting Menu' },
      { id: 'discover-3', title: 'Night Market Bites', vendor_name: 'TasteLocal', category_display: 'Street Food' },
    ];
    return [...featured, ...fallbacks].slice(0, 3);
  }, [featured]);

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/experiences${searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : ''}`);
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.15),_transparent_32%),linear-gradient(135deg,#933A15_0%,#EE7A1B_42%,#F19340_100%)] text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(115deg, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.02) 42%, transparent 60%)' }} />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
              Singapore food tourism, reimagined
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] md:text-7xl">
              Find the stories behind every bite.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-primary-50 md:text-xl">
              TasteLocal helps travelers discover trusted local food hosts, book rich cultural experiences, and explore Singapore through neighbourhood-driven dining moments.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex max-w-2xl flex-col gap-3 rounded-[1.5rem] bg-white/12 p-3 shadow-2xl shadow-black/20 backdrop-blur md:flex-row">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search hawker walks, tea tastings, Peranakan classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-white px-12 py-4 text-base text-gray-900 shadow-lg outline-none ring-0 placeholder:text-gray-400"
                />
              </div>
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent-500 px-6 py-4 font-semibold text-white transition hover:bg-accent-600">
                Explore now <FiArrowRight />
              </button>
            </form>

            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-4 text-sm text-white/90 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><FiMapPin className="mb-2" /> 22+ local vendors</div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><FiStar className="mb-2" /> Highly rated itineraries</div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><FiCalendar className="mb-2" /> Instant booking flow</div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><FiUsers className="mb-2" /> Tourist + vendor friendly</div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:grid-rows-2 lg:pl-6">
            {showcaseCards.map((item, index) => {
              const imageUrl = resolveMediaUrl(item.image) || getExperienceFallback(item);
              return (
                <div
                  key={item.id}
                  className={`relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur ${index === 0 ? 'sm:col-span-2 sm:h-[320px]' : 'h-[220px]'}`}
                >
                  <img src={imageUrl} alt={item.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/75">{item.category_display || 'Experience'}</p>
                    <h3 className="mt-2 font-display text-2xl font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-white/80">{item.vendor_name || 'TasteLocal host'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-warm-200 bg-white py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {cuisines.slice(0, 12).map(([value, label]) => (
              <Link
                key={value}
                to={`/experiences?cuisine=${value}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
              >
                <span>{CUISINE_ICONS[value] || '🍴'}</span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-500">Featured now</p>
            <h2 className="section-title mt-2">Curated experiences with stronger visual storytelling</h2>
            <p className="mt-3 max-w-2xl text-gray-500">Each card now highlights richer tags, image-led presentation, and vendor context to make browsing feel closer to a travel magazine than a listing board.</p>
          </div>
          <Link to="/experiences" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700">
            See all experiences <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.slice(0, 8).map((experience) => <ExperienceCard key={experience.id} experience={experience} />)}
          </div>
        )}
      </section>

      <section className="bg-warm-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-500">Explore by area</p>
              <h2 className="section-title mt-2">Neighbourhood-led discovery feels more local</h2>
            </div>
            <Link to="/map" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700">Open the food map <FiArrowRight /></Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {NEIGHBORHOODS.map((spot) => (
              <Link key={spot.title} to={`/experiences?search=${encodeURIComponent(spot.query)}`} className="rounded-[1.5rem] border border-white/70 bg-white p-6 shadow-md shadow-warm-200/60 transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-xl">📍</div>
                <h3 className="mt-5 font-display text-2xl font-semibold text-gray-900">{spot.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">{spot.note}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-600">Browse area <FiArrowRight /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-accent-700 via-accent-600 to-primary-600 py-16 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl font-bold">Ready to turn seed data into a richer food journey?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">
            The upgraded dataset now supports stronger imagery, better map-ready vendor records, and more compelling experience presentation for tourists and hosts.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/experiences" className="rounded-2xl bg-white px-6 py-3 font-semibold text-accent-700 transition hover:bg-accent-50">Browse experiences</Link>
            <Link to="/register" className="rounded-2xl border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10">Join as a vendor</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
