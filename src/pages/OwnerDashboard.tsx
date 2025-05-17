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
import { DollarSign, Package, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { toast } from 'sonner';
import { OwnerLayout } from '../components/OwnerLayout';
import { supabase } from '../lib/supabase';
import { formatDate, formatPrice } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

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

export default function OwnerDashboard() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEquipment: 0,
        totalRentals: 0,
        totalRevenue: 0,
        recentRentals: [],
        popularEquipment: []
    });
    const [rentalData, setRentalData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            setLoading(true);

            // Fetch total equipment owned by this user
            const { count: equipmentCount, error: eqError } = await supabase
                .from('equipment')
                .select('*', { count: 'exact', head: true })
                .eq('owner_id', user?.id || '');

            if (eqError) throw eqError;

            // Fetch rentals for equipment owned by this user
            const { data: ownedEquipment } = await supabase
                .from('equipment')
                .select('id')
                .eq('owner_id', user?.id || '');

            if (!ownedEquipment || ownedEquipment.length === 0) {
                setStats({
                    totalEquipment: equipmentCount || 0,
                    totalRentals: 0,
                    totalRevenue: 0,
                    recentRentals: [],
                    popularEquipment: []
                });
                setLoading(false);
                return;
            }

            const equipmentIds = ownedEquipment.map(eq => eq.id);

            // Get rentals for this equipment
            const { data: rentalData, error: rentalError } = await supabase
                .from('rentals')
                .select('*')
                .in('equipment_id', equipmentIds);

            if (rentalError) throw rentalError;

            const totalRevenue = rentalData?.reduce((sum, rental) => sum + (rental.total_price || 0), 0) || 0;

            // Fetch recent rentals with details
            const { data: recentRentals, error: rrError } = await supabase
                .from('rentals')
                .select(`
          id,
          created_at,
          total_price,
          equipment:equipment_id (
            title,
            images
          ),
          renter:renter_id (
            email,
            full_name
          )
        `)
                .in('equipment_id', equipmentIds)
                .order('created_at', { ascending: false })
                .limit(5);

            if (rrError) throw rrError;

            // Fetch popular equipment
            const { data: popularEquipmentRaw, error: peError } = await supabase
                .from('equipment')
                .select(`
          id,
          title,
          images,
          price_per_day,
          rentals:rentals (
            id
          )
        `)
                .eq('owner_id', user?.id || '')
                .limit(20); // lấy nhiều hơn để sort phía client

            if (peError) throw peError;

            // Sort phía client theo số lượt thuê giảm dần
            const popularEquipment = popularEquipmentRaw ?
                popularEquipmentRaw.sort((a, b) => (b.rentals?.length || 0) - (a.rentals?.length || 0)).slice(0, 5) : [];

            // Prepare chart data
            // Group rentals by month
            const last6Months: Array<{
                monthYear: string;
                month: string;
                year: number;
                revenue: number;
                count: number;
            }> = [];

            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
                last6Months.push({
                    monthYear,
                    month: date.toLocaleDateString('vi-VN', { month: 'short' }),
                    year: date.getFullYear(),
                    revenue: 0,
                    count: 0
                });
            }

            if (rentalData) {
                rentalData.forEach(rental => {
                    const rentalDate = new Date(rental.created_at);
                    const monthYear = `${rentalDate.getMonth() + 1}/${rentalDate.getFullYear()}`;

                    const monthData = last6Months.find(m => m.monthYear === monthYear);
                    if (monthData) {
                        monthData.revenue += rental.total_price || 0;
                        monthData.count += 1;
                    }
                });
            }

            setRentalData({
                labels: last6Months.map(m => m.month),
                datasets: [
                    {
                        label: 'Doanh thu (VND)',
                        data: last6Months.map(m => m.revenue),
                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    }
                ]
            });

            setStats({
                totalEquipment: equipmentCount || 0,
                totalRentals: rentalData?.length || 0,
                totalRevenue,
                recentRentals: recentRentals || [],
                popularEquipment: popularEquipment
            });

            console.log('Recent rentals:', recentRentals);
        } catch (error) {
            console.error('Error fetching owner stats:', error);
            toast.error('Lỗi khi tải thống kê');
        } finally {
            setLoading(false);
        }
    };

    return (
        <OwnerLayout>
            <div className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Tổng quan chủ sở hữu</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Chào mừng quay trở lại, {user?.full_name || user?.email}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard
                                icon={<Package className="h-6 w-6 text-blue-600" />}
                                title="Tổng thiết bị"
                                value={stats.totalEquipment.toString()}
                            />
                            <StatCard
                                icon={<ShoppingCart className="h-6 w-6 text-green-600" />}
                                title="Đơn thuê"
                                value={stats.totalRentals.toString()}
                            />
                            <StatCard
                                icon={<DollarSign className="h-6 w-6 text-yellow-600" />}
                                title="Doanh thu"
                                value={formatPrice(stats.totalRevenue)}
                            />
                        </div>

                        {/* Revenue Chart */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-8">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Doanh thu 6 tháng gần đây</h2>
                            <div className="h-80">
                                <Bar
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : undefined
                                                },
                                                grid: {
                                                    color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : undefined
                                                }
                                            },
                                            x: {
                                                ticks: {
                                                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : undefined
                                                },
                                                grid: {
                                                    color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : undefined
                                                }
                                            }
                                        },
                                        plugins: {
                                            legend: {
                                                labels: {
                                                    color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : undefined
                                                }
                                            }
                                        }
                                    }}
                                    data={rentalData}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Recent Rentals */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Đơn thuê gần đây</h2>
                                {stats.recentRentals.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thiết bị</th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Người thuê</th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày</th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Giá (VND)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {stats.recentRentals.map((rental: any) => (
                                                    <tr key={rental.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 flex-shrink-0">
                                                                    <img className="h-10 w-10 object-cover rounded-md"
                                                                        src={rental.equipment?.images && rental.equipment.images.length > 0 ? rental.equipment.images[0] : '/placeholder.png'}
                                                                        alt={rental.equipment?.title} />
                                                                </div>
                                                                <div className="ml-3">
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{rental.equipment?.title}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-gray-100">{rental.renter?.full_name || rental.renter?.email}</div>
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(rental.created_at)}</div>
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {formatPrice(rental.total_price)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">Chưa có đơn thuê nào.</div>
                                )}
                            </div>

                            {/* Popular Equipment */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Thiết bị phổ biến</h2>
                                {stats.popularEquipment.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thiết bị</th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Giá</th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Số lượt thuê</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {stats.popularEquipment.map((item: any) => (
                                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 flex-shrink-0">
                                                                    <img className="h-10 w-10 object-cover rounded-md"
                                                                        src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.png'}
                                                                        alt={item.title} />
                                                                </div>
                                                                <div className="ml-3">
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-gray-100">{formatPrice(item.price_per_day)}</div>
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">{item.rentals?.length || 0}</div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">Chưa có thiết bị nào được thuê.</div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </OwnerLayout>
    );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/30 mr-4">
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
                </div>
            </div>
        </div>
    );
} 