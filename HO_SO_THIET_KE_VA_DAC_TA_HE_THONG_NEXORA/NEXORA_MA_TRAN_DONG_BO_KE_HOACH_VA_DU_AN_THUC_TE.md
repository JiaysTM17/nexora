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
| **21** | **Mã PIN Bảo Mật Giao Nhận An Ninh (FUL-VERIF-05)** | Module 04 | Đã hoàn thiện | Mã PIN 6 chữ số sinh an toàn theo từng đơn hàng/shop, bảo vệ người mua khỏi mạo nhận shipper và đối soát ký nhận chính chủ tại `/don-hang/[id]` |
| **22** | **Quy Trình Đồng Kiểm Ngoại Quan (RET-COINSPECT)** | Module 05 | Đã hoàn thiện | Khung hướng dẫn đồng kiểm ngoại quan trực tiếp giữa shipper và khách hàng (kiểm tra bao bì, niêm phong, số lượng trước khi nhận COD) |
| **23** | **Tiến Trình Đơn Hàng Đa Chặng (Visual Order Stepper)**| Module 04 | Đã hoàn thiện | Thanh hiển thị 4 nấc tiến trình trực quan (`Tiếp nhận` → `Đóng gói` → `Vận chuyển` → `Đã giao`) trên từng đơn hàng của shop |
| **24** | **Trọng Tài Sàn Xử Lý Tranh Chấp Đa Phương (RET-DISPUTE)**| Module 05 | Đã hoàn thiện | Cơ chế leo thang khiếu nại lên Ban Quản Trị Sàn SLA 48h khi shop từ chối đổi trả; API `POST /returns/:id/dispute`, `POST /admin/disputes/:id/arbitrate`, tự động phong tỏa ví shop và cưỡng chế hoàn tiền |
| **25** | **Hoàn Tiền Không Cần Trả Hàng (RET-RETURNLESS)** | Module 05 | Đã hoàn thiện | Thuật toán hoàn tiền lập tức không bắt buộc gửi trả kiện hàng vật lý đối với sự cố rõ ràng hoặc hàng lỗi, tối ưu chi phí logistics ngược |
| **26** | **Phiên Giờ Vàng Flash Sale & Đếm Ngược (CART-FLASH-03)**| Module 03 | Đã hoàn thiện | Banner Flash Sale độc quyền trang chủ kèm đồng hồ đếm ngược thời gian thực (Countdown Timer), cơ chế phân lập kho và khóa giữ giá 15 phút chống race-condition |
| **27** | **Mua Trước Trả Sau NEXORA PayLater (PAY-BNPL-MIDFLOW-05)**| Module 03 | Đã hoàn thiện | Tùy chọn thanh toán trả góp 0% lãi suất chia 3 kỳ linh hoạt tại Checkout Giỏ hàng và bảng theo dõi tiến độ thanh toán kỳ hạn tại `/don-hang/[id]` |
| **28** | **Sàn Diễn Trực Tiếp & Chốt Đơn 1-Chạm (SOC-LIVE-01)** | Module 06 | Đã hoàn thiện | Phòng Live Shopping chuyên nghiệp tại `/live`: Trình phát Runway Stage mô phỏng, Deal ghim giảm 35% có đồng hồ đếm ngược & thanh tồn kho, chốt đơn 1-chạm không gián đoạn luồng xem, phòng chat tương tác thời gian thực & hiệu ứng thả tim bay sinh động |
| **29** | **Cầu Dao Ngắt Mạch Khẩn Cấp Giá Flash (SOC-PRICE-ERROR)** | Module 06 | Đã hoàn thiện | Cầu dao khẩn cấp (Emergency Circuit Breaker Kill Switch) tại Cổng Quản trị `/admin` và Kênh Người Bán `/seller`: API `POST /admin/products/:id/circuit-breaker` & `POST /seller/shops/:shopId/products/:id/circuit-breaker`, lập tức khóa gỡ sản phẩm sang `HIDDEN` và ghi nhật ký kiểm toán bất biến khi phát hiện lỗi giá |
| **30** | **Trung Tâm Mẫu Thử KOC & Điểm Tín Nhiệm (SOC-CREATOR-SAMPLE)** | Module 06 | Đã hoàn thiện | Hệ thống cấp bậc Điểm Tín Nhiệm Nhà Sáng Tạo (Creator Trust Score: Kim Cương/Vàng/Bạc 0-100), huy hiệu định danh trên bài đăng OOTD, tab Trung tâm Mẫu thử KOC tại `/cong-dong` hỗ trợ KOC xin mẫu thử miễn phí với cam kết duyệt trong SLA 48h |
| **31** | **Động Cơ Xếp Chồng 5 Tầng Voucher & Xu Thưởng (CART-STACK-COIN)** | Module 03 | Đã hoàn thiện | Thuật toán xếp chồng 5 tầng ưu đãi không suy hao: Voucher Shop + Voucher Sàn/Trade-In + Freeship Xtra (-30.000đ) + PayLater 0% + Cấn trừ Xu thưởng NEXORA Coins (1 xu = 1đ) tại Checkout Giỏ hàng |
| **32** | **Nhật Ký Biến Thiên Cân Nặng Bưu Tá 3 Trạm (FUL-WEIGHT-AUDIT)** | Module 04 | Đã hoàn thiện | Cơ chế kiểm soát biến thiên khối lượng bưu kiện qua 3 trạm (Xuất kho -> Sorting Hub -> Bưu tá giao) với dung sai quang học ΔW ≤ 50g, ngăn chặn tráo hàng và rút ruột kiện hàng tại `/don-hang/[id]` |
| **33** | **Bảo Hiểm Thời Trang NEXORA Care+ (VAS-WARRANTY-EXT)** | Module 03 | Đã hoàn thiện | Gói dịch vụ giá trị gia tăng gia hạn bảo hành và phục hồi form trang phục cao cấp 12 tháng (+150.000đ): trọn đời đường may, thay khóa YKK, 2 lần spa đồ hiệu/năm tại NEXORA Atelier trên `/san-pham/[slug]` |
| **34** | **Bảo Chứng Thu Cũ & SLA Cân Nhắc 14 Ngày (VAS-TRADEIN-REQUOTE)** | Module 05 | Đã hoàn thiện | Chính sách bảo chứng cam kết bảo lưu định giá 14 ngày, hoàn trả tận nhà 0đ nếu kết quả Vòng 2 chênh lệch >10%, niêm phong quang học buồng sáng 1000 Lux tại `/trade-in` |
| **35** | **Phòng Thử Đồ Mix & Match & Ưu Đãi Combo (CAT-MIX-MATCH-01)** | Module 01 & 06 | Đã hoàn thiện | Studio phối đồ 3 tầng (Lớp ngoài + Áo chính + Quần/Váy) trên Style Canvas tại `/phoi-do`, tính toán chỉ số hài hòa tone-sur-tone và áp dụng ưu đãi Combo Style Saver -10% khi mua trọn bộ 1-click |
| **36** | **Khung Giờ Nhận Hàng Hẹn Trước & Đóng Gói Xanh (FUL-GREEN-SLOT-02)** | Module 03 & 04 | Đã hoàn thiện | Tùy chọn 3 khung giờ giao hàng (Sáng/Chiều/Tối ngoài giờ) và đóng gói xanh hộp giấy kraft tự hủy không nilon (Eco Green Box), thưởng ngay +50 Xu NEXORA Coins tại `/gio-hang` và hiển thị trên `/don-hang/[id]` |
| **37** | **Đổi Size Tốc Hành Tận Cửa 24-48h (RET-QUICK-EXCHANGE-01)** | Module 05 | Đã hoàn thiện | Dịch vụ shipper mang trang phục size mới đến đổi trực tiếp và thu hồi size cũ trong cùng 1 lần giao nhận tận nhà tại `/don-hang/[id]`, rút ngắn thời gian đổi size còn 24-48h với 0đ phụ phí ship |
| **38** | **Bảng Xếp Hạng Xu Hướng Thời Trang Tuần (CAT-TRENDING-BOARD-02)** | Module 01 & 06 | Đã hoàn thiện | Radar xu hướng thời trang tính toán Realtime Sales Velocity (+142% Quiet Luxury, +98% Eco Linen, +85% Tone Đất Sartorial) trực quan trên trang chủ, kết nối trực tiếp phòng thử đồ `/phoi-do` |
| **39** | **Hồ Sơ Số Đo Cá Nhân & Gợi Ý Smart Fit (USER-PASSPORT-01)** | Module 01 & 07 | Đã hoàn thiện | Phân hệ Fashion Passport lưu trữ số đo cơ thể cá nhân (Chiều cao, Cân nặng, 3 Vòng, Gu mặc) tại `/tai-khoan`, tự động so khớp và gợi ý size thông minh (Khớp 96%) kèm nút chọn 1-chạm trên trang sản phẩm `/san-pham/[slug]` |
| **40** | **Trung Tâm Thông Báo Đa Kênh Thời Gian Thực (NOTIF-CENTER-02)** | Module 07 | Đã hoàn thiện | Chuông thông báo trực quan trên Header với số lượng tin chưa đọc, cập nhật biến động đơn hàng, thưởng xu sống xanh Eco Box, ưu đãi combo Mix & Match và kích hoạt bảo hành Care+ |

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

