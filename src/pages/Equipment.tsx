import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

type Equipment = Database['public']['Tables']['equipment']['Row'];

export function Equipment() {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'price' | 'title'>('price');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('equipment')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setEquipment(data || []);
        } catch (err) {
            console.error('Error fetching equipment:', err);
            setError('Không thể tải danh sách thiết bị. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const filteredEquipment = equipment
        .filter((item) => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === 'price') {
                return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
            }
            return sortOrder === 'asc'
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
        });

    const categories = ['all', ...new Set(equipment.map((item) => item.category))];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-900">Đang tải...</h2>
                    <p className="mt-2 text-gray-600">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-red-600">Đã xảy ra lỗi</h2>
                    <p className="mt-2 text-gray-600">{error}</p>
                    <button
                        onClick={fetchEquipment}
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Danh sách thiết bị</h1>

                {/* Search and Filter Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm thiết bị..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'Tất cả danh mục' : category}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'price' | 'title')}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="price">Giá</option>
                            <option value="title">Tên</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>

                {/* Equipment Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEquipment.map((item) => (
                        <Link
                            key={item.id}
                            to={`/equipment/${item.id}`}
                            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                        >
                            <div className="aspect-w-16 aspect-h-9">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="object-cover rounded-t-lg w-full h-48"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-orange-500 font-semibold">
                                        {item.price.toLocaleString('vi-VN')}đ/ngày
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {item.rating > 0 ? `${item.rating}⭐ (${item.reviews})` : 'Chưa có đánh giá'}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredEquipment.length === 0 && (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900">Không tìm thấy thiết bị</h3>
                        <p className="mt-2 text-gray-600">
                            Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 