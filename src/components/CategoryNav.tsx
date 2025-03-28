import React from 'react';
import { Camera, Speaker, Tent, Ship } from 'lucide-react';
import { useEquipmentStore } from '../store/equipmentStore';

export function CategoryNav() {
  const setFilters = useEquipmentStore((state) => state.setFilters);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const categories = [
    { name: 'Thiết bị chụp ảnh', icon: Camera, value: 'Photography' },
    { name: 'Thiết bị âm thanh', icon: Speaker, value: 'Audio Equipment' },
    { name: 'Đồ cắm trại', icon: Tent, value: 'Camping Gear' },
    { name: 'Thiết bị SUP', icon: Ship, value: 'SUP Equipment' },
  ];

  const handleCategoryClick = (value: string) => {
    if (activeCategory === value) {
      setActiveCategory(null);
      setFilters({ category: null });
    } else {
      setActiveCategory(value);
      setFilters({ category: value });
    }
  };

  return (
    <div className="py-3 flex gap-6 text-sm overflow-x-auto scrollbar-hide">
      {categories.map(({ name, icon: Icon, value }) => (
        <button
          key={value}
          onClick={() => handleCategoryClick(value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
            activeCategory === value
              ? 'bg-orange-500 text-white shadow-lg scale-105'
              : 'hover:bg-orange-100 hover:text-orange-500'
          }`}
        >
          <Icon className={`h-4 w-4 transition-transform duration-300 ${
            activeCategory === value ? 'rotate-12' : ''
          }`} />
          <span className="relative">
            {name}
            {activeCategory === value && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded animate-pulse" />
            )}
          </span>
        </button>
      ))}
    </div>
  );
}