# HỒ SƠ ĐỒNG BỘ TOÀN DIỆN KẾ HOẠCH & DỰ ÁN THỰC TẾ
## NEXORA FASHION COMMERCE & SOCIAL LIFESTYLE PLATFORM

> **Quy tắc bất biến**: *"Bản kế hoạch có gì thì dự án thực tế có đó; tính năng nào dự án bổ sung thêm thì phải được cập nhật toàn bộ vào hồ sơ kế hoạch, bảo đảm sự nhất quán 100% hai chiều (Zero Discrepancy)."*

---

## I. TỔNG QUAN MA TRẬN ĐỒNG BỘ 100% (TRACEABILITY MATRIX)

| STT | Phân hệ / Tính năng nghiệp vụ | Tình trạng kế hoạch | Tình trạng dự án thực tế | Vị trí file / API / Database thực tế |
| :---: | :--- | :---: | :---: | :--- |
| **1** | **Nhận diện Thương hiệu & Logo NEXORA** | Master Docx §1 | Đã hoàn thiện | `apps/web/public/nexora-logo.svg`, `nexora-icon.svg` (Nền trong suốt, giữ trọn dải màu gốc `#4F46E5`, `#06B6D4`, `#3B82F6`) |
| **2** | **Catalog Sản phẩm & Biến thể SKU** | Module 01 | Đã hoàn thiện | `apps/api/src/catalog.ts`, `packages/database/prisma/schema.prisma` (`Product`, `ProductVariant`, `InventoryBalance`) |
| **3** | **Bảng Size Chi tiết riêng từng Shop** | Module 01 | Đã hoàn thiện | `ProductSizeChart` (GARMENT/BODY rows), hiển thị bảng đo tại `/san-pham/[slug]` |
| **4** | **Hình ảnh thực tế & Bản quyền (Không dùng AI)** | *Bổ sung chuẩn hóa* | Đã hoàn thiện | Ảnh thời trang chụp thực tế 100% (Uniqlo, Zara, Mango, Massimo Dutti, Coolmate) kèm hộp trích dẫn nguồn đối chiếu minh bạch |
| **5** | **Hệ thống Danh sách Yêu thích (Wishlist)** | *Bổ sung trải nghiệm* | Đã hoàn thiện | Migration `202611170001_wishlist`, API `GET /wishlist`, `POST /wishlist/:id`, nút tim tại chi tiết & mục đã lưu `/tai-khoan` |
| **6** | **Huy hiệu Gian hàng Chính hãng (NEXORA Mall)** | *Bổ sung cao cấp* | Đã hoàn thiện | Migration `202611170002_shop_tax_mall` (`shop.isMall`), bộ lọc Mall tại trang chủ & tìm kiếm, huy hiệu `MALL` trên thẻ sản phẩm |
| **7** | **Bộ lọc Đa tiêu chí (Multi-Facet Filters)** | Module 01 | Đã hoàn thiện | Lọc theo danh mục, từ khóa, màu sắc, kích cỡ, khoảng giá (`under-1m`, `1m-2m`, `over-2m`), trạng thái còn hàng, chuẩn Mall tại `/tim-kiem` |
| **8** | **Mạng xã hội OOTD & Tag Tọa độ Sản phẩm** | Module 06 | Đã hoàn thiện | `apps/api/src/community.ts`, `Post`, `PostMedia`, `PostTag` (tọa độ x,y), xem chi tiết & tương tác Like/Save/Comment/Report |
| **9** | **Mua trọn bộ phối sẵn (Shop the Look)** | Module 06 | Đã hoàn thiện | Nút `Mua trọn bộ (Shop the Look)` tại `/cong-dong` tự động gom toàn bộ các món trong set vào giỏ hàng chỉ với 1 click |
| **10** | **Tiếp thị Liên kết KOC (Affiliate 15-day Hold)** | Module 06 | Đã hoàn thiện | Thuật toán Last-Click KOC link (`/?ref=userId`), hoa hồng 5%, cơ chế ký quỹ tạm giữ 15 ngày phòng hủy/hoàn đơn, API giải phóng hoa hồng |
| **11** | **Thu cũ Đổi mới (Trade-In Re-Loved 2 Vòng)** | Module 02 | Đã hoàn thiện | Vòng 1 AI Vision định giá sơ bộ, Vòng 2 chuyên viên Hub kiểm định vật lý, phân hạng 5 cấp S/A/B/C/D, cấp Voucher đối ứng tự động |
| **12** | **Chăm sóc Đồ hiệu (VAS Luxury Care)** | Module 02 | Đã hoàn thiện | Quy trình giao nhận White-glove, mã niêm phong Zip-seal tamper-evident, biên bản quang học 8 góc, hạn mức bảo hiểm 100.000.000đ |
| **13** | **Giỏ hàng Đa Shop & Phân tách Đơn con** | Module 03 & 04 | Đã hoàn thiện | Tách đơn hàng cha (`Order`) thành nhiều đơn con (`ShopOrder`), áp dụng mã giảm giá và tính phí giao hàng độc lập cho từng shop |
| **14** | **Báo giá Tạm giữ Kho & Khóa Biến thể Đồng thời** | Module 03 | Đã hoàn thiện | Quote có thời hạn 10 phút, kiểm soát tồn kho 2 tầng tránh bán âm (Optimistic Locking & Inventory Lock) |
| **15** | **Ví Người Bán 3 Tầng & Cơ chế Ký quỹ (Escrow)** | Module 03 & 07 | Đã hoàn thiện | Phân tách 3 số dư: *Khả dụng (Available)*, *Tạm giữ ký quỹ 7 ngày (Held)*, và *Đóng băng tranh chấp (Disputed)* tại `/seller` |
| **16** | **Báo cáo Thuế Sàn TMĐT (Nghị định 91/2022/NĐ-CP)** | *Bổ sung tuân thủ* | Đã hoàn thiện | Cổng cung cấp dữ liệu định kỳ cho Cơ quan Thuế `GET /api/v1/admin/tax-report`, tự động khấu trừ 1% GTGT + 0.5% TNCN theo TT 40/2021/TT-BTC, xuất file Etax JSON |
| **17** | **Mặt nạ Bảo mật Thông tin Cá nhân (PDPD)** | *Bổ sung NĐ 13/2023* | Đã hoàn thiện | Mặt nạ che số điện thoại (`090****567`) và địa chỉ trên vận đơn giao hàng, cho phép người dùng bật/tắt hiển thị có kiểm soát |
| **18** | **Hóa đơn Điện tử e-Invoice (Thông tư 78/2021/TT-BTC)**| *Bổ sung kế toán* | Đã hoàn thiện | Bản thể hiện hóa đơn VAT khởi tạo từ máy tính tiền kết nối dữ liệu Thuế, phân tách thuế suất 8%/10%, lưu trữ 10 năm theo Luật Kế toán |
| **19** | **Đổi Size / Hoàn tiền & Đánh giá Sản phẩm** | Module 05 | Đã hoàn thiện | `ReturnRequest` (Đổi size hoặc Trả hàng hoàn tiền), xếp hạng 1-5 sao kèm nhận xét chân thực từ người mua đã nhận hàng |
| **20** | **Kiểm định Tự động & Vận hành 1-Click** | DevOps & CI/CD | Đã hoàn thiện | Script `start-local.ps1` 1-click khởi động trọn bộ dịch vụ (WSL + Relay + API + Web); 12/12 integration tests pass; CI workflow tự động |

---

## II. CHI TIẾT CÁC TÍNH NĂNG MỚI ĐÃ BỔ SUNG & ĐỒNG BỘ VÀO HỒ SƠ

### 1. Phân hệ Danh sách Sản phẩm Yêu thích (Product Wishlist)
- **Mục tiêu**: Tối ưu hóa phễu chuyển đổi cho khách hàng lưu lại các mẫu trang phục ấn tượng từ Catalog và bài đăng OOTD để cân nhắc mua sắm sau.
- **Thiết kế CSDL**:
  ```prisma
  model Wishlist {
    id        String   @id @default(cuid())
    userId    String
    productId String
    createdAt DateTime @default(now())

    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

    @@unique([userId, productId])
    @@index([userId])
    @@index([productId])
  }
  ```
- **Hành vi Giao diện**: Nút bấm Trái tim (`Heart`) tương tác mượt mà ngay trên trang chi tiết sản phẩm; hiển thị danh sách trực quan tại Cổng thông tin khách hàng `/tai-khoan`.

### 2. Cổng Dữ liệu Thuế Định kỳ (Decree 91/2022/ND-CP Compliance Portal)
- **Mục tiêu**: Đảm bảo NEXORA tuân thủ 100% nghĩa vụ của tổ chức quản lý sàn TMĐT theo Điều 19a Nghị định 91/2022/NĐ-CP và Thông tư 40/2021/TT-BTC.
- **Dữ liệu xuất chuẩn**:
  - Mã số thuế (MST) / Số định danh của từng gian hàng đối tác.
  - Tổng số đơn hàng giao thành công trong kỳ kê khai quý/năm.
  - Tổng doanh thu phát sinh và nghĩa vụ thuế sàn đã khấu trừ tại nguồn (**1% GTGT + 0.5% TNCN = 1.5%**).
  - Trích xuất định dạng JSON tương thích cổng thông tin điện tử của Tổng cục Thuế (Etax).

