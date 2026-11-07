# Design

## Context

Xem `proposal.md` để biết lý do thực hiện. Ứng dụng đã có các thành phần WebsiteGlass trong `src/components/ui` và đang dùng chúng cho thẻ, nút, tiêu đề, ô nhập liệu dùng chung cùng một số bề mặt riêng của trang. Bộ nhận diện giao diện trong bộ máy kính hiểu `.dark`, `.light` và `data-theme`, trong khi bố cục gốc hiện cố định tài liệu ở chế độ `light`; màu toàn cục và nhiều lớp tiện ích cũng chỉ hỗ trợ giao diện sáng.

## Goals / Non-Goals

**Goals:**
- Thiết lập một trạng thái giao diện ở cấp gốc tài liệu để mọi trang và thành phần kính đều sử dụng được.
- Tái sử dụng mã lens, surface và chuyển động WebsiteGlass hiện tại, đồng thời áp dụng diện mạo thống nhất cho các bề mặt dùng chung và bề mặt riêng của từng trang.
- Giữ nội dung dễ đọc và điều khiển dễ nhận biết ở giao diện sáng, tối, trình duyệt không hỗ trợ khúc xạ và chế độ giảm độ trong suốt.

**Non-Goals:**
- Bổ sung các nhóm thành phần WebsiteGlass mới mà sản phẩm hiện chưa cần.
- Thay đổi luồng bỏ phiếu, bầu chọn hoặc quản trị ngoài việc thêm điều khiển giao diện và đổi kiểu các bề mặt.
- Thêm gói phụ thuộc lúc chạy nào khác ngoài Motion cho chuyển theme.
- Thay đổi quy tắc nghiệp vụ, logic hoặc hợp đồng API route handler, hay các chuyển trạng thái hiện có của phiếu bầu, danh sách ứng viên, xác thực, kỳ bầu chọn và kết quả.

### Bảng màu nhấn độc lập với giao diện sáng/tối
Giữ xanh lá hiện tại làm lựa chọn mặc định và thêm bảng màu xanh navy dịu. Lưu lựa chọn bảng màu trong khóa riêng với `appearance-theme`, áp dụng trên gốc tài liệu để các biến CSS và WebsiteGlass cùng cập nhật sau khi chọn, điều hướng hoặc tải lại. Bảng màu chỉ đổi màu nhấn, sắc kính và viền; không thay đổi chế độ sáng/tối hay trạng thái nghiệp vụ.

### Giảm tint và độ nổi của viền kính
Giảm đáng kể độ đục của viền trắng hiện tại và hạ tint ở các bề mặt dùng chung xuống mức thấp nhất vẫn giữ nội dung phân biệt được trên nền thực tế. Dùng biến viền theo giao diện và bảng màu, tránh viền trắng sáng mặc định; giữ phản quang nhẹ, còn chế độ giảm độ trong suốt và fallback tiếp tục dùng nền đục dễ đọc.

## Decisions

### Dùng giao diện theo thiết bị với nút toggle sáng/tối ghi nhớ lựa chọn
Khi chưa có chế độ riêng được lưu, đặt thuộc tính data-theme trên gốc tài liệu theo thiết lập prefers-color-scheme và đồng bộ khi thiết lập thiết bị thay đổi. Một nút toggle truy cập được hiển thị trạng thái sáng/tối hiện tại; mỗi lần kích hoạt chuyển sang trạng thái đối diện và lưu lựa chọn đó vào bộ nhớ trình duyệt. Giá trị đã lưu được ưu tiên qua điều hướng và tải lại. Trạng thái giao diện vẫn là trạng thái trình bày riêng, không tạo lại thành phần nghiệp vụ hoặc thay đổi phiếu, danh sách tạm, xác thực, kỳ bầu chọn hay kết quả đang hiển thị.

Khởi tạo giao diện trước khi trang được vẽ để tránh lóe màu. Dùng cùng một khóa lưu trữ và cùng quy tắc phân giải giữa đoạn khởi tạo và phần giao diện dùng chung. Nút thể hiện chế độ hiện tại bằng nhãn truy cập được và ngữ nghĩa switch; không dùng biểu tượng hoặc màu sắc làm chỉ báo duy nhất.

