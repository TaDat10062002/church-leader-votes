# Proposal

## Why

Dự án đã có các thành phần WebsiteGlass, nhưng cách dùng hiệu ứng kính chưa đồng nhất giữa trang bỏ phiếu, quản trị, nhập danh sách và bảng điều khiển; ứng dụng cũng đang cố định ở giao diện sáng. Một hệ thống giao diện thống nhất sẽ mở rộng Liquid Glass cho toàn ứng dụng và cho phép người dùng chọn giao diện sáng hoặc tối phù hợp.

## What Changes

- Dùng nút toggle sáng/tối hai trạng thái; theo thiết bị cho đến lần bật/tắt đầu tiên, sau đó lưu chế độ người dùng chọn.
- Tăng độ trong suốt mặc định của các bề mặt Liquid Glass để hậu cảnh hiện rõ hơn, đồng thời giữ độ đọc bằng viền, phản quang và màu chữ; chế độ giảm độ trong suốt vẫn dùng nền đục hơn.
- Giảm độ trắng và độ nổi của viền kính, hạ tint mặc định để các bề mặt trong suốt hơn.
- Cho phép chọn một trong hai bảng màu nhấn: xanh lá hiện tại hoặc xanh navy dịu; lưu lựa chọn độc lập với giao diện sáng/tối.

- Mở rộng giao diện dựa trên WebsiteGlass cho các điều khiển dùng chung, thẻ, lớp phủ và bề mặt riêng của từng trang trong toàn ứng dụng.
- Bổ sung giao diện sáng và tối đồng bộ; mặc định theo cài đặt thiết bị, đồng thời có công tắc để người dùng chọn và ghi nhớ giao diện.
- Thêm chuyển theme bằng hiệu ứng Circular Reveal từ tâm công tắc, kết hợp chuyển màu nền và màu giao diện mượt; tôn trọng tùy chọn giảm chuyển động của hệ điều hành.
- Định nghĩa màu kính, đường viền, màu chữ, bóng đổ và bề mặt dự phòng theo từng giao diện để nội dung trên lớp trong suốt vẫn dễ đọc.
- Định nghĩa hai bảng màu nhấn dùng chung cho toàn ứng dụng mà không thay đổi lựa chọn sáng/tối.
- Giữ khả năng hiển thị dự phòng trên trình duyệt không hỗ trợ khúc xạ và hỗ trợ cài đặt giảm độ trong suốt.
- Giữ nguyên mọi quy tắc nghiệp vụ và hành vi trạng thái hiện có; không đổi logic hoặc hợp đồng của bộ xử lý API trong route. Các trạng thái trình bày cục bộ (giao diện sáng/tối và bảng màu nhấn) được lưu riêng, không tham gia luồng bầu chọn.

## Capabilities

### New Capabilities
- `appearance-theme`: Chọn giao diện sáng hoặc tối ban đầu theo thiết bị, cho phép người dùng đổi giao diện và ghi nhớ lựa chọn.
- `liquid-glass-ui`: Hiển thị các bề mặt tương tác trong ứng dụng bằng hiệu ứng Liquid Glass đồng nhất, thích ứng theo giao diện.

### Modified Capabilities
- Không có.

## Impact

- Ảnh hưởng đến bố cục gốc, kiểu hiển thị toàn cục và các thành phần giao diện dùng chung trong `src/components/ui`.
- Ảnh hưởng đến bề mặt của trang bỏ phiếu, nhập danh sách, quản trị và bảng điều khiển, bao gồm biểu đồ, hộp thoại và bảng trượt.
- Tái sử dụng mã WebsiteGlass và cấu hình React/Tailwind hiện có; bổ sung gói Motion làm dependency lúc chạy cho hiệu ứng chuyển theme.
- Bộ xử lý API trong route và các chuyển trạng thái hiện hữu của phiếu bầu, danh sách ứng viên, xác thực, kỳ bầu chọn và kết quả nằm ngoài phạm vi thay đổi.
