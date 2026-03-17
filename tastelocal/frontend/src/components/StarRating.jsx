import { FiStar } from 'react-icons/fi';

export default function StarRating({ rating, size = 16, showValue = true, total = null }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    stars.push(
      <FiStar
        key={i}
        size={size}
        className={i < fullStars ? 'text-yellow-400 fill-yellow-400' : (i === fullStars && hasHalf) ? 'text-yellow-400 fill-yellow-200' : 'text-gray-300'}
      />
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      {showValue && <span className="text-sm font-semibold text-gray-700 ml-1">{Number(rating).toFixed(1)}</span>}
      {total !== null && <span className="text-sm text-gray-500">({total})</span>}
    </div>
  );
}