### 6. Xác Thực An Ninh Giao Nhận Bằng Mã PIN (FUL-VERIF-05)
- **Mục tiêu**: Ngăn chặn tình trạng shipper tự ý ấn "Đã giao" khi chưa thực tế giao hàng hoặc giao nhầm người nhận đối với các kiện hàng thời trang cao cấp.
- **Cơ chế**: Hệ thống sinh mã PIN bảo mật 6 chữ số độc bản cho từng gói hàng của shop, hiển thị riêng cho người mua trong trang chi tiết đơn hàng `/don-hang/[id]`. Khách hàng cung cấp mã này cho bưu tá khi nhận hàng để hoàn tất việc ký nhận.

### 7. Tiêu Chuẩn Đồng Kiểm Ngoại Quan Khi Giao Nhận (RET-COINSPECT)
- **Mục tiêu**: Tạo sự an tâm tuyệt đối và giảm thiểu tranh chấp hậu mãi về bưu kiện móp méo, rách vỡ hoặc thiếu món.
- **Cơ chế**: Cho phép người mua đồng kiểm ngoại quan cùng bưu tá trước khi ký nhận hoặc thanh toán COD: kiểm tra tình trạng hộp ngoài, tem niêm phong ni-lông và số lượng sản phẩm; nghiêm cấm việc mặc thử đồ hoặc cắt đứt tem mác bảo hành của sản phẩm.

