import React from 'react';

export function Cookies() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Cài đặt cookie</h1>
      <div className="prose prose-lg max-w-none">
        <p>
          RentGear sử dụng cookie để cải thiện trải nghiệm người dùng và cung cấp dịch vụ tốt hơn.
        </p>

        <h2>Cookie là gì?</h2>
        <p>
          Cookie là những tệp văn bản nhỏ được lưu trữ trên thiết bị của bạn khi truy cập website.
          Chúng giúp chúng tôi ghi nhớ các tùy chọn và cải thiện trải nghiệm của bạn.
        </p>

        <h2>Các loại cookie chúng tôi sử dụng</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-card rounded-lg">
            <div>
              <h3 className="font-semibold">Cookie cần thiết</h3>
              <p className="text-muted-foreground">
                Cần thiết để website hoạt động, không thể tắt
              </p>
            </div>
            <div className="w-12 h-6 bg-primary rounded-full"></div>
          </div>

          <div className="flex items-center justify-between p-4 bg-card rounded-lg">
            <div>
              <h3 className="font-semibold">Cookie phân tích</h3>
              <p className="text-muted-foreground">
                Giúp chúng tôi hiểu cách bạn sử dụng website
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-card rounded-lg">
            <div>
              <h3 className="font-semibold">Cookie tiếp thị</h3>
              <p className="text-muted-foreground">
                Được sử dụng để hiển thị quảng cáo phù hợp
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        <h2 className="mt-12">Quản lý cookie</h2>
        <p>
          Bạn có thể quản lý cài đặt cookie thông qua trình duyệt của mình.
          Tuy nhiên, việc tắt một số cookie có thể ảnh hưởng đến trải nghiệm của bạn trên website.
        </p>

        <div className="flex justify-end gap-4 mt-8">
          <button className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg">
            Từ chối tất cả
          </button>
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg">
            Chấp nhận tất cả
          </button>
        </div>
      </div>
    </div>
  );
}