### 3. Chứng chỉ & Huy hiệu NEXORA Mall
- **Mục tiêu**: Phân hạng các gian hàng thương hiệu chính hãng có pháp nhân kinh doanh minh bạch, bảo đảm nguồn gốc xuất xứ 100%.
- **Chính sách ưu đãi dành cho NEXORA Mall**:
  - Bảo lãnh hàng thật 100%, bồi hoàn 200% nếu phát hiện hàng giả.
  - Miễn phí đổi trả kéo dài lên đến 15 ngày (thay vì 7 ngày của shop tiêu chuẩn).
  - Ưu tiên hiển thị trên Catalog và thanh tìm kiếm với bộ lọc chuyên biệt `isMall=true`.

### 4. Cam kết Bản quyền & Hình ảnh Sản phẩm Thực tế (Anti-AI Photography Policy)
- **Mục tiêu**: Khắc phục nhược điểm của các bản vẽ vector mô phỏng hoặc hình ảnh AI giả tạo, mang lại trải nghiệm thị giác chân thực cho người mua sắm thời trang.
- **Tiêu chuẩn triển khai**:
  - 100% hình ảnh sản phẩm là ảnh chụp đời thực từ người thật, chất vải thật.
  - Tích hợp khung đối chiếu bản quyền: dẫn link tham chiếu nguồn cảm hứng từ các bộ sưu tập chính hãng (Uniqlo, Zara, Mango, Massimo Dutti, Coolmate) để bảo đảm quyền sở hữu trí tuệ và sự trung thực tuyệt đối.
  - Tích hợp cơ chế Fallback chống vỡ khung ảnh đảm bảo website luôn vận hành trơn tru ở mọi điều kiện mạng.

### 5. Bảo vệ Dữ liệu Cá nhân Vận đơn (PDPD Masking - Nghị định 13/2023/NĐ-CP)
- **Mục tiêu**: Bảo mật số điện thoại và địa chỉ người nhận hàng khỏi nguy cơ bị lộ lọt dữ liệu hoặc các cuộc gọi lừa đảo mạo danh shipper.
- **Cơ chế**: Tự động mã hóa mặt nạ 4 số giữa của số điện thoại (`090****567`) khi hiển thị trên phiếu giao hàng công cộng hoặc màn hình theo dõi đơn hàng, chỉ người dùng sở hữu tài khoản mới có quyền mở khóa xem số đầy đủ.

---

## III. KẾT LUẬN & CAM KẾT ĐỒNG BỘ
Toàn bộ mã nguồn trên nhánh `main` của kho lưu trữ GitHub (`https://github.com/JiaysTM17/nexora.git`) và hồ sơ tài liệu đặc tả nghiệp vụ đã đạt trạng thái **đồng nhất hoàn toàn**. Mọi cập nhật tính năng trong tương lai sẽ tiếp tục tuân thủ nghiêm ngặt quy trình tài liệu hóa song hành này.
