import { Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function Contact() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !message) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            setSubmitting(true);
            // Here you would typically send the form data to your backend
            // For now, we'll just simulate a successful submission
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ lại với bạn sớm.');
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 pt-28">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Liên hệ với chúng tôi</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                        <div className="bg-orange-100 p-3 rounded-full mb-4">
                            <Phone className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Điện thoại</h3>
                        <p className="text-gray-600">+84 123 456 789</p>
                        <p className="text-gray-600">Thứ 2 - Thứ 6: 8:00 - 17:00</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                        <div className="bg-orange-100 p-3 rounded-full mb-4">
                            <Mail className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Email</h3>
                        <p className="text-gray-600">cauvan2293@gmail.com</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                        <div className="bg-orange-100 p-3 rounded-full mb-4">
                            <MapPin className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Địa chỉ</h3>
                        <p className="text-gray-600">Quy Nhơn, Gia Lai</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-6">Gửi tin nhắn cho chúng tôi</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Nhập họ và tên của bạn"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Nhập địa chỉ email của bạn"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                            <input
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Nhập tiêu đề tin nhắn"
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Nhập nội dung tin nhắn của bạn"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-orange-600 text-white py-2 px-6 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
                        </button>
                    </form>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-semibold mb-6">Vị trí của chúng tôi</h2>
                    <div className="h-80 bg-gray-200 rounded-lg overflow-hidden">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62713.984552736775!2d109.19858591085635!3d13.803743288648636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x316f6bf778c80973%3A0x8a7d0b5aa0af29c7!2zxJDhuqFpIGjhu41jIEZQVCBRdXkgTmjGsG4!5e0!3m2!1svi!2s!4v1716022467783!5m2!1svi!2s"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="FPT Quy Nhơn"
                        ></iframe>
                    </div>
                </div>

            </div>
        </div>
    );
} 