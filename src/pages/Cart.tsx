import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PaymentForm from '../components/PaymentForm';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export function Cart() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, removeFromCart, clearCart } = useCartStore();
  const [showPayment, setShowPayment] = useState(false);

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
  };

  const handlePaymentSuccess = async () => {
    try {
      // TODO: Create rental records in database
      clearCart();
      toast.success('Thanh toán thành công!');
      navigate('/profile');
    } catch (error) {
      console.error('Error creating rental:', error);
      toast.error('Có lỗi xảy ra khi tạo đơn hàng');
    }
  };

  if (showPayment) {
    const orderInfo = items.map(item => {
      const days = Math.ceil(
        (item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return `${item.title} (${days} ngày)`;
    }).join(', ');

    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Thanh toán</h1>
        <PaymentForm
          amount={items.reduce((total, item) => {
            const days = Math.ceil(
              (item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            return total + item.price * days;
          }, 0) + 80000}
          orderInfo={orderInfo}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPayment(false)}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
              {items.map((item) => {
                const days = Math.ceil(
                  (item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                const total = item.price * days;

                return (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-md"
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
                          {item.startDate.toLocaleDateString('vi-VN')} -{' '}
                          {item.endDate.toLocaleDateString('vi-VN')}
                        </p>
                        <div className="flex justify-between items-end mt-2">
                          <p className="text-gray-600 text-sm">
                            {days} ngày x {item.price.toLocaleString('vi-VN')}đ
                          </p>
                          <span className="font-semibold text-orange-500">
                            {total.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
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
                <span>
                  {items
                    .reduce((total, item) => {
                      const days = Math.ceil(
                        (item.endDate.getTime() - item.startDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                      );
                      return total + item.price * days;
                    }, 0)
                    .toLocaleString('vi-VN')}
                  đ
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí dịch vụ</span>
                <span>30.000đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí bảo hiểm</span>
                <span>50.000đ</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Tổng cộng</span>
                  <span className="text-orange-500 text-lg">
                    {(
                      items.reduce((total, item) => {
                        const days = Math.ceil(
                          (item.endDate.getTime() - item.startDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                        );
                        return total + item.price * days;
                      }, 0) + 80000
                    ).toLocaleString('vi-VN')}
                    đ
                  </span>
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