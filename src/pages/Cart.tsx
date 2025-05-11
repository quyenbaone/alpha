import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h1>
          <p className="text-gray-600 mb-8">
            Hãy thêm một số thiết bị vào giỏ hàng của bạn
          </p>
          <button
            onClick={() => navigate('/equipment')}
            className="bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600"
          >
            Xem thiết bị
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => {
              const days = Math.ceil(
                (item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60 * 60 * 24)
              );
              const total = item.price * days;

              return (
                <div
                  key={item.id}
                  className="flex gap-4 bg-white p-4 rounded-lg shadow-sm"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 text-sm">
                      {item.startDate.toLocaleDateString('vi-VN')} -{' '}
                      {item.endDate.toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {days} ngày x {item.price.toLocaleString('vi-VN')}đ
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-semibold text-orange-500">
                        {total.toLocaleString('vi-VN')}đ
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tổng đơn hàng</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
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
              <div className="flex justify-between">
                <span className="text-gray-600">Phí dịch vụ</span>
                <span>30.000đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí bảo hiểm</span>
                <span>50.000đ</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="font-semibold text-orange-500">
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
              className="w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-600 mt-6"
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}