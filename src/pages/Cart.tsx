import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PaymentForm from '../components/PaymentForm';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

// Define types for our cart items
interface CartItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  startDate: Date;
  endDate: Date;
}

const SERVICE_FEE = 30000;
const INSURANCE_FEE = 50000;

function calcDays(startDate: any, endDate: any): number {
  // Convert sang Date nếu là string
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  // Nếu giá trị invalid, trả về 1
  if (!start || !end || typeof start.getTime !== 'function' || typeof end.getTime !== 'function') return 1;
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
  const diff = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(diff, 1);
}

function calcSubtotal(items: CartItem[]): number {
  return items.reduce((total: number, item: CartItem) => {
    const days = calcDays(item.startDate, item.endDate);
    return total + (item.price || 0) * days;
  }, 0);
}

// Helper function to safely format dates
function toLocale(date: string | Date | undefined | null, locale = 'vi-VN'): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale);
}

// Format date for SQL storage (YYYY-MM-DD)
function formatDateForSQL(date: any): string | null {
  if (!date) return null;
  if (typeof date === "string" && date.length === 10) return date; // "YYYY-MM-DD"
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  // Make sure to output the correct YYYY-MM-DD format
  return d.toISOString().slice(0, 10);
}

// Helper function to normalize dates to ISO strings for database insertion
/*
function normalizeToISOString(val: any): string | null {
  if (!val) return null;
  if (typeof val === "string") {
    // If val is already in ISO string format, return it directly
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) return val.split('T')[0];
    // If it's a string but not in ISO format, convert to Date
    const d = new Date(val);
    return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : null;
  }
  if (typeof val === "object" && typeof val.toISOString === "function") {
    return val.toISOString().split('T')[0];
  }
  return null;
}
*/

