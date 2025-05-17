import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FAQItemProps {
    question: string;
    answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 py-4">
            <button
                className="flex w-full justify-between items-center text-left focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{question}</h3>
                {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                )}
            </button>
            {isOpen && (
                <div className="mt-2 text-gray-600 dark:text-gray-300">
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
}

export function FAQ() {
    const generalFAQs = [
        {
            question: "Alpha là gì?",
            answer: "Alpha là nền tảng cho thuê thiết bị trực tuyến, kết nối những người có thiết bị với những người cần thuê thiết bị."
        },
        {
            question: "Làm thế nào để tôi có thể bắt đầu thuê thiết bị?",
            answer: "Để thuê thiết bị, bạn cần đăng ký tài khoản, duyệt qua danh sách thiết bị, chọn thiết bị bạn muốn thuê, chọn ngày thuê và thanh toán. Sau đó, bạn sẽ nhận được thông tin liên hệ để nhận thiết bị."
        },
        {
            question: "Tôi có thể thuê thiết bị trong bao lâu?",
            answer: "Thời gian thuê phụ thuộc vào từng thiết bị và chủ sở hữu. Thông thường, bạn có thể thuê từ một ngày đến vài tháng."
        },
        {
            question: "Làm thế nào để tôi thanh toán?",
            answer: "Chúng tôi chấp nhận thanh toán qua thẻ tín dụng, thẻ ghi nợ, và các phương thức thanh toán trực tuyến phổ biến khác như Momo, VNPay, ZaloPay."
        }
    ];

    const rentalFAQs = [
        {
            question: "Nếu thiết bị bị hỏng trong quá trình thuê thì sao?",
            answer: "Tất cả các thiết bị đều được bảo hiểm. Nếu thiết bị bị hỏng do sử dụng bình thường, chúng tôi sẽ xử lý thông qua bảo hiểm. Nếu thiết bị bị hỏng do sử dụng không đúng cách, người thuê có thể phải chịu trách nhiệm."
        },
        {
            question: "Làm thế nào để tôi trả lại thiết bị?",
            answer: "Bạn sẽ trả lại thiết bị theo địa điểm và thời gian đã thỏa thuận với chủ sở hữu. Sau khi chủ sở hữu xác nhận đã nhận lại thiết bị trong tình trạng tốt, giao dịch sẽ được hoàn tất."
        },
        {
            question: "Tôi có thể hủy đơn thuê không?",
            answer: "Có, bạn có thể hủy đơn thuê, nhưng có thể áp dụng phí hủy tùy thuộc vào thời gian hủy so với ngày bắt đầu thuê. Vui lòng xem chính sách hủy của từng thiết bị."
        }
    ];

    const ownerFAQs = [
        {
            question: "Làm thế nào để tôi có thể cho thuê thiết bị của mình?",
            answer: "Để cho thuê thiết bị, bạn cần đăng ký tài khoản chủ sở hữu, thêm thông tin thiết bị của bạn, đặt giá và chính sách cho thuê, và chờ phê duyệt từ đội ngũ của chúng tôi."
        },
        {
            question: "Làm thế nào để tôi nhận được tiền từ việc cho thuê?",
            answer: "Sau khi người thuê thanh toán, tiền sẽ được giữ lại cho đến khi giao dịch thuê hoàn tất. Sau đó, tiền sẽ được chuyển vào tài khoản ngân hàng của bạn trong vòng 2-3 ngày làm việc."
        },
        {
            question: "Thiết bị của tôi có được bảo hiểm không?",
            answer: "Có, tất cả thiết bị được đăng ký trên nền tảng của chúng tôi đều được bảo hiểm trong thời gian cho thuê để bảo vệ bạn khỏi những rủi ro không mong muốn."
        }
    ];

    return (
        <div className="container mx-auto px-4 py-12 pt-28">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Câu hỏi thường gặp</h1>

                <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-orange-600 dark:text-orange-400">Thông tin chung</h2>
                    <div className="space-y-2">
                        {generalFAQs.map((faq, index) => (
                            <FAQItem key={index} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-orange-600 dark:text-orange-400">Thuê thiết bị</h2>
                    <div className="space-y-2">
                        {rentalFAQs.map((faq, index) => (
                            <FAQItem key={index} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-6 text-orange-600 dark:text-orange-400">Cho thuê thiết bị</h2>
                    <div className="space-y-2">
                        {ownerFAQs.map((faq, index) => (
                            <FAQItem key={index} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </div>

                <div className="mt-12 bg-orange-50 dark:bg-orange-900/40 p-6 rounded-lg border border-orange-100 dark:border-orange-400/30 text-center shadow">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Không tìm thấy câu trả lời?</h3>
                    <p className="text-gray-700 dark:text-gray-200 mb-4">
                        Nếu bạn có câu hỏi khác, vui lòng liên hệ với chúng tôi qua trang liên hệ.
                    </p>
                    <a
                        href="/contact"
                        className="inline-block bg-orange-600 text-white py-2 px-6 rounded-md hover:bg-orange-700 transition-colors"
                    >
                        Liên hệ với chúng tôi
                    </a>
                </div>
            </div>
        </div>
    );
}

export default FAQ;
