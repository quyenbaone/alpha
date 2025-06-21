import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Speaker, Tent, Ship } from 'lucide-react';

export function BecomeLender() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Trở thành người cho thuê</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Biến thiết bị của bạn thành nguồn thu nhập thụ động. Dễ dàng đăng ký và bắt đầu cho thuê ngay hôm nay.
        </p>

        <div className="grid gap-8 mb-12">
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Các loại thiết bị cho thuê</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Camera,
                  title: 'Thiết bị chụp ảnh',
                  description: 'Máy ảnh, ống kính, đèn flash...',
                },
                {
                  icon: Speaker,
                  title: 'Thiết bị âm thanh',
                  description: 'Loa, micro, mixer...',
                },
                {
                  icon: Tent,
                  title: 'Đồ cắm trại',
                  description: 'Lều, túi ngủ, bếp gas...',
                },
                {
                  icon: Ship,
                  title: 'Thiết bị SUP',
                  description: 'Ván SUP, mái chèo, áo phao...',
                },
              ].map((item) => (
                <div key={item.title} className="flex flex-col items-center text-center p-4">
                  <item.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-medium mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Quy trình cho thuê</h2>
            <div className="space-y-4">
              {[
                {
                  title: 'Đăng ký thiết bị',
                  description: 'Tạo tài khoản và đăng thông tin thiết bị của bạn',
                },
                {
                  title: 'Nhận yêu cầu thuê',
                  description: 'Xem xét và phê duyệt các yêu cầu thuê từ người dùng',
                },
                {
                  title: 'Bàn giao thiết bị',
                  description: 'Gặp người thuê và bàn giao thiết bị theo lịch hẹn',
                },
                {
                  title: 'Nhận thanh toán',
                  description: 'Nhận tiền thuê sau khi hoàn thành giao dịch',
                },
              ].map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Bắt đầu cho thuê
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}