### 8. Cơ Chế Leo Thang Khiếu Nại & Trọng Tài Sàn Phân Xử SLA 48h (RET-DISPUTE)
- **Mục tiêu**: Bảo đảm quyền lợi tối thượng của người mua sắm và tính công bằng cho người bán khi phát sinh bất đồng về đổi size hoặc trả hàng.
- **Cơ chế**: Khi shop từ chối (`REJECTED`) hoặc yêu cầu đổi trả quá hạn phản hồi, người mua có thể bấm nút "Khiếu nại lên Sàn (RET-DISPUTE Trọng tài SLA 48h)". Trạng thái yêu cầu lập tức chuyển sang `DISPUTED`, số tiền hoàn trả tương ứng được tự động đóng băng trong ví ký quỹ của shop (`disputed`). Hội đồng Quản trị Sàn tại Cổng Quản trị `/admin` có thẩm quyền ra phán quyết độc lập: duyệt hoàn tiền cưỡng chế từ ví shop (`DISPUTE_REFUND_DEBIT`) hoặc bác khiếu nại nếu shop chứng minh hàng hóa chuẩn mực.

### 9. Thuật Toán Hoàn Tiền Không Cần Trả Hàng (RET-RETURNLESS)
- **Mục tiêu**: Tối ưu hóa chi phí logistics ngược (Reverse Logistics Cost) đối với các sự cố hư hỏng không thể phục hồi hoặc đơn hàng có giá trị thu hồi thanh lý ròng (Net Salvage Value) nhỏ hơn chi phí vận chuyển thu hồi.
- **Cơ chế**: Shop có thể lựa chọn quyết định "Hoàn tiền không cần trả hàng (RET-RETURNLESS)". Tiền được hoàn lại cho khách hàng ngay lập tức mà không yêu cầu khách phải đóng gói, gửi bưu tá mang hàng về, giúp nâng cao chỉ số NPS và sự hài lòng của khách hàng.

