
export function Help() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Trung tâm trợ giúp</h1>
      <div className="prose prose-lg max-w-none">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2>Câu hỏi thường gặp</h2>
            <div className="space-y-6">
              <details className="group">
                <summary className="font-medium cursor-pointer">
                  Làm thế nào để đặt thuê thiết bị?
                </summary>
                <p className="mt-4 text-muted-foreground">
                  Để đặt thuê thiết bị, bạn cần đăng ký tài khoản, chọn thiết bị muốn thuê,
                  chọn ngày thuê và thanh toán. Chúng tôi sẽ xác nhận đơn đặt thuê trong vòng 24 giờ.
                </p>
              </details>

              <details className="group">
                <summary className="font-medium cursor-pointer">
                  Làm thế nào để trở thành người cho thuê?
                </summary>
                <p className="mt-4 text-muted-foreground">
                  Để trở thành người cho thuê, bạn cần đăng ký tài khoản, xác minh danh tính,
                  và đăng thông tin thiết bị cho thuê. Chúng tôi sẽ xem xét và phê duyệt trong vòng 48 giờ.
                </p>
              </details>

              <details className="group">
                <summary className="font-medium cursor-pointer">
                  Chính sách bảo hiểm như thế nào?
                </summary>
                <p className="mt-4 text-muted-foreground">
                  Mọi giao dịch trên Alpha đều được bảo hiểm 100% giá trị thiết bị.
                  Trong trường hợp xảy ra sự cố, chúng tôi sẽ hỗ trợ giải quyết và bồi thường theo quy định.
                </p>
              </details>
            </div>
          </div>

          <div>
            <h2>Liên hệ hỗ trợ</h2>
            <p>
              Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7.
            </p>
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-muted-foreground">support@alpha.vn</p>
              </div>
              <div>
                <h3 className="font-medium">Hotline</h3>
                <p className="text-muted-foreground">1900 1234</p>
              </div>
              <div>
                <h3 className="font-medium">Địa chỉ</h3>
                <p className="text-muted-foreground">
                  Đại học FPT Quy Nhơn, Bình Định
                  <div className="mt-4">
                    <iframe
                      title="Google Maps"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.579349611255!2d109.2179062!3d13.8039729!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x316f6bf778c80973%3A0x8a7d0b5aa0af29c7!2sFPT%20University%20Quy%20Nhon%20AI%20Campus!5e0!3m2!1sen!2s!4v1711512345678"
                      width="100%"
                      height="350"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>

                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}