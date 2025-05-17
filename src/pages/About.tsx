import { Users } from 'lucide-react';

export function About() {
  return (
    <div className="container mx-auto px-4 py-12 pt-28">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Về chúng tôi</h1>

        <div className="bg-white p-8 rounded-lg shadow-md mb-12">
          <h2 className="text-2xl font-semibold mb-6">Câu chuyện của chúng tôi</h2>
          <p className="text-gray-700 mb-6">
            Alpha được thành lập vào năm 2025 với sứ mệnh đơn giản: Giúp mọi người tiếp cận với thiết bị chất lượng cao mà không cần phải mua. Chúng tôi tin rằng nền kinh tế chia sẻ là tương lai, và việc thuê thiết bị không chỉ tiết kiệm chi phí mà còn góp phần bảo vệ môi trường.
          </p>
          <p className="text-gray-700 mb-6">
            Từ một ý tưởng nhỏ, chúng tôi đã phát triển thành nền tảng cho thuê thiết bị hàng đầu tại Việt Nam, kết nối hàng nghìn chủ sở hữu thiết bị với những người có nhu cầu thuê ngắn hạn hoặc dài hạn.
          </p>
          <p className="text-gray-700">
            Sứ mệnh của chúng tôi là tạo ra một cộng đồng nơi mọi người có thể dễ dàng chia sẻ tài nguyên, tiết kiệm chi phí và cùng nhau xây dựng một tương lai bền vững hơn.
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md mb-12">
          <h2 className="text-2xl font-semibold mb-6">Giá trị cốt lõi</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-3 text-orange-600">Tin cậy</h3>
              <p className="text-gray-700">
                Chúng tôi xây dựng niềm tin thông qua sự minh bạch và trung thực trong mọi giao dịch.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-3 text-orange-600">Chất lượng</h3>
              <p className="text-gray-700">
                Chúng tôi đảm bảo mọi thiết bị trên nền tảng đều được kiểm tra và đáp ứng tiêu chuẩn cao.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-3 text-orange-600">Cộng đồng</h3>
              <p className="text-gray-700">
                Chúng tôi xây dựng một cộng đồng nơi mọi người có thể kết nối và hỗ trợ lẫn nhau.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-3 text-orange-600">Bền vững</h3>
              <p className="text-gray-700">
                Chúng tôi cam kết tạo ra tác động tích cực đến môi trường thông qua mô hình kinh doanh của mình.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Đội ngũ của chúng tôi</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full overflow-hidden mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium"> Phạm Đình Phương Sang</h3>
              <p className="text-gray-600"> chưa biết </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full overflow-hidden mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">Võ Phạm Ý Nhi</h3>
              <p className="text-gray-600">chưa biết</p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full overflow-hidden mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">Phạm Nhật Nam</h3>
              <p className="text-gray-600">chưa biết</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full overflow-hidden mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">Trân Nguyễn Quyên</h3>
              <p className="text-gray-600">chưa biết</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full overflow-hidden mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">Tường Vy</h3>
              <p className="text-gray-600">chưa biết</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full overflow-hidden mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">Nguyễn Thúy Vy</h3>
              <p className="text-gray-600">chưa biết</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;