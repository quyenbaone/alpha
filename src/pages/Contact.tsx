import { Mail, MapPin, Phone } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const SUPPORT_EMAIL = 'hotro.alphateam@gmail.com';

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const subject = `Liên hệ từ ${name}`;
    const body = `
Họ và tên: ${name}
Email: ${email}

${message}
    `.trim();

    const mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;

    // Reset form sau khi mở Gmail
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-8 py-16 pt-28">
      <h1 className="text-5xl font-extrabold mb-8 text-center text-[#116466] tracking-wide leading-normal">
        Liên hệ với chúng tôi
      </h1>
      <p className="text-center text-gray-700 mb-12 text-lg max-w-3xl mx-auto">
        Chúng tôi luôn sẵn sàng lắng nghe bạn! Điền thông tin hoặc liên hệ trực tiếp, đội ngũ sẽ phản hồi trong vòng 24h (giờ hành chính).
      </p>

      {/* Info blocks (bỏ border) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
        <div className="bg-white p-8 rounded-2xl shadow flex flex-col items-center text-center">
          <div className="bg-[#116466] p-4 rounded-full mb-5">
            <Phone className="h-7 w-7 text-white" />
          </div>
          <h3 className="font-semibold text-xl mb-1 text-[#116466]">Điện thoại</h3>
          <p className="text-gray-600 text-lg">+84 123 456 789</p>
          <p className="text-gray-500 text-sm mt-2">Thứ 2 - Thứ 6: 8:00 - 17:00</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow flex flex-col items-center text-center">
          <div className="bg-[#116466] p-4 rounded-full mb-5">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <h3 className="font-semibold text-xl mb-1 text-[#116466]">Email</h3>
          <p className="text-gray-600 text-lg">{SUPPORT_EMAIL}</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[#116466] hover:underline text-sm mt-2"
          >
            Gửi email trực tiếp
          </a>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow flex flex-col items-center text-center">
          <div className="bg-[#116466] p-4 rounded-full mb-5">
            <MapPin className="h-7 w-7 text-white" />
          </div>
          <h3 className="font-semibold text-xl mb-1 text-[#116466]">Địa chỉ</h3>
          <p className="text-gray-600 text-lg">Quy Nhơn, Bình Định</p>
        </div>
      </div>

      {/* Contact form (bỏ border) */}
      <div className="bg-white p-12 rounded-3xl shadow-md mb-20 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-[#116466] text-center">Gửi tin nhắn cho chúng tôi</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label htmlFor="name" className="block text-base font-medium text-[#116466] mb-2">Họ và tên *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="
                  w-full px-5 py-3 rounded-lg
                  focus:ring-2 focus:ring-[#116466] focus:border-[#116466]
                  text-gray-900 bg-white placeholder-gray-400 text-lg
                  border border-gray-300
                "
                placeholder="Nhập họ và tên của bạn"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-base font-medium text-[#116466] mb-2">Email *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full px-5 py-3 rounded-lg
                  focus:ring-2 focus:ring-[#116466] focus:border-[#116466]
                  text-gray-900 bg-white placeholder-gray-400 text-lg
                  border border-gray-300
                "
                placeholder="Nhập địa chỉ email của bạn"
              />
            </div>
          </div>
          <div className="mb-8">
            <label htmlFor="message" className="block text-base font-medium text-[#116466] mb-2">Nội dung *</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="
                w-full px-5 py-3 rounded-lg
                focus:ring-2 focus:ring-[#116466] focus:border-[#116466]
                text-gray-900 bg-white placeholder-gray-400 text-lg
                border border-gray-300
              "
              placeholder="Nhập nội dung tin nhắn của bạn"
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="
                bg-[#116466] text-white py-3 px-12 rounded-lg
                hover:opacity-90 transition
                disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg
                shadow
              "
            >
              {submitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
            </button>
          </div>
        </form>
      </div>

      {/* Map */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-8 text-[#116466] text-center">Vị trí của chúng tôi</h2>
        <div className="h-96 bg-gray-200 rounded-2xl overflow-hidden shadow-xl max-w-5xl mx-auto">
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
  );
}

export default Contact;
