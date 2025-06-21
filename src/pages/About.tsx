import { Users } from 'lucide-react';

export function About() {
  const team = [
    { name: 'Phạm Đình Phương Sang', role: 'Thành viên' },
    { name: 'Võ Phạm Ý Nhi', role: 'Thành viên' },
    { name: 'Phạm Nhật Nam', role: 'Thành viên' },
    { name: 'Trân Nguyễn Quyên', role: 'Thành viên' },
    { name: 'Tường Vy', role: 'Thành viên' },
    { name: 'Nguyễn Thúy Vy', role: 'Thành viên' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 pt-28">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
          Về chúng tôi
        </h1>

        {/* Story Section */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md mb-12 transition-colors duration-300">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white text-center">
            Câu chuyện của chúng tôi
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
            Alpha được thành lập vào năm 2025 với sứ mệnh đơn giản: Giúp mọi người tiếp cận với thiết bị chất lượng cao mà không cần phải mua. Chúng tôi tin rằng nền kinh tế chia sẻ là tương lai, và việc thuê thiết bị không chỉ tiết kiệm chi phí mà còn góp phần bảo vệ môi trường.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
            Từ một ý tưởng nhỏ, chúng tôi đã phát triển thành nền tảng cho thuê thiết bị hàng đầu tại Việt Nam, kết nối hàng nghìn chủ sở hữu thiết bị với những người có nhu cầu thuê ngắn hạn hoặc dài hạn.
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-center">
            Sứ mệnh của chúng tôi là tạo ra một cộng đồng nơi mọi người có thể dễ dàng chia sẻ tài nguyên, tiết kiệm chi phí và cùng nhau xây dựng một tương lai bền vững hơn.
          </p>
        </div>

        {/* Core Values */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md mb-12 transition-colors duration-300">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white text-center">
            Giá trị cốt lõi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Tin cậy', desc: 'Chúng tôi xây dựng niềm tin thông qua sự minh bạch và trung thực trong mọi giao dịch.' },
              { title: 'Chất lượng', desc: 'Chúng tôi đảm bảo mọi thiết bị trên nền tảng đều được kiểm tra và đáp ứng tiêu chuẩn cao.' },
              { title: 'Cộng đồng', desc: 'Chúng tôi xây dựng một cộng đồng nơi mọi người có thể kết nối và hỗ trợ lẫn nhau.' },
              { title: 'Bền vững', desc: 'Chúng tôi cam kết tạo ra tác động tích cực đến môi trường thông qua mô hình kinh doanh của mình.' },
            ].map((value, idx) => (
              <div
                key={idx}
                className="border border-gray-200 dark:border-gray-700/60 rounded-lg p-6 bg-gray-50 dark:bg-gray-800 transition-all duration-300"
              >
                <h3 className="text-xl font-medium mb-3 text-orange-600 text-center">
                  {value.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-center">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md transition-colors duration-300">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white">
            Đội ngũ của chúng tôi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="text-center hover:shadow-lg hover:scale-105 transition-all bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-32 h-32 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4 flex items-center justify-center transition-all duration-300">
                  <Users className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default About;