export function Cart() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, removeFromCart, clearCart } = useCartStore();

  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod' | null>(null);

  const subtotal = calcSubtotal(items);
  const total = subtotal + SERVICE_FEE + INSURANCE_FEE;

  const handleCheckout = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      navigate('/signin');
      return;
    }
    if (items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    setShowPayment(true);
    setPaymentMethod(null); // Bắt buộc chọn lại phương thức thanh toán
  };

  const handlePaymentSuccess = async () => {
    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First fetch all owner_ids for the equipment in one batch
      const equipmentIds = items.map(item => item.id);
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('id, owner_id')
        .in('id', equipmentIds);

      if (equipmentError || !equipmentData || equipmentData.length === 0) {
        console.error('Error fetching equipment owners:', equipmentError);
        throw new Error('Could not retrieve equipment information');
      }

      // Create a map of equipment IDs to owner IDs for quick lookup
      const ownerMap = {};
      equipmentData.forEach(eq => {
        if (eq && eq.id && eq.owner_id) {
          ownerMap[eq.id] = eq.owner_id;
        }
      });

      // Function to calculate total price for each item
      const calcTotal = (item) => {
        const days = calcDays(item.startDate, item.endDate);
        const itemPrice = item.price * days;
        return itemPrice + SERVICE_FEE + INSURANCE_FEE;
      };

      // Create the rental objects for batch insertion
      const rentalsToInsert = items
        .filter(item => ownerMap[item.id]) // Only include items where we found the owner
        .map(item => ({
          equipment_id: item.id,
          renter_id: user.id,
          owner_id: ownerMap[item.id],
          start_date: formatDateForSQL(item.startDate),
          end_date: formatDateForSQL(item.endDate),
          total_price: calcTotal(item),
          status: 'pending',
          is_approved: false,
          cancel_reason: null
        }));

      if (rentalsToInsert.length === 0) {
        throw new Error('No valid rental items to process');
      }

      // Insert all rentals in a single batch
      const { error: insertError } = await supabase
        .from('rentals')
        .insert(rentalsToInsert);

      if (insertError) {
        console.error('Error creating rentals:', insertError);
        throw new Error('Failed to create rentals');
      }

      clearCart();
      toast.success('Thanh toán thành công!');
      navigate('/profile?fromCheckout=true');
    } catch (error) {
      console.error('Error creating rental:', error);
      toast.error('Có lỗi xảy ra khi tạo đơn hàng');
    }
  };

  // Xác nhận thanh toán khi nhận hàng (COD)
  const handleCOD = async () => {
    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First fetch all owner_ids for the equipment in one batch
      const equipmentIds = items.map(item => item.id);
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('id, owner_id')
        .in('id', equipmentIds);

      if (equipmentError || !equipmentData || equipmentData.length === 0) {
        console.error('Error fetching equipment owners:', equipmentError);
        throw new Error('Could not retrieve equipment information');
      }

      // Create a map of equipment IDs to owner IDs for quick lookup
      const ownerMap = {};
      equipmentData.forEach(eq => {
        if (eq && eq.id && eq.owner_id) {
          ownerMap[eq.id] = eq.owner_id;
        }
      });

      // Function to calculate total price for each item
      const calcTotal = (item) => {
        const days = calcDays(item.startDate, item.endDate);
        const itemPrice = item.price * days;
        return itemPrice + SERVICE_FEE + INSURANCE_FEE;
      };

      // Create the rental objects for batch insertion
      const rentalsToInsert = items
        .filter(item => ownerMap[item.id]) // Only include items where we found the owner
        .map(item => ({
          equipment_id: item.id,
          renter_id: user.id,
          owner_id: ownerMap[item.id],
          start_date: formatDateForSQL(item.startDate),
          end_date: formatDateForSQL(item.endDate),
          total_price: calcTotal(item),
          status: 'pending',
          is_approved: false,
          cancel_reason: null
        }));

      if (rentalsToInsert.length === 0) {
        throw new Error('No valid rental items to process');
      }

      // Insert all rentals in a single batch
      const { error: insertError } = await supabase
        .from('rentals')
        .insert(rentalsToInsert);

      if (insertError) {
        console.error('Error creating rentals:', insertError);
        throw new Error('Failed to create rentals');
      }

      clearCart();
      toast.success('Đặt đơn thành công! Bạn sẽ thanh toán khi nhận thiết bị.');
      navigate('/profile?fromCheckout=true');
    } catch (error) {
      console.error('Error creating rental:', error);
      toast.error('Có lỗi xảy ra khi tạo đơn hàng');
    }
  };

  // --- PAYMENT SCREEN ---
  if (showPayment) {
    const orderInfo = items
      .map(item => {
        const days = calcDays(item.startDate, item.endDate);
        return `${item.title} (${days} ngày)`;
      })
      .join(', ');

    // 1. Bắt buộc chọn phương thức thanh toán trước
    if (!paymentMethod) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Chọn phương thức thanh toán</h1>
          <div className="space-y-4">
            <button
              className="w-full px-6 py-3 border rounded-lg text-left hover:bg-orange-50 focus:bg-orange-100 transition-colors"
              onClick={() => setPaymentMethod('online')}
            >
              <span className="font-semibold">Thanh toán online</span> (VNPay, MoMo, Visa...)
            </button>
            <button
              className="w-full px-6 py-3 border rounded-lg text-left hover:bg-orange-50 focus:bg-orange-100 transition-colors"
              onClick={() => setPaymentMethod('cod')}
            >
              <span className="font-semibold">Thanh toán khi nhận thiết bị</span> (COD)
            </button>
            <button
              onClick={() => setShowPayment(false)}
              className="block w-full text-center mt-6 text-blue-600 hover:underline"
            >
              ← Quay lại giỏ hàng
            </button>
          </div>
        </div>
      );
    }

    // 2. Nếu chọn COD (thanh toán khi nhận hàng)
    if (paymentMethod === 'cod') {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Xác nhận đơn hàng</h1>
          <div className="mb-4">
            <span className="font-semibold text-gray-700">Bạn đã chọn:</span> <br />
            <span className="text-orange-500 font-medium">Thanh toán khi nhận thiết bị</span>
          </div>
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border text-gray-700">
            <b>Số tiền phải thanh toán:</b> <br />
            <span className="text-orange-500 text-lg font-bold">
              {total.toLocaleString('vi-VN')}đ
            </span>
            <div className="mt-2 text-sm">Thanh toán trực tiếp khi nhận thiết bị.</div>
          </div>
          <button
            onClick={handleCOD}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-sm"
          >
            Xác nhận đặt đơn
          </button>
          <button
            onClick={() => {
              setPaymentMethod(null);
              setShowPayment(false);
            }}
            className="block w-full text-center mt-6 text-blue-600 hover:underline"
          >
            ← Quay lại giỏ hàng
          </button>
        </div>
      );
    }

    // 3. Nếu chọn thanh toán online
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Thanh toán</h1>
        <PaymentForm
          amount={total}
          orderInfo={orderInfo}
          onSuccess={handlePaymentSuccess}
          onCancel={() => {
            setPaymentMethod(null);
            setShowPayment(false);
          }}
        />
      </div>
    );
  }

  // --- EMPTY CART ---
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Hãy thêm một số thiết bị vào giỏ hàng của bạn để tiếp tục quá trình thuê thiết bị
          </p>
          <Link
            to="/equipment"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
          >
            Xem thiết bị
          </Link>
        </div>
      </div>
    );
  }

  // --- MAIN CART ---
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Giỏ hàng của bạn</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="font-medium text-gray-700">Thiết bị đã chọn ({items.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map(item => {
                const days = calcDays(item.startDate, item.endDate);
                const totalItem = (item.price || 0) * days;
                return (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-4">
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-md bg-gray-100"
                        onError={e => e.currentTarget.src = '/placeholder.png'}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-gray-900">{item.title}</h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-600 text-sm"
                          >
                            Xóa
                          </button>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          {toLocale(item.startDate)} - {toLocale(item.endDate)}
                        </p>
                        <div className="flex justify-between items-end mt-2">
                          <p className="text-gray-600 text-sm">
                            {days} ngày x {(item.price || 0).toLocaleString('vi-VN')}đ
                          </p>
                          <span className="font-semibold text-orange-500">
                            {totalItem.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm sticky top-28">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng đơn hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính</span>
                <span>{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí dịch vụ</span>
                <span>{SERVICE_FEE.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí bảo hiểm</span>
                <span>{INSURANCE_FEE.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Tổng cộng</span>
                  <span className="text-orange-500 text-lg">{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors mt-6 font-medium shadow-sm"
            >
              Thanh toán
            </button>
            <div className="mt-4 text-center">
              <Link to="/equipment" className="text-blue-600 hover:text-blue-800 text-sm">
                ← Tiếp tục xem thiết bị
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
