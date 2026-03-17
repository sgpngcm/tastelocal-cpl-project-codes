import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiSearch, FiSliders, FiX } from 'react-icons/fi';
import { experienceAPI, vendorAPI } from '../utils/api';
import ExperienceCard from '../components/ExperienceCard';
import { EmptyState, LoadingSpinner } from '../components/UI';

export default function ExperienceListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [experiences, setExperiences] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    cuisine: searchParams.get('cuisine') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    min_rating: searchParams.get('min_rating') || '',
    sort: searchParams.get('sort') || '-created_at',
  });

  useEffect(() => {
    Promise.all([
      vendorAPI.cuisineTypes().catch(() => ({ data: [] })),
      experienceAPI.categories().catch(() => ({ data: [] })),
    ]).then(([cuisineRes, categoryRes]) => {
      setCuisines(cuisineRes.data || []);
      setCategories(categoryRes.data || []);
    });
  }, []);

  const fetchExperiences = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const response = await experienceAPI.list(params);
      setExperiences(response.data.results || response.data || []);
      setSearchParams(params);
    } catch {
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.sort, filters.cuisine, filters.category]);

  const activeFilterCount = useMemo(
    () => ['search', 'cuisine', 'category', 'min_price', 'max_price', 'min_rating'].filter((key) => filters[key]).length,
    [filters]
  );

  const clearFilters = () => {
    const nextFilters = {
      search: '', cuisine: '', category: '', min_price: '', max_price: '', min_rating: '', sort: '-created_at',
    };
    setFilters(nextFilters);
    setSearchParams({});
    fetchExperiences(nextFilters);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    fetchExperiences(filters);
  };

  return (
    <div className="page-container">
      <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-warm-200/60 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-500">Discover</p>
            <h1 className="section-title mt-2">Food experiences with stronger browsing cues</h1>
            <p className="mt-3 max-w-3xl text-gray-500">The listings now surface richer tags, bolder imagery, and cleaner filter controls so users can move from casual inspiration to booking faster.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-warm-100 px-4 py-2 text-sm font-medium text-gray-600">
            <FiSliders /> {loading ? 'Refreshing results…' : `${experiences.length} experience${experiences.length === 1 ? '' : 's'} shown`}
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors, cuisines, experiences, or neighbourhoods"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="input-field pl-11"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Search</button>
            <button type="button" onClick={() => setShowFilters((prev) => !prev)} className="btn-secondary inline-flex items-center gap-2">
              <FiFilter /> Filters {activeFilterCount > 0 && <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1 text-xs text-white">{activeFilterCount}</span>}
            </button>
          </div>
        </form>
      </div>

      {showFilters && (
        <div className="mt-6 rounded-[1.75rem] border border-white/70 bg-white p-6 shadow-lg shadow-warm-200/50 animate-fade-in-up">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Cuisine</label>
              <select value={filters.cuisine} onChange={(e) => setFilters((prev) => ({ ...prev, cuisine: e.target.value }))} className="input-field">
                <option value="">All cuisines</option>
                {cuisines.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select value={filters.category} onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))} className="input-field">
                <option value="">All categories</option>
                {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Price range (SGD)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={filters.min_price} onChange={(e) => setFilters((prev) => ({ ...prev, min_price: e.target.value }))} className="input-field" />
                <input type="number" placeholder="Max" value={filters.max_price} onChange={(e) => setFilters((prev) => ({ ...prev, max_price: e.target.value }))} className="input-field" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sort by</label>
              <select value={filters.sort} onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))} className="input-field">
                <option value="-created_at">Newest</option>
                <option value="price_low">Price: low to high</option>
                <option value="price_high">Price: high to low</option>
                <option value="rating">Highest rated</option>
                <option value="popular">Most popular</option>
              </select>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.search && <span className="badge bg-primary-50 text-primary-700">Search: {filters.search}</span>}
              {filters.cuisine && <span className="badge bg-primary-50 text-primary-700">Cuisine: {filters.cuisine.replace('_', ' ')}</span>}
              {filters.category && <span className="badge bg-primary-50 text-primary-700">Category: {filters.category.replace('_', ' ')}</span>}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-primary-700"><FiX /> Clear all</button>
              <button type="button" onClick={() => fetchExperiences(filters)} className="btn-primary text-sm !py-2">Apply filters</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <LoadingSpinner />
        ) : experiences.length === 0 ? (
          <EmptyState icon="🍽️" title="No experiences found" description="Try broadening your search or removing a few filters." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {experiences.map((experience) => <ExperienceCard key={experience.id} experience={experience} />)}
          </div>
        )}
      </div>
    </div>
  );
}
