# Tasks

## 1. Source registry và dependency

- [x] 1.1 Lấy các item glasscn cần dùng từ registry chính thức, đối chiếu từng source cục bộ và hợp nhất tại `src/components/ui/glasscn/`; hoàn tất khi component/engine giữ lại truy được tới URL nguồn và danh sách adaptation trong `docs/liquid-glass.md`.
- [x] 1.2 Khai báo dependency thực tế của primitive, gồm `@base-ui/react` và `class-variance-authority`, cập nhật lockfile và giữ neutral alias tránh ghi đè app adapter; xác nhận cài dependency thành công và `npm ls @base-ui/react class-variance-authority` không báo thiếu gói.
- [x] 1.3 Sửa `GlassScrimCard` cùng các primitive còn dùng để không import app Card WebsiteGlass, hoặc gỡ source không sử dụng; xác nhận import graph của thư mục glasscn không quay về engine kính cũ và typecheck phân giải được toàn bộ import giữ lại.

## 2. Token, theme và phương án giảm hiệu ứng

- [x] 2.1 Ánh xạ semantic color/radius và custom variant `dark` của Tailwind sang `data-theme`, giữ alias token mà ECharts đang đọc; kiểm tra computed style của bốn kết hợp sáng/tối và xanh lá/navy có giá trị đúng cho nền, chữ, viền và focus.
- [x] 2.2 Kết nối script trước paint/provider với source mới, giữ khóa lưu và Circular Reveal; bổ sung hoặc cập nhật kiểm tra browser cho lựa chọn theo hệ thống, lựa chọn đã lưu, đổi theme/palette rồi reload, xác nhận không hydration error hoặc lóe màu đối nghịch.
- [x] 2.3 Áp dụng reduced motion, reduced transparency và fallback không có backdrop-filter cho mọi loại bề mặt kể cả portal; kiểm tra CSS/khả năng browser thực tế hoặc môi trường mô phỏng và ghi kết quả cùng cách kích hoạt fallback trong tài liệu tích hợp.
- [x] 2.4 Ghi chính sách variant và bảng token/theme trong `docs/liquid-glass.md`; đối chiếu bảng vai trò ở design để bảo đảm có hướng dẫn cho bề mặt chính, phần tử lặp và overlay.

## 3. Adapter và màn hình độc lập

- [x] 3.1 Chuyển app `Card` sang glasscn với root/ref/class layout ổn định và content class riêng; kiểm tra flex/grid, width, padding, fixed/sticky và focus không bị wrapper/base Card đổi ngoài ý muốn.
- [x] 3.2 Chuyển `Button`, icon và badge sang source mới, giữ ref tới phần tử nút thật, type, ARIA, event và disabled/loading; kiểm tra bằng bàn phím và browser rằng click/Enter chỉ gọi đúng handler, điều khiển disabled không phát yêu cầu.
- [x] 3.3 Chuyển header, palette/theme control và các `glass-chip` dùng chung sang bề mặt glasscn; kiểm tra nhãn switch/pressed, liên kết, icon trang trí, vùng bấm và header trên mobile/desktop.
- [x] 3.4 Chuyển PIN ở `/admin` sang input mới và Card/icon ở `/thanks`; cập nhật kiểm tra đăng nhập bằng Enter, pending/error state và trang cảm ơn có theme control, xác nhận chuyển trang và giữ ngữ nghĩa status.
- [x] 3.5 Điều chỉnh Sheet và các host dùng Radix `asChild` để props/ref/geometry đến đúng root, cập nhật ghi chú adaptation của adapter trong tài liệu; chạy phần Escape, containment/return focus và không tràn ngang của `e2e/glass-roster.spec.ts`.

## 4. Giao diện bỏ phiếu

