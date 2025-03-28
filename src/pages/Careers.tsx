import React from 'react';

export function Careers() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Tuyển dụng</h1>
      <div className="prose prose-lg max-w-none">
        <p>
        Alpha đang tìm kiếm những người tài năng để cùng xây dựng nền tảng chia sẻ thiết bị hàng đầu Việt Nam.
        </p>

        <h2>Vị trí đang tuyển</h2>
        <div className="grid gap-6">
          <div className="bg-card p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Senior Full Stack Developer</h3>
            <p className="text-muted-foreground mb-4">
              Phát triển và duy trì các tính năng chính của nền tảng Alpha
            </p>
            <div className="flex gap-4">
              <span className="text-sm bg-secondary px-3 py-1 rounded-full">Remote</span>
              <span className="text-sm bg-secondary px-3 py-1 rounded-full">Full-time</span>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Product Manager</h3>
            <p className="text-muted-foreground mb-4">
              Định hướng phát triển sản phẩm và làm việc với các team để đạt mục tiêu kinh doanh
            </p>
            <div className="flex gap-4">
              <span className="text-sm bg-secondary px-3 py-1 rounded-full">Hà Nội</span>
              <span className="text-sm bg-secondary px-3 py-1 rounded-full">Full-time</span>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Customer Support Specialist</h3>
            <p className="text-muted-foreground mb-4">
              Hỗ trợ khách hàng và đảm bảo trải nghiệm tốt nhất trên nền tảng
            </p>
            <div className="flex gap-4">
              <span className="text-sm bg-secondary px-3 py-1 rounded-full">TP HCM</span>
              <span className="text-sm bg-secondary px-3 py-1 rounded-full">Full-time</span>
            </div>
          </div>
        </div>

        <h2 className="mt-12">Quyền lợi</h2>
        <ul>
          <li>Mức lương cạnh tranh</li>
          <li>Bảo hiểm sức khỏe cho nhân viên và người thân</li>
          <li>Chế độ nghỉ phép linh hoạt</li>
          <li>Môi trường làm việc năng động, sáng tạo</li>
          <li>Cơ hội học hỏi và phát triển</li>
        </ul>
      </div>
    </div>
  );
}