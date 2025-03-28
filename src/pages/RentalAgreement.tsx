import React from 'react';

export function RentalAgreement() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Hợp đồng thuê</h1>
      <div className="prose prose-lg max-w-none">
        <p>
          Đây là các điều khoản và điều kiện chi tiết về việc thuê thiết bị trên nền tảng RentGear.
        </p>

        <h2>1. Định nghĩa</h2>
        <ul>
          <li>
            
            <strong>Người cho thuê:</strong> Cá nhân hoặc tổ chức sở hữu thiết bị và đăng ký cho thuê trên RentGear
          </li>
          <li>
            <strong>Người thuê:</strong> Cá nhân hoặc tổ chức thuê thiết bị thông qua nền tảng RentGear
          </li>
          <li>
            <strong>Thời gian thuê:</strong> Khoảng thời gian từ khi nhận đến khi trả thiết bị
          </li>
        </ul>

        <h2>2. Quyền và nghĩa vụ của người cho thuê</h2>
        <ul>
          <li>Cung cấp thiết bị đúng như mô tả</li>
          <li>Đảm bảo thiết bị hoạt động tốt</li>
          <li>Cung cấp hướng dẫn sử dụng đầy đủ</li>
          <li>Hỗ trợ kỹ thuật khi cần thiết</li>
        </ul>

        <h2>3. Quyền và nghĩa vụ của người thuê</h2>
        <ul>
          <li>Sử dụng thiết bị đúng mục đích</li>
          <li>Bảo quản thiết bị cẩn thận</li>
          <li>Trả thiết bị đúng hạn</li>
          <li>Báo cáo sự cố kịp thời</li>
        </ul>

        <h2>4. Thanh toán</h2>
        <ul>
          <li>Thanh toán đầy đủ trước khi nhận thiết bị</li>
          <li>Đặt cọc theo quy định</li>
          <li>Phí phát sinh (nếu có)</li>
        </ul>

        <h2>5. Bảo hiểm và trách nhiệm</h2>
        <ul>
          <li>Phạm vi bảo hiểm</li>
          <li>Quy trình yêu cầu bồi thường</li>
          <li>Trách nhiệm các bên</li>
        </ul>

        <h2>6. Chấm dứt hợp đồng</h2>
        <ul>
          <li>Điều kiện chấm dứt</li>
          <li>Quy trình hoàn trả</li>
          <li>Giải quyết tranh chấp</li>
        </ul>

        <div className="bg-secondary p-6 rounded-lg mt-8">
          <h3 className="text-xl font-semibold mb-4">Lưu ý quan trọng</h3>
          <p>
            Đây là bản tóm tắt hợp đồng thuê. Khi thực hiện giao dịch,
            bạn sẽ nhận được bản hợp đồng chi tiết qua email.
            Vui lòng đọc kỹ và liên hệ chúng tôi nếu có bất kỳ thắc mắc nào.
          </p>
        </div>
      </div>
    </div>
  );
}