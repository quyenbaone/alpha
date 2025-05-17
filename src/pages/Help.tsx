export function Help() {
  return (
    <div className="container py-12 max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white text-center">Trung tâm trợ giúp</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-orange-600 dark:text-orange-400">Câu hỏi thường gặp</h2>
          <div className="space-y-6">
            <details className="group bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <summary className="font-medium cursor-pointer text-gray-900 dark:text-white">
                Làm thế nào để đặt thuê thiết bị?
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Để đặt thuê thiết bị, bạn cần đăng ký tài khoản, chọn thiết bị muốn thuê,
                chọn ngày thuê và thanh toán. Chúng tôi sẽ xác nhận đơn đặt thuê trong vòng 24 giờ.
              </p>
            </details>
            <details className="group bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <summary className="font-medium cursor-pointer text-gray-900 dark:text-white">
                Làm thế nào để trở thành người cho thuê?
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Để trở thành người cho thuê, bạn cần đăng ký tài khoản, xác minh danh tính,
                và đăng thông tin thiết bị cho thuê. Chúng tôi sẽ xem xét và phê duyệt trong vòng 48 giờ.
              </p>
            </details>
            <details className="group bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <summary className="font-medium cursor-pointer text-gray-900 dark:text-white">
                Chính sách bảo hiểm như thế nào?
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Mọi giao dịch trên Alpha đều được bảo hiểm 100% giá trị thiết bị.
                Trong trường hợp xảy ra sự cố, chúng tôi sẽ hỗ trợ giải quyết và bồi thường theo quy định.
              </p>
            </details>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-orange-600 dark:text-orange-400">Liên hệ hỗ trợ</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7.
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Email</h3>
              <p className="text-gray-600 dark:text-gray-300">cauvang2293@gmail.com</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Hotline</h3>
              <p className="text-gray-600 dark:text-gray-300">012345678</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Địa chỉ</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Quy Nhơn, Gia Lai
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Help;
