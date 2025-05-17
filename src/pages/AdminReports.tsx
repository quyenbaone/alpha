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
            const categoryRevenueMap = new Map();

            // Đảm bảo các đối tượng tồn tại trước khi xử lý
            if (categoryRentalData && equipmentData) {
                categoryRentalData.forEach((rental: any) => {
                    if (rental && rental.equipment_id && rental.total_price) {
                        const equipment = equipmentData.find((e: any) => e.id === rental.equipment_id);
                        if (equipment && equipment.category_id) {
                            const currentRevenue = categoryRevenueMap.get(equipment.category_id) || 0;
                            categoryRevenueMap.set(equipment.category_id, currentRevenue + rental.total_price);
                        }
                    }
                });
            }

            // Chuyển đổi map thành mảng để hiển thị
            const categoryRevenueData = Array.from(categoryRevenueMap).map(([categoryId, totalRevenue]) => ({
                category_id: categoryId,
                total_revenue: totalRevenue
            }));

            // Lấy top khách hàng
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id, full_name, email')
                .eq('role', 'customer')
                .limit(10);

            if (userError) throw userError;

            // Lấy giao dịch thuê của mỗi khách hàng
            const topCustomersWithRentals = [];

            if (userData) {
                for (const user of userData) {
                    const { data: userRentals, error: userRentalsError } = await supabase
                        .from('rentals')
                        .select('id, total_price, status')
                        .eq('renter_id', user.id);

                    if (!userRentalsError && userRentals) {
                        topCustomersWithRentals.push({
                            ...user,
                            rentals: userRentals
                        });
                    }
                }
            }

            // Xử lý dữ liệu doanh thu
            const monthlyRevenues = processMonthlyData(revenueData || [], 'total_price');

            // Xử lý dữ liệu đơn thuê
            const monthlyRentals = processMonthlyData(rentalData || []);

            // Tính tổng doanh thu
            const totalRevenue = allRevenueData?.reduce((sum, rental) => sum + (rental.total_price || 0), 0) || 0;

            // Tính giá trị trung bình mỗi đơn
            const averageValue = totalRentalsCount ? totalRevenue / totalRentalsCount : 0;

            // Xử lý dữ liệu danh mục
            const processedCategories = processCategories(categoryRevenueData);

            // Xử lý dữ liệu top khách hàng
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

    // Lấy ngày bắt đầu dựa trên khoảng thời gian
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

    // Xử lý dữ liệu theo tháng
    const processMonthlyData = (data: any[], valueField?: string) => {
        const months = Array(12).fill(0);

        if (!data) return months;

        data.forEach(item => {
            const date = new Date(item.created_at);
            const monthIndex = date.getMonth();

            if (valueField) {
                months[monthIndex] += item[valueField] || 0;
            } else {
                months[monthIndex] += 1;
            }
        });

        return months;
    };

    // Xử lý dữ liệu danh mục
    const processCategories = (data: any[]): CategoryData[] => {
        if (!data) return [];

        const categories: Record<string, CategoryData> = {};

        // Danh sách tên danh mục mặc định (bạn có thể thay thế bằng dữ liệu thực)
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

    // Xử lý dữ liệu top khách hàng
    const processTopUsers = (data: any[]): UserData[] => {
        if (!data) return [];

        return data.map(user => {
            let totalSpent = 0;
            const rentalsCount = user.rentals ? user.rentals.length : 0;

            if (user.rentals) {
                user.rentals.forEach((rental: any) => {
                    totalSpent += rental.total_price || 0;
                });
            }

            return {
                name: user.full_name || 'Người dùng ' + user.id.substring(0, 5),
                rentals: rentalsCount,
                spent: totalSpent
            };
        })
            // Sắp xếp theo số lượng đơn hàng giảm dần
            .sort((a, b) => b.rentals - a.rentals)
            // Chỉ lấy 5 người dùng hàng đầu
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
                    <h1 className="text-2xl font-bold">Báo cáo & Thống kê</h1>

                    <div className="flex space-x-2">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="week">Tuần này</option>
                            <option value="month">Tháng này</option>
                            <option value="quarter">Quý này</option>
                            <option value="year">Năm nay</option>
                        </select>

                        <button className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center">
                            <Filter size={16} className="mr-1" />
                            Lọc
                        </button>

                        <button
                            onClick={fetchReportData}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
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
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Tổng doanh thu</h3>
                                <p className="text-3xl font-bold text-gray-900">{formatPrice(reportData.totalRevenue)}</p>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Tổng đơn thuê</h3>
                                <p className="text-3xl font-bold text-gray-900">{reportData.totalRentalsCount}</p>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Giá trị trung bình mỗi đơn</h3>
                                <p className="text-3xl font-bold text-gray-900">
                                    {formatPrice(reportData.averageValue)}
                                </p>
                            </div>
                        </div>

                        {/* Biểu đồ */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-4">Doanh thu theo tháng</h3>
                                <div className="h-80">
                                    <Line data={revenueChartData} options={chartOptions} />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-4">Số lượng đơn thuê theo tháng</h3>
                                <div className="h-80">
                                    <Bar data={rentalChartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>

                        {/* Phân tích danh mục và top người dùng */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {reportData.categories.length > 0 && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold mb-4">Phân tích danh mục</h3>
                                    <div className="h-80">
                                        <Bar data={categoryChartData} options={chartOptions} />
                                    </div>
                                </div>
                            )}

                            {reportData.topUsers.length > 0 && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-semibold mb-4">Top khách hàng</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Tên công ty
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Số đơn
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Tổng chi tiêu
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {reportData.topUsers.map((user, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {user.name}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                            {user.rentals}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
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