### 10. Động Cơ Flash Sale & Đồng Hồ Đếm Ngược Thời Gian Thực (CART-FLASH-03)
- **Mục tiêu**: Khơi dậy cảm xúc săn đón sản phẩm thời trang thiết kế phiên bản giới hạn, thúc đẩy quyết định mua sắm tức thời với hiệu ứng khan hiếm và ưu đãi giờ vàng.
- **Cơ chế**: Banner Flash Sale tích hợp đồng hồ đếm ngược thời gian thực (Countdown Timer) sống động trên trang chủ. Tách biệt vùng tồn kho Flash Sale độc lập, áp dụng cơ chế khóa giá động và giữ giỏ hàng trong 15 phút. Nếu khách không thanh toán trước khi hết giờ, hệ thống tự động giải phóng tồn kho về kho chung mà không gây nghẽn database.

### 11. Giải Pháp Mua Trước Trả Sau NEXORA PayLater 0% Lãi Suất (PAY-BNPL-MIDFLOW-05)
- **Mục tiêu**: Nâng cao giá trị giỏ hàng bình quân (AOV) cho các thiết kế thời trang cao cấp và dịch vụ chăm sóc đồ hiệu, mang đến sự linh hoạt tài chính tối đa cho người mua trẻ.
- **Cơ chế**: Tích hợp tùy chọn PayLater tại khâu Checkout Giỏ hàng. Tự động chia nhỏ tổng số tiền thành 3 kỳ trả góp bằng nhau (33.3% - 33.3% - 33.4%) với 0% lãi suất và không phụ phí dịch vụ. Màn hình chi tiết đơn hàng `/don-hang/[id]` hiển thị bảng lịch trình trả góp chi tiết giúp người dùng dễ dàng theo dõi thời hạn của từng kỳ thanh toán.

### 12. Nền Tảng Sàn Diễn Trực Tiếp & Mua Sắm 1-Chạm (SOC-LIVE-01)
- **Mục tiêu**: Kết hợp giải trí sàn diễn thời trang runway sống động với thương mại chuyển đổi cao, mang lại trải nghiệm xem đồ mẫu mặc thực tế và chốt đơn liền mạch.
- **Cơ chế**:
  - Không gian Studio trực tiếp tại `/live` với màn hình trình diễn runway, hiển thị thông số luồng phát Full HD 1080p, đếm lượng người xem trực tuyến theo thời gian thực (1.400+ viewers) và nút thả tim bay động.
  - Khung "Ghim Deal Sốc Đang Live" giảm sâu 35%, thanh đo lượng tồn kho Flash trực tiếp (Stock Meter) và đồng hồ đếm ngược kết thúc ưu đãi.
  - Cơ chế **"Chốt Đơn 1-Chạm Không Rời Live"**: Người xem lựa chọn nhanh size trang phục (S/M/L) và bấm nút chốt đơn lập tức đẩy vào giỏ hàng hoặc xác nhận mà không cần thoát khỏi hoặc gián đoạn luồng video.
  - Khán phòng chat tương tác thời gian thực: Khán giả đặt câu hỏi trực tiếp cho Stylist về chất liệu/phom dáng, hệ thống tự động bắn ticker thông báo đơn hàng thành công ("Khách hàng Minh Anh vừa chốt 1 Áo Blazer Da Ý!").
  - Kệ hàng phiên live: Danh sách trực quan toàn bộ các bộ cánh được người mẫu diện trên sàn diễn, cho phép chuyển đổi sản phẩm ghim 1-click.

