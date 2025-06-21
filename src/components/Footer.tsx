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
              <a href={settings.facebook_link || "#"} className="text-white/60 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/equipment" className="text-sm text-white/70 hover:text-white transition-colors">
                  Thiết bị
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-white/70 hover:text-white transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-white/70 hover:text-white transition-colors">
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
                <Link to="/faq" className="text-sm text-white/70 hover:text-white transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-white/70 hover:text-white transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-white/70 hover:text-white transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-sm text-white/70 hover:text-white transition-colors">
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
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-white/70" />
                <span className="text-sm text-white/70">
                  {settings.contact_address || "123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh"}
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-white/70" />
                <span className="text-sm text-white/70">{settings.contact_phone || "(84) 123 456 789"}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-white/70" />
                <span className="text-sm text-white/70">{settings.contact_email || "contact@alpha.com"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-white/70">
              © {year} {settings.site_name || 'Alpha'}. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                alt="Visa"
                className="h-6 w-auto bg-white rounded p-0.5"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                alt="Mastercard"
                className="h-6 w-auto bg-white rounded p-0.5"
              />
              <img
                src="https://homepage.momocdn.net/fileuploads/svg/momo-file-240411162904.svg"
                alt="MoMo"
                className="h-6 w-auto bg-white rounded p-0.5"
              />
              <img
                src="https://stcd02206177151.cloud.edgevnpay.vn/assets/images/logo-icon/logo-primary.svg"
                alt="VNPay"
                className="h-6 w-auto bg-white rounded p-0.5"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}