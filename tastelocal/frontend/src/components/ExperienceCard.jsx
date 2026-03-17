import { Link } from 'react-router-dom';
import { FiClock, FiUsers, FiArrowRight } from 'react-icons/fi';
import StarRating from './StarRating';
import { getExperienceFallback, resolveMediaUrl } from '../utils/media';

export default function ExperienceCard({ experience }) {
  const imageUrl = resolveMediaUrl(experience.image) || getExperienceFallback(experience);

  return (
    <Link
      to={`/experiences/${experience.id}`}
      className="group overflow-hidden rounded-[1.5rem] border border-white/70 bg-white shadow-md shadow-warm-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={experience.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {experience.is_featured && <span className="badge bg-white/20 text-white backdrop-blur">Featured</span>}
          <span className="badge bg-primary-500/90 text-white backdrop-blur">{experience.category_display || experience.category}</span>
        </div>
        <div className="absolute inset-x-4 bottom-4">
          <p className="text-xs uppercase tracking-[0.22em] text-white/80">Hosted by {experience.vendor_name}</p>
          <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-white line-clamp-2">
            {experience.title}
          </h3>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warm-50 px-3 py-1.5"><FiClock size={14} /> {experience.duration_hours}h</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warm-50 px-3 py-1.5"><FiUsers size={14} /> Up to {experience.capacity}</span>
        </div>

        {experience.avg_rating > 0 && (
          <StarRating rating={experience.avg_rating} size={14} total={experience.total_reviews} />
        )}

        {experience.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {experience.tags.slice(0, 3).map((tag) => (
              <span key={tag.id || tag.slug || tag.name} className="badge bg-primary-50 text-primary-700">
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end justify-between border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gray-400">From</p>
            <p className="text-2xl font-bold text-primary-600">
              {experience.currency || 'SGD'} {Number(experience.price || 0).toFixed(0)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 font-medium text-primary-600">
            Explore <FiArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
