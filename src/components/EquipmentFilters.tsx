import { Star } from 'lucide-react';

interface Category {
  value: string;
  label: string;
}

interface EquipmentFiltersProps {
  categories: Category[];
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  filterPriceMin: number;
  filterPriceMax: number;
  setFilterPriceMin: (value: number) => void;
  setFilterPriceMax: (value: number) => void;
  ratingFilter: number;
  setRatingFilter: (value: number) => void;
}

const PRICE_RANGES = [
  { label: 'Tất cả giá', min: 0, max: 10000000 },
  { label: 'Dưới 200.000đ', min: 0, max: 200000 },
  { label: '200.000đ - 600.000đ', min: 200000, max: 600000 },
  { label: '600.000đ - 1.000.000đ', min: 600000, max: 1000000 },
  { label: '1.000.000đ - 2.000.000đ', min: 1000000, max: 2000000 },
  { label: 'Trên 2.000.000đ', min: 2000000, max: 10000000 },
];

export function EquipmentFilters({
  categories,
  filterCategory,
  setFilterCategory,
  filterPriceMin,
  filterPriceMax,
  setFilterPriceMin,
  setFilterPriceMax,
  ratingFilter,
  setRatingFilter,
}: EquipmentFiltersProps) {
  const currentPriceRange = PRICE_RANGES.find(
    range => range.min === filterPriceMin && range.max === filterPriceMax
  ) || PRICE_RANGES[0];

  const handleClearFilters = () => {
    setFilterCategory('all');
    setFilterPriceMin(0);
    setFilterPriceMax(10000000);
    setRatingFilter(0);
  };

  return (
    <div className="p-4 bg-[#f5f7f8] rounded-lg shadow-lg">
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-white shadow-sm">
        {/* Danh mục */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <label className="text-gray-800 font-semibold">Danh mục:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white text-gray-900 rounded px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Khoảng giá */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <label className="text-gray-800 font-semibold">Giá:</label>
          <select
            value={`${filterPriceMin}-${filterPriceMax}`}
            onChange={(e) => {
              const [min, max] = e.target.value.split('-').map(Number);
              setFilterPriceMin(min);
              setFilterPriceMax(max);
            }}
            className="bg-white text-gray-900 rounded px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {PRICE_RANGES.map(range => (
              <option key={`${range.min}-${range.max}`} value={`${range.min}-${range.max}`}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Đánh giá */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <label className="text-gray-800 font-semibold">Đánh giá:</label>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(Number(e.target.value))}
            className="bg-white text-gray-900 rounded px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={0}>Tất cả</option>
            {[5, 4, 3, 2, 1].map(star => (
              <option key={star} value={star}>
                {star} sao trở lên
              </option>
            ))}
          </select>
        </div>

        {/* Nút xóa bộ lọc */}
        <button
          onClick={handleClearFilters}
          className="ml-auto bg-white text-gray-800 rounded-lg px-4 py-2 border border-gray-300 hover:bg-indigo-600 hover:text-white transition-colors"
        >
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
}