### 13. Cầu Dao Ngắt Mạch Khẩn Cấp Chống Sự Cố Lỗi Giá (SOC-PRICE-ERROR Circuit Breaker)
- **Mục tiêu**: Ngăn chặn rủi ro tổn thất tài chính quy mô lớn cho sàn và nhà bán hàng khi phát sinh sai sót kỹ thuật về mức giá flash sale (ví dụ chiết khấu nhầm 95% hoặc gõ nhầm 10.000đ thay vì 1.000.000đ).
- **Cơ chế**:
  - Tích hợp nút kích hoạt khẩn cấp "Ngắt Cầu Dao (Circuit Breaker Kill Switch)" trên cả Cổng Quản trị Sàn `/admin` và Kênh Người Bán `/seller`.
  - API chuyên biệt `POST /api/v1/admin/products/:id/circuit-breaker` và `POST /api/v1/seller/shops/:shopId/products/:id/circuit-breaker`.
  - Khi được kích hoạt, trạng thái sản phẩm chuyển đổi nguyên tử sang `HIDDEN`, gỡ bỏ sản phẩm tức thì khỏi mọi API truy vấn catalog công khai và ngăn chặn các giao dịch thêm giỏ hàng mới.
  - Tự động ghi nhật ký kiểm toán bất biến `AuditLog` với định danh `ADMIN_CIRCUIT_BREAKER_TRIGGER` / `SELLER_CIRCUIT_BREAKER_TRIGGER` lưu vết lý do, người thực hiện và dấu thời gian chính xác.

### 14. Trung Tâm Mẫu Thử KOC & Thang Điểm Tín Nhiệm Nhà Sáng Tạo (SOC-CREATOR-SAMPLE)
- **Mục tiêu**: Chuẩn hóa quy trình hợp tác tiếp thị thời trang giữa các nhà bán hàng và mạng lưới KOC sáng tạo nội dung OOTD, bảo đảm tỷ lệ hoàn thành bài đăng và chất lượng nội dung.
- **Cơ chế**:
  - Thiết lập Thang Bậc Điểm Tín Nhiệm Nhà Sáng Tạo (`Creator Trust Score`: Hạng Kim Cương &ge; 90, Hạng Vàng &ge; 80, Hạng Bạc &ge; 70), gắn huy hiệu định danh uy tín ngay cạnh tên tác giả bài đăng OOTD tại `/cong-dong`.
  - Ra mắt tab "Trung Tâm Mẫu Thử KOC (SOC-CREATOR-SAMPLE)" tại `/cong-dong`: Các Creator đạt điều kiện tín nhiệm có thể duyệt danh mục các trang phục có gắn nhãn "Mẫu thử miễn phí" và gửi yêu cầu xin mẫu thử 1-click.
  - Ràng buộc quy tắc nghiệp vụ: Cam kết SLA người bán phản hồi duyệt hoặc từ chối trong vòng 48 giờ; KOC có trách nhiệm nộp bài phối đồ OOTD công khai trong thời hạn 14 ngày sau khi nhận mẫu để bảo lưu và tích lũy thêm điểm tín nhiệm (+2 điểm uy tín).

### 15. Động Cơ Xếp Chồng 5 Tầng Voucher & Cấn Trừ Xu Thưởng (CART-STACK-COIN)
- **Mục tiêu**: Tối đa hóa tỷ lệ chuyển đổi giỏ hàng thời trang cao cấp bằng động cơ xếp chồng ưu đãi thông minh, phân bổ số học chính xác đến từng đồng VND và xử lý triệt để phần dư $\Delta = 1$đ không suy hao.
- **Cơ chế**:
  - Tầng 1: Shop Voucher giảm trực tiếp tiền hàng của từng gian hàng.
  - Tầng 2: Voucher Sàn TMĐT / Voucher đối ứng Thu cũ đổi mới Trade-In (`NXTI-...`).
  - Tầng 3: Voucher Miễn phí vận chuyển Freeship Xtra tài trợ giảm 30.000đ cước bưu chính (`_freeship`).
  - Tầng 4: Ưu đãi Trả góp 0% Lãi suất qua giải pháp Mua trước Trả sau NEXORA PayLater.
  - Tầng 5: Xu thưởng NEXORA Coins tích lũy từ hoạt động cộng đồng, cấn trừ trực tiếp 1 xu = 1đ vào tổng thanh toán cuối cùng.
  - Hiển thị bảng bóc tách 5 tầng ưu đãi trực quan tại Checkout Giỏ hàng `/gio-hang`.

