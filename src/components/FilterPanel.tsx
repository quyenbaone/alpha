import { Search } from 'lucide-react';
import { useState } from 'react';
import { useEquipmentStore } from '../store/equipmentStore';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterPanel({ isOpen, onClose }: FilterPanelProps) {
  const { setFilters } = useEquipmentStore();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [location, setLocation] = useState('');

  const handleApplyFilters = () => {
    setFilters({
      priceRange: priceRange[0] === 0 && priceRange[1] === 1000000 ? null : priceRange,
      location: location.trim() || null,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
        <h2 className="text-xl font-semibold mb-6">Bộ lọc tìm kiếm</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoảng giá (VND)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Math.max(0, Number(e.target.value)), priceRange[1]])}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Giá tối thiểu"
              />
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Math.max(priceRange[0], Number(e.target.value))])}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Giá tối đa"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa điểm
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg"
                placeholder="Nhập địa điểm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Hủy
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}