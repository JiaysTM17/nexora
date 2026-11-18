# PHỤ LỤC BỔ SUNG: MA TRẬN ĐỒNG BỘ KẾ HOẠCH & DỰ ÁN THỰC TẾ
## HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ THỜI TRANG & PHỐI ĐỒ NEXORA

Phụ lục này ghi nhận và chuẩn hóa toàn bộ các tính năng được bổ sung trong quá trình hiện thực hóa dự án trên mã nguồn, bảo đảm sự khớp nối 100% không sai lệch giữa Hồ sơ Kế hoạch Tổng thể và Hệ thống Ứng dụng Thực tế.

---

### Bảng Đối Chiếu Tính Năng Phát Triển Thực Tế & Hồ Sơ Nghiệp Vụ:

1. **Bộ Nhận Diện Thương Hiệu (Brand Identity & Logo SVG)**:
   - Hồ sơ: Logo biểu tượng Nexus 'X' đa sắc và chữ thương hiệu NEXORA.
   - Thực tế: File `apps/web/public/nexora-logo.svg` và `nexora-icon.svg` đã được chuẩn hóa với nền trong suốt (loại bỏ phông nền trắng vuông), bảo toàn các mã màu gradient thương hiệu (`#4F46E5`, `#06B6D4`, `#3B82F6`, `#6366F1`) để tương thích tối đa với giao diện tone màu giấy ngà sang trọng của sàn.

2. **Hệ Thống Wishlist (Danh Sách Yêu Thích)**:
   - Hồ sơ bổ sung: Mục 1.4 Đặc tả Catalog & Trải nghiệm Mua sắm.
   - Thực tế: Bảng dữ liệu `Wishlist` (quan hệ 1-N giữa `User` và `Product`), API kiểm tra và toggle trạng thái yêu thích, giao diện trái tim tại chi tiết sản phẩm và danh mục lưu trữ tại trang cá nhân `/tai-khoan`.

3. **Huy Hiệu Gian Hàng Chính Hãng NEXORA Mall**:
   - Hồ sơ bổ sung: Tiêu chuẩn phân hạng người bán & Chính sách bảo đảm nguồn gốc.
   - Thực tế: Cột `isMall` trong bảng `Shop`, chức năng phê duyệt cấp/gỡ huy hiệu Mall tại Cổng Quản trị Admin, nhãn hiển thị trực quan `MALL` trên thẻ sản phẩm và trang chi tiết, bộ lọc sản phẩm Mall tại `/` và `/tim-kiem`.

4. **Tuân Thủ Pháp Lý & Báo Cáo Thuế Định Kỳ (Nghị Định 91/2022/NĐ-CP & Thông Tư 40/2021/TT-BTC)**:
   - Hồ sơ: Module 07 và Báo cáo Đánh giá Chuyên sâu 32 chuyên đề.
   - Thực tế: Endpoint `GET /api/v1/admin/tax-report` tự động tổng hợp doanh thu đơn hoàn tất, đối chiếu mã số thuế từng gian hàng, trích xuất nghĩa vụ thuế khấu trừ tại nguồn (1% GTGT + 0.5% TNCN) và hỗ trợ tải gói dữ liệu chuẩn Etax JSON.

5. **Chính Sách Hình Ảnh Thực Tế & Bản Quyền Minh Bạch (Anti-AI Photography)**:
   - Hồ sơ bổ sung: Quy chuẩn thẩm mỹ thị giác và đạo đức bản quyền TMĐT.
   - Thực tế: Toàn bộ ảnh sản phẩm được số hóa từ các mẫu thời trang thật 100% (Uniqlo, Zara, Mango, Massimo Dutti, Coolmate), có khung trích dẫn đường link đối chiếu nguồn gốc rõ ràng, tích hợp cơ chế tự phục hồi ảnh (fallback) khi mất kết nối mạng.

6. **Mặt Nạ Bảo Mật Vận Đơn (PDPD Masking - Nghị Định 13/2023/NĐ-CP)**:
   - Hồ sơ bổ sung: Bảo vệ thông tin người dùng và quyền riêng tư dữ liệu cá nhân.
   - Thực tế: Tự động mã hóa 4 số giữa của số điện thoại nhận hàng (`090****567`) trên vận đơn và màn hình chi tiết đơn hàng, kèm nút bật/tắt hiển thị có chủ quyền của người dùng.

7. **Hóa Đơn Điện Tử VAT Kép (Thông Tư 78/2021/TT-BTC)**:
   - Hồ sơ bổ sung: Kế toán tài chính & Chứng từ mua hàng.
   - Thực tế: Khung hiển thị chi tiết hóa đơn điện tử VAT khởi tạo từ máy tính tiền kết nối dữ liệu Cơ quan Thuế, phân tách thuế suất 8% và tiền hàng trước thuế trên màn hình theo dõi đơn hàng `/don-hang/[id]`.

8. **Mã PIN Giao Nhận An Ninh Đơn Hàng Cao Cấp (FUL-VERIF-05)**:
   - Hồ sơ: Module 04 Vận chuyển & Giao nhận.
   - Thực tế: Mã PIN bảo mật 6 số độc bản sinh riêng cho từng đơn hàng của shop, hiển thị trên trang `/don-hang/[id]` để người mua đọc cho shipper đối soát lúc giao nhận, chống giao nhầm hoặc mạo danh.

9. **Tiêu Chuẩn Đồng Kiểm Ngoại Quan Khi Nhận Kiện Hàng (RET-COINSPECT)**:
   - Hồ sơ: Module 05 Hậu mãi & Đổi trả.
   - Thực tế: Tích hợp khung thông tin đồng kiểm ngoại quan trên vận đơn chi tiết, cho phép khách hàng kiểm tra tình trạng hộp niêm phong và số lượng sản phẩm cùng shipper trước khi nhận hàng.

10. **Tiến Trình Vận Chuyển Đa Chặng (Visual Order Stepper)**:
   - Hồ sơ: Module 04 Vận chuyển & Theo dõi.
   - Thực tế: Thanh hiển thị 4 giai đoạn xử lý đơn hàng trực quan (`Tiếp nhận` → `Đóng gói` → `Vận chuyển` → `Đã giao`) trên từng đơn của shop.