### Dùng Motion cho Circular Reveal và chuyển màu giao diện

Cài gói `motion` và dùng API React từ `motion/react`. Dự án hiện dùng React 19.1.1; Motion hỗ trợ React 18.2 trở lên. Không dùng `AnimateView`, vì API đó yêu cầu React 19.3 trở lên. Tham khảo [hướng dẫn cài Motion cho React](https://motion.dev/docs/react-installation) và [yêu cầu của AnimateView](https://motion.dev/docs/react-animate-view).

Khi người dùng đổi giao diện bằng công tắc, dùng một lớp giao diện hình tròn đặt tại tâm công tắc và animate `transform: scale()` đến khi phủ hết màn hình. Dùng transform để giữ Circular Reveal trên compositor, tránh vẽ lại mặt nạ `clip-path` ở mỗi khung hình. Đồng thời chuyển mượt màu nền, chữ, viền và sắc kính sang bảng màu mới. Khi thay đổi đến từ thiết lập thiết bị, chuyển bảng màu mượt mà mà không chạy Circular Reveal vì không có điểm kích hoạt từ thao tác người dùng.

Giữ lớp chuyển tiếp đơn nhất để hạn chế công việc vẽ lại. Khi `prefers-reduced-motion` được bật, bỏ Circular Reveal và chuyển các màu tức thì; không tạo state nghiệp vụ mới để điều phối hiệu ứng.

### Định nghĩa biến ngữ nghĩa cho giao diện và loại bỏ giả định chỉ có giao diện sáng

Dùng CSS custom properties cho nền trang, màu chữ chính, chữ phụ, màu nhấn, đường viền, vùng đang được chọn, sắc kính, viền phản quang và bóng đổ. Ánh xạ kiểu hiển thị của giao diện dùng chung sang các giá trị ngữ nghĩa này, sau đó rà các lớp tiện ích theo trang và màu biểu đồ đang cố định màu trắng, kem, mực hoặc bề mặt sáng. Giữ kiểu nền chuyển sắc dịu hiện có, bổ sung bảng màu sáng và tối riêng để tạo biến thiên màu dễ thấy phía sau lớp kính.

Việc này tạo một quy ước bảng màu thống nhất cho CSS, thành phần giao diện và trực quan hóa dữ liệu. Đã cân nhắc thêm các ghi đè chế độ tối rải rác, nhưng cách đó sẽ lặp lại quyết định màu sắc và khiến việc tinh chỉnh kính sau này thiếu nhất quán.

Các cập nhật thành phần trong thay đổi này chỉ giới hạn ở trình bày và tích hợp điều khiển giao diện. Giữ nguyên hàm xử lý sự kiện, kiểm tra hợp lệ, chuyển trạng thái và cách gửi yêu cầu hiện tại; không sửa các tệp bộ xử lý API của từng trang.

### Áp dụng hiệu ứng quang học WebsiteGlass trên các bề mặt dễ đọc, thích ứng theo giao diện

Giữ `GlassSurface` của WebsiteGlass làm khối xây dựng dùng chung cho thẻ, điều hướng, điều khiển, hộp thoại và bảng trượt. Dùng màu phủ trong mờ, thuộc tính `backdrop-filter` để làm mờ hậu cảnh và tăng độ bão hòa, điểm phản quang nhẹ cùng đường viền mảnh. Tinh chỉnh màu phủ và độ mờ theo loại bề mặt để bảng chính vẫn dễ đọc, nhãn nhỏ vẫn có vẻ trong suốt rõ ràng; không dùng cùng một độ đục cho mọi bề mặt. Cập nhật thành phần bao hiện tại và các bề mặt riêng còn lại thay vì phủ thêm một giải pháp kính cạnh tranh.

Thiết kế dùng khúc xạ trực tiếp hiện có ở nơi được hỗ trợ và giữ hiệu ứng kính mờ/phủ màu dự phòng ở nơi khác. Với chế độ giảm độ trong suốt, dùng màu nền theo token đục hơn và bỏ hiệu ứng quang học trang trí phụ thuộc vào độ trong suốt.

### Đặt điều khiển giao diện trong phần khung trang dùng chung

Hiển thị cùng một điều khiển trong thanh đầu trang kính dùng chung trên trang bỏ phiếu, nhập danh sách và bảng điều khiển; bổ sung vào màn hình đăng nhập và xác nhận độc lập để người dùng luôn truy cập được trong suốt luồng sử dụng. Dùng nhãn dễ tiếp cận và thông báo chế độ hiện tại; không chỉ dựa vào màu biểu tượng để thể hiện trạng thái.

Đặt điều khiển trong phần khung trang để tránh lớp phủ cố định che mất thao tác bỏ phiếu trên màn hình nhỏ. Thanh đầu trang riêng của từng trang vẫn có thể giữ bố cục hiện tại và dùng chung một thành phần điều khiển.

### Tăng độ trong suốt mặc định của Liquid Glass
Giảm độ đục của lớp màu phủ trên các bề mặt kính thông thường để hậu cảnh hiện rõ hơn qua kính, đồng thời giữ hiệu ứng làm mờ hậu cảnh, viền mảnh và phản quang nhẹ theo tinh thần Liquid Glass trên iOS. Tinh chỉnh độ phủ theo bề mặt: thẻ và thanh điều hướng trong hơn; nơi có nhiều chữ có thể dùng mức phủ vừa đủ để dễ đọc. Màu chữ, viền và trạng thái đang chọn phải tự phân biệt rõ mà không phụ thuộc vào lớp phủ đục. Khi hệ điều hành yêu cầu giảm độ trong suốt hoặc trình duyệt thiếu hiệu ứng kính, dùng nền dự phòng đục hơn theo giao diện hiện tại.

## Risks / Trade-offs

- [Bảng trong mờ có thể làm giảm tương phản trên ảnh ứng viên hoặc biểu đồ] → Dùng biến màu phủ riêng theo giao diện, tăng độ đục cho nội dung dày và kiểm tra độ rõ của chữ/vùng đang được chọn trên từng trang.
- [Bộ nhớ trình duyệt có thể không khả dụng hoặc chứa dữ liệu sai] → Xem bộ nhớ là tùy chọn, kiểm tra giá trị đã lưu và quay về thiết lập hiện tại của thiết bị khi cần.
- [Khúc xạ trực tiếp có thể tăng thời gian dựng hình ở trang phức tạp] → Chỉ khúc xạ các bề mặt chính và giữ đường xử lý chỉ làm mờ cho các bề mặt còn lại hoặc trình duyệt không hỗ trợ.
- [Giao diện khởi tạo ở gốc có thể không khớp trạng thái sau hydration] → Dùng chung khóa lưu trữ và quy tắc xác định giao diện giữa đoạn khởi tạo và phần xử lý giao diện dùng chung.
- [Circular Reveal toàn màn hình có thể tốn hiệu năng hoặc gây khó chịu khi lặp lại] → Chỉ chạy khi người dùng chủ động đổi giao diện, dùng một lớp phủ duy nhất và tắt hiệu ứng theo `prefers-reduced-motion`.

## Migration Plan

1. Thêm biến ngữ nghĩa cho giao diện sáng/tối và xác định giao diện ở gốc, giữ bảng màu hiện tại làm nền tảng cho giao diện sáng.
2. Thêm điều khiển giao diện dùng chung và tích hợp vào phần khung của mọi trang người dùng.
3. Chuyển thành phần dùng chung và màu cố định theo trang sang biến thích ứng với giao diện, sau đó tinh chỉnh hiệu ứng kính và bề mặt biểu đồ.
4. Thêm gói Motion và tích hợp Circular Reveal cùng chuyển màu mượt khi đổi giao diện; xác nhận tương thích với React 19.1.1.
5. Kiểm tra đổi giao diện, ghi nhớ sau khi tải lại, chế độ theo thiết bị và phương án dự phòng khi giảm độ trong suốt hoặc chuyển động trên các trang bỏ phiếu/quản trị.

Để hoàn tác, có thể gỡ điều khiển giao diện và hành vi ghi đè ở gốc, khôi phục tài liệu cố định ở chế độ sáng, đồng thời giữ các thành phần WebsiteGlass với giá trị biến màu sáng.