### 16. Nhật Ký Biến Thiên Cân Nặng Bưu Tá 3 Trạm (FUL-WEIGHT-AUDIT)
- **Mục tiêu**: Triệt tiêu hoàn toàn vấn nạn tráo hàng, rút ruột hoặc đánh tráo sản phẩm giá trị cao trong quá trình luân chuyển qua các trung tâm phân loại bưu chính 3PL.
- **Cơ chế**:
  - Tự động ghi vết và so khớp trọng lượng kiện hàng qua 3 trạm bưu tá:
    1. Trạm 1: Bưu cục tiếp nhận xuất kho ban đầu của Shop ($W_1$).
    2. Trạm 2: Cân tự động tại Trung tâm phân loại Sorting Hub trung chuyển ($W_2$).
    3. Trạm 3: Cân đối soát cầm tay của bưu tá giao hàng chặng cuối trước khi bấm mã PIN ($W_3$).
  - Thuật toán kiểm soát dung sai quang học: $\Delta W = |W_1 - W_2| \le 50\text{g}$. Nếu vượt ngưỡng, hệ thống kích hoạt báo động gian lận và tạm giữ tiền hàng để thanh tra.
  - Bảng nhật ký cân nặng 3 trạm hiển thị minh bạch cho khách hàng và tài xế tại Cổng chi tiết đơn hàng `/don-hang/[id]`.

### 17. Bảo Hiểm Thời Trang & Gia Hạn Bảo Hành NEXORA Care+ (VAS-WARRANTY-EXT)
- **Mục tiêu**: Nâng tầm giá trị vòng đời trang phục thiết kế, giải tỏa nỗi lo phai màu, sờn chỉ hay biến dạng form dáng sau khi giặt là đối với các sản phẩm may mặc cao cấp.
- **Cơ chế**:
  - Tích hợp khối tùy chọn Dịch vụ Giá trị Gia tăng (VAS) "NEXORA Care+ 12 Tháng (+150.000đ)" ngay trên màn hình chi tiết sản phẩm `/san-pham/[slug]`.
  - Quyền lợi toàn diện: Bảo hành đường may trọn đời, phục hồi form dáng sau giặt, thay thế phụ kiện/khóa kéo YKK chính hãng miễn phí.
  - Tặng kèm 02 lần dịch vụ Giặt hấp Spa đồ hiệu chuyên sâu tại NEXORA Atelier.
  - Tự động đóng gói kèm dòng sản phẩm vào giỏ hàng và cập nhật thông báo giỏ hàng tương ứng.

### 18. Chính Sách Bảo Chứng Thu Cũ & Quyền Cân Nhắc 14 Ngày (VAS-TRADEIN-REQUOTE)
- **Mục tiêu**: Loại bỏ triệt để rào cản e ngại của khách hàng khi tham gia chương trình Thời trang Tuần hoàn (Circular Fashion) khi lo sợ sản phẩm gửi đi bị ép giá hoặc tổn hại.
- **Cơ chế**:
  - Cam kết bảo lưu giá trị định giá sơ bộ Vòng 1 trong thời hạn 14 ngày kể từ ngày duyệt AI.
  - Quyền cân nhắc 14 ngày vô điều kiện: Sau khi có kết quả giám định Vòng 2 tại Hub, khách hàng có 14 ngày để chấp thuận nhận Voucher đối ứng hoặc hủy yêu cầu.
  - Bảo hiểm hoàn trả 0đ tận cửa: Nếu mức định giá Vòng 2 chênh lệch trên 10% so với Vòng 1, NEXORA chịu 100% chi phí chuyển phát hoàn trả 2 chiều.
  - Quy trình niêm phong quang học Tamper-Evident: Video unboxing 4K tại buồng sáng chuẩn 1000 Lux và đóng tem niêm phong bảo mật trước khi hoàn trả lại trang phục.

