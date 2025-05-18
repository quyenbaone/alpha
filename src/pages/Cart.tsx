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
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
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

function toLocale(date: string | Date | undefined | null, locale = 'vi-VN'): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale);
}

function formatDateForSQL(date: any): string | null {
  if (!date) return null;
  if (typeof date === "string" && date.length === 10) return date;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

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
    setPaymentMethod(null);
  };

  const handlePaymentSuccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const equipmentIds = items.map(item => item.id);
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('id, owner_id')
        .in('id', equipmentIds);

      if (equipmentError || !equipmentData || equipmentData.length === 0) {
        throw new Error('Could not retrieve equipment information');
      }

      const ownerMap: any = {};
      equipmentData.forEach(eq => {
        if (eq && eq.id && eq.owner_id) ownerMap[eq.id] = eq.owner_id;
      });

      const calcTotal = (item: CartItem) => {
        const days = calcDays(item.startDate, item.endDate);
        const itemPrice = item.price * days;
        return itemPrice + SERVICE_FEE + INSURANCE_FEE;
      };

      const rentalsToInsert = items
        .filter(item => ownerMap[item.id])
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

      const { error: insertError } = await supabase
        .from('rentals')
        .insert(rentalsToInsert);

      if (insertError) throw new Error('Failed to create rentals');

      clearCart();
      toast.success('Thanh toán thành công!');
      navigate('/profile?fromCheckout=true');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo đơn hàng');
    }
  };

  const handleCOD = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const equipmentIds = items.map(item => item.id);
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('id, owner_id')
        .in('id', equipmentIds);

      if (equipmentError || !equipmentData || equipmentData.length === 0) {
        throw new Error('Could not retrieve equipment information');
      }

      const ownerMap: any = {};
      equipmentData.forEach(eq => {
        if (eq && eq.id && eq.owner_id) ownerMap[eq.id] = eq.owner_id;
      });

      const calcTotal = (item: CartItem) => {
        const days = calcDays(item.startDate, item.endDate);
        const itemPrice = item.price * days;
        return itemPrice + SERVICE_FEE + INSURANCE_FEE;
      };

      const rentalsToInsert = items
        .filter(item => ownerMap[item.id])
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

      const { error: insertError } = await supabase
        .from('rentals')
        .insert(rentalsToInsert);

      if (insertError) throw new Error('Failed to create rentals');

      clearCart();
      toast.success('Đặt đơn thành công! Bạn sẽ thanh toán khi nhận thiết bị.');
      navigate('/profile?fromCheckout=true');
    } catch (error) {
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

    if (!paymentMethod) {
      return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Chọn phương thức thanh toán</h1>
          <div className="space-y-4">
            <button
              className="w-full px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-left hover:bg-orange-50 dark:hover:bg-orange-900 focus:bg-orange-100 transition-colors dark:text-white"
              onClick={() => setPaymentMethod('online')}
            >
              <span className="font-semibold">Thanh toán online</span> (VNPay, MoMo, Visa...)
            </button>
            <button
              className="w-full px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-left hover:bg-orange-50 dark:hover:bg-orange-900 focus:bg-orange-100 transition-colors dark:text-white"
              onClick={() => setPaymentMethod('cod')}
            >
              <span className="font-semibold">Thanh toán khi nhận thiết bị</span> (COD)
            </button>
            <button
              onClick={() => setShowPayment(false)}
              className="block w-full text-center mt-6 text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Quay lại giỏ hàng
            </button>
          </div>
        </div>
      );
    }

    if (paymentMethod === 'cod') {
      return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Xác nhận đơn hàng</h1>
          <div className="mb-4">
            <span className="font-semibold text-gray-700 dark:text-gray-200">Bạn đã chọn:</span> <br />
            <span className="text-orange-500 font-medium">Thanh toán khi nhận thiết bị</span>
          </div>
          <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">
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
            className="block w-full text-center mt-6 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Quay lại giỏ hàng
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Thanh toán</h1>
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
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-8">
        <div className="text-center">
          <svg className="w-24 h-24 text-gray-300 dark:text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Giỏ hàng trống</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Giỏ hàng của bạn</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-medium text-gray-700 dark:text-gray-200">Thiết bị đã chọn ({items.length})</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map(item => {
                const days = calcDays(item.startDate, item.endDate);
                const totalItem = (item.price || 0) * days;
                return (
                  <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex gap-4">
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-md bg-gray-100 dark:bg-gray-700"
                        onError={e => e.currentTarget.src = '/placeholder.png'}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-600 text-sm"
                          >
                            Xóa
                          </button>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                          {toLocale(item.startDate)} - {toLocale(item.endDate)}
                        </p>
                        <div className="flex justify-between items-end mt-2">
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
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
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm sticky top-28">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tổng đơn hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Tạm tính</span>
                <span>{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Phí dịch vụ</span>
                <span>{SERVICE_FEE.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Phí bảo hiểm</span>
                <span>{INSURANCE_FEE.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="border-t dark:border-gray-700 pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span className="dark:text-gray-200">Tổng cộng</span>
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
              <Link to="/equipment" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm">
                ← Tiếp tục xem thiết bị
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