- [x] 4.1 Chuyển `vote/page`, `ballot-builder` và `election-closed-notice` gồm danh sách ứng viên, vị trí phiếu, bộ đếm, vùng hành động và các trạng thái tải/lỗi/chưa mở/đã đóng; đối chiếu inventory và xác nhận không còn import trực tiếp WebsiteGlass trong khu vực này.
- [x] 4.2 Chuyển bề mặt xem phiếu và xác nhận gửi, giữ host dialog cùng handler hiện tại; kiểm tra chạm chọn/xóa, mở/đóng phiếu, hủy/xác nhận, gửi thành công/lỗi và trạng thái bận trên 375 px.
- [x] 4.3 Cập nhật `e2e/ballot-drag.spec.ts` theo thao tác chạm chọn và bước xác nhận hiện tại, bỏ kỳ vọng kéo thả/gửi trực tiếp/trang cảm ơn không có nút; chạy các ca phiếu liên quan và xác nhận hủy không gửi API, xác nhận chỉ gửi một lần.

## 5. Nhập danh sách và khôi phục

- [x] 5.1 Chuyển vùng tải file, tải mẫu, trạng thái, danh sách chờ và drawer ứng viên đã xóa của `import-roster` sang glasscn; kiểm tra tên/ảnh/nút xóa/khôi phục/empty state đọc và bấm được ở giao diện sáng/tối.
- [x] 5.2 Chuyển hộp thoại bắt đầu kỳ bầu chọn và các hành động trong drawer, giữ focus và dữ liệu tạm khi đổi theme; chạy/cập nhật `e2e/glass-roster.spec.ts` để xác nhận xóa/khôi phục, Escape/trả focus và hủy không phát yêu cầu bắt đầu.

## 6. Dashboard và kết quả

- [x] 6.1 Chuyển các thẻ thống kê, trạng thái, ranking, header và điều khiển dashboard sang glasscn; kiểm tra các trạng thái chưa có kỳ, đang mở/đóng, tải/lỗi và số liệu realtime vẫn hiện đúng theo fixture.
- [x] 6.2 Chuyển container/tooltip/điều khiển biểu đồ sang token và vật liệu mới, giữ nội dung ECharts rõ ràng; kiểm tra đổi theme/palette, chuyển chế độ biểu đồ, resize và số liệu/thứ hạng không bị kính che hoặc làm méo.
- [x] 6.3 Chuyển hộp thoại reset và các nút nguy hiểm, chạy/cập nhật `e2e/admin-reset.spec.ts`; xác nhận hủy không reset, xác nhận giữ hợp đồng yêu cầu hiện tại và trả focus phù hợp khi đóng.

## 7. Gỡ hệ kính cũ và kiểm tra tích hợp

- [x] 7.1 Gỡ `ui/glass.tsx`, `glass-motion.ts`, các component WebsiteGlass cũ cùng CSS/props không còn dùng sau khi chuyển hết tham chiếu; xác nhận bằng tìm kiếm import toàn `src` và typecheck rằng không còn đường chạy WebsiteGlass hoặc kính cũ lồng trong kính mới.
- [x] 7.2 Hoàn thiện `docs/liquid-glass.md` với item/source upstream, dependency, adaptation đã thực hiện, phạm vi UI và lệnh kiểm tra đúng với luồng hiện tại; đối chiếu lại với source, loại bỏ mô tả forced-light và drag handle đã lỗi thời.
- [x] 7.3 Chạy `npm run build`, typecheck và tập e2e hồi quy phiếu/roster/reset sau tích hợp; ghi kết quả và xử lý lỗi runtime, hydration, focus hoặc hành vi mới phát sinh trước khi đánh dấu hoàn tất.
- [x] 7.4 Kiểm tra ma trận hiển thị theo design: năm route, loading/empty/error/overlay, bốn kết hợp theme/palette, 375/768/1440 px và điện thoại xoay ngang; lưu bằng chứng ảnh/quan sát về tương phản, không tràn ngang, focus và thanh hành động không che nội dung.
- [x] 7.5 Kiểm tra Chromium và ít nhất một browser đi qua fallback không dùng SVG backdrop, reduced motion/transparency, đồng thời quan sát cuộn/mở overlay ở danh sách dày; xác nhận chỉ bề mặt nổi bật dùng displacement, fallback đọc và thao tác được, không còn cả hai engine chạy song song.

## Workflow follow-up

- Khi người dùng yêu cầu đồng bộ/archive, ghép baseline của change `liquid-glass-theme` trước delta `liquid-glass-ui` này; rà tên requirement và quyết định WebsiteGlass đã được thay thế. Không tự sync hoặc archive trong bước apply UI.
