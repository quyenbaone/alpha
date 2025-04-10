import { ArrowLeft, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export function Cart() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const total = items.reduce(
    (sum, item) => sum + item.equipment.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để tiếp tục');
      navigate('/signin');
      return;
    }

    if (items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    try {
      // Validate dates for each item
      for (const item of items) {
        if (!item.startDate || !item.endDate) {
          toast.error('Vui lòng chọn ngày thuê cho tất cả thiết bị');
          return;
        }

        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        const today = new Date();

        if (startDate < today) {
          toast.error('Ngày bắt đầu không thể là ngày trong quá khứ');
          return;
        }

        if (endDate <= startDate) {
          toast.error('Ngày kết thúc phải sau ngày bắt đầu');
          return;
        }
      }

      // Check equipment availability
      for (const item of items) {
        const { data: existingRentals, error: rentalError } = await supabase
          .from('rentals')
          .select('*')
          .eq('equipment_id', item.equipment.id)
          .in('status', ['pending', 'approved']);

        if (rentalError) throw rentalError;

        const isOverlapping = existingRentals?.some(rental => {
          const rentalStart = new Date(rental.start_date);
          const rentalEnd = new Date(rental.end_date);
          const itemStart = new Date(item.startDate);
          const itemEnd = new Date(item.endDate);

          return (
            (itemStart >= rentalStart && itemStart <= rentalEnd) ||
            (itemEnd >= rentalStart && itemEnd <= rentalEnd) ||
            (itemStart <= rentalStart && itemEnd >= rentalEnd)
          );
        });

        if (isOverlapping) {
          toast.error(`Thiết bị "${item.equipment.title}" đã được đặt thuê trong khoảng thời gian này`);
          return;
        }
      }

      // Create rental records for each item
      for (const item of items) {
        const { error } = await supabase.from('rentals').insert({
          equipment_id: item.equipment.id,
          renter_id: user.id,
          start_date: item.startDate,
          end_date: item.endDate,
          status: 'pending',
        });

        if (error) throw error;
      }

      // Clear cart after successful checkout
      clearCart();
      toast.success('Đặt thuê thành công! Vui lòng chờ xác nhận.');
      navigate('/profile');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Đã xảy ra lỗi khi đặt thuê. Vui lòng thử lại sau.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
          <p className="text-muted-foreground mb-8">
            Bạn chưa có thiết bị nào trong giỏ hàng.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Tiếp tục thuê thiết bị
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Giỏ hàng của bạn</h1>

        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.equipment.id} className="p-6">
                <div className="flex gap-6">
                  <img
                    src={item.equipment.image}
                    alt={item.equipment.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.equipment.title}</h3>
                    <p className="text-gray-600">
                      {item.equipment.location}
                    </p>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-600">
                        Ngày bắt đầu: {new Date(item.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Ngày kết thúc: {new Date(item.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">
                          Số lượng
                        </label>
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.equipment.id,
                              parseInt(e.target.value)
                            )
                          }
                          className="px-3 py-1 border rounded-lg"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => removeItem(item.equipment.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {formatPrice(item.equipment.price * item.quantity)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.equipment.price)}/ngày
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-muted">
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold">Tổng cộng</span>
              <span className="text-2xl font-bold">{formatPrice(total)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Tiến hành thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}