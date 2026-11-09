# Tasks

## 1. Trạng thái giao diện và điều khiển

- [x] 1.1 Thêm cơ chế chọn giao diện theo thiết bị ở gốc tài liệu, lựa chọn ghi đè đã lưu và khởi tạo trước khi vẽ trang như một trạng thái trình bày riêng; xác nhận tùy chọn còn hiệu lực sau khi chuyển trang hoặc tải lại mà không làm thay đổi phiếu hay danh sách đang thao tác.
- [x] 1.2 Tạo nút toggle sáng/tối dùng chung, dễ tiếp cận; theo thiết bị cho đến lần bật/tắt đầu tiên rồi lưu lựa chọn. Hiển thị trên trang bỏ phiếu, nhập danh sách, bảng điều khiển, đăng nhập và xác nhận; trạng thái hiện tại được công bố cho công nghệ hỗ trợ mà không làm đổi trạng thái luồng nghiệp vụ.
- [x] 1.3 Cài gói `motion` bằng `npm install motion`; xác nhận dependency xuất hiện trong `package.json` và `package-lock.json`, đồng thời có thể import API React từ `motion/react`.
- [x] 1.4 Thêm Circular Reveal từ tâm công tắc giao diện và chuyển mượt màu nền, chữ, viền cùng sắc kính; xác nhận reveal phủ toàn màn hình và không làm thay đổi state nghiệp vụ hiện có.
- [x] 1.5 Khi thiết bị tự đổi giao diện, chỉ chuyển màu mượt mà không chạy Circular Reveal; khi bật `prefers-reduced-motion`, bỏ reveal và chuyển màu tức thì; xác nhận cả hai chế độ hoạt động đúng.

## 2. Biến giao diện và thành phần kính dùng chung

- [x] 2.1 Định nghĩa biến thiết kế sáng/tối cho nền, chữ, đường viền, vùng điều khiển đang được chọn, màu kính, viền phản quang và bóng đổ; xác nhận mỗi giao diện phân biệt rõ lớp nền trang và bề mặt.
- [x] 2.2 Chuyển kiểu của thẻ, nút, thanh đầu trang, ô nhập, hộp thoại và bảng trượt dùng chung sang biến giao diện mà không đổi hàm xử lý sự kiện hoặc bước kiểm tra hiện có; xác nhận chữ, trạng thái điều khiển và vùng đang được chọn vẫn dễ đọc ở cả hai giao diện, thao tác giữ nguyên hành vi.
- [x] 2.3 Giữ hiệu ứng khúc xạ và chuyển động WebsiteGlass hiện có, bổ sung kính mờ dự phòng theo giao diện và hỗ trợ giảm độ trong suốt; xác nhận bề mặt dự phòng vẫn tách biệt rõ và dễ đọc.
- [x] 2.4 Tăng độ trong suốt mặc định của bề mặt Liquid Glass để hậu cảnh nhìn xuyên rõ hơn; giữ độ đọc bằng màu chữ, viền và phản quang, đồng thời duy trì nền đục hơn cho chế độ giảm độ trong suốt.

## 3. Phủ giao diện cho các bề mặt trong ứng dụng

- [x] 3.1 Chuyển các bề mặt còn lại của trang bỏ phiếu, ứng viên, phiếu bầu, nhập danh sách và quản trị sang kính dùng chung cùng biến giao diện, không đổi chuyển trạng thái hiện có; xác nhận từng luồng giữ nguyên hành vi và trạng thái kéo, chọn, lỗi vẫn hiển thị rõ.
- [x] 3.2 Làm cho lưới biểu đồ, chú giải nổi, nhãn và bề mặt xếp hạng trong bảng điều khiển thích ứng theo giao diện hiện tại; xác nhận dữ liệu và nhãn biểu đồ dễ phân biệt ở chế độ sáng lẫn tối.

## 4. Tích hợp và rà soát giữa các trang

- [x] 4.1 Rà soát mọi trang ở chế độ sáng, tối, theo thiết bị, giảm độ trong suốt và giảm chuyển động; xác nhận nút toggle, Circular Reveal, độ trong suốt mới, hiệu ứng kính dự phòng, độ tương phản và trạng thái luồng nhất quán khi chuyển trang.
- [x] 4.2 Rà soát toàn bộ thay đổi cuối cùng; xác nhận không sửa tệp bộ xử lý API trong route hoặc logic nghiệp vụ/trạng thái luồng hiện có.

## 5. Tinh chỉnh kính và bảng màu nhấn

- [x] 5.1 Giảm độ đục của viền trắng và hạ tint mặc định của các bề mặt Liquid Glass; giữ phản quang tiết chế, độ đọc rõ và fallback đục hơn cho chế độ giảm độ trong suốt.
- [x] 5.2 Thêm lựa chọn xanh lá hiện tại và xanh navy dịu vào giao diện; lưu lựa chọn riêng với sáng/tối, khởi tạo màu trước khi vẽ trang và áp dụng nhất quán cho màu nhấn, viền và sắc kính.
- [x] 5.3 Rà soát các trang với cả hai giao diện, hai bảng màu và chế độ giảm độ trong suốt; xác nhận lựa chọn còn hiệu lực sau điều hướng/tải lại, kính nhìn xuyên rõ và luồng nghiệp vụ không đổi.

## 6. Audit hiệu năng chuyển theme

- [x] 6.1 Đo và ghi lại thời gian xử lý click cùng frame rate và thời lượng reveal hiện tại trên trang đại diện; lưu số liệu nền để so sánh sau migration sang Magic UI.
- [x] 6.2 Kiểm tra transition màu toàn cục, số component đăng ký `useTheme`, và chi phí snapshot từ `backdrop-filter`, blur, canvas hoặc WebGL; ghi phát hiện và cách xử lý cho từng nguyên nhân có tác động.

## 7. Chuyển quản lý theme sang next-themes

- [x] 7.1 Cài `next-themes` và cấu hình provider với `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`; xác nhận theme system/light/dark và `resolvedTheme` hoạt động.
- [x] 7.2 Chuyển mọi import consumer từ `useTheme` tự viết sang `next-themes`, xóa provider/hook cũ và xác nhận không còn tham chiếu cũ bằng tìm kiếm toàn repo.

## 8. Ngăn flash và hydration warning

- [x] 8.1 Tích hợp khởi tạo theme của `next-themes` vào root layout Next.js, thêm `suppressHydrationWarning` tại `<html>` và chỉ render icon phụ thuộc theme sau `mounted`; xác nhận bố cục nút không dịch chuyển.
- [x] 8.2 Tải lại trang với theme dark đã lưu và với theme system; xác nhận theme đúng ngay từ lần render hiển thị đầu, không flash và không có hydration warning trong console.

## 9. Tối ưu handler View Transition

- [x] 9.1 Cài component bằng `npx shadcn@latest add @magicui/animated-theme-toggler`; xác nhận component được thêm vào đường dẫn UI của dự án và các dependency của registry được giải quyết.
- [x] 9.2 Nối component với `next-themes` qua `theme` lấy từ `resolvedTheme` và `onThemeChange` lấy từ `setTheme`; xác nhận provider nhận và lưu lựa chọn sáng/tối.
- [x] 9.3 Cấu hình `variant="circle"`, `duration={500}` và origin mặc định ở tâm nút; xác nhận reveal tròn đúng thời lượng khi kích hoạt bằng pointer và bàn phím.
- [x] 9.4 Giữ CSS View Transition do component cung cấp, bỏ transition màu toàn trang cạnh tranh và cấu hình duration bằng 0 khi bật reduced motion; xác nhận giảm chuyển động không có reveal nhìn thấy được.
- [x] 9.5 Xác nhận fallback tích hợp của component đổi theme tức thì khi thiếu View Transitions và bỏ qua bấm thêm trong lúc transition đang chạy; kiểm tra theme vẫn đồng bộ sau khi transition hoàn tất hoặc lỗi.

## 10. Hoàn thiện ThemeToggle

- [x] 10.1 Thay các nút toggle hiện có bằng component Magic UI dùng chung trên các trang bỏ phiếu, nhập danh sách, bảng điều khiển, đăng nhập và xác nhận; xác nhận các vị trí đều dùng cùng component.
- [x] 10.2 Chỉ render toggle sau `mounted`, giữ kích thước chỗ trống ổn định và cung cấp nhãn truy cập phù hợp; xác nhận icon Sun/Moon và trạng thái truy cập được khớp với `resolvedTheme`.
- [x] 10.3 AnimatePresence chuyen icon Sun/Moon va whileTap tren nut theme; xac nhan motion chi danh cho icon/nut va tat khi reduced motion.

## 11. Kiểm thử thủ công theme

- [ ] 11.1 Kiểm tra Chrome, Safari và Firefox: reload khi đang dark, lựa chọn system, đổi theme bằng pointer và bàn phím, bấm liên tục, và reduced motion; ghi kết quả từng trình duyệt.
  Chrome and WebKit passed dark reload, system dark/light, pointer and Space toggles, rapid clicks (single flip), reduced motion, and zero hydration warnings. Playwright Firefox launch timed out after 30 seconds. Safari is unavailable on this Windows host; WebKit was tested as an engine proxy, not as Safari.
- [x] 11.2 Đo lại hiệu năng sau tối ưu trên các trang đại diện; ghi frame rate và xác nhận mục tiêu xấp xỉ 60fps trong reveal.
  Chrome (headless, 1280x800): /thanks 96.0% of sampled frames <=16.67ms, p95 14.0ms; /vote 98.7%, p95 7.1ms.

## 12. Kiểm tra chất lượng và OpenSpec

- [x] 12.1 Chạy `tsc` và lint; ghi kết quả và xử lý lỗi phát sinh từ migration theme.
- [x] 12.2 Chạy `openspec validate liquid-glass-theme --strict`; xác nhận change hợp lệ.
