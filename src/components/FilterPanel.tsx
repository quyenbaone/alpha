import React, { useState, useEffect } from 'react';
import { Filter, X, Search } from 'lucide-react';
import { useEquipmentStore } from '../store/equipmentStore';
import { LoadingSpinner } from './LoadingSpinner';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterPanel({ isOpen, onClose }: FilterPanelProps) {
  const { setFilters, filters: currentFilters } = useEquipmentStore();
  const [priceRange, setPriceRange] = useState<[number, number]>(currentFilters.priceRange || [0, 1000]);
  const [location, setLocation] = useState(currentFilters.location || '');
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset filters to current values when panel opens
      setPriceRange(currentFilters.priceRange || [0, 1000]);
      setLocation(currentFilters.location || '');
    }
  }, [isOpen, currentFilters]);

  const handleApplyFilters = async () => {
    setIsApplying(true);
    try {
      await setFilters({
        priceRange: priceRange[0] === 0 && priceRange[1] === 1000 ? null : priceRange,
        location: location.trim() || null,
      });
      onClose();
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleClearFilters = async () => {
    setIsApplying(true);
    try {
      setPriceRange([0, 1000]);
      setLocation('');
      await setFilters({
        priceRange: null,
        location: null,
      });
      onClose();
    } catch (error) {
      console.error('Error clearing filters:', error);
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc tìm kiếm
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoảng giá
            </label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Math.max(0, Number(e.target.value)), priceRange[1]])}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Giá tối thiểu"
                  min="0"
                />
                <span className="text-gray-500">đến</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Math.max(priceRange[0], Number(e.target.value))])}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Giá tối đa"
                  min={priceRange[0]}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa điểm
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Nhập địa điểm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>

          {/* Quick Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lọc nhanh
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Dưới 500K/ngày', range: [0, 500000] },
                { label: '500K - 2M/ngày', range: [500000, 2000000] },
                { label: 'Trên 2M/ngày', range: [2000000, 10000000] }
              ].map(({ label, range }) => (
                <button
                  key={label}
                  onClick={() => setPriceRange(range as [number, number])}
                  className={`px-3 py-1 rounded-full border transition-all ${
                    priceRange[0] === range[0] && priceRange[1] === range[1]
                      ? 'bg-orange-50 border-orange-500 text-orange-700'
                      : 'hover:bg-orange-50 hover:border-orange-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={handleClearFilters}
            disabled={isApplying}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
          >
            Xóa bộ lọc
          </button>
          <button
            onClick={handleApplyFilters}
            disabled={isApplying}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isApplying ? (
              <>
                <LoadingSpinner size="sm" />
                Đang áp dụng...
              </>
            ) : (
              'Áp dụng'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}