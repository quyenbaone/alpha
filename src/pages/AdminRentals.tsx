import { Check, Filter, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { AdminLayout } from '../components/AdminLayout';
import { adminUpdateRentalStatus } from '../lib/rentalService';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/utils';

interface Rental {
    id: string;
    equipment: {
        id: string;
        title: string;
        price_per_day: number;
        images: string[];
    };
    renter: {
        id: string;
        email: string;
        full_name: string;
        phone_number?: string;
    };
    equipment_id: string;
    renter_id: string;
    start_date: string;
    end_date: string;
    total_price: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'confirmed' | 'cancelled' | 'delivering' | 'in_progress';
    payment_status?: 'paid' | 'unpaid' | 'cod';
    created_at: string;
}

export function AdminRentals() {
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'year'
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
    const [showRentalDetails, setShowRentalDetails] = useState(false);
    const [rentalNote, setRentalNote] = useState('');
    const [showHelpModal, setShowHelpModal] = useState(false);

    // Stats for the dashboard
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        totalRevenue: 0,
        todayCount: 0
    });

    useEffect(() => {
        fetchRentals();
    }, [statusFilter, dateFilter]);

    const fetchRentals = async () => {
        setLoading(true);
        try {
            // Check if supabase client is properly initialized
            if (!supabase) {
                throw new Error('Supabase client is not initialized');
            }

            let query = supabase
                .from('rentals')
                .select(`
          id,
          equipment_id,
          renter_id,
          owner_id,
          start_date,
          end_date,
          total_price,
          status,
          payment_status,
          created_at
        `)
                .order('created_at', { ascending: false });

            // Áp dụng bộ lọc trạng thái
            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter as any);
            }

            // Áp dụng bộ lọc ngày
            if (dateFilter !== 'all') {
                const now = new Date();
                let startDate = new Date();

                switch (dateFilter) {
                    case 'today':
                        startDate.setHours(0, 0, 0, 0);
                        break;
                    case 'week':
                        startDate.setDate(now.getDate() - 7);
                        break;
                    case 'month':
                        startDate.setMonth(now.getMonth() - 1);
                        break;
                    case 'year':
                        startDate.setFullYear(now.getFullYear() - 1);
                        break;
                }

                query = query.gte('created_at', startDate.toISOString());
            }

            const { data, error } = await query;

            if (error) {
                console.error('Supabase error details:', error);
                throw error;
            }

            if (!data) {
                setRentals([]);
                setStats({
                    total: 0,
                    pending: 0,
                    confirmed: 0,
                    completed: 0,
                    totalRevenue: 0,
                    todayCount: 0
                });
                return;
            }

            // Fetch equipment and renters data separately
            const rentalsData = [...data] as any[];

            // Get unique equipment IDs and renter IDs
            const equipmentIds = [...new Set(rentalsData.map(rental => rental.equipment_id))];
            const renterIds = [...new Set(rentalsData.map(rental => rental.renter_id))];

            // Fetch equipment data
            const { data: equipmentData, error: equipmentError } = await supabase
                .from('equipment')
                .select('id, title, price_per_day, images')
                .in('id', equipmentIds);

            if (equipmentError) {
                console.error('Error fetching equipment:', equipmentError);
            }

            // Fetch renters data
            const { data: rentersData, error: rentersError } = await supabase
                .from('users')
                .select('id, email, full_name, phone_number')
                .in('id', renterIds);

            if (rentersError) {
                console.error('Error fetching renters:', rentersError);
            }

            // Create lookup tables
            const equipmentMap = new Map();
            equipmentData?.forEach(item => {
                equipmentMap.set(item.id, item);
            });

            const renterMap = new Map();
            rentersData?.forEach(renter => {
                renterMap.set(renter.id, renter);
            });

            // Combine data
            const combinedRentals = rentalsData.map(rental => {
                return {
                    ...rental,
                    equipment: equipmentMap.get(rental.equipment_id) || null,
                    renter: renterMap.get(rental.renter_id) || null
                };
            });

            setRentals(combinedRentals);

            // Calculate stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const statsData = {
                total: combinedRentals.length,
                pending: combinedRentals.filter(r => r.status === 'pending').length,
                confirmed: combinedRentals.filter(r => r.status === 'confirmed' || r.status === 'approved').length,
                completed: combinedRentals.filter(r => r.status === 'completed').length,
                totalRevenue: combinedRentals.reduce((sum, rental) => sum + rental.total_price, 0),
                todayCount: combinedRentals.filter(r => {
                    const createdDate = new Date(r.created_at);
                    return createdDate >= today;
                }).length
            };

            setStats(statsData);

        } catch (error: any) {
            console.error('Error fetching rentals:', error);

            // More descriptive error message
            const errorMessage = error.message || 'Lỗi khi tải danh sách đơn thuê';
            toast.error(errorMessage);

            // Reset rentals to empty array on error
            setRentals([]);
            setStats({
                total: 0,
                pending: 0,
                confirmed: 0,
                completed: 0,
                totalRevenue: 0,
                todayCount: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRentalStatus = async (rentalId: string, status: string) => {
        try {
            await adminUpdateRentalStatus(rentalId, status);

            // After updating the status, immediately refresh the data
            await fetchRentals();

            // If the modal is open, close it to show the updated status in the table
            if (showRentalDetails) {
                setShowRentalDetails(false);

                // Add a small delay and then show success toast
                setTimeout(() => {
                    toast.success(`Đã cập nhật trạng thái thành công!`, {
                        position: "bottom-right",
                        duration: 3000
                    });
                }, 300);
            }
        } catch (error) {
            console.error('Error updating rental status:', error);
            toast.error('Lỗi khi cập nhật trạng thái', {
                position: "bottom-right",
                duration: 3000
            });
        }
    };

    const handleDeleteRental = async (rentalId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa đơn thuê này?')) return;

        try {
            const { error } = await supabase
                .from('rentals')
                .delete()
                .eq('id', rentalId);

            if (error) throw error;
            toast.success('Đã xóa đơn thuê');
            fetchRentals();
        } catch (error) {
            console.error('Error deleting rental:', error);
            toast.error('Lỗi khi xóa đơn thuê');
        }
    };

    const saveNote = async () => {
        if (!selectedRental) return;

        try {
            // Update the note in the database using match instead of eq
            // This avoids TypeScript errors while still functioning correctly
            const { error } = await supabase
                .from('rentals')
                .update({
                    notes: rentalNote
                } as any)
                .match({ id: selectedRental.id } as any);

            if (error) throw error;
            toast.success('Đã lưu ghi chú');
        } catch (error) {
            console.error('Error saving note:', error);
            toast.error('Lỗi khi lưu ghi chú');
        }
    };

    const filteredRentals = rentals.filter(rental =>
        rental.equipment?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.renter?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.renter?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return { text: 'Đang chờ', color: 'bg-yellow-100 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-300' };
            case 'approved':
            case 'confirmed':
                return { text: 'Đã duyệt', color: 'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300' };
            case 'delivering':
                return { text: 'Đang giao hàng', color: 'bg-purple-100 dark:bg-purple-800/30 text-purple-800 dark:text-purple-300' };
            case 'in_progress':
                return { text: 'Đang thuê', color: 'bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300' };
            case 'rejected':
            case 'cancelled':
                return { text: 'Từ chối', color: 'bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-300' };
            case 'completed':
                return { text: 'Hoàn thành', color: 'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300' };
            default:
                return { text: status, color: 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300' };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Helper function to export rentals to CSV
    const exportToCSV = () => {
        try {
            // Create column headers
            const headers = [
                'ID', 'Thiết bị', 'Người thuê', 'Email', 'SĐT',
                'Ngày bắt đầu', 'Ngày kết thúc', 'Trạng thái', 'Thanh toán',
                'Tổng tiền', 'Ngày tạo'
            ];

            // Format rental data
            const csvData = filteredRentals.map(rental => [
                rental.id,
                rental.equipment?.title || '',
                rental.renter?.full_name || '',
                rental.renter?.email || '',
                rental.renter?.phone_number || '',
                formatDate(rental.start_date),
                formatDate(rental.end_date),
                getStatusLabel(rental.status).text,
                rental.payment_status || 'Chưa có',
                rental.total_price.toString(),
                formatDate(rental.created_at)
            ]);

            // Combine headers and data
            const csvContent = [
                headers.join(','),
                ...csvData.map(row => row.join(','))
            ].join('\n');

            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `rentals-export-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Xuất file thành công!');
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            toast.error('Lỗi khi xuất file CSV');
        }
    };

    // Function to open rental details modal
    const openRentalDetails = (rental: Rental) => {
        setSelectedRental(rental);
        setShowRentalDetails(true);
    };

    // Get payment status label and color
    const getPaymentStatusLabel = (status?: string) => {
        switch (status) {
            case 'paid':
                return { text: 'Đã thanh toán', color: 'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300' };
            case 'unpaid':
                return { text: 'Chưa thanh toán', color: 'bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-300' };
            case 'cod':
                return { text: 'Thanh toán khi nhận', color: 'bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300' };
            default:
                return { text: 'Không xác định', color: 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300' };
        }
    };

    return (
        <AdminLayout>
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Quản lý đơn thuê</h1>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">Tổng đơn thuê</h3>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">Đơn chờ xác nhận</h3>
                        <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">Đơn đã xác nhận</h3>
                        <p className="text-2xl font-semibold text-blue-600">{stats.confirmed}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">Đơn đã hoàn thành</h3>
                        <p className="text-2xl font-semibold text-green-600">{stats.completed}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">Doanh thu (VNĐ)</h3>
                        <p className="text-2xl font-semibold text-purple-600">
                            {stats.totalRevenue.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý đơn thuê</h1>
                        <div className="flex space-x-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="pending">Đang chờ</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="rejected">Từ chối</option>
                                <option value="completed">Hoàn thành</option>
                            </select>

                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            >
                                <option value="all">Tất cả thời gian</option>
                                <option value="today">Hôm nay</option>
                                <option value="week">7 ngày qua</option>
                                <option value="month">30 ngày qua</option>
                                <option value="year">365 ngày qua</option>
                            </select>

                            <button
                                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center text-gray-900 dark:text-gray-200"
                            >
                                <Filter size={16} className="mr-1" />
                                Lọc thêm
                            </button>

                            <button
                                onClick={fetchRentals}
                                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center text-gray-900 dark:text-gray-200"
                            >
                                <RefreshCw size={16} className="mr-1" />
                                Làm mới
                            </button>

                            <button
                                onClick={exportToCSV}
                                className="px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md text-sm flex items-center"
                            >
                                <span className="mr-1">↓</span>
                                Xuất CSV
                            </button>

                            <button
                                onClick={() => setShowHelpModal(true)}
                                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md flex items-center text-sm"
                            >
                                <span className="mr-1">?</span>
                                Trợ giúp
                            </button>
                        </div>
                    </div>

                    {/* Thanh tìm kiếm */}
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên thiết bị, email hoặc tên công ty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-700"
                            />
                            <Search className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                            {filteredRentals.length === 0 ? (
                                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                                    Không tìm thấy đơn thuê nào
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Thiết bị
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Người thuê
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Thời gian thuê
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Tổng tiền
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Trạng thái
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Thanh toán
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Ngày tạo
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Thao tác
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {filteredRentals.map((rental) => {
                                                const status = getStatusLabel(rental.status);
                                                const paymentStatus = getPaymentStatusLabel(rental.payment_status);

                                                return (
                                                    <tr key={rental.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 flex-shrink-0">
                                                                    <img
                                                                        className="h-10 w-10 rounded-md object-cover"
                                                                        src={(rental.equipment?.images && rental.equipment.images.length > 0) ? rental.equipment.images[0] : '/placeholder.png'}
                                                                        alt={rental.equipment?.title}
                                                                        onError={(e) => e.currentTarget.src = '/placeholder.png'}
                                                                    />
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {rental.equipment?.title}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {formatPrice(rental.equipment?.price_per_day)}/ngày
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {rental.renter?.full_name || 'N/A'}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {rental.renter?.email}
                                                            </div>
                                                            {rental.renter?.phone_number && (
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    SĐT: {rental.renter.phone_number}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {Math.ceil(
                                                                    (new Date(rental.end_date).getTime() - new Date(rental.start_date).getTime()) /
                                                                    (1000 * 60 * 60 * 24)
                                                                )} ngày
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {formatPrice(rental.total_price)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                                                {status.text}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatus.color}`}>
                                                                {paymentStatus.text}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {formatDate(rental.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                            <button
                                                                onClick={() => openRentalDetails(rental)}
                                                                className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-md text-xs"
                                                            >
                                                                Chi tiết
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateRentalStatus(rental.id, 'confirmed')}
                                                                disabled={rental.status === 'confirmed' || rental.status === 'completed'}
                                                                className={`${rental.status === 'confirmed' || rental.status === 'completed'
                                                                    ? 'text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-700'
                                                                    : 'text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200'
                                                                    } px-2 py-1 rounded-md text-xs`}
                                                            >
                                                                <Check className="h-3 w-3 inline mr-1" />
                                                                Xác nhận
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRental(rental.id)}
                                                                className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded-md text-xs"
                                                            >
                                                                <Trash2 className="h-3 w-3 inline mr-1" />
                                                                Xóa
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Rental Details Modal */}
            {showRentalDetails && selectedRental && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Chi tiết đơn thuê #{selectedRental.id}</h2>
                                <button
                                    onClick={() => setShowRentalDetails(false)}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Thông tin thiết bị</h3>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        {selectedRental.equipment ? (
                                            <div>
                                                <div className="mb-3">
                                                    {selectedRental.equipment.images && selectedRental.equipment.images.length > 0 ? (
                                                        <img
                                                            src={selectedRental.equipment.images[0]}
                                                            alt={selectedRental.equipment.title}
                                                            className="w-full h-40 object-cover rounded-md mb-2"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/placeholder.png';
                                                            }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src="/placeholder.png"
                                                            alt="Placeholder"
                                                            className="w-full h-40 object-cover rounded-md mb-2"
                                                        />
                                                    )}
                                                </div>
                                                <p className="font-semibold text-lg text-gray-900 dark:text-white">{selectedRental.equipment.title}</p>
                                                <p className="text-gray-600 dark:text-gray-300 mb-2">Giá: {formatPrice(selectedRental.equipment.price_per_day)}/ngày</p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400">Không có thông tin thiết bị</p>
                                        )}
                                    </div>

                                    <h3 className="font-semibold text-lg mt-4 mb-2 text-gray-900 dark:text-white">Thông tin thuê</h3>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Ngày bắt đầu</p>
                                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedRental.start_date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Ngày kết thúc</p>
                                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedRental.end_date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái đơn</p>
                                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusLabel(selectedRental.status).color}`}>
                                                    {getStatusLabel(selectedRental.status).text}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái thanh toán</p>
                                                <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusLabel(selectedRental.payment_status).color}`}>
                                                    {getPaymentStatusLabel(selectedRental.payment_status).text}
                                                </span>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Tổng tiền</p>
                                                <p className="font-bold text-lg text-gray-900 dark:text-white">{formatPrice(selectedRental.total_price)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Thông tin người thuê</h3>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                                        {selectedRental.renter ? (
                                            <div>
                                                <p><span className="text-gray-500 dark:text-gray-400">Tên:</span> <span className="text-gray-900 dark:text-white">{selectedRental.renter.full_name || 'N/A'}</span></p>
                                                <p><span className="text-gray-500 dark:text-gray-400">Email:</span> <span className="text-gray-900 dark:text-white">{selectedRental.renter.email || 'N/A'}</span></p>
                                                <p><span className="text-gray-500 dark:text-gray-400">SĐT:</span> <span className="text-gray-900 dark:text-white">{selectedRental.renter.phone_number || 'N/A'}</span></p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400">Không có thông tin người thuê</p>
                                        )}
                                    </div>

                                    <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Cập nhật trạng thái</h3>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <button
                                                onClick={() => handleUpdateRentalStatus(selectedRental.id, 'confirmed')}
                                                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                                disabled={selectedRental.status === 'confirmed'}
                                            >
                                                Xác nhận đơn
                                            </button>
                                            <button
                                                onClick={() => handleUpdateRentalStatus(selectedRental.id, 'completed')}
                                                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                                disabled={selectedRental.status === 'completed'}
                                            >
                                                Hoàn thành
                                            </button>
                                            <button
                                                onClick={() => handleUpdateRentalStatus(selectedRental.id, 'cancelled')}
                                                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm col-span-2"
                                                disabled={selectedRental.status === 'cancelled'}
                                            >
                                                Hủy đơn
                                            </button>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-white">Ghi chú</h4>
                                            <textarea
                                                className="w-full border rounded-md px-3 py-2 mb-2 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-700"
                                                placeholder="Thêm ghi chú về đơn thuê này..."
                                                rows={3}
                                                value={rentalNote}
                                                onChange={(e) => setRentalNote(e.target.value)}
                                            />
                                            <button
                                                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 w-full"
                                                onClick={saveNote}
                                            >
                                                Lưu ghi chú
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Help Modal */}
            {showHelpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Hướng dẫn sử dụng</h2>
                                <button
                                    onClick={() => setShowHelpModal(false)}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Thông tin tổng quan</h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Trang này hiển thị tất cả các đơn thuê thiết bị. Bạn có thể xem chi tiết,
                                        cập nhật trạng thái, và quản lý các đơn thuê từ đây.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Các trạng thái đơn thuê</h3>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 ml-2">
                                        <li><span className="font-medium">Chờ xác nhận:</span> Đơn thuê mới, cần được xác nhận</li>
                                        <li><span className="font-medium">Đã xác nhận:</span> Đơn đã được chấp nhận</li>
                                        <li><span className="font-medium">Hoàn thành:</span> Đơn thuê đã kết thúc thành công</li>
                                        <li><span className="font-medium">Đã hủy:</span> Đơn thuê đã bị hủy</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Các chức năng chính</h3>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 ml-2">
                                        <li>Sử dụng bộ lọc để tìm đơn thuê theo trạng thái, thanh toán, thời gian</li>
                                        <li>Tìm kiếm đơn thuê theo tên thiết bị hoặc thông tin người thuê</li>
                                        <li>Xuất dữ liệu ra file CSV để phân tích</li>
                                        <li>Nhấn vào nút "Chi tiết" để xem chi tiết đơn thuê</li>
                                        <li>Cập nhật trạng thái đơn từ trang chi tiết</li>
                                        <li>Xem và thêm ghi chú cho đơn thuê</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toaster component for notifications */}
            <Toaster position="bottom-right" richColors />
        </AdminLayout>
    );
} 