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

  const buttonBase = "cursor-pointer transition-all duration-300 ease-in-out rounded-lg px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#116466]";

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-8 max-w-full flex flex-wrap items-center gap-4 justify-between">
      <div className="flex items-center gap-4 flex-wrap max-w-[75%]">
        {/* Danh mục */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-[#116466] font-medium">Danh mục:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-gray-300 p-2 text-sm focus:border-[#116466] focus:ring-2 focus:ring-[#116466] focus:outline-none"
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
          <span className="text-[#116466] font-medium">Giá:</span>
          <select
            value={`${filterPriceMin}-${filterPriceMax}`}
            onChange={(e) => {
              const [min, max] = e.target.value.split('-').map(Number);
              setFilterPriceMin(min);
              setFilterPriceMax(max);
            }}
            className="rounded-lg border border-gray-300 p-2 text-sm focus:border-[#116466] focus:ring-2 focus:ring-[#116466] focus:outline-none"
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
          <span className="text-[#116466] font-medium">Đánh giá:</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(Number(e.target.value))}
            className="rounded-lg border border-gray-300 p-2 text-sm focus:border-[#116466] focus:ring-2 focus:ring-[#116466] focus:outline-none"
          >
            <option value={0}>Tất cả</option>
            {[5, 4, 3, 2, 1].map(star => (
              <option key={star} value={star}>
                {star} sao trở lên
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Nút xóa bộ lọc */}
      <button
        onClick={handleClearFilters}
        className={`${buttonBase} bg-[#116466] text-white hover:bg-[#0a4b4d] shadow-md`}
      >
        Xóa bộ lọc
      </button>
    </div>
  );
}
