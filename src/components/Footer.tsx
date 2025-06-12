import { Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';

export function Footer() {
  const { settings, fetchSettings } = useSettingsStore();
  const [year] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchSettings();

    if ((window as any).FB) {
      (window as any).FB.XFBML.parse();
    }
  }, [fetchSettings]);

  return (
    <footer className="bg-[#0F4D4D] text-white py-6">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Company Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src={settings.site_logo || "/logo.png"}
                alt="Logo"
                className="h-10 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.png";
                }}
              />
              <span className="text-2xl font-extrabold tracking-tight">Alpha</span>
            </Link>
            <p className="text-gray-300 leading-relaxed max-w-sm">
              Nền tảng cho thuê thiết bị chuyên nghiệp, đáng tin cậy và tiết kiệm chi phí.
            </p>
            {/* Facebook Follow */}
            <div>
              <iframe
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D61576194940259&tabs=timeline&width=280&height=70&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=true&appId"
                width="280"
                height="70"
                style={{ border: 'none', overflow: 'hidden' }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title="Facebook Follow"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 border-b border-gray-600 pb-2">Liên kết nhanh</h3>
            <ul className="space-y-4 font-medium text-base">
              <li>
                <Link to="/about"
                  className="text-white hover:text-[#22c55e] transition-colors duration-300"
                >
                  Giới thiệu chung
                </Link>
              </li>
              <li>
                <Link to="/contact"
                  className="text-white hover:text-[#22c55e] transition-colors duration-300"
                >
                  Liên hệ hỗ trợ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-6 border-b border-gray-600 pb-2">Liên hệ</h3>
            <ul className="space-y-5 font-medium text-base">
              <li className="flex items-center space-x-3">
                <MapPin className="h-6 w-6 text-white hover:text-[#22c55e] transition-colors duration-300" />
                <Link
                  to="/contact"
                  className="text-white hover:text-[#22c55e] transition-colors duration-300"
                  title="Xem địa chỉ trên bản đồ"
                >
                  {settings.contact_address || "Quy Nhơn - Bình Định"}
                </Link>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-6 w-6 text-white hover:text-[#22c55e] transition-colors duration-300" />
                <a
                  href={`tel:${settings.contact_phone || "0352486411"}`}
                  className="text-white hover:text-[#22c55e] transition-colors duration-300"
                  title="Gọi điện thoại"
                >
                  {settings.contact_phone || "0352486411"}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-6 w-6 text-white hover:text-[#22c55e] transition-colors duration-300" />
                <a
                  href={`mailto:${settings.contact_email || "alpha@gmail.com"}`}
                  className="text-white hover:text-[#22c55e] transition-colors duration-300"
                  title="Gửi email"
                >
                  {settings.contact_email || "alpha@gmail.com"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-6">
          <p className="text-center text-gray-400 text-sm">
            © {year} Alpha. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