### 19. Phòng Thử Đồ Mix & Match & Ưu Đãi Mua Trọn Set (CAT-MIX-MATCH-01)
- **Mục tiêu**: Nâng cao chỉ số AOV (Average Order Value) và truyền cảm hứng phối đồ thời trang sáng tạo, giải quyết câu hỏi "Mặc gì hôm nay?" của người tiêu dùng.
- **Cơ chế**:
  - Phân hệ Studio tương tác tại tuyến `/phoi-do`: Khách hàng tự do chọn các lớp trang phục gồm Áo chính (Tops), Quần/Chân váy (Bottoms) và Lớp ngoài (Outerwear).
  - Khung Style Canvas thị giác magazine: Xếp chồng trực quan các sản phẩm thực tế, tự động tính toán Điểm Hài Hòa Tone-sur-Tone (98/100).
  - Thuật toán chiết khấu Combo Style Saver: Giảm ngay **10%** tổng giá trị khi mua trọn bộ cả set đồ.
  - Chức năng 1-Click: Thêm tuần tự tất cả các món đồ vào giỏ hàng chỉ bằng một nút bấm duy nhất.

### 20. Khung Giờ Giao Hàng Hẹn Trước & Đóng Gói Xanh Eco Box (FUL-GREEN-SLOT-02)
- **Mục tiêu**: Cá nhân hóa dịch vụ giao vận chặng cuối cho khách hàng bận rộn và tiên phong thực hành thương mại điện tử xanh, giảm thiểu rác thải nhựa nilon.
- **Cơ chế**:
  - Tùy chọn 3 khung giờ nhận hàng chính xác tại Checkout `/gio-hang`: Buổi sáng (08:00 - 12:00), Buổi chiều (13:30 - 17:30) hoặc Buổi tối (18:00 - 21:00 ngoài giờ hành chính).
  - Tùy chọn Đóng gói Xanh Eco Green Box: Sử dụng 100% hộp giấy kraft tổ ong tự phân hủy sinh học, loại bỏ hoàn toàn màng nilon bọc ngoài.
  - Tặng thưởng xanh: Cộng ngay **+50 Xu NEXORA Coins** vào ví người dùng khi chọn đóng gói xanh.
  - Đồng bộ hiển thị: Khung giờ hẹn và huy hiệu Eco Box được lưu vết vĩnh viễn trên vận đơn và màn hình chi tiết đơn hàng `/don-hang/[id]`.

### 21. Đổi Size Tốc Hành Tận Cửa 24-48h (RET-QUICK-EXCHANGE-01)
- **Mục tiêu**: Giải quyết rào cản lớn nhất của mua sắm thời trang trực tuyến là kích thước không vừa vặn, biến trải nghiệm hậu mãi thành lợi thế cạnh tranh vượt trội.
- **Cơ chế**:
  - Khách hàng lựa chọn hình thức `DOORSTEP_EXCHANGE` trên màn hình chi tiết đơn hàng `/don-hang/[id]`.
  - Thay vì phải đóng gói gửi hoàn kho rồi mới chờ giao áo mới (7-10 ngày), bưu tá giao hàng mang trực tiếp áo size mới đến tận cửa nhà khách hàng trong vòng 24–48 giờ.
  - Khách hàng kiểm tra đối chứng sản phẩm mới và giao lại sản phẩm ban đầu cho bưu tá trong cùng một lần gặp mặt duy nhất với chi phí vận chuyển hoàn trả 0đ.
  - API nghiệp vụ hỗ trợ ghi nhận và điều phối trực tiếp qua `POST /returns` và `POST /orders/shops/:id/returns`.

