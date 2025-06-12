import { ChevronDown } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: 1,
    name: 'Máy ảnh',
    slug: 'cameras',
    subcategories: [
      { id: 11, name: 'Máy ảnh DSLR', slug: 'dslr-cameras' },
      { id: 12, name: 'Máy ảnh Mirrorless', slug: 'mirrorless-cameras' },
      { id: 13, name: 'Máy ảnh Compact', slug: 'compact-cameras' },
    ],
  },
  {
    id: 2,
    name: 'Ống kính',
    slug: 'lenses',
    subcategories: [
      { id: 21, name: 'Ống kính Canon', slug: 'canon-lenses' },
      { id: 22, name: 'Ống kính Nikon', slug: 'nikon-lenses' },
      { id: 23, name: 'Ống kính Sony', slug: 'sony-lenses' },
    ],
  },
  {
    id: 3,
    name: 'Âm thanh',
    slug: 'audio',
    subcategories: [
      { id: 31, name: 'Microphone', slug: 'microphones' },
      { id: 32, name: 'Bộ khuếch đại', slug: 'amplifiers' },
      { id: 33, name: 'Loa', slug: 'speakers' },
    ],
  },
  {
    id: 4,
    name: 'Ánh sáng',
    slug: 'lighting',
    subcategories: [
      { id: 41, name: 'Đèn LED', slug: 'led-lights' },
      { id: 42, name: 'Đèn Flash', slug: 'flash-lights' },
      { id: 43, name: 'Phụ kiện ánh sáng', slug: 'lighting-accessories' },
    ],
  },
  {
    id: 5,
    name: 'Phụ kiện',
    slug: 'accessories',
    subcategories: [
      { id: 51, name: 'Tripod', slug: 'tripods' },
      { id: 52, name: 'Gimbal', slug: 'gimbals' },
      { id: 53, name: 'Bộ lọc', slug: 'filters' },
    ],
  },
];

export function CategoryNav() {
  const [activeCategory, setActiveCategory] = React.useState<number | null>(null);

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-8 overflow-x-auto py-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative group"
              onMouseEnter={() => setActiveCategory(category.id)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <button className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-orange-500 py-2">
                <span>{category.name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* Dropdown */}
              {activeCategory === category.id && (
                <div className="absolute top-full left-0 w-48 dropdown-menu">
                  {category.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.id}
                      to={`/categories/${category.slug}/${subcategory.slug}`}
                      className="dropdown-item"
                    >
                      {subcategory.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}