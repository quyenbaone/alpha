import React from 'react';

export function EquipmentCare() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Bảo quản thiết bị</h1>
      <div className="prose prose-lg max-w-none">
        <p>
          Hướng dẫn chi tiết về cách bảo quản và sử dụng thiết bị đúng cách để đảm bảo tuổi thọ và hiệu suất tốt nhất.
        </p>

        <h2>Thiết bị chụp ảnh</h2>
        <ul>
          <li>Bảo quản trong môi trường khô ráo, tránh ẩm mốc</li>
          <li>Sử dụng túi chống shock khi di chuyển</li>
          <li>Vệ sinh ống kính thường xuyên bằng dụng cụ chuyên dụng</li>
          <li>Tránh để pin trong máy khi không sử dụng thời gian dài</li>
        </ul>

        <h2>Thiết bị âm thanh</h2>
        <ul>
          <li>Tránh để thiết bị ở nơi có nhiệt độ cao</li>
          <li>Không để thiết bị tiếp xúc trực tiếp với nước</li>
          <li>Kiểm tra và vệ sinh các cổng kết nối định kỳ</li>
          <li>Bảo quản dây cáp đúng cách, tránh gập góc</li>
        </ul>

        <h2>Dụng cụ cắm trại</h2>
        <ul>
          <li>Phơi khô hoàn toàn trước khi cất giữ</li>
          <li>Kiểm tra và vá các lỗ thủng nhỏ kịp thời</li>
          <li>Bảo quản ở nơi thoáng mát, tránh ánh nắng trực tiếp</li>
          <li>Vệ sinh sạch sẽ sau mỗi lần sử dụng</li>
        </ul>

        <h2>SUP</h2>
        <ul>
          <li>Rửa sạch với nước ngọt sau khi sử dụng ở biển</li>
          <li>Để khô hoàn toàn trước khi gấp và cất giữ</li>
          <li>Tránh để ván tiếp xúc với vật sắc nhọn</li>
          <li>Kiểm tra áp suất trước mỗi lần sử dụng</li>
        </ul>

        <h2>Lưu ý chung</h2>
        <ul>
          <li>Đọc kỹ hướng dẫn sử dụng trước khi dùng thiết bị</li>
          <li>Báo cáo ngay khi phát hiện bất kỳ hư hỏng nào</li>
          <li>Không tự ý sửa chữa khi không có chuyên môn</li>
          <li>Liên hệ hỗ trợ kỹ thuật khi cần thiết</li>
        </ul>
      </div>
    </div>
  );
}