import React from 'react';

export function Blog() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="grid gap-12">
        <article className="grid md:grid-cols-2 gap-8">
          <img
            src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32"
            alt="Camera gear"
            className="rounded-lg aspect-video object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Hướng dẫn chọn thiết bị chụp ảnh cho người mới bắt đầu
            </h2>
            <p className="text-muted-foreground mb-4">
              Tìm hiểu các yếu tố cần cân nhắc khi chọn máy ảnh và ống kính phù hợp với nhu cầu của bạn...
            </p>
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                alt="Author"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">Nguyễn Văn A</p>
                <p className="text-sm text-muted-foreground">12 tháng 3, 2024</p>
              </div>
            </div>
          </div>
        </article>

        <article className="grid md:grid-cols-2 gap-8">
          <img
            src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4"
            alt="Camping gear"
            className="rounded-lg aspect-video object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold mb-4">
              5 địa điểm cắm trại đẹp nhất miền Bắc
            </h2>
            <p className="text-muted-foreground mb-4">
              Khám phá những địa điểm cắm trại tuyệt vời với cảnh quan thiên nhiên hùng vĩ...
            </p>
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
                alt="Author"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">Trần Thị B</p>
                <p className="text-sm text-muted-foreground">10 tháng 3, 2024</p>
              </div>
            </div>
          </div>
        </article>

        <article className="grid md:grid-cols-2 gap-8">
          <img
            src="https://images.unsplash.com/photo-1545454675-3531b543be5d"
            alt="Audio equipment"
            className="rounded-lg aspect-video object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Cách setup phòng thu âm tại nhà
            </h2>
            <p className="text-muted-foreground mb-4">
              Những thiết bị cần thiết và cách bố trí để có được chất lượng âm thanh tốt nhất...
            </p>
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
                alt="Author"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">Lê Văn C</p>
                <p className="text-sm text-muted-foreground">8 tháng 3, 2024</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}