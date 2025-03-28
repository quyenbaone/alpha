import React from 'react';

export function Insurance() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Thông tin bảo hiểm</h1>
      <div className="prose prose-lg max-w-none">
        <p>
          Alpha hợp tác với các công ty bảo hiểm hàng đầu để đảm bảo an toàn cho mọi giao dịch trên nền tảng.
        </p>

        <h2>Phạm vi bảo hiểm</h2>
        <ul>
          <li>Thiệt hại vật lý do tai nạn</li>
          <li>Mất cắp có báo cáo công an</li>
          <li>Hư hỏng do sự cố kỹ thuật</li>
          <li>Thiệt hại do thiên tai</li>
        </ul>

        <h2>Mức độ bảo hiểm</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Cơ bản</h3>
            <ul>
              <li>Bảo hiểm 80% giá trị thiết bị</li>
              <li>Miễn thường 500,000đ</li>
              <li>Thời gian giải quyết 7 ngày</li>
            </ul>
          </div>

          <div className="bg-card p-6 rounded-lg border-2 border-primary">
            <h3 className="text-xl font-semibold mb-4">Nâng cao</h3>
            <ul>
              <li>Bảo hiểm 100% giá trị thiết bị</li>
              <li>Miễn thường 200,000đ</li>
              <li>Thời gian giải quyết 5 ngày</li>
            </ul>
          </div>

          <div className="bg-card p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Cao cấp</h3>
            <ul>
              <li>Bảo hiểm 120% giá trị thiết bị</li>
              <li>Không miễn thường</li>
              <li>Thời gian giải quyết 3 ngày</li>
            </ul>
          </div>
        </div>

        <h2>Quy trình yêu cầu bồi thường</h2>
        <ol>
          <li>Báo cáo sự cố trong vòng 24 giờ</li>
          <li>Cung cấp hình ảnh và mô tả chi tiết</li>
          <li>Nộp các giấy tờ cần thiết</li>
          <li>Chờ xác minh và phê duyệt</li>
          <li>Nhận bồi thường</li>
        </ol>

        <h2>Điều khoản loại trừ</h2>
        <ul>
          <li>Thiệt hại do sử dụng sai mục đích</li>
          <li>Hao mòn tự nhiên</li>
          <li>Mất mát không có bằng chứng</li>
          <li>Thiệt hại do cố ý</li>
        </ul>

        <div className="bg-secondary p-6 rounded-lg mt-8">
          <h3 className="text-xl font-semibold mb-4">Liên hệ bảo hiểm</h3>
          <p>
            Để biết thêm thông tin chi tiết hoặc yêu cầu bồi thường, vui lòng liên hệ:
            <br />
            Hotline: 1900 1234
            <br />
            Email: insurance@alpha.vn
          </p>
        </div>
      </div>
    </div>
  );
}