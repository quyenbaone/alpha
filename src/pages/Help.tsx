import React from 'react';

export function Help() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Trung tâm trợ giúp</h1>
      <div className="prose prose-lg max-w-none">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2>Câu hỏi thường gặp</h2>
            <div className="space-y-6">
              <details className="group">
                <summary className="font-medium cursor-pointer">
                  Làm thế nào để đặt thuê thiết bị?
                </summary>
                <p className="mt-4 text-muted-foreground">
                  Để đặt thuê thiết bị, bạn cần đăng ký tài khoản, chọn thiết bị muốn thuê,
                  chọn ngày thuê và thanh toán. Chúng tôi sẽ xác nhận đơn đặt thuê trong vòng 24 giờ.
                </p>
              </details>

              <details className="group">
                <summary className="font-medium cursor-pointer">
                  Làm thế nào để trở thành người cho thuê?
                </summary>
                <p className="mt-4 text-muted-foreground">
                  Để trở thành người cho thuê, bạn cần đăng ký tài khoản, xác minh danh tính,
                  và đăng thông tin thiết bị cho thuê. Chúng tôi sẽ xem xét và phê duyệt trong vòng 48 giờ.
                </p>
              </details>

              <details className="group">
                <summary className="font-medium cursor-pointer">
                  Chính sách bảo hiểm như thế nào?
                </summary>
                <p className="mt-4 text-muted-foreground">
                  Mọi giao dịch trên RentGear đều được bảo hiểm 100% giá trị thiết bị.
                  Trong trường hợp xảy ra sự cố, chúng tôi sẽ hỗ trợ giải quyết và bồi thường theo quy định.
                </p>
              </details>
            </div>
          </div>

          <div>
            <h2>Liên hệ hỗ trợ</h2>
            <p>
              Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7.
            </p>
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-muted-foreground">support@rentgear.vn</p>
              </div>
              <div>
                <h3 className="font-medium">Hotline</h3>
                <p className="text-muted-foreground">1900 1234</p>
              </div>
              <div>
                <h3 className="font-medium">Địa chỉ</h3>
                <p className="text-muted-foreground">
                  123 Đường ABC, Quận 1, TP HCM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}