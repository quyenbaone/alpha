# Hướng dẫn khắc phục vấn đề người dùng và vai trò

Vấn đề hiện tại là cơ sở dữ liệu Supabase mới của bạn không có bảng `users` cần thiết. Điều này giải thích tại sao người dùng có thể đăng nhập (vì hệ thống xác thực hoạt động) nhưng không hiển thị thông tin và vai trò (vì bảng hồ sơ chưa tồn tại).

## Cách thực hiện:

1. Đăng nhập vào trang quản trị Supabase: https://app.supabase.com/project/bfueidgbnbggvlczwecz
2. Chọn "SQL Editor" trong menu bên trái
3. Tạo một truy vấn SQL mới (New query)
4. Sao chép nội dung từ file `create-users-table-vi.sql` và dán vào trình soạn thảo SQL
5. Nhấn nút "Run" để thực thi truy vấn

Sau khi chạy xong, đăng xuất và đăng nhập lại với một trong những tài khoản mẫu:

- **Quản trị viên**: admin_new@gmail.com / admin@123
- **Chủ nhà**: owner_new@gmail.com / owner@123
- **Người thuê**: renter_new@gmail.com / renter@123

Bây giờ hệ thống sẽ hiện thông tin người dùng và phân quyền đúng vai trò.

## Thiết lập đầy đủ (tùy chọn)

Nếu muốn thiết lập đầy đủ tất cả các bảng, bạn có thể chạy toàn bộ script di chuyển dữ liệu từ:
`supabase/migrations/20240320000000_initial_schema.sql`

Tuy nhiên, bạn nên sửa lại tên hiển thị trong script đó thành tiếng Việt trước khi chạy.

## Ghi chú

Nếu gặp lỗi khi chạy script, có thể là do:

1. Bảng đã tồn tại từ trước (bạn có thể bỏ qua lỗi này)
2. Không đủ quyền (đảm bảo bạn đang sử dụng tài khoản có quyền quản trị Supabase)
3. Cấu trúc dữ liệu không khớp (kiểm tra logs để biết thêm chi tiết) 