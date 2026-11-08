# Spec Delta

## Purpose

Cung cấp vật liệu kính nhất quán trên toàn bộ giao diện bầu chọn và quản trị, phân cấp rõ giữa điều hướng, điều khiển và nội dung, đồng thời bảo đảm người dùng thao tác và đọc được nội dung trong mọi giao diện hỗ trợ.

## ADDED Requirements

### Requirement: Bao phủ vật liệu kính mới trên mọi màn hình
Ứng dụng SHALL thể hiện cùng hệ vật liệu kính mới trên các bề mặt của trang bỏ phiếu, đăng nhập quản trị, nhập danh sách, dashboard và cảm ơn, bao gồm điều hướng, điều khiển giao diện, nội dung nhóm, nhãn trạng thái và lớp phủ.

#### Scenario: Đi qua các màn hình chính
- **WHEN** người dùng truy cập `/vote`, `/admin`, `/import-file`, `/dashboard` hoặc `/thanks` với quyền phù hợp
- **THEN** các bề mặt nhóm và điều khiển trên mỗi trang có vật liệu kính thống nhất về sắc kính, đường viền, bóng và trạng thái tương tác

#### Scenario: Hiển thị trạng thái ngoài dữ liệu thành công
- **WHEN** màn hình hiển thị trạng thái đang tải, lỗi, chưa có dữ liệu, chưa mở hoặc đã đóng kỳ bầu chọn
- **THEN** các thông báo và điều khiển của trạng thái đó sử dụng cùng hệ vật liệu, với nội dung và hành động dễ nhận biết

### Requirement: Phân cấp độ trong của bề mặt theo nội dung
Giao diện SHALL phân biệt bề mặt điều hướng, hành động nổi bật và nội dung dày bằng mức trong mờ, phản quang và khúc xạ phù hợp. Hiệu ứng trang trí SHALL NOT làm méo chữ, ảnh ứng viên, số liệu hoặc vùng đang chọn bên trong bề mặt.

#### Scenario: Danh sách và kết quả có nhiều nội dung
- **WHEN** người dùng xem danh sách ứng viên, các vị trí phiếu hoặc bảng và biểu đồ kết quả
- **THEN** tên, số lượng, thứ hạng và trạng thái lựa chọn hiển thị rõ, không có nhiều lớp khúc xạ chồng lên cùng nội dung

#### Scenario: Hiển thị điều hướng hoặc hành động nổi bật
- **WHEN** thanh điều hướng hoặc vùng hành động chính xuất hiện trên trang
- **THEN** bề mặt có phản quang và chiều sâu kính rõ ràng, đồng thời giữ nội dung và vùng bấm ổn định

### Requirement: Đồng bộ vật liệu trên trang và lớp phủ theo giao diện đã chọn
Vật liệu kính mới SHALL nhận đúng kết hợp sáng/tối và xanh lá/navy từ lần hiển thị đầu, kể cả nội dung mở nổi trên trang. Thay đổi lựa chọn SHALL cập nhật các bề mặt đang mở và biểu đồ mà không làm mất dữ liệu đang thao tác.

#### Scenario: Tải lại với lựa chọn đã lưu
- **WHEN** người dùng tải lại trang với một trong bốn kết hợp sáng/tối và xanh lá/navy đã lưu
- **THEN** nền, chữ, kính và điều khiển hiển thị kết hợp tương ứng ngay từ khi trang bắt đầu hiển thị, không lóe bảng màu đối nghịch

#### Scenario: Đổi giao diện trong khi đang làm việc
- **WHEN** người dùng đổi sáng/tối hoặc màu nhấn khi đã chọn phiếu, có danh sách nhập tạm hoặc đang xem kết quả
- **THEN** bề mặt và biểu đồ đổi màu tương ứng, còn lựa chọn phiếu, danh sách tạm và dữ liệu kết quả vẫn được giữ

#### Scenario: Mở dialog hoặc drawer
- **WHEN** người dùng mở hộp thoại xác nhận hoặc danh sách ứng viên đã xóa
- **THEN** bề mặt nổi, nền che, chữ, điều khiển và chỉ báo focus phù hợp với giao diện và màu nhấn hiện tại

### Requirement: Giữ độ đọc và khả năng nhận biết trạng thái trên kính mới
Nội dung chữ thông thường trên kính SHALL có tương phản tối thiểu 4.5:1; chữ lớn và thành phần đồ họa mang thông tin SHALL đạt tối thiểu 3:1 với nền trực tiếp. Lựa chọn, lỗi và hành động nguy hiểm SHALL có dấu hiệu chữ hoặc hình ngoài màu sắc.

#### Scenario: Nội dung trên nền sáng hoặc tối
- **WHEN** tên ứng viên, chỉ dẫn, số liệu hoặc nhãn điều khiển xuất hiện trong bất kỳ kết hợp giao diện và màu nhấn nào
- **THEN** nội dung đạt ngưỡng tương phản tương ứng trên nền tổng hợp thực tế, bao gồm bề mặt trong mờ và nền phía sau

#### Scenario: Lựa chọn hoặc lỗi xuất hiện
- **WHEN** ứng viên được chọn, điều khiển bị vô hiệu hóa hoặc một thao tác báo lỗi
- **THEN** người dùng nhận biết trạng thái bằng dấu hiệu rõ ràng như nhãn, biểu tượng, bộ đếm hoặc trạng thái điều khiển tương ứng

### Requirement: Giữ hợp đồng tương tác khi thay bề mặt kính
Các điều khiển SHALL giữ ngữ nghĩa, nhãn truy cập, hành vi bàn phím, gửi form và trạng thái bận/vô hiệu hóa hiện tại. Lớp trang trí kính SHALL NOT chặn con trỏ, thu focus hoặc làm thay đổi phần tử nhận thao tác.

#### Scenario: Gửi form và thao tác khi bận
- **WHEN** người dùng nhập PIN và gửi form bằng Enter hoặc kích hoạt một thao tác bất đồng bộ
- **THEN** đúng hành động được thực hiện một lần, trạng thái bận được thể hiện và điều khiển bị vô hiệu hóa không phát thêm yêu cầu

#### Scenario: Mở và đóng bề mặt nổi bằng bàn phím
- **WHEN** người dùng mở dialog hoặc drawer, di chuyển focus bên trong rồi đóng bằng Escape hoặc nút đóng/hủy
- **THEN** focus ở trong bề mặt nổi khi mở và trở lại phần tử kích hoạt phù hợp khi đóng; nội dung có tên truy cập và chỉ báo focus không bị cắt

#### Scenario: Chọn và xác nhận phiếu bằng thao tác hiện tại
- **WHEN** cử tri chạm chọn ứng viên, xóa lựa chọn, xem phiếu và xác nhận hoặc hủy gửi
- **THEN** các thao tác cập nhật đúng phiếu, giữ bước xác nhận và không bị lớp kính hoặc lớp phủ ngăn thao tác

### Requirement: Bố cục kính mới thích ứng với màn hình hẹp
Các bề mặt kính SHALL co giãn theo bố cục responsive mà không tạo cuộn ngang ngoài ý muốn. Header, thanh hành động, dialog và drawer SHALL giữ nội dung cùng điều khiển chính trong vùng đọc và thao tác được.

#### Scenario: Dùng trên điện thoại
- **WHEN** người dùng mở các trang chính ở chiều rộng 375 CSS px hoặc xoay ngang điện thoại
- **THEN** nội dung chính không tràn ngang, dialog/drawer có thể cuộn khi cần và thanh cố định không che điều khiển hoặc focus

#### Scenario: Dùng trên desktop
- **WHEN** người dùng mở dashboard hoặc danh sách ở chiều rộng 1440 CSS px
- **THEN** các cột, thẻ và biểu đồ giữ phân cấp và độ rộng theo bố cục của trang, không bị lớp bọc kính thay đổi ngoài ý muốn

### Requirement: Giữ bề mặt mới sử dụng được khi giảm hiệu ứng
Ứng dụng SHALL cung cấp nền dễ đọc khi trình duyệt không dựng được khúc xạ hoặc làm mờ hậu cảnh. Yêu cầu giảm độ trong suốt SHALL tăng độ đục và bỏ quang học trang trí; yêu cầu giảm chuyển động SHALL tắt các chuyển động trang trí của vật liệu.

#### Scenario: Trình duyệt thiếu hiệu ứng hậu cảnh
- **WHEN** trình duyệt không hỗ trợ khúc xạ hoặc không có khả năng làm mờ hậu cảnh
- **THEN** người dùng vẫn thấy đủ chữ, ranh giới, trạng thái và điều khiển để hoàn thành thao tác trên nền dự phòng phù hợp

#### Scenario: Giảm độ trong suốt
- **WHEN** thiết bị yêu cầu giảm độ trong suốt
- **THEN** trang, dialog và drawer dùng bề mặt đục hơn và không cần hiệu ứng khúc xạ để nhận biết nội dung

#### Scenario: Giảm chuyển động
- **WHEN** thiết bị yêu cầu giảm chuyển động
- **THEN** các hiệu ứng chuyển động trang trí của kính và chuyển giao diện được tắt, trong khi thao tác và dữ liệu tiếp tục hoạt động
