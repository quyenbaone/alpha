import { Check, Filter, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/AdminLayout';
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
        is_business: boolean;
        business_name: string;
    };
    equipment_id: string;
    renter_id: string;
    start_date: string;
    end_date: string;
    total_price: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    created_at: string;
}

export function AdminRentals() {
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'year'

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
          start_date,
          end_date,
          total_price,
          status,
          created_at,
          equipment:equipment_id (
            id,
            title,
            price_per_day,
            images
          ),
          renter:renter_id (
            id,
            email,
            full_name,
            is_business,
            business_name
          )
        `)
                .order('created_at', { ascending: false });

            // Áp dụng bộ lọc trạng thái
            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
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
                return;
            }

            setRentals(data as Rental[]);
        } catch (error: any) {
            console.error('Error fetching rentals:', error);

            // More descriptive error message
            const errorMessage = error.message || 'Lỗi khi tải danh sách đơn thuê';
            toast.error(errorMessage);

            // Reset rentals to empty array on error
            setRentals([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRentalStatus = async (rentalId: string, status: string) => {
        try {
            const { error } = await supabase
                .from('rentals')
                .update({ status })
                .eq('id', rentalId);

            if (error) throw error;
            toast.success('Đã cập nhật trạng thái đơn thuê');
            fetchRentals();
        } catch (error) {
            console.error('Error updating rental status:', error);
            toast.error('Lỗi khi cập nhật trạng thái');
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

    const filteredRentals = rentals.filter(rental =>
        rental.equipment?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.renter?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.renter?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.renter?.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return { text: 'Đang chờ', color: 'bg-yellow-100 text-yellow-800' };
            case 'approved':
                return { text: 'Đã duyệt', color: 'bg-green-100 text-green-800' };
            case 'rejected':
                return { text: 'Từ chối', color: 'bg-red-100 text-red-800' };
            case 'completed':
                return { text: 'Hoàn thành', color: 'bg-blue-100 text-blue-800' };
            default:
                return { text: status, color: 'bg-gray-100 text-gray-800' };
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

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Quản lý đơn thuê</h1>
                    <div className="flex space-x-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tất cả thời gian</option>
                            <option value="today">Hôm nay</option>
                            <option value="week">7 ngày qua</option>
                            <option value="month">30 ngày qua</option>
                            <option value="year">365 ngày qua</option>
                        </select>

                        <button
                            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                        >
                            <Filter size={16} className="mr-1" />
                            Lọc thêm
                        </button>

                        <button
                            onClick={fetchRentals}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                        >
                            <RefreshCw size={16} className="mr-1" />
                            Làm mới
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
                            className="w-full px-4 py-2 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Search className="absolute left-3 top-3 text-gray-400" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {filteredRentals.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                Không tìm thấy đơn thuê nào
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Thiết bị
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Người thuê
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Thời gian thuê
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tổng tiền
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Trạng thái
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ngày tạo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredRentals.map((rental) => {
                                            const status = getStatusLabel(rental.status);

                                            return (
                                                <tr key={rental.id} className="hover:bg-gray-50">
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
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {rental.equipment?.title}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {formatPrice(rental.equipment?.price_per_day)}/ngày
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {rental.renter?.business_name || rental.renter?.full_name || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {rental.renter?.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {Math.ceil(
                                                                (new Date(rental.end_date).getTime() - new Date(rental.start_date).getTime()) /
                                                                (1000 * 60 * 60 * 24)
                                                            )} ngày
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {formatPrice(rental.total_price)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                                            {status.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(rental.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            {rental.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleUpdateRentalStatus(rental.id, 'approved')}
                                                                        className="p-1 text-green-600 hover:text-green-900 focus:outline-none"
                                                                        title="Phê duyệt"
                                                                    >
                                                                        <Check className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateRentalStatus(rental.id, 'rejected')}
                                                                        className="p-1 text-red-600 hover:text-red-900 focus:outline-none"
                                                                        title="Từ chối"
                                                                    >
                                                                        <X className="w-5 h-5" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {rental.status === 'approved' && (
                                                                <button
                                                                    onClick={() => handleUpdateRentalStatus(rental.id, 'completed')}
                                                                    className="p-1 text-blue-600 hover:text-blue-900 focus:outline-none"
                                                                    title="Đánh dấu hoàn thành"
                                                                >
                                                                    <Check className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteRental(rental.id)}
                                                                className="p-1 text-red-600 hover:text-red-900 focus:outline-none"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
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
        </AdminLayout>
    );
} 