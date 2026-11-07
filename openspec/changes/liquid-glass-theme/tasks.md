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
