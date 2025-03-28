import React from 'react';

export function About() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Về Alpha</h1>
      <div className="prose prose-lg max-w-none">
        <p>
        Alpha là nền tảng chia sẻ thiết bị hàng đầu tại Việt Nam, kết nối những người có thiết bị chuyên nghiệp với những người cần sử dụng chúng.
        </p>
        <p>
          Chúng tôi tin rằng việc chia sẻ thiết bị không chỉ giúp tối ưu hóa việc sử dụng tài nguyên mà còn tạo ra một cộng đồng những người đam mê sáng tạo và khám phá.
        </p>
      </div>
    </div>
  );
}