# Spec Delta

## Purpose

Tạo diện mạo Liquid Glass trong mờ đồng nhất cho giao diện bỏ phiếu, quản trị, nhập danh sách và xem kết quả; cho phép chọn bảng màu xanh lá hoặc xanh navy dịu; đồng thời duy trì độ tương phản dễ đọc và các phương án dự phòng dễ tiếp cận.

## ADDED Requirements

### Requirement: Dùng hiệu ứng Liquid Glass nhất quán
Các bề mặt tương tác và nhóm thành phần trong toàn ứng dụng SHALL dùng hiệu ứng kính trong mờ nhất quán, thích ứng với giao diện sáng hoặc tối và một trong hai bảng màu nhấn xanh lá hoặc xanh navy dịu.

#### Scenario: Bề mặt kính trong luồng bỏ phiếu
- **WHEN** cử tri xem phiếu, danh sách ứng viên, thanh điều hướng hoặc điều khiển bỏ phiếu
- **THEN** các bề mặt nhóm và điều khiển tương tác dùng hiệu ứng Liquid Glass theo giao diện hiện tại

#### Scenario: Bề mặt kính trong quản trị và xem kết quả
- **WHEN** quản trị viên xem trang nhập danh sách, đăng nhập, bảng điều khiển, hộp thoại hoặc bảng trượt
- **THEN** các bề mặt nhóm và điều khiển tương tác dùng hiệu ứng Liquid Glass theo giao diện hiện tại

#### Scenario: Đổi giao diện khi trang đang mở
- **WHEN** người dùng đổi giao diện hiện tại
- **THEN** màu kính, viền, chữ và bóng đổ của các bề mặt đang hiển thị được cập nhật theo giao diện đã chọn

#### Scenario: Chọn bảng màu nhấn
- **WHEN** người dùng chọn màu xanh lá hiện tại hoặc màu xanh navy dịu
- **THEN** màu nhấn, trạng thái được chọn, viền và sắc kính được cập nhật trên toàn ứng dụng mà không đổi giao diện sáng/tối
- **AND** lựa chọn màu nhấn được lưu riêng và còn hiệu lực sau khi điều hướng hoặc tải lại trang

### Requirement: Duy trì khả năng đọc trên bề mặt trong mờ
Trong mọi kết hợp giao diện và bảng màu, các bề mặt kính SHALL giữ cho chữ, trạng thái điều khiển và đường phân cách dễ nhận biết trên nền ứng dụng, đồng thời tránh viền trắng quá nổi.

#### Scenario: Chữ và điều khiển vẫn dễ phân biệt
- **WHEN** nội dung được hiển thị trên bề mặt kính ở một trong hai giao diện
- **THEN** chữ, chỉ báo vùng đang được chọn và ranh giới điều khiển vẫn dễ phân biệt với bề mặt và nền phía sau bằng viền mảnh, dịu theo bảng màu thay vì viền trắng đục nổi bật

### Requirement: Cung cấp hiệu ứng kính dự phòng
Ứng dụng SHALL giữ hiệu ứng kính mờ hoặc có màu khi không thể khúc xạ nội dung trực tiếp, đồng thời SHALL giảm độ trong suốt khi người dùng bật tùy chọn giảm độ trong suốt.

#### Scenario: Trình duyệt không hỗ trợ khúc xạ trực tiếp
- **WHEN** trình duyệt không thể hiển thị hiệu ứng khúc xạ Liquid Glass trực tiếp
- **THEN** các bề mặt kính vẫn có hiệu ứng làm mờ hoặc phủ màu phù hợp với giao diện hiện tại

#### Scenario: Người dùng yêu cầu giảm độ trong suốt
- **WHEN** hệ điều hành yêu cầu giảm độ trong suốt
- **THEN** các bề mặt kính dùng màu nền đục hơn, phù hợp với giao diện hiện tại và không phụ thuộc vào độ trong suốt để tạo ranh giới hoặc giúp dễ đọc

### Requirement: Tăng độ trong suốt mặc định của Liquid Glass
Trong chế độ hiển thị thông thường, bề mặt Liquid Glass SHALL để hậu cảnh nhìn xuyên qua rõ nhất có thể bằng lớp tint có độ đục tối thiểu và hiệu ứng làm mờ hậu cảnh. Tint SHALL được tinh chỉnh theo loại bề mặt và bảng màu; ưu tiên độ trong suốt cho thẻ và bề mặt điều hướng, đồng thời duy trì khả năng đọc bằng màu chữ, viền mảnh dịu và phản quang tiết chế. Chỉ tăng độ đục khi cần để giữ nội dung dày dễ đọc hoặc khi người dùng bật giảm độ trong suốt.

#### Scenario: Bề mặt kính ở chế độ hiển thị thông thường
- **WHEN** trang hiển thị bề mặt Liquid Glass và hệ điều hành không yêu cầu giảm độ trong suốt
- **THEN** màu sắc và chi tiết hậu cảnh vẫn nhìn thấy xuyên qua lớp kính, trong khi chữ, viền và trạng thái điều khiển tiếp tục phân biệt rõ

#### Scenario: Đổi bảng màu nhấn trên bề mặt kính
- **WHEN** người dùng chuyển giữa màu xanh lá và màu xanh navy dịu
- **THEN** tint kính và viền chuyển sang sắc độ tương ứng nhưng vẫn giữ độ phủ thấp để nhìn rõ hậu cảnh

#### Scenario: Người dùng yêu cầu giảm độ trong suốt
- **WHEN** hệ điều hành yêu cầu giảm độ trong suốt
- **THEN** ứng dụng dùng nền kính đục hơn, dễ đọc theo giao diện hiện tại

### Requirement: Chỉ thay đổi cách trình bày bằng hiệu ứng kính
Việc áp dụng kiểu Liquid Glass SHALL giữ nguyên hành động của điều khiển, chuyển trạng thái trong luồng nghiệp vụ và cách gửi/nhận dữ liệu qua API hiện có.

#### Scenario: Cử tri gửi phiếu
- **WHEN** cử tri gửi phiếu qua giao diện bỏ phiếu đã được đổi kiểu
- **THEN** cách kiểm tra tính hợp lệ và gửi phiếu hiện có vẫn được giữ nguyên

#### Scenario: Quản trị viên bắt đầu kỳ bầu chọn
- **WHEN** quản trị viên bắt đầu kỳ bầu chọn qua giao diện nhập danh sách đã được đổi kiểu
- **THEN** thao tác xác nhận, công bố ứng viên và gửi yêu cầu hiện có vẫn được giữ nguyên
