import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Equipment = {
    id: string
    title: string
    description: string | null
    price_per_day: number
    category_id: string
    images: string[]
    location: string
    owner_id: string
    rating: number
    reviews: number
    deposit_amount: number
    created_at: string
    condition: string
    available_quantity: number
    tags: string[]
    status: string
    category?: {
        name: string
    }
};

// Skeleton component for loading state
const EquipmentSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-4">
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    ))}
                </div>
                <div className="flex justify-between items-center">
                    <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        </div>
    );
};

export function Equipment() {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'price' | 'title' | 'rating' | 'newest'>('price');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
    const [showFilters, setShowFilters] = useState(false);
    const [ratingFilter, setRatingFilter] = useState(0);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [categories, setCategories] = useState([
        { value: 'all', label: 'Tất cả danh mục' }
    ]);

    // Search suggestions
    const searchSuggestions = [
        "Máy ảnh", "Máy quay phim", "Drone", "Tripod", "Máy chiếu", "Đèn studio"
    ];
    const [showSuggestions, setShowSuggestions] = useState(false);

    const location = useLocation();
    const [searchParams] = useSearchParams();

    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const sortDropdownRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close category dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setShowCategoryDropdown(false);
            }
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setShowSortDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [categoryDropdownRef, sortDropdownRef]);

    // Define sort options
    const sortOptions = [
        { value: 'price', label: 'Sắp xếp theo: Giá' },
        { value: 'title', label: 'Sắp xếp theo: Tên' },
        { value: 'rating', label: 'Sắp xếp theo: Đánh giá' },
        { value: 'newest', label: 'Sắp xếp theo: Mới nhất' },
    ];

    // Fetch categories from database
    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            // Use any type to bypass TypeScript limitations
            const categoryData = (data as any[]) || [];

            const categoryOptions = [
                { value: 'all', label: 'Tất cả danh mục' },
                ...categoryData.map(cat => ({
                    value: cat.id,
                    label: cat.name
                }))
            ];

            setCategories(categoryOptions);
            // Categories loaded successfully
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            setError(null); // Reset error state before fetching

            // Simulate search loading for demo
            if (searchTerm) {
                setSearching(true);
            }

            const { data, error } = await supabase
                .from('equipment')
                .select(`
                    *,
                    category:category_id (
                        name
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching equipment:', error);
                throw error;
            }

            // Use any type to bypass TypeScript limitations
            const equipmentData = (data as any[]) || [];
            setEquipment(equipmentData as Equipment[]);

            // Set initial price range based on actual data
            if (equipmentData.length > 0) {
                const prices = equipmentData.map(item => item.price_per_day);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                setPriceRange([minPrice, maxPrice]);
            }
        } catch (err) {
            console.error('Error fetching equipment:', err);
            setError('Không thể tải danh sách thiết bị. Vui lòng thử lại sau.');
            setEquipment([]); // Reset equipment data on error
        } finally {
            setLoading(false);
            // End search loading after delay for better UX
            if (searchTerm) {
                setTimeout(() => setSearching(false), 500);
            }
        }
    };

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only refetch if we already have initial data
            if (!loading && equipment.length > 0) {
                setSearching(true);
                // Simulate API call delay
                setTimeout(() => {
                    setSearching(false);
                }, 500);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch data on component mount
    useEffect(() => {
        fetchCategories();
        fetchEquipment();
    }, []);

    // Handle key press events for search input
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setSearchTerm('');
            searchInputRef.current?.blur();
            setShowSuggestions(false);
        } else if (e.key === 'Enter') {
            searchInputRef.current?.blur();
            setShowSuggestions(false);
        }
    };

    // Apply category filter from URL parameters when categories are loaded
    useEffect(() => {
        const categoryParam = searchParams.get('category');

        if (categoryParam && categories.length > 1) {
            // Check if the category exists in our options
            const categoryOption = categories.find(cat =>
                cat.value === categoryParam ||
                cat.label === categoryParam
            );

            if (categoryOption) {
                setSelectedCategory(categoryOption.value);
            } else {
                // If not found by exact match, try to find a partial match
                const partialMatch = categories.find(cat =>
                    cat.label.toLowerCase().includes(categoryParam.toLowerCase())
                );

                if (partialMatch) {
                    setSelectedCategory(partialMatch.value);
                }
            }
        }
    }, [searchParams, categories]);

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setRatingFilter(0);
        if (equipment.length > 0) {
            const prices = equipment.map(item => item.price_per_day);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            setPriceRange([minPrice, maxPrice]);
        }
    };

    const filteredEquipment = equipment
        .filter((item) => {
            // Text search
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

            // Category filter
            const matchesCategory = selectedCategory === 'all' ||
                (item.category?.name === selectedCategory) ||
                (item.category_id === selectedCategory);

            // Price range filter
            const matchesPrice = item.price_per_day >= priceRange[0] && item.price_per_day <= priceRange[1];

            // Rating filter
            const matchesRating = (item.rating || 0) >= ratingFilter;

            return matchesSearch && matchesCategory && matchesPrice && matchesRating;
        })
        .sort((a, b) => {
            if (sortBy === 'price') {
                return sortOrder === 'asc' ? a.price_per_day - b.price_per_day : b.price_per_day - a.price_per_day;
            } else if (sortBy === 'rating') {
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
            } else if (sortBy === 'newest') {
                const dateA = new Date(a.created_at || '').getTime();
                const dateB = new Date(b.created_at || '').getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
            return sortOrder === 'asc'
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
        });

    // Scroll to top of results when filters change
    useEffect(() => {
        if (contentRef.current && !loading) {
            contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedCategory, searchTerm, priceRange, ratingFilter, loading]);

    // Add error boundary
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-semibold text-red-600">Đã xảy ra lỗi</h2>
                    <p className="mt-2 text-gray-600">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            fetchEquipment();
                        }}
                        className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // Show loading state
    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 py-10">
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
                            <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                            <div className="md:col-span-7">
                                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="md:col-span-3">
                                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="md:col-span-2 flex gap-2">
                                <div className="h-10 flex-1 bg-gray-200 rounded-lg animate-pulse"></div>
                                <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array(8).fill(0).map((_, index) => (
                                <EquipmentSkeleton key={index} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen relative">
            <div className="container mx-auto px-4 py-10">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8" ref={contentRef}>
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                            <svg className="w-8 h-8 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                            Danh sách thiết bị
                        </h1>
                        <div className="flex items-center space-x-4">
                            <div className="flex border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/60 dark:text-orange-300' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    aria-label="Grid view"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/60 dark:text-orange-300' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    aria-label="List view"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center px-3 py-1.5 border border-orange-500 rounded-lg text-orange-600 dark:text-orange-400 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors text-sm"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                            </button>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                {filteredEquipment.length} {filteredEquipment.length === 1 ? 'thiết bị' : 'thiết bị'}
                            </span>
                        </div>
                    </div>

                    {/* Control group with unified styling */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                            {/* Enhanced Search box */}
                            <div className="md:col-span-5 relative">
                                <label htmlFor="search-equipment" className="sr-only">Tìm kiếm thiết bị</label>
                                <div className="relative">
                                    <input
                                        id="search-equipment"
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Tìm kiếm thiết bị..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            if (e.target.value) setShowSuggestions(true);
                                        }}
                                        onFocus={() => {
                                            if (searchTerm) setShowSuggestions(true);
                                        }}
                                        onBlur={() => {
                                            // Delayed to allow clicking on suggestions
                                            setTimeout(() => setShowSuggestions(false), 200);
                                        }}
                                        onKeyDown={handleSearchKeyDown}
                                        aria-label="Tìm kiếm thiết bị"
                                        aria-describedby="search-description"
                                        className="
                                            pl-11 pr-10 w-full 
                                            py-3 md:py-3 
                                            border border-gray-300 dark:border-gray-700
                                            rounded-lg
                                            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                                            text-sm shadow-sm
                                            bg-white dark:bg-gray-800
                                            text-gray-900 dark:text-white
                                            placeholder-gray-500 dark:placeholder-gray-400
                                            transition-all
                                        "
                                    />
                                    <span id="search-description" className="sr-only">
                                        Nhập từ khóa để tìm kiếm thiết bị. Nhấn Enter để tìm kiếm, Esc để xóa.
                                    </span>

                                    {/* Search icon with improved visibility */}
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                                        <svg
                                            className="h-5 w-5 text-orange-500 dark:text-gray-300"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>

                                    {/* Loading spinner */}
                                    {searching && (
                                        <div className="absolute inset-y-0 right-8 flex items-center">
                                            <svg
                                                className="animate-spin h-4 w-4 text-orange-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                        </div>
                                    )}

                                    {/* Clear button */}
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            onClick={() => {
                                                setSearchTerm('');
                                                searchInputRef.current?.focus();
                                            }}
                                            aria-label="Xóa tìm kiếm"
                                        >
                                            <svg
                                                className="h-4 w-4 text-gray-500 dark:text-gray-400"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    )}

                                    {/* Search suggestions */}
                                    {showSuggestions && searchTerm && (
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto">
                                            {searchSuggestions
                                                .filter(suggestion =>
                                                    suggestion.toLowerCase().includes(searchTerm.toLowerCase())
                                                )
                                                .map((suggestion, index) => (
                                                    <div
                                                        key={index}
                                                        className="px-4 py-2 hover:bg-orange-50 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-800 dark:text-gray-200"
                                                        onClick={() => {
                                                            setSearchTerm(suggestion);
                                                            setShowSuggestions(false);
                                                        }}
                                                    >
                                                        {suggestion}
                                                    </div>
                                                ))}
                                            {searchSuggestions.filter(suggestion =>
                                                suggestion.toLowerCase().includes(searchTerm.toLowerCase())
                                            ).length === 0 && (
                                                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                                        Không tìm thấy gợi ý
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Category dropdown */}
                            <div className="md:col-span-4">
                                <div className="relative" ref={categoryDropdownRef}>
                                    <button
                                        type="button"
                                        className="w-full py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-lg text-left bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm flex justify-between items-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors shadow-sm"
                                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                    >
                                        <span className="truncate">
                                            {categories.find(cat => cat.value === selectedCategory)?.label || 'Tất cả danh mục'}
                                        </span>
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {showCategoryDropdown && (
                                        <div className="absolute mt-1 w-full z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                                            {categories.map((category) => (
                                                <div
                                                    key={category.value}
                                                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedCategory === category.value ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-900 dark:text-white'}`}
                                                    onClick={() => {
                                                        setSelectedCategory(category.value);
                                                        setShowCategoryDropdown(false);
                                                    }}
                                                >
                                                    {category.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sort controls */}
                            <div className="md:col-span-3 flex gap-3">
                                <div className="relative flex-1" ref={sortDropdownRef}>
                                    <button
                                        type="button"
                                        className="w-full py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-lg text-left bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm flex justify-between items-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors shadow-sm"
                                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    >
                                        <span className="truncate">
                                            {sortOptions.find(opt => opt.value === sortBy)?.label || 'Sắp xếp theo: Giá'}
                                        </span>
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {showSortDropdown && (
                                        <div className="absolute mt-1 w-full z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                                            {sortOptions.map((option) => (
                                                <div
                                                    key={option.value}
                                                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${sortBy === option.value ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-900 dark:text-white'}`}
                                                    onClick={() => {
                                                        setSortBy(option.value as 'price' | 'title' | 'rating' | 'newest');
                                                        setShowSortDropdown(false);
                                                    }}
                                                >
                                                    {option.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none transition-colors flex items-center justify-center shadow-sm"
                                    aria-label={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
                                >
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg mb-8 border border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Khoảng giá (đ)</h3>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="number"
                                            value={priceRange[0]}
                                            onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700"
                                            min="0"
                                        />
                                        <span className="dark:text-gray-300">đến</span>
                                        <input
                                            type="number"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700"
                                            min={priceRange[0]}
                                        />
                                    </div>

                                    <h3 className="text-sm font-medium text-gray-700 mt-4 mb-2 dark:text-gray-300">Đánh giá tối thiểu</h3>
                                    <div className="flex items-center">
                                        {[0, 1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                                key={rating}
                                                className={`flex items-center mr-3 ${rating === 0 && ratingFilter === 0 ? 'text-orange-500 font-medium' : ''}`}
                                                onClick={() => setRatingFilter(rating)}
                                            >
                                                {rating === 0 ? (
                                                    <span className={`text-sm ${ratingFilter === 0 ? 'text-orange-500 font-medium' : 'text-gray-500'}`}>Tất cả</span>
                                                ) : (
                                                    <>
                                                        {Array.from({ length: 5 }).map((_, index) => (
                                                            <svg
                                                                key={index}
                                                                className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'} ${ratingFilter === rating ? 'stroke-orange-500' : ''}`}
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                    </>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col justify-end">
                                    <button
                                        onClick={resetFilters}
                                        className="w-full mt-4 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-md hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 text-sm"
                                    >
                                        Xóa tất cả bộ lọc
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Equipment Grid or List View */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredEquipment.map((item) => (
                                <Link
                                    key={item.id}
                                    to={`/equipment/${item.id}`}
                                    onClick={() => window.scrollTo(0, 0)}
                                    className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={item.images?.[0] || '/placeholder.png'}
                                            alt={item.title}
                                            className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-200"
                                            onError={(e) => e.currentTarget.src = '/placeholder.png'}
                                        />
                                        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 px-2 py-1 rounded-md text-xs font-medium text-gray-900 dark:text-gray-100">
                                            {item.category?.name}
                                        </div>
                                        {item.condition && (
                                            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                                                {item.condition}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-orange-500 transition-colors">{item.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{item.description}</p>

                                        {item.tags && item.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {item.tags.map((tag, index) => (
                                                    <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center mb-2 text-xs text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center">
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                                                </svg>
                                                <span>Có sẵn</span>
                                            </div>
                                            <div>
                                                {new Date(item.created_at).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                                            <span className="text-orange-500 dark:text-orange-400 font-bold">
                                                {(typeof item.price_per_day === 'number' && !isNaN(item.price_per_day) ? item.price_per_day : 0).toLocaleString('vi-VN')}đ/ngày
                                            </span>
                                            <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                {item.rating > 0 ? (
                                                    <>
                                                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        {item.rating} <span className="ml-1 text-gray-400">({item.reviews || 0})</span>
                                                    </>
                                                ) : 'Chưa có đánh giá'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-4">
                            {filteredEquipment.map((item) => (
                                <Link
                                    key={item.id}
                                    to={`/equipment/${item.id}`}
                                    onClick={() => window.scrollTo(0, 0)}
                                    className="group flex bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="relative w-36 sm:w-48 flex-shrink-0">
                                        <img
                                            src={item.images?.[0] || '/placeholder.png'}
                                            alt={item.title}
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                                            onError={(e) => e.currentTarget.src = '/placeholder.png'}
                                        />
                                        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 px-2 py-1 rounded-md text-xs font-medium text-gray-900 dark:text-gray-100">
                                            {item.category?.name}
                                        </div>
                                        {item.condition && (
                                            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                                                {item.condition}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex-grow flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-orange-500 transition-colors">{item.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">{item.description}</p>

                                            {item.tags && item.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {item.tags.map((tag, index) => (
                                                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center mb-2 text-xs text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
                                                    </svg>
                                                    <span>Có sẵn</span>
                                                </div>
                                                <div>
                                                    {new Date(item.created_at).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>

                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                {item.rating > 0 ? (
                                                    <>
                                                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        {item.rating} <span className="ml-1 text-gray-400">({item.reviews || 0} đánh giá)</span>
                                                    </>
                                                ) : 'Chưa có đánh giá'}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                                            <span className="text-orange-500 dark:text-orange-400 font-bold">
                                                {(typeof item.price_per_day === 'number' && !isNaN(item.price_per_day) ? item.price_per_day : 0).toLocaleString('vi-VN')}đ/ngày
                                            </span>
                                            <span className="text-sm text-blue-600 font-medium hover:underline">
                                                Xem chi tiết
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {filteredEquipment.length === 0 && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center py-16 px-4">
                            <svg className="mx-auto h-20 w-20 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">Không tìm thấy thiết bị</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                                Không tìm thấy thiết bị phù hợp. Thử từ khóa khác hoặc chọn lại bộ lọc!
                            </p>
                            <button
                                onClick={resetFilters}
                                className="mt-6 px-5 py-2.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-md hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
