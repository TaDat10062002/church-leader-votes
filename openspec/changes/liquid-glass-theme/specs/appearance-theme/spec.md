# Spec Delta

## Purpose

Cho phép người dùng sử dụng ứng dụng bầu chọn với giao diện sáng hoặc tối, mặc định theo thiết bị và có thể lưu lựa chọn riêng giữa các lần truy cập.

## ADDED Requirements

### Requirement: Chọn giao diện theo thiết lập thiết bị
Khi người dùng chưa lưu lựa chọn giao diện, ứng dụng SHALL dùng thiết lập sáng hoặc tối hiện tại của thiết bị và đồng bộ giao diện khi thiết lập đó thay đổi.

#### Scenario: Lần truy cập đầu dùng giao diện sáng của thiết bị
- **WHEN** người dùng chưa lưu lựa chọn giao diện và thiết bị đang đặt giao diện sáng
- **THEN** ứng dụng hiển thị giao diện sáng

#### Scenario: Lần truy cập đầu dùng giao diện tối của thiết bị
- **WHEN** người dùng chưa lưu lựa chọn giao diện và thiết bị đang đặt giao diện tối
- **THEN** ứng dụng hiển thị giao diện tối

#### Scenario: Thiết lập thiết bị thay đổi khi chưa có lựa chọn riêng
- **WHEN** thiết lập giao diện của thiết bị thay đổi và người dùng chưa lưu lựa chọn riêng
- **THEN** ứng dụng chuyển sang giao diện mới được thiết bị ưu tiên

### Requirement: Chuyển giao diện bằng nút toggle
Ứng dụng SHALL cung cấp trên các trang người dùng một nút toggle hai trạng thái sáng/tối. Nút SHALL công bố giao diện hiện tại bằng nhãn truy cập được và ngữ nghĩa switch. Mỗi lần kích hoạt SHALL chuyển ngay sang giao diện đối diện. Tùy chọn này SHALL độc lập với trạng thái luồng nghiệp vụ.

#### Scenario: Người dùng bật/tắt giao diện
- **WHEN** người dùng kích hoạt nút toggle
- **THEN** ứng dụng chuyển sang giao diện đối diện và công bố trạng thái mới của nút

### Requirement: Ghi nhớ lựa chọn giao diện
Khi người dùng bật/tắt giao diện, ứng dụng SHALL lưu chế độ sáng hoặc tối đã chọn và duy trì chế độ đó qua điều hướng, tải lại và thay đổi thiết lập thiết bị.

#### Scenario: Lựa chọn đã lưu được ưu tiên hơn thiết bị
- **WHEN** người dùng quay lại với lựa chọn sáng hoặc tối đã lưu, kể cả khi thiết lập thiết bị khác lựa chọn đó
- **THEN** ứng dụng hiển thị giao diện đã lưu

### Requirement: Giữ thay đổi giao diện độc lập với trạng thái của luồng nghiệp vụ
Việc đổi giao diện SHALL NOT làm thay đổi trạng thái hiện có của phiếu bầu, danh sách ứng viên, xác thực, kỳ bầu chọn hoặc kết quả.

#### Scenario: Cử tri đổi giao diện khi đang chọn phiếu
- **WHEN** cử tri đã chọn ứng viên và đổi giao diện
- **THEN** các ứng viên đã chọn và trạng thái của phiếu vẫn được giữ nguyên

#### Scenario: Quản trị viên đổi giao diện khi đang nhập danh sách
- **WHEN** quản trị viên có ứng viên tạm trong danh sách chờ hoặc danh sách đã xóa và đổi giao diện
- **THEN** nội dung của hai danh sách vẫn được giữ nguyên

### Requirement: Chuyển giao diện bằng hiệu ứng động
Khi giao diện hiệu lực thay đổi, ứng dụng SHALL chuyển mượt màu nền và màu các bề mặt. Khi người dùng kích hoạt nút toggle, ứng dụng SHALL mở giao diện mới bằng Circular Reveal bắt đầu tại tâm nút. Ứng dụng SHALL tôn trọng tùy chọn giảm chuyển động của hệ điều hành.

#### Scenario: Người dùng bật/tắt giao diện
- **WHEN** người dùng kích hoạt nút toggle sáng/tối
- **THEN** giao diện mới mở rộng theo hình tròn từ tâm nút, đồng thời nền và bề mặt chuyển sang bảng màu mới một cách mượt mà

#### Scenario: Thiết lập giao diện thiết bị thay đổi
- **WHEN** thiết bị đổi chế độ sáng/tối và người dùng chưa lưu lựa chọn riêng
- **THEN** nền và các bề mặt chuyển mượt sang giao diện mới mà không chạy Circular Reveal

#### Scenario: Người dùng bật chế độ giảm chuyển động
- **WHEN** hệ điều hành yêu cầu giảm chuyển động
- **THEN** ứng dụng bỏ Circular Reveal và đổi giao diện tức thì