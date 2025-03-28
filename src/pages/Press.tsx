import React from 'react';

export function Press() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Trung tâm báo chí</h1>
      <div className="prose prose-lg max-w-none">
        <p>
          Tìm hiểu thêm về RentGear qua các bài báo và thông cáo báo chí.
        </p>

        <h2>Thông cáo báo chí mới nhất</h2>
        <div className="grid gap-8">
          <article className="border-b pb-8">
            <time className="text-sm text-muted-foreground">15 tháng 3, 2024</time>
            <h3 className="text-xl font-semibold mt-2 mb-4">
              RentGear nhận đầu tư 2 triệu USD từ quỹ đầu tư ABC Ventures
            </h3>
            <p className="text-muted-foreground">
              Khoản đầu tư sẽ được sử dụng để mở rộng thị trường và phát triển công nghệ...
            </p>
          </article>

          <article className="border-b pb-8">
            <time className="text-sm text-muted-foreground">1 tháng 3, 2024</time>
            <h3 className="text-xl font-semibold mt-2 mb-4">
              RentGear ra mắt tính năng bảo hiểm thiết bị
            </h3>
            <p className="text-muted-foreground">
              Người dùng có thể yên tâm hơn khi thuê thiết bị với chính sách bảo hiểm mới...
            </p>
          </article>

          <article className="border-b pb-8">
            <time className="text-sm text-muted-foreground">15 tháng 2, 2024</time>
            <h3 className="text-xl font-semibold mt-2 mb-4">
              RentGear đạt mốc 10,000 giao dịch thành công
            </h3>
            <p className="text-muted-foreground">
              Một cột mốc quan trọng khẳng định sự tin tưởng của cộng đồng...
            </p>
          </article>
        </div>

        <h2 className="mt-12">Liên hệ báo chí</h2>
        <p>
          Để biết thêm thông tin hoặc yêu cầu phỏng vấn, vui lòng liên hệ:
          <br />
          Email: press@rentgear.vn
          <br />
          Phone: (024) 1234 5678
        </p>
      </div>
    </div>
  );
}