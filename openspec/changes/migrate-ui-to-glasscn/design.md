# Design

## Context

Xem `proposal.md` về mục tiêu và `specs/liquid-glass-ui/spec.md` về hành vi nghiệm thu. Nền tảng hiện tại là Next.js 15, React 19 và Tailwind CSS 4. Các điểm tích hợp quan sát được:

- `ui/button.tsx`, `ui/card.tsx`, `ui/glass-header.tsx`, input PIN và các vị trí phiếu vẫn phụ thuộc các component WebsiteGlass, `glass.tsx` và `glass-motion.ts`.
- `ui/glasscn/` đã có Card, Button, Input, Badge, Item, Icon, Scrim Card và `liquid-glass.tsx`; đây là source cục bộ cần đối chiếu registry, không tự coi tên thư mục là bằng chứng đã tích hợp đúng thư viện. `FormInput` đã dùng Glass Input mới nhưng PIN còn dùng input cũ.
- Các primitive mới import `@base-ui/react` và `class-variance-authority`, trong khi manifest/lockfile chưa khai báo hai gói này. `GlassScrimCard` còn import app `Card` đang chạy WebsiteGlass.
- Theme dùng `data-theme`, `data-palette`, hai khóa lưu `appearance-theme` / `appearance-palette` và script khởi tạo trước paint. Các class `dark:` trong glasscn chưa được ánh xạ sang `data-theme`; semantic token của shadcn cũng còn thiếu.
- Card cũ đặt layout ở root, trong khi Glass Card mới thêm wrapper và Card nền có sẵn flex, gap, padding, clipping. Dialog/Sheet dùng Radix `asChild` hoặc native dialog nên không thể thay import mà bỏ qua root/ref.
- ECharts đọc `--glass-panel`, `--glass-fallback`, `--glass-border` và quan sát theme/palette. Nền trang hiện là màu tĩnh; mọi `--app-page-bg` đang là `none`.
- E2E `ballot-drag.spec.ts` còn kỳ vọng kéo thả và gửi trực tiếp; UI hiện tại dùng chạm chọn cùng bước xác nhận. `glass-roster.spec.ts` kiểm tra khôi phục ứng viên, Escape và trả focus trên mobile.

## Goals / Non-Goals

**Goals:**
- Có một nguồn hiệu ứng quang học glasscn và một lớp adapter ứng dụng ổn định cho semantic, ref, layout và trạng thái.
- Tận dụng source registry có thể sở hữu tại repo, với các điều chỉnh nhỏ được ghi lại và dễ đối chiếu khi cập nhật.
- Phân bổ chi phí khúc xạ theo vai trò bề mặt, đồng thời giữ bốn kết hợp theme/palette và fallback sử dụng được.

**Non-Goals:**
- Đổi backend, dữ liệu, quy tắc phiếu bầu hoặc thêm lại thao tác kéo thả.
- Thay toàn bộ Radix bằng hệ dialog khác, thay thư viện biểu đồ, thêm framework theme hoặc thiết kế lại điều hướng.
- Thêm ảnh nền, blob chuyển động hoặc một phong cách thương hiệu mới để minh họa kính.

## Decisions

### 1. Sử dụng registry chính thức và đối chiếu source cục bộ

Nguồn chuẩn là [website glasscn-components](https://glasscn-components.vercel.app/) và [repository chính thức](https://github.com/kostyniuk/glasscn-components). Tài liệu [Glass Card](https://glasscn-components.vercel.app/components/glass-card) và [Glass Button](https://glasscn-components.vercel.app/components/glass-button) cung cấp cách cài theo registry `@glasscn` và thuộc tính `glassVariant`.

Trong apply, lấy các item cần dùng cùng dependency của registry, đối chiếu với `src/components/ui/glasscn/` rồi hợp nhất có kiểm soát. Ghi URL item, ngày lấy và commit upstream nếu xác định được trong `docs/liquid-glass.md`. Các source mới được giữ tại repo; không tìm một npm package có tên gần giống để thay thế. Khai báo và khóa dependency thực tế, tối thiểu `@base-ui/react` và `class-variance-authority` cho các primitive đang có.

Giữ tên neutral primitive như `button-base.tsx`, `card-base.tsx` để tránh registry ghi đè app `Button`/`Card`. Sửa `GlassScrimCard` dùng primitive nền nếu giữ component này, hoặc gỡ nếu không được dùng; tuyệt đối không lồng app Card WebsiteGlass vào kính mới. `glasscn/liquid-glass.tsx` chỉ được giữ dưới vai trò engine của thư viện sau khi đã đối chiếu nguồn; engine WebsiteGlass ở `ui/glass.tsx` sẽ được gỡ.

Đã cân nhắc chỉ đổi CSS của WebsiteGlass hoặc tự viết một engine mô phỏng; cả hai không đáp ứng nguồn thư viện người dùng yêu cầu. Cũng không ghi đè toàn bộ registry trực tiếp lên các file app vì trùng alias và khác hợp đồng root.

### 2. Giữ adapter ứng dụng, quy định rõ phần tử nhận ref và layout

Giữ các điểm vào `Button`, `Card`, `FormInput`, header và Sheet để thống nhất chính sách, nhưng adapter chỉ dựng vật liệu từ component/source glasscn.

- `Button`: ref, `type`, `disabled`, thuộc tính ARIA và event handler phải tới nút thật; mặc định hành động thông thường là `type="button"`, form gửi dùng `type="submit"`. Ánh xạ primary/secondary/ghost/danger sang primitive/variant mới. Vùng bấm và width được áp dụng cả vào wrapper kính khi cần.
- `Card`: định nghĩa một root DOM ổn định nhận ref, role, `data-state`, event, fixed/sticky positioning, width và class layout. Dùng root của bề mặt glasscn làm host phù hợp; chuyển content class riêng để không vô tình áp `flex-col`, gap và padding của base Card lên mọi call site. Các props quang học WebsiteGlass cũ được bỏ tại call site hoặc chuyển sang prop tương đương có chủ đích, không rò xuống DOM.
- Dialog/Sheet: root mà Radix `Content asChild` nhận ref phải chính là host giữ vị trí, kích thước và focus contract. Nội dung kính không tạo thêm một semantic dialog hoặc lớp clipping cắt focus. Native dialog giữ host và behavior riêng, phần nội dung dùng bề mặt mới.
- Icon, badge và điều khiển theme: dùng component glasscn tương ứng hoặc adapter nhỏ từ primitive/source của thư viện. Giữ nút/switch thật và nhãn truy cập; icon trang trí không tự thành button hoặc tab stop.

Lớp quang học và SVG trang trí không nhận con trỏ hoặc focus. Điều chỉnh nhỏ trên source registry để bảo toàn root/ref được ghi trong tài liệu. Lựa chọn này tránh một đợt đổi API toàn ứng dụng và tránh đổi hệ quản lý focus chỉ để thay vật liệu.

### 3. Dùng `data-theme` làm nguồn duy nhất và ánh xạ token đầy đủ

Định nghĩa custom variant Tailwind `dark` theo `data-theme="dark"` tại root và descendants. Giữ nguồn theme hiện tại thay vì bổ sung một state `.dark` thứ hai phải đồng bộ ở cả script trước paint và provider.

Ánh xạ token nền/chữ/card/primary/secondary/muted/accent/destructive/border/input/ring cùng radius của primitive sang các CSS variable ứng dụng trong từng kết hợp sáng/tối và xanh lá/navy. Các lớp `text-foreground`, `bg-card`, `ring-ring` phải có giá trị thực. Giữ `--glass-panel`, `--glass-fallback`, `--glass-border` như alias được quản lý bởi cùng hệ token để biểu đồ cập nhật cùng lần đổi theme.

Giữ khóa lưu và thứ tự ưu tiên lựa chọn đã có, Circular Reveal và cơ chế reduced motion. Kiểm tra script khởi tạo cùng provider cho kết quả giống nhau trước/sau hydration. Không remount thành phần nghiệp vụ theo theme. Giữ nền trang tĩnh từ token hiện có; tinh chỉnh kính dựa trên nền đó thay vì giả định đang có gradient hoặc yêu cầu thêm hình nền.

Đã cân nhắc giữ nguyên `dark:` theo media query mặc định nhưng điều đó bỏ qua lựa chọn thủ công của người dùng, nên không dùng.

### 4. Áp dụng variant theo vai trò, một lớp khúc xạ cho mỗi bề mặt

| Vai trò | Component hoặc adapter | Chính sách vật liệu |
| --- | --- | --- |
| Header, vùng hành động chính nổi bật | Header/Card/Surface từ glasscn | `liquid-refract` ở số lượng nhỏ; fallback của thư viện khi không hỗ trợ |
| Thẻ chính, thống kê, cảm ơn, nhóm nội dung | Glass Card | `liquid` mặc định; tăng độ phủ theo token khi cần tương phản |
| Nút và ô nhập | Glass Button/Input, FormInput | `liquid` hoặc `clear` theo cấp hành động; không khúc xạ SVG riêng cho mọi nút |
| Danh sách ứng viên, hàng kết quả, vị trí phiếu | Glass Item/Card | `subtle` hoặc `frosted` theo mật độ; trạng thái chọn rõ bằng icon/nhãn/màu |
| Badge, icon, chọn palette và switch | Glass Badge/Icon hoặc adapter semantic | `clear`/`subtle`, phản quang tiết chế và vùng thao tác đủ lớn |
| Dialog, drawer và thông báo nổi | Host hành vi hiện tại + Glass Card | `frosted`/`liquid` với nền đủ đọc; không khúc xạ nhiều lớp qua nội dung phía sau |
| Kết quả ECharts | Glass Card và token chart | Kính ở container/điều khiển; canvas, số liệu và thanh biểu đồ đọc rõ theo token |

Các tên variant và sự khác nhau giữa `liquid` CSS và `liquid-refract` SVG được mô tả ở [tài liệu chính thức](https://github.com/kostyniuk/glasscn-components#liquid-variants). Bề mặt kính là đặc trưng chung; việc dùng thư viện không đồng nghĩa bật displacement trên mọi phần tử lặp lại. Không chồng engine mới lên kính cũ để giữ CSS trước đây.

### 5. Chuyển theo inventory đầy đủ, giữ luồng đang chạy

| Khu vực | Bề mặt cần chuyển |
| --- | --- |
| `/vote`, `ballot-builder`, `election-closed-notice` | Header, badge, lỗi/chờ/đóng kỳ, danh sách ứng viên, lựa chọn, vị trí phiếu, vùng hành động, xem phiếu và xác nhận gửi |
| `/admin` | Card đăng nhập, PIN, icon, lỗi, nút gửi và điều khiển theme |
| `/import-file`, `import-roster`, Sheet | Header, tải file/mẫu, vùng nhận file, trạng thái, danh sách chờ/đã xóa, xóa/khôi phục, xác nhận bắt đầu |
| `/dashboard`, `dashboard`, `dashboard-results-chart` | Header, thống kê, trạng thái trực tiếp, ranking, tooltip, chế độ biểu đồ, hành động và xác nhận reset |
| `/thanks` | Thẻ ghi nhận, icon và điều khiển theme |

`/` chỉ redirect tới `/vote`. Dùng bảng này làm checklist nghiệm thu kể cả loading/empty/error state. Di chuyển import dùng engine cũ còn nằm trực tiếp trong các feature component, không chỉ các adapter chung.

Các sự kiện chọn/xóa/xác nhận phiếu, khôi phục danh sách, xác thực, reset và đăng ký realtime tiếp tục gọi handler hiện tại. Các liên kết vẫn là liên kết; không biến toàn bộ nội dung thành nút vì Glass Icon có thể mặc định render button.

### 6. Giữ fallback và kiểm tra đúng hành vi hiện tại

Dùng fallback từ source glasscn cho trình duyệt thiếu SVG backdrop, đồng thời thêm style dự phòng theo token khi không có backdrop-filter. Với `prefers-reduced-transparency`, tắt quang học trang trí và tăng độ đục trên cả bề mặt thường lẫn portal. Với reduced motion, tắt ambient drift và animation kính; không animate kích thước làm tái sinh displacement map liên tục.

Kiểm tra bằng production build/typecheck và các browser flow có giá trị: PIN qua Enter; chọn/xóa phiếu, mở/hủy/xác nhận gửi; xóa/khôi phục roster, bắt đầu/hủy; reset/hủy; Escape và trả focus. Cập nhật e2e lỗi thời theo UI chạm chọn và bước xác nhận đang tồn tại, không sửa nghiệp vụ để khớp test kéo thả cũ.

Ma trận hiển thị gồm 375, 768 và 1440 CSS px, điện thoại xoay ngang; bốn kết hợp theme/palette; portal đang mở; reduced motion/transparency; Chromium và ít nhất một browser có fallback không dùng SVG backdrop. Ghi bằng chứng ảnh và kết quả quan sát theo trạng thái, không dùng ảnh tĩnh thay cho kiểm tra tương tác.

## Risks / Trade-offs

- [Wrapper mới đổi root/layout hoặc cắt focus] → Hợp đồng root/ref tường minh trong adapter; kiểm tra asChild, vị trí sheet/dialog, nút trong form và các class flex/grid ở call site.
- [Kính trong giảm độ đọc hoặc viền trắng quá nổi] → Điều chỉnh token theo bốn kết hợp và nền tổng hợp thực tế; tăng nền cho nội dung dày, giữ viền mảnh và đo ngưỡng tương phản trong spec.
- [SVG displacement tạo nhiều observer/map và tốn GPU] → Hạn chế vào header/vùng nổi bật, dùng CSS variant cho phần tử lặp, không animate kích thước hoặc tái tạo nguồn kính theo theme.
- [Source registry khác bản cục bộ hoặc mang dependency thiếu] → Đối chiếu nguồn chính thức, pin lockfile, kiểm tra import graph và ghi adaptation; không coi folder đã có là migration hoàn tất.
- [Hai engine còn tồn tại hoặc kính cũ bị lồng ngầm] → Rà cả source, import và CSS, đặc biệt Scrim Card; gỡ engine cũ sau khi chuyển hết call site.
- [Baseline OpenSpec chưa đồng bộ] → `openspec list --specs` hiện rỗng; dùng lại `liquid-glass-ui` với requirement mới, giữ `appearance-theme` làm baseline tương thích. Design này thay quyết định WebsiteGlass/dependency của change cũ. Trước archive cần ghép baseline `liquid-glass-theme` rồi delta này và rà trùng requirement; không tự archive/sync trong apply.

## Migration Plan

1. Đối chiếu/cố định source registry và dependency, chuẩn bị neutral primitive, adapter và theme bridge.
2. Chuyển shared component rồi các feature theo inventory; có thể kiểm tra từng khu vực nhưng kết quả bàn giao phải phủ đủ năm route.
3. Chuyển CSS/chart token và fallback, gỡ mọi runtime import engine cũ, cập nhật tài liệu nguồn và bộ e2e liên quan.
4. Chạy build/typecheck, các flow hồi quy cần thiết và ma trận trình bày; xử lý mọi lỗi hydration, focus, tràn màn hình, tương phản hoặc vùng bấm.
5. Bàn giao source và bằng chứng kiểm tra cùng nhau. Không có migration dữ liệu hoặc thay đổi cách triển khai server.

Rollback bằng việc hoàn nguyên cùng tập thay đổi UI, dependency/lockfile và tài liệu. Không giữ renderer WebsiteGlass như một chế độ chạy phụ hoặc feature flag sau migration; state đã lưu và dữ liệu nghiệp vụ không cần chuyển đổi.
