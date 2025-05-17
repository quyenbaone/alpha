import { Check, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { OwnerLayout } from '../components/OwnerLayout';
import { supabase } from '../lib/supabase';
import { formatDate, formatPrice } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export default function OwnerRentals() {
    const { user } = useAuthStore();
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (user) {
            fetchRentals();
        }
    }, [user]);

    const fetchRentals = async () => {
        try {
            setLoading(true);

            // First fetch all equipment owned by this user
            const { data: ownedEquipment, error: equipmentError } = await supabase
                .from('equipment')
                .select('id')
                .eq('owner_id', user.id);

            if (equipmentError) throw equipmentError;

            if (!ownedEquipment || ownedEquipment.length === 0) {
                setRentals([]);
                setLoading(false);
                return;
            }

            const equipmentIds = ownedEquipment.map(eq => eq.id);

            // Get rentals for this equipment
            const { data: rentalData, error: rentalError } = await supabase
                .from('rentals')
                .select(`
          *,
          equipment:equipment_id (
            title,
            price_per_day,
            images
          ),
          renter:renter_id (
            id,
            email,
            full_name,
            phone_number
          )
        `)
                .in('equipment_id', equipmentIds)
                .order('created_at', { ascending: false });

            if (rentalError) throw rentalError;

            setRentals(rentalData || []);
        } catch (error) {
            console.error('Error fetching rentals:', error);
            toast.error('Lỗi khi tải dữ liệu đơn thuê');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRentalStatus = async (rentalId, newStatus) => {
        try {
            const { error } = await supabase
                .from('rentals')
                .update({ status: newStatus })
                .eq('id', rentalId);

            if (error) throw error;

            toast.success(`Đã cập nhật trạng thái thành ${newStatus}`);
            fetchRentals();

            // If accepted, update equipment status to rented
            if (newStatus === 'accepted') {
                const rental = rentals.find(r => r.id === rentalId);
                if (rental) {
                    const { error: equipmentError } = await supabase
                        .from('equipment')
                        .update({ status: 'rented' })
                        .eq('id', rental.equipment_id);

                    if (equipmentError) {
                        console.error('Error updating equipment status:', equipmentError);
                    }
                }
            }

            // If completed, update equipment status back to available
            if (newStatus === 'completed') {
                const rental = rentals.find(r => r.id === rentalId);
                if (rental) {
                    const { error: equipmentError } = await supabase
                        .from('equipment')
                        .update({ status: 'available' })
                        .eq('id', rental.equipment_id);

                    if (equipmentError) {
                        console.error('Error updating equipment status:', equipmentError);
                    }
                }
            }
        } catch (error) {
            console.error('Error updating rental status:', error);
            toast.error('Lỗi khi cập nhật trạng thái đơn thuê');
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Chờ xác nhận';
            case 'accepted':
                return 'Đã xác nhận';
            case 'rejected':
                return 'Từ chối';
            case 'completed':
                return 'Hoàn thành';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const filteredRentals = rentals
        .filter(rental =>
            (statusFilter === 'all' || rental.status === statusFilter) &&
            (searchTerm === '' ||
                rental.equipment?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rental.renter?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rental.renter?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
        );

    return (
        <OwnerLayout>
            <div className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quản lý đơn thuê</h1>
                    <p className="text-gray-600 mt-1">Quản lý yêu cầu thuê thiết bị của bạn</p>
                </div>

                {/* Search and filter */}
                <div className="mb-6 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                    <div className="flex items-center bg-white rounded-lg shadow-sm px-3 py-2 flex-grow">
                        <Search size={20} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm đơn thuê..."
                            className="flex-grow outline-none text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-white rounded-lg shadow-sm border-none outline-none text-sm min-w-[150px]"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xác nhận</option>
                        <option value="accepted">Đã xác nhận</option>
                        <option value="rejected">Từ chối</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>

                {/* Rentals table */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {filteredRentals.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thiết bị</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người thuê</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày thuê</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá thuê</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredRentals.map((rental) => (
                                            <tr key={rental.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            {rental.equipment?.images && rental.equipment.images.length > 0 ? (
                                                                <img
                                                                    className="h-10 w-10 object-cover rounded-md"
                                                                    src={rental.equipment.images[0]}
                                                                    alt={rental.equipment?.title}
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                                                                    <span className="text-xs text-gray-500">No img</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{rental.equipment?.title}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{rental.renter?.full_name || 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">{rental.renter?.email}</div>
                                                    {rental.renter?.phone_number && (
                                                        <div className="text-xs text-gray-500">{rental.renter.phone_number}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(rental.created_at).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatPrice(rental.total_amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(rental.status)}`}>
                                                        {getStatusText(rental.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {rental.status === 'pending' && (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleUpdateRentalStatus(rental.id, 'accepted')}
                                                                className="bg-green-100 text-green-800 p-1 rounded hover:bg-green-200"
                                                                title="Chấp nhận"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateRentalStatus(rental.id, 'rejected')}
                                                                className="bg-red-100 text-red-800 p-1 rounded hover:bg-red-200"
                                                                title="Từ chối"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {rental.status === 'accepted' && (
                                                        <button
                                                            onClick={() => handleUpdateRentalStatus(rental.id, 'completed')}
                                                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs hover:bg-blue-200"
                                                        >
                                                            Hoàn thành
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Không tìm thấy đơn thuê nào.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </OwnerLayout>
    );
} 