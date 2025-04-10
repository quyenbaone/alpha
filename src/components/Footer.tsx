import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary opacity-20"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGM2LjYyNyAwIDEyLTUuMzczIDEyLTEyUzQyLjYyNyAxMCAzNiAxMGMtNi42MjggMC0xMiA1LjM3My0xMiAxMnM1LjM3MiAxMiAxMiAxMnoiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>

      <div className="container mx-auto px-4 py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg heading-highlight mb-6">Về RentGear</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="nav-link">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/careers" className="nav-link">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link to="/press" className="nav-link">
                  Trung tâm báo chí
                </Link>
              </li>
              <li>
                <Link to="/blog" className="nav-link">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg heading-highlight mb-6">Hỗ trợ</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="nav-link">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link to="/safety" className="nav-link">
                  An toàn
                </Link>
              </li>
              <li>
                <Link to="/equipment-care" className="nav-link">
                  Bảo quản thiết bị
                </Link>
              </li>
              <li>
                <Link to="/insurance" className="nav-link">
                  Thông tin bảo hiểm
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg heading-highlight mb-6">Pháp lý</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="nav-link">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="nav-link">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="nav-link">
                  Cài đặt cookie
                </Link>
              </li>
              <li>
                <Link to="/rental-agreement" className="nav-link">
                  Hợp đồng thuê
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg heading-highlight mb-6">Theo dõi chúng tôi</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 glass-effect rounded-lg hover:bg-primary-foreground/20 hover-scale"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="p-2 glass-effect rounded-lg hover:bg-primary-foreground/20 hover-scale"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="p-2 glass-effect rounded-lg hover:bg-primary-foreground/20 hover-scale"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="p-2 glass-effect rounded-lg hover:bg-primary-foreground/20 hover-scale"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="h-6 w-6" />
              </a>
            </div>
            <div className="mt-6">
              <p className="text-sm text-primary-foreground/60">
                © {new Date().getFullYear()} RentGear. Đã đăng ký bản quyền.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}