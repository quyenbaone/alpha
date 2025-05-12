import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';

export function Footer() {
  const { settings, fetchSettings } = useSettingsStore();
  const [year] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img
                src={settings.site_logo || "/logo.png"}
                alt="Logo"
                className="h-8 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.png";
                }}
              />
              <span className="text-xl font-bold text-white">{settings.site_name || 'Alpha'}</span>
            </Link>
            <p className="text-sm mb-4">
              Nền tảng cho thuê thiết bị chuyên nghiệp, đáng tin cậy và tiết kiệm chi phí.
            </p>
            <div className="flex space-x-4">
              <a href={settings.facebook_link || "#"} className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/equipment" className="text-sm hover:text-white">
                  Thiết bị
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm hover:text-white">
                  Danh mục
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-white">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-white">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-sm hover:text-white">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm hover:text-white">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm hover:text-white">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-sm hover:text-white">
                  Trung tâm trợ giúp
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span className="text-sm">
                  {settings.contact_address || "123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh"}
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{settings.contact_phone || "(84) 123 456 789"}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{settings.contact_email || "contact@alpha.com"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              © {year} {settings.site_name || 'Alpha'}. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <img
                src="/payment/visa.png"
                alt="Visa"
                className="h-6 w-auto"
              />
              <img
                src="/payment/mastercard.png"
                alt="Mastercard"
                className="h-6 w-auto"
              />
              <img
                src="/payment/momo.png"
                alt="MoMo"
                className="h-6 w-auto"
              />
              <img
                src="/payment/vnpay.png"
                alt="VNPay"
                className="h-6 w-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}