import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { Download, Filter, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/utils';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface CategoryData {
    name: string;
    count: number;
    revenue: number;
}

interface UserData {
    name: string;
    rentals: number;
    spent: number;
}

interface ReportData {
    revenues: number[];
    rentals: number[];
    categories: CategoryData[];
    topUsers: UserData[];
    totalRevenue: number;
    totalRentalsCount: number;
    averageValue: number;
}

// Type definitions for Supabase responses
interface RentalRecord {
    created_at: string;
    total_price: number;
    status?: string;
    equipment_id?: string;
    id?: string;
}

interface EquipmentRecord {
    id: string;
    category_id: string;
}

interface UserRecord {
    id: string;
    full_name?: string;
    email?: string;
    rentals?: RentalRecord[];
}

interface CategoryRevenueRecord {
    category_id: string;
    total_revenue: number;
}

export function AdminReports() {
    const [timeRange, setTimeRange] = useState('month');
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState<ReportData>({
        revenues: [],
        rentals: [],
        categories: [],
        topUsers: [],
        totalRevenue: 0,
        totalRentalsCount: 0,
        averageValue: 0,
    });

    useEffect(() => {
        fetchReportData();
        // eslint-disable-next-line
    }, [timeRange]);

    const fetchReportData = async () => {
        setIsLoading(true);
        try {
            // Lấy dữ liệu doanh thu theo tháng
            const { data: revenueData, error: revenueError } = await supabase
                .from('rentals')
                .select('created_at, total_price')
                .gte('created_at', getTimeRangeDate())
                .order('created_at');

            if (revenueError) throw revenueError;

            // Lấy tổng doanh thu (tất cả thời gian)
            const { data: allRevenueData, error: allRevenueError } = await supabase
                .from('rentals')
                .select('total_price');

            if (allRevenueError) throw allRevenueError;

            // Lấy dữ liệu số lượng đơn thuê theo tháng
            const { data: rentalData, error: rentalError } = await supabase
                .from('rentals')
                .select('created_at, status')
                .gte('created_at', getTimeRangeDate())
                .order('created_at');

            if (rentalError) throw rentalError;

            // Lấy tổng số đơn thuê
            const { count: totalRentalsCount, error: countError } = await supabase
                .from('rentals')
                .select('*', { count: 'exact', head: true });

            if (countError) throw countError;

            // Lấy dữ liệu phân tích theo danh mục
            const { data: equipmentData, error: equipmentError } = await supabase
                .from('equipment')
                .select('id, category_id');

            if (equipmentError) throw equipmentError;

            // Lấy dữ liệu giao dịch cho phân tích doanh thu theo danh mục
            const { data: categoryRentalData, error: categoryRentalError } = await supabase
                .from('rentals')
                .select('equipment_id, total_price');

            if (categoryRentalError) throw categoryRentalError;

            // Tạo map để tổng hợp doanh thu theo danh mục
            const categoryRevenueMap = new Map<string, number>();

            if (categoryRentalData && equipmentData) {
                const safeRentalData = categoryRentalData as unknown as RentalRecord[];
                const safeEquipmentData = equipmentData as unknown as EquipmentRecord[];

                safeRentalData.forEach((rental) => {
                    if (rental && rental.equipment_id && rental.total_price) {
                        const equipment = safeEquipmentData.find(e => e.id === rental.equipment_id);
                        if (equipment && equipment.category_id) {
                            const currentRevenue = categoryRevenueMap.get(equipment.category_id) || 0;
                            categoryRevenueMap.set(equipment.category_id, currentRevenue + rental.total_price);
                        }
                    }
                });
            }

            const categoryRevenueData = Array.from(categoryRevenueMap).map(([categoryId, totalRevenue]) => ({
                category_id: categoryId,
                total_revenue: totalRevenue
            }));

            // Lấy top khách hàng
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id, full_name, email')
                .eq('role', 'customer' as any)
                .limit(10);

            if (userError) throw userError;

            // Lấy giao dịch thuê của mỗi khách hàng
            const topCustomersWithRentals: UserRecord[] = [];
            if (userData) {
                const safeUserData = userData as unknown as UserRecord[];
                for (const user of safeUserData) {
                    const { data: userRentals, error: userRentalsError } = await supabase
                        .from('rentals')
                        .select('id, total_price, status')
                        .eq('renter_id', user.id as any);

                    if (!userRentalsError && userRentals) {
                        topCustomersWithRentals.push({
                            ...user,
                            rentals: userRentals as unknown as RentalRecord[]
                        });
                    }
                }
            }

            // Xử lý dữ liệu doanh thu
            const safeRevenueData = revenueData as unknown as RentalRecord[];
            const safeRentalData = rentalData as unknown as RentalRecord[];
            const safeAllRevenueData = allRevenueData as unknown as RentalRecord[];
            const safeCategoryData = categoryRevenueData as unknown as CategoryRevenueRecord[];

            const monthlyRevenues = processMonthlyData(safeRevenueData || [], 'total_price');
            const monthlyRentals = processMonthlyData(safeRentalData || []);
            const totalRevenue = safeAllRevenueData?.reduce((sum, rental) => sum + (rental.total_price || 0), 0) || 0;
            const averageValue = totalRentalsCount ? totalRevenue / totalRentalsCount : 0;
            const processedCategories = processCategories(safeCategoryData);
            const processedTopUsers = processTopUsers(topCustomersWithRentals);

            setReportData({
                revenues: monthlyRevenues,
                rentals: monthlyRentals,
                categories: processedCategories,
                topUsers: processedTopUsers,
                totalRevenue,
                totalRentalsCount: totalRentalsCount || 0,
                averageValue,
            });

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching report data:', error);
            setIsLoading(false);
        }
    };

    const getTimeRangeDate = () => {
        const now = new Date();
        let startDate = new Date();

        switch (timeRange) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(now.getMonth() - 1);
        }

        return startDate.toISOString();
    };

    const processMonthlyData = (data: RentalRecord[], valueField?: string) => {
        const months = Array(12).fill(0);

        if (!data) return months;

        data.forEach(item => {
            const date = new Date(item.created_at);
            const monthIndex = date.getMonth();

            if (valueField) {
                months[monthIndex] += (item as any)[valueField] || 0;
            } else {
                months[monthIndex] += 1;
            }
        });

        return months;
    };

    const processCategories = (data: CategoryRevenueRecord[]): CategoryData[] => {
        if (!data) return [];

        const categories: Record<string, CategoryData> = {};
        const categoryNames: Record<string, string> = {
            '1': 'Camera',
            '2': 'Đèn chiếu sáng',
            '3': 'Thiết bị âm thanh',
            '4': 'Phụ kiện',
            '5': 'Khác'
        };

        data.forEach(item => {
            const categoryId = item.category_id ? item.category_id.toString() : 'unknown';
            const categoryName = categoryNames[categoryId] || 'Danh mục ' + categoryId;

            if (!categories[categoryId]) {
                categories[categoryId] = {
                    name: categoryName,
                    count: 0,
                    revenue: 0
                };
            }

            categories[categoryId].count += 1;
            if (item.total_revenue) {
                categories[categoryId].revenue += item.total_revenue;
            }
        });

        return Object.values(categories);
    };

    const processTopUsers = (data: UserRecord[]): UserData[] => {
        if (!data) return [];

        return data.map(user => {
            let totalSpent = 0;
            const rentalsCount = user.rentals ? user.rentals.length : 0;

            if (user.rentals) {
                user.rentals.forEach((rental: RentalRecord) => {
                    totalSpent += rental.total_price || 0;
                });
            }

            return {
                name: user.full_name || 'Người dùng ' + user.id.substring(0, 5),
                rentals: rentalsCount,
                spent: totalSpent
            };
        })
            .sort((a, b) => b.rentals - a.rentals)
            .slice(0, 5);
    };

    const getMonthLabels = () => {
        const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        return months;
    };

    const revenueChartData = {
        labels: getMonthLabels(),
        datasets: [
            {
                label: 'Doanh thu (VNĐ)',
                data: reportData.revenues,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const rentalChartData = {
        labels: getMonthLabels(),
        datasets: [
            {
                label: 'Số lượng đơn thuê',
                data: reportData.rentals,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderRadius: 5,
            },
        ],
    };

    const categoryChartData = {
        labels: reportData.categories.map(cat => cat.name),
        datasets: [
            {
                label: 'Số lượng thuê',
                data: reportData.categories.map(cat => cat.count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                ],
                borderRadius: 5,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
    };

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Báo cáo & Thống kê</h1>

                    <div className="flex space-x-2">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                        >
                            <option value="week">Tuần này</option>
                            <option value="month">Tháng này</option>
                            <option value="quarter">Quý này</option>
                            <option value="year">Năm nay</option>
                        </select>

                        <button className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center text-gray-900 dark:text-gray-200">
                            <Filter size={16} className="mr-1" />
                            Lọc
                        </button>

                        <button
                            onClick={fetchReportData}
                            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center text-gray-900 dark:text-gray-200"
                        >
                            <RefreshCw size={16} className="mr-1" />
                            Làm mới
                        </button>

                        <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center">
                            <Download size={16} className="mr-1" />
                            Xuất báo cáo
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Thống kê tổng quan */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tổng doanh thu</h3>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(reportData.totalRevenue)}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tổng đơn thuê</h3>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{reportData.totalRentalsCount}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Giá trị trung bình mỗi đơn</h3>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {formatPrice(reportData.averageValue)}
                                </p>
                            </div>
                        </div>

                        {/* Biểu đồ */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Doanh thu theo tháng</h3>
                                <div className="h-80">
                                    <Line data={revenueChartData} options={chartOptions} />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Số lượng đơn thuê theo tháng</h3>
                                <div className="h-80">
                                    <Bar data={rentalChartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>

                        {/* Phân tích danh mục và top người dùng */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {reportData.categories.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Phân tích danh mục</h3>
                                    <div className="h-80">
                                        <Bar data={categoryChartData} options={chartOptions} />
                                    </div>
                                </div>
                            )}
                            {reportData.topUsers.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top khách hàng</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-700">
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                                                        Tên công ty
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                                                        Số đơn
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                                                        Tổng chi tiêu
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {reportData.topUsers.map((user, index) => (
                                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {user.name}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                            {user.rentals}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                            {formatPrice(user.spent)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
} 