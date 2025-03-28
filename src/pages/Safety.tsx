import React from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

export function Safety() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">An toàn</h1>
      <div className="prose prose-lg max-w-none">
        <p className="lead">
        Alpha cam kết đảm bảo an toàn cho mọi giao dịch và người dùng trên nền tảng.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-4">Bảo vệ thiết bị</h3>
            <p className="text-muted-foreground">
              Mọi thiết bị đều được bảo hiểm 100% giá trị trong suốt thời gian cho thuê
            </p>
          </div>

          <div className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-4">Bảo mật thông tin</h3>
            <p className="text-muted-foreground">
              Thông tin cá nhân và thanh toán được mã hóa và bảo vệ theo tiêu chuẩn quốc tế
            </p>
          </div>

          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-4">Xác minh người dùng</h3>
            <p className="text-muted-foreground">
              Mọi người dùng đều phải xác minh danh tính trước khi tham gia giao dịch
            </p>
          </div>
        </div>

        <h2 className="mt-12">Quy trình đảm bảo an toàn</h2>
        <ol>
          <li>Kiểm tra và xác minh danh tính người dùng</li>
          <li>Kiểm định chất lượng thiết bị trước khi cho thuê</li>
          <li>Thanh toán an toàn qua cổng thanh toán được bảo mật</li>
          <li>Giám sát giao dịch trong suốt thời gian thuê</li>
          <li>Hỗ trợ 24/7 khi có sự cố xảy ra</li>
        </ol>

        <h2>Báo cáo vấn đề</h2>
        <p>
          Nếu bạn gặp bất kỳ vấn đề nào về an toàn, vui lòng liên hệ ngay với chúng tôi:
        </p>
        <ul>
          <li>Hotline: 1900 1234</li>
          <li>Email: safety@alpha.vn</li>
        </ul>
      </div>
    </div>
  );
}