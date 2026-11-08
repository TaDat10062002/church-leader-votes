# Proposal

## Why

Giao diện đang chạy trên WebsiteGlass, trong khi các component glasscn cục bộ chưa được tích hợp đồng bộ và còn thiếu dependency, token cùng cầu nối dark mode. Cần chuyển toàn bộ UI sang thư viện [glasscn-components](https://glasscn-components.vercel.app/) theo yêu cầu người dùng, để các màn hình và trạng thái sử dụng cùng một hệ vật liệu kính mới.

## What Changes

- Dùng source từ registry chính thức `@glasscn` làm nền tảng duy nhất cho hiệu ứng kính; đối chiếu các file `glasscn/` đã có với upstream, ghi nhận nguồn và các điều chỉnh cục bộ.
- Chuyển UI của `/vote`, `/admin`, `/import-file`, `/dashboard` và `/thanks`, gồm header, thẻ, danh sách ứng viên, phiếu, nút, input, badge, điều khiển giao diện, dialog, drawer, thông báo và phần trình bày kết quả.
- Áp dụng các variant glasscn theo vai trò: kính cho bề mặt chính và điều khiển, nền dễ đọc cho danh sách/nội dung dày, khúc xạ SVG có chọn lọc cho bề mặt nổi bật.
- Kết nối token và `dark:` của glasscn với sáng/tối, bảng màu xanh lá/navy và các lựa chọn đã lưu; duy trì reduced motion, reduced transparency và fallback trình duyệt.
- Thay các lớp bọc phụ thuộc WebsiteGlass, rồi gỡ engine `glass.tsx`, chuyển động gel và các component/CSS cũ khi không còn tham chiếu; cập nhật tài liệu tích hợp.
- Bổ sung dependency thực sự cần cho source glasscn và kiểm tra tương thích layout, ref/focus, portal, gửi form, trạng thái disabled/loading và hiển thị mobile.

## Capabilities

### New Capabilities

- `liquid-glass-ui`: Bổ sung yêu cầu về vật liệu glasscn, độ phủ toàn bộ UI, phân vai variant, đồng bộ theme và khả năng tương tác khi thay renderer. Đây là cùng đường dẫn capability đã được khai báo trong change `liquid-glass-theme`; hiện chưa có main spec trong `openspec/specs/`. Delta này dùng các tên requirement mới để có thể ghép với baseline đó, không tạo capability kính thứ hai.

### Modified Capabilities

Không có main capability đã được đồng bộ để sửa. Hành vi `appearance-theme` trong change `liquid-glass-theme` là ràng buộc tương thích; change này không tạo bản sao của capability đó.

## Impact

- `src/components/ui`: app adapters, các primitive nền, `glasscn/`, header, sheet, các file WebsiteGlass và style liên quan.
- `src/app/globals.css`, `src/app/layout.tsx`, `src/components/theme/*`: semantic token, biến thể dark và bề mặt của điều khiển giao diện.
- Các trang và component phiếu, danh sách, dashboard, biểu đồ, thông báo kỳ bầu chọn; `components.json`, `package.json`, lockfile nếu registry yêu cầu dependency.
- `docs/liquid-glass.md` và e2e liên quan: thay hướng dẫn nguồn kính và cập nhật kỳ vọng không còn đúng với luồng chạm chọn/xác nhận hiện tại.
- Giả định phạm vi: giữ cấu trúc luồng, nội dung, các lựa chọn sáng/tối và xanh lá/navy; tinh chỉnh trình bày để phù hợp component mới. API, cơ sở dữ liệu, quy tắc bầu chọn và quản trị không cần thay đổi.
- Quyết định tái dùng WebsiteGlass và giới hạn dependency trong design cũ được thay thế cho phạm vi migration này. Trước khi archive, cần đồng bộ baseline của `liquid-glass-theme` và ghép delta cùng capability theo thứ tự; không sửa change cũ trong bước đề xuất này.
