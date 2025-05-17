import { Check, Eye, RefreshCw, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { OwnerLayout } from '../components/OwnerLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/utils'
import { useAuthStore } from '../store/authStore'

interface Rental {
    id: string
    equipment: {
        id: string
        title: string
        price_per_day: number
        images: string[]
    }
    renter: {
        id: string
        email: string
        full_name: string
        phone_number?: string
        address?: string // thêm address nếu có
    }
    equipment_id: string
    renter_id: string
    start_date: string
    end_date: string
    total_price: number
    status: string
    payment_status?: string
    created_at: string
}

export default function OwnerRentals() {
    const { user } = useAuthStore()
    const [rentals, setRentals] = useState<Rental[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
    const [showRentalDetails, setShowRentalDetails] = useState(false)
    const [editingStatus, setEditingStatus] = useState(false)
    const [newStatus, setNewStatus] = useState('')

    useEffect(() => {
        if (user) fetchRentals()
        // eslint-disable-next-line
    }, [user, statusFilter])

    const fetchRentals = async () => {
        setLoading(true)
        try {
            // @ts-expect-error - Supabase typing issues
            const { data: equipmentList, error: equipmentErr } = await supabase
                .from('equipment')
                .select('id, title, price_per_day, images')
                .eq('owner_id', user?.id || '')
            if (equipmentErr) throw equipmentErr

            const equipmentIds = equipmentList?.map((e: any) => e.id) ?? []
            if (!equipmentIds.length) {
                setRentals([])
                setLoading(false)
                return
            }

            // @ts-expect-error - Supabase typing issues
            let query = supabase
                .from('rentals')
                .select(
                    `*,equipment:equipment_id(id, title, price_per_day, images),renter:renter_id(id, email, full_name, phone_number, address)`
                )
                .in('equipment_id', equipmentIds)
                .order('created_at', { ascending: false })

            if (statusFilter !== 'all') {
                // @ts-expect-error - Supabase typing issues
                query = query.eq('status', statusFilter)
            }

            const { data, error } = await query
            if (error) throw error
            // @ts-expect-error - Supabase typing issues
            setRentals(data || [])
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu đơn thuê')
            setRentals([])
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateRentalStatus = async (rentalId: string, status: string) => {
        try {
            // @ts-expect-error - Supabase typing issues
            const { error } = await supabase
                .from('rentals')
                .update({ status })
                .eq('id', rentalId)
            if (error) throw error
            toast.success('Đã cập nhật trạng thái!')
            fetchRentals()
            setShowRentalDetails(false)
            setEditingStatus(false)
        } catch (error) {
            toast.error('Lỗi khi cập nhật trạng thái')
        }
    }

    const handleDeleteRental = async (rentalId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đơn thuê này không?')) return
        try {
            // @ts-expect-error - Supabase typing issues
            const { error } = await supabase
                .from('rentals')
                .delete()
                .eq('id', rentalId)
            if (error) throw error
            toast.success('Đã xóa đơn thuê thành công!')
            fetchRentals()
        } catch (error) {
            toast.error('Lỗi khi xóa đơn thuê')
        }
    }

    const filteredRentals = rentals.filter(
        (rental) =>
            rental.equipment?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rental.renter?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rental.renter?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' }
            case 'approved':
            case 'confirmed':
                return { text: 'Đã xác nhận', color: 'bg-green-100 text-green-800' }
            case 'delivering':
                return { text: 'Đang giao', color: 'bg-purple-100 text-purple-800' }
            case 'in_progress':
                return { text: 'Đang thuê', color: 'bg-blue-100 text-blue-800' }
            case 'rejected':
            case 'cancelled':
                return { text: 'Từ chối', color: 'bg-red-100 text-red-800' }
            case 'completed':
                return { text: 'Hoàn thành', color: 'bg-green-100 text-green-800' }
            default:
                return { text: status, color: 'bg-gray-100 text-gray-800' }
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
    }

    const handleEditStatus = () => {
        if (selectedRental) {
            setNewStatus(selectedRental.status)
            setEditingStatus(true)
        }
    }

    const handleSaveStatus = () => {
        if (selectedRental && newStatus) {
            handleUpdateRentalStatus(selectedRental.id, newStatus)
        }
    }

    const handleCancelEdit = () => {
        setEditingStatus(false)
    }

    return (
        <OwnerLayout>
            <div className="max-w-6xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-6 text-slate-800">Quản lý đơn thuê</h1>

                {/* Thanh search và filter */}
                <div className="mb-6 p-6 bg-white rounded-lg shadow-lg">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <Input
                            placeholder="Tìm kiếm tên thiết bị, email..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className="md:w-1/3"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border rounded-md bg-white"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ xác nhận</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="rejected">Từ chối</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                        <Button onClick={fetchRentals} variant="secondary" className="flex items-center gap-1">
                            <RefreshCw size={16} /> Làm mới
                        </Button>
                    </div>
                </div>

                {/* Bảng đơn thuê */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center py-24">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
                            <span className="text-gray-500 text-lg">Đang tải dữ liệu...</span>
                        </div>
                    ) : filteredRentals.length === 0 ? (
                        <div className="py-24 flex flex-col items-center">
                            <img src="/empty-state.svg" alt="No data" className="w-32 h-32 mb-6 opacity-40" />
                            <span className="text-gray-400">Không có đơn thuê nào.</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Thiết bị
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Người thuê
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Thời gian
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Tổng tiền
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredRentals.map((rental) => {
                                        const status = getStatusLabel(rental.status)
                                        return (
                                            <tr key={rental.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={rental.equipment?.images?.[0] || '/placeholder.png'}
                                                            alt={rental.equipment?.title}
                                                            className="h-12 w-12 object-cover rounded-xl border"
                                                            onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                                                        />
                                                        <div>
                                                            <div className="font-medium text-gray-800">{rental.equipment?.title}</div>
                                                            <div className="text-xs text-gray-500">{formatPrice(rental.equipment?.price_per_day)}/ngày</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-gray-900 font-medium">{rental.renter?.full_name || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">{rental.renter?.email}</div>
                                                    {rental.renter?.phone_number && (
                                                        <div className="text-xs text-gray-400">SĐT: {rental.renter.phone_number}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                                    {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-700">
                                                    {formatPrice(rental.total_price)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                                        {status.text}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <Button
                                                        variant="secondary"
                                                        className="mr-2 p-2"
                                                        onClick={() => {
                                                            setSelectedRental(rental)
                                                            setShowRentalDetails(true)
                                                        }}
                                                    >
                                                        <Eye size={16} />
                                                    </Button>
                                                    {rental.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                variant="primary"
                                                                className="mr-1 p-2 bg-green-500 hover:bg-green-600"
                                                                onClick={() => handleUpdateRentalStatus(rental.id, 'confirmed')}
                                                            >
                                                                <Check size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="primary"
                                                                className="p-2 bg-red-500 hover:bg-red-600"
                                                                onClick={() => handleUpdateRentalStatus(rental.id, 'cancelled')}
                                                            >
                                                                <X size={16} />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {rental.status === 'confirmed' && (
                                                        <Button
                                                            variant="primary"
                                                            className="p-2 bg-green-500 hover:bg-green-600"
                                                            onClick={() => handleUpdateRentalStatus(rental.id, 'completed')}
                                                        >
                                                            <Check size={16} />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="secondary"
                                                        className="ml-2 p-2"
                                                        onClick={() => handleDeleteRental(rental.id)}
                                                    >
                                                        <X size={16} className="text-red-500" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal chi tiết đơn thuê */}
                {showRentalDetails && selectedRental && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center border-b px-6 py-4">
                                <h2 className="text-xl font-bold text-slate-800">Chi tiết đơn thuê #{selectedRental.id}</h2>
                                <button
                                    onClick={() => setShowRentalDetails(false)}
                                    className="text-gray-500 hover:text-gray-800"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4 text-[15px]">
                                <div>
                                    <div className="mb-2 font-medium text-slate-600">Thiết bị:</div>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={selectedRental.equipment?.images?.[0] || '/placeholder.png'}
                                            alt={selectedRental.equipment?.title}
                                            className="h-12 w-12 object-cover rounded-xl border"
                                            onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                                        />
                                        <span className="font-semibold text-slate-800">{selectedRental.equipment?.title}</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 font-medium text-slate-600">Người thuê:</div>
                                    <div className="text-slate-800 font-medium">{selectedRental.renter?.full_name || 'N/A'}</div>
                                    <div className="text-sm text-gray-500">{selectedRental.renter?.email}</div>
                                </div>

                                <div>
                                    <div className="mb-2 font-medium text-slate-600">Địa chỉ:</div>
                                    <div className="text-slate-800">
                                        {selectedRental.renter?.address || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 font-medium text-slate-600">Số điện thoại:</div>
                                    <div className="text-slate-800">
                                        {selectedRental.renter?.phone_number || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 font-medium text-slate-600">Thời gian thuê:</div>
                                    <div className="text-slate-800">
                                        {formatDate(selectedRental.start_date)} - {formatDate(selectedRental.end_date)}
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 font-medium text-slate-600 flex justify-between items-center">
                                        <span>Trạng thái:</span>
                                        {!editingStatus && (
                                            <Button
                                                variant="secondary"
                                                className="py-1 px-3 text-xs"
                                                onClick={handleEditStatus}
                                            >
                                                Chỉnh sửa
                                            </Button>
                                        )}
                                    </div>
                                    {!editingStatus ? (
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusLabel(selectedRental.status).color}`}>
                                            {getStatusLabel(selectedRental.status).text}
                                        </span>
                                    ) : (
                                        <div className="flex gap-2 items-center">
                                            <select
                                                value={newStatus}
                                                onChange={(e) => setNewStatus(e.target.value)}
                                                className="border rounded px-3 py-2 text-sm flex-1"
                                            >
                                                <option value="pending">Chờ xác nhận</option>
                                                <option value="confirmed">Đã xác nhận</option>
                                                <option value="delivering">Đang giao</option>
                                                <option value="in_progress">Đang thuê</option>
                                                <option value="completed">Hoàn thành</option>
                                                <option value="cancelled">Đã hủy</option>
                                                <option value="rejected">Từ chối</option>
                                            </select>
                                            <Button
                                                variant="primary"
                                                className="p-2 bg-green-500 hover:bg-green-600"
                                                onClick={handleSaveStatus}
                                            >
                                                <Save size={16} />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                className="p-2"
                                                onClick={handleCancelEdit}
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="mb-2 font-medium text-slate-600">Tổng tiền:</div>
                                    <div className="text-lg font-bold text-blue-700">{formatPrice(selectedRental.total_price)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </OwnerLayout>
    )
}