### 22. Bảng Xếp Hạng Xu Hướng Thời Trang Tuần Realtime (CAT-TRENDING-BOARD-02)
- **Mục tiêu**: Định hướng phong cách mua sắm cho khách hàng dựa trên dữ liệu tiêu dùng thực tế và tốc độ tăng trưởng doanh số (Sales Velocity).
- **Cơ chế**:
  - Khung Radar Xu Hướng nổi bật ngay trên trang chủ, phân tích và xếp hạng 3 xu hướng dẫn đầu:
    1. *Top 1*: Quiet Luxury & Phom Rộng Phóng Khoáng (+142% tăng trưởng).
    2. *Top 2*: Chất Liệu Tự Nhiên & Dệt Thô Mộc Premium Linen (+98% tăng trưởng).
    3. *Top 3*: Gam Màu Đất & Phong Cách Sartorial Sang Trọng (+85% tăng trưởng).
  - Tích hợp liên kết chuyển tiếp 1-click vào Phòng Thử Đồ Mix & Match `/phoi-do` để trải nghiệm trực quan cách phối đồ của xu hướng thịnh hành.

### 23. Hồ Sơ Số Đo Cá Nhân & Gợi Ý Smart Fit (USER-PASSPORT-01)
- **Mục tiêu**: Loại bỏ triệt để rủi ro chọn sai kích cỡ trang phục, nâng cao tỷ lệ hài lòng và giảm tỷ lệ hoàn trả hàng (Return Rate) trong ngành may mặc.
- **Cơ chế**:
  - Phân hệ Fashion Passport tích hợp tại Cổng tài khoản cá nhân `/tai-khoan`, cho phép người dùng lưu trữ 6 thông số: Chiều cao, Cân nặng, Vòng 1 (Ngực), Vòng 2 (Eo), Vòng 3 (Mông) và Gu mặc ưu tiên (Vừa vặn, Rộng rãi, Ôm dáng).
  - Thuật toán Smart Fit Matching: Tự động tính toán và đối chiếu số đo cơ thể với bảng size (SizeChart) của từng sản phẩm khi duyệt trang chi tiết `/san-pham/[slug]`.
  - Hiển thị huy hiệu trực quan: "Gợi ý Smart Fit: Size M (Khớp 96% theo số đo Fashion Passport của bạn)" kèm nút bấm 1-chạm chọn ngay size phù hợp.

### 24. Trung Tâm Thông Báo Đa Kênh Thời Gian Thực (NOTIF-CENTER-02)
- **Mục tiêu**: Tối ưu hóa tính tương tác và giữ chân khách hàng (Retention), cập nhật trạng thái đơn hàng và các quyền lợi thành viên kịp thời.
- **Cơ chế**:
  - Biểu tượng Chuông Thông Báo (Notification Bell) tích hợp trên thanh Header chính, hiển thị số lượng tin mới chưa đọc.
  - Ngăn thông báo đa kênh hiển thị các luồng tin nổi bật:
    1. *Cập nhật vận đơn*: Trạng thái đóng gói kiểm định cân nặng 3 trạm và mã PIN giao nhận.
    2. *Thưởng Xu Xanh*: Thông báo cộng +50 Xu NEXORA Coins từ đóng gói hộp giấy tự hủy Eco Box.
    3. *Ưu đãi Combo*: Thông báo chiết khấu 10% tại Phòng thử đồ Mix & Match `/phoi-do`.
    4. *Bảo hiểm Care+*: Kích hoạt chính sách bảo hành thời trang 12 tháng tại NEXORA Atelier.

---

## III. KẾT LUẬN & CAM KẾT ĐỒNG BỘ
Toàn bộ mã nguồn trên nhánh `main` của kho lưu trữ GitHub (`https://github.com/JiaysTM17/nexora.git`) và hồ sơ tài liệu đặc tả nghiệp vụ đã đạt trạng thái **đồng nhất hoàn toàn**. Mọi cập nhật tính năng trong tương lai sẽ tiếp tục tuân thủ nghiêm ngặt quy trình tài liệu hóa song hành này.
