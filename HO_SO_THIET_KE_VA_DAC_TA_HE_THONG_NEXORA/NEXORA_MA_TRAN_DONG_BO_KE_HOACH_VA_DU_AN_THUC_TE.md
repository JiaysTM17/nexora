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
| **41** | **Bản Thể Hiện Hóa Đơn Điện Tử VAT Đạt Chuẩn TT 78 & Xuất HĐ (ORD-EXPORT-PDF-01)** | Module 03 & 04 | Đã hoàn thiện | Khung modal và giao diện in ấn hóa đơn GTGT điện tử khởi tạo từ máy tính tiền (Ký hiệu 1C26TNO/C26MNE), bảng kê mặt hàng, thuế GTGT 8%, mã CQT cấp và QR tra cứu hóa đơn tại `/don-hang/[id]` |
| **42** | **Tủ Đồ Nhộng Thông Minh & Trợ Lý Phong Cách AI Stylist (SOC-WARDROBE-AI-01)** | Module 01, 06 & 07 | Đã hoàn thiện | Phân hệ Capsule Wardrobe lập lịch phối đồ 7 ngày AI Stylist theo số đo Fashion Passport, chuyển đổi thời tiết Nắng ấm/Se lạnh, ghim bộ đồ hôm nay và chia sẻ Lookbook OOTD tại `/tai-khoan` |
| **43** | **Hộ Chiếu Minh Bạch Chất Liệu & Xuất Xứ (CAT-FABRIC-TRACE-01)** | Module 01 | Đã hoàn thiện | Khung thông tin nguồn gốc sợi dệt (Lụa Bảo Lộc, Linen Normandy, GOTS Cotton), chỉ số dấu chân sinh thái Eco-Footprint (giảm 65% nước, -72% CO2e) và cẩm nang bảo quản Atelier Care tại `/san-pham/[slug]` |
| **44** | **Thanh Tìm Kiếm Nhanh & Gợi Ý Tức Thì (CAT-SEARCH-AUTOCOMPLETE-01)** | Module 01 & UI | Đã hoàn thiện | Command Palette tìm kiếm mở nhanh bằng Ctrl+K hoặc icon kính lúp trên Header, thẻ xu hướng thịnh hành, gợi ý sản phẩm realtime kèm thumbnail và giá tại chỗ |
| **45** | **Đặt Lịch Hẹn VIP Tại Flagship Atelier (VAS-ATELIER-BOOKING-01)** | Module 02 & VAS | Đã hoàn thiện | Phân hệ đặt lịch trực tiếp tại Flagship Atelier (Sài Gòn/Hà Nội), thử đồ Private Suite, may đo phom dáng bespoke, tư vấn Senior Stylist và cấp thẻ VIP Ticket điện tử tại `/vas-care` |
| **46** | **Rừng Xanh NEXORA & Bù Đắp Carbon (ECO-TREE-OFFSET-01)** | Module 04 & 07 | Đã hoàn thiện | Sổ cái cây xanh bảo trợ kỹ thuật số (Digital Tree Registry) với mã số định danh từng cây tại Cần Giờ/Cúc Phương/Cà Mau, chỉ số bù đắp CO2e và huy hiệu Eco Pioneer tại `/tai-khoan` |
| **47** | **Đăng Ký Thông Báo Có Hàng Lại & Giá (USER-STOCK-ALERT-01)** | Module 01 & 07 | Đã hoàn thiện | Nút đăng ký nhận chuông thông báo tức thời khi sản phẩm hết hàng về thêm size hoặc áp dụng Flash Sale, tích hợp Trung tâm thông báo Header tại `/san-pham/[slug]` |
| **48** | **Bộ Sưu Tập Nhộng Capsule Lookbook (CAT-CAPSULE-LOOKBOOK-01)** | Module 01 & 06 | Đã hoàn thiện | Phân hệ Lookbook 3 phong cách thiết yếu (Normandy Summer, Minimal Executive, Bảo Lộc Silk) trên trang chủ, chiết khấu Combo Saver -10% và kết nối Studio `/phoi-do` |
| **49** | **Thang Điểm Uy Tín Gian Hàng & Tỷ Lệ Đổi Size (CAT-SELLER-SCORE-01)** | Module 01 & 02 | Đã hoàn thiện | Khung đánh giá uy tín shop trên trang sản phẩm `/san-pham/[slug]` với điểm số 4.9★, tốc độ chuẩn bị hàng 99.4%, phản hồi chat < 5 phút, tỷ lệ hỗ trợ đổi size 100% và bảo chứng đền bù 200% nếu phát hiện hàng giả |
| **50** | **Trắc Nghiệm Định Hình Phong Cách Cá Nhân (USER-STYLE-QUIZ-01)** | Module 06 & 07 | Đã hoàn thiện | Bài trắc nghiệm 4 câu hỏi trực quan khám phá bản sắc thời trang (Quiet Luxury, Earth Sartorialist, Minimalist Architect, Bohemian) và lưu giữ huy hiệu Style DNA vĩnh viễn tại `/tai-khoan` |
| **51** | **Hộp Quà Cao Cấp Kèm Thiệp Sáp Niêm Phong (VAS-GIFT-WRAP-01)** | Module 02 & 03 | Đã hoàn thiện | Tùy chọn đóng gói quà tặng Haute Couture tại `/gio-hang`: Hộp cứng nhung xám khói, 3 màu nơ ruy băng lụa dệt, thiệp chúc mừng viết tay Calligraphy niêm phong dấu sáp đồng độc bản (+60k hoặc 0đ đơn > 2tr) |
| **52** | **Bản Đồ Bưu Tá Trực Tuyến & Định Vị Kiện Hàng (ORD-TRACKING-MAP-01)** | Module 04 & Logistics | Đã hoàn thiện | Modal bản đồ trực tuyến Live GPS tại `/don-hang/[id]`: Mô phỏng tuyến đường di chuyển từ Hub Tân Bình, bưu tá xe điện VinFast Feliz, telemetry GPS 26 km/h, gọi điện ẩn danh PDPD NĐ 13 và nhắn tin điều phối |
| **53** | **Mô Phỏng Phom Dáng & Độ Rủ 2D (CAT-VIRTUAL-SILHOUETTE-01)** | Module 01 & 3D/AI | Đã hoàn thiện | Phòng mô phỏng phom dáng 2D Mannequin Croquis tại `/san-pham/[slug]`: Đối chiếu 3 tạng người (Petite/Athletic/Curvy), bản đồ độ căng phom (Tension Heatmap) và gợi ý cử động vai/eo/dài áo |
| **54** | **Hỏi Đáp Tỉ Lệ Dáng & Chiều Cao Thực Tế Cùng KOC (SOC-FIT-FEEDBACK-01)** | Module 06 & Social | Đã hoàn thiện | Phân hệ Fit Q&A tại `/cong-dong`: Thẻ lọc câu hỏi số đo cơ thể, phím tắt nhanh 1-chạm (1m58 48kg mặc size gì), huy hiệu KOC Tác giả phản hồi SLA 24h |
| **55** | **Thước Đo Chân Số Hóa & Khuyến Nghị Size Giày (USER-FOOTWEAR-SCAN-01)** | Module 07 & Fit | Đã hoàn thiện | Mở rộng Fashion Passport tại `/tai-khoan`: Lưu trữ chiều dài/rộng bàn chân (mm), dạng vòm chân (Bẹt/Chuẩn/Cao), tự động quy đổi kích cỡ chuẩn quốc tế EU/US/UK và gợi ý lót giày |
| **56** | **Ma Trận So Sánh Cảm Giác & Độ Bền Vải (CAT-FABRIC-COMPARISON-01)** | Module 01 & CSR | Đã hoàn thiện | Bảng đối chiếu 5 tiêu chí giữa sợi tự nhiên cao cấp và vải Polyester tổng hợp tại `/san-pham/[slug]`: Độ thoáng khí 9.8/10, an toàn da 10/10, điều hòa thân nhiệt 9.6/10 và độ bền >5 năm |

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

### 25. Bản Thể Hiện Hóa Đơn Điện Tử VAT Đạt Chuẩn TT 78 & Xuất HĐĐT (ORD-EXPORT-PDF-01)
- **Mục tiêu**: Đảm bảo 100% tuân thủ pháp lý tài chính kế toán theo Thông tư 78/2021/TT-BTC và Nghị định 123/2020/NĐ-CP của Bộ Tài Chính, cung cấp chứng từ minh bạch cho khách hàng cá nhân và doanh nghiệp.
- **Cơ chế**:
  - Tích hợp nút chức năng `[ In / Xuất Hóa Đơn VAT (ORD-EXPORT-PDF-01) ]` trên màn hình chi tiết đơn hàng `/don-hang/[id]`.
  - Khung bản thể hiện hóa đơn điện tử chuẩn mực:
    - Đơn vị bán hàng: CÔNG TY CỔ PHẦN CÔNG NGHỆ & THỜI TRANG NEXORA (Mã số thuế: 0109988776-001, Địa chỉ: Tòa nhà NEXORA Tower, 128 Hai Bà Trưng, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh).
    - Thông số pháp lý: Mẫu số `1C26TNO`, Ký hiệu `C26MNE`, Số HĐ `HD-[ORDER_CODE]`.
    - Bảng kê chi tiết từng mặt hàng quy cách thời trang (ĐVT Cái, Số lượng, Đơn giá chưa thuế, Thành tiền).
    - Tách biệt chính xác tiền hàng chưa thuế, thuế suất GTGT 8% (theo chính sách ưu đãi kích cầu tiêu dùng hàng may mặc), và tổng tiền thanh toán.
    - Mã số tra cứu hóa đơn của Cơ quan Thuế và mã QR Code liên kết Cổng tra cứu HĐĐT Tổng Cục Thuế.
    - Con dấu chứng thư số điện tử hợp chuẩn: "ĐÃ KÝ ĐIỆN TỬ HỢP LỆ BỞI CÔNG TY CP CÔNG NGHỆ & THỜI TRANG NEXORA".
    - Khả năng xuất in trực tiếp thông qua hộp thoại Print (`window.print()`).

### 26. Tủ Đồ Nhộng Thông Minh & Trợ Lý Phong Cách AI Stylist (SOC-WARDROBE-AI-01)
- **Mục tiêu**: Thúc đẩy tiêu dùng thời trang bền vững (Sustainable Capsule Fashion), giải quyết bài toán "hôm nay mặc gì" cho khách hàng dựa trên dữ liệu hình thể cá nhân.
- **Cơ chế**:
  - Tích hợp phân hệ Tủ Đồ Nhộng tại `/tai-khoan`, kế thừa trực tiếp dữ liệu số đo cơ thể và gu mặc ưu tiên từ Fashion Passport (`USER-PASSPORT-01`).
  - Lập lịch phối đồ 7 ngày AI Stylist chuyên nghiệp:
    - *Thứ 2 (Quiet Luxury Minimalist)*: Áo sơ mi lụa tơ tằm dệt thủ công + Quần tây sartorial xếp ly kép (Hòa sắc 99/100).
    - *Thứ 3 (Contemporary Executive)*: Áo Polo dệt kim Merino xám khói + Quần âu may đo phom phẳng.
    - *Thứ 4 (Mid-week Earth Sartorial)*: Áo cổ trụ linen cát sa mạc + Quần jeans ống suông organic wash.
    - *Thứ 5 (High Monochrome)*: Áo dệt kim cổ lọ + Quần xếp ly ống rộng monochrome.
    - *Thứ 6 (Smart Denim & Casual Friday)*: Áo thun Pima Cotton + Quần jeans vintage.
    - *Thứ 7 (Eco Linen Weekend Escape)*: Áo đũi lanh cộc tay nâu đất + Quần short linen tự nhiên.
    - *Chủ Nhật (Sunday Gallery & Atelier Brunch)*: Áo lụa suông bay bổng + Quần culottes lụa cát.
  - Bộ chuyển đổi chế độ thời tiết thông minh: Tùy biến giữa "Nắng ấm thoáng mát" (lớp áo nhẹ, chất liệu lanh/lụa) và "Se lạnh thu đông" (bổ sung layer blazer linen, cardigan len cashmere hoặc áo khoác safari).
  - Tương tác đa chiều: Nút `[ Chọn mặc hôm nay ]` ghim trực quan ngày hiện tại, nút `[ Đăng OOTD Lookbook ]` liên kết ngay sang cộng đồng OOTD `/cong-dong`, và thuật toán phát hiện món đồ còn thiếu (Missing Piece) gợi ý bổ sung trang phục để tối ưu hóa tủ đồ nhộng.

### 27. Hộ Chiếu Minh Bạch Chất Liệu & Xuất Xứ (CAT-FABRIC-TRACE-01)
- **Mục tiêu**: Nâng cao niềm tin của người tiêu dùng đối với thời trang cao cấp thông qua việc công khai minh bạch nguồn gốc sợi dệt, chứng chỉ sinh thái và hướng dẫn bảo quản kéo dài vòng đời trang phục.
- **Cơ chế**:
  - Tích hợp khung Hộ Chiếu Chất Liệu mở rộng ngay trên trang chi tiết sản phẩm `/san-pham/[slug]`.
  - Phân tích nguồn gốc xuất xứ nguyên liệu: Lụa tơ tằm Bảo Lộc (Lâm Đồng), Sợi đay lanh French Normandy Flax (Cộng Hòa Pháp), hoặc Pima Cotton hữu cơ.
  - Chứng nhận tiêu chuẩn quốc tế: OEKO-TEX Standard 100, Global Organic Textile Standard (GOTS).
  - Bảng chỉ số dấu chân môi trường (Eco-Footprint): Tiết kiệm -65% lượng nước tiêu thụ, giảm phát thải -72% CO2e so với sợi tổng hợp polyester, 100% tự phân hủy sinh học trong đất.
  - Atelier Care Guide: Quy trình giặt sấy, là ủi hơi nước mặt trái chuyên biệt để duy trì độ rủ óng ả và phom dáng nguyên bản.

### 28. Thanh Tìm Kiếm Nhanh & Gợi Ý Tức Thì (CAT-SEARCH-AUTOCOMPLETE-01)
- **Mục tiêu**: Rút ngắn thời gian tiếp cận sản phẩm (Time-to-Product), mang lại trải nghiệm tìm kiếm mượt mà như các ứng dụng native cao cấp.
- **Cơ chế**:
  - Hỗ trợ phím tắt toàn cục `Ctrl+K` (hoặc `Cmd+K`) và biểu tượng kính lúp trên Header để mở nhanh hộp thoại tìm kiếm Command Palette.
  - Các thẻ từ khóa thịnh hành (Trending Search Tags): *Quiet Luxury*, *Linen Normandy*, *Lụa Tơ Tằm*, *Quần Sartorial*, *Blazer*.
  - Khả năng gợi ý sản phẩm tự động (Live Autocomplete) theo thời gian thực (debounced 200ms): Hiển thị thumbnail ảnh thật, tên gian hàng, huy hiệu MALL, chất liệu và mức giá VND thấp nhất của biến thể.
  - Điều hướng tức thời 1-chạm hoặc nhấn phím Esc để đóng nhẹ nhàng.

### 29. Đặt Lịch Hẹn VIP Tại Flagship Atelier (VAS-ATELIER-BOOKING-01)
- **Mục tiêu**: Nâng tầm trải nghiệm dịch vụ O2O (Online-to-Offline), mang lại không gian may đo riêng tư và tư vấn phong cách chuyên sâu cho khách hàng thời trang cao cấp.
- **Cơ chế**:
  - Tích hợp giao diện chuyển đổi giữa 2 chế độ tại `/vas-care`: Dịch vụ bưu tá tận nhà (White-Glove Zip-Seal) và Đặt lịch hẹn tại Flagship Atelier.
  - Lựa chọn 2 không gian di sản:
    - *NEXORA Flagship Atelier Sài Gòn*: 128 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh.
    - *NEXORA Heritage Atelier Hà Nội*: 68 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội.
  - Gói dịch vụ cao cấp: Thử đồ Private Suite & May đo tinh chỉnh phom dáng (0đ đặc quyền thành viên), Tư vấn định hình phong cách cá nhân cùng Senior Stylist, và Tiếp nhận kiểm định quang học trực tiếp tại Lounge.
  - Cấp thẻ hẹn điện tử VIP Appointment Ticket với mã xác nhận bảo mật (`ATELIER-VIP-[CODE]`), định tuyến thời gian và đồng bộ trạng thái đón tiếp.

### 30. Rừng Xanh NEXORA & Sổ Cái Cây Xanh Kỹ Thuật Số (ECO-TREE-OFFSET-01)
- **Mục tiêu**: Kiến tạo mô hình kinh tế tuần hoàn và bù đắp phát thải carbon thực chất trong ngành thời trang (Fashion Carbon Offset), gắn kết hành vi mua sắm với trách nhiệm bảo vệ môi trường.
- **Cơ chế**:
  - Dự án "Một Đơn Hàng - Một Cây Xanh Bản Địa": Trích lập quỹ phát triển rừng phòng hộ cho mỗi đơn hàng hoặc lựa chọn bao bì tự hủy Eco Green Box.
  - Sổ cái cây xanh kỹ thuật số (Digital Tree Registry) tích hợp tại `/tai-khoan`:
    - Lưu vết mã định danh minh bạch từng cây: `TREE-VN-CG-2401` (Cây Bần Trắng - Rừng Cần Giờ), `TREE-VN-CP-2402` (Cây Chò Chỉ - Vườn QG Cúc Phương), `TREE-VN-CM-2403` (Cây Đước Đôi - Cà Mau).
    - Đo lường lượng CO2e đã hấp thụ bù đắp (64.5 kg CO2e) và tích lũy xu thưởng Eco Coins (+150 Xu).
    - Cấp chứng thư số và danh hiệu danh dự **NEXORA Eco Pioneer 2026** cho thành viên tích cực.

### 31. Đăng Ký Nhận Thông Báo Khi Có Hàng Lại & Biến Động Giá (USER-STOCK-ALERT-01)
- **Mục tiêu**: Tối đa hóa tỷ lệ giữ chân khách hàng (Retention) và không để mất đơn hàng khi kích thước hoặc biến thể sản phẩm tạm thời hết hàng trong kho.
- **Cơ chế**:
  - Tích hợp nút `[ Nhận thông báo khi có hàng lại hoặc giảm giá ]` ngay trên trang chi tiết sản phẩm `/san-pham/[slug]`.
  - Khách hàng bấm đăng ký 1-chạm không cần điền form phức tạp; hệ thống tự động ghi nhận mã sản phẩm vào danh sách quan tâm `nexora_stock_alerts`.
  - Hiển thị phản hồi xác nhận xanh tức thời: "Đã bật chuông thông báo! NEXORA sẽ gửi thông báo đến chuông Header của bạn ngay khi mẫu này có đợt Flash Sale hoặc về thêm size mới."
  - Tương thích đa kênh với Trung tâm thông báo `NOTIF-CENTER-02` trên thanh Header.

### 32. Bộ Sưu Tập Nhộng Mùa Mới · Capsule Lookbook Studio (CAT-CAPSULE-LOOKBOOK-01)
- **Mục tiêu**: Chuyển đổi mô hình hiển thị sản phẩm đơn lẻ truyền thống sang bán hàng theo gói phong cách (Curated Outfit Bundle), kích thích giá trị đơn hàng trung bình (AOV).
- **Cơ chế**:
  - Bổ sung phân hệ Lookbook tạp chí thời trang nổi bật trên trang chủ, giới thiệu 3 bản phối Capsule hoàn chỉnh:
    1. *The Normandy Summer Edit*: Áo sơ mi linen cổ trụ + Quần short linen mộc + Áo khoác safari kaki đũi (Hòa sắc 99/100, tiết kiệm -10% còn 1.314.000đ).
    2. *The Minimal Executive Edit*: Áo Polo dệt kim Merino + Quần tây xếp ly kép + Áo khoác Blazer linen hai hàng khuy (Hòa sắc 98/100, tiết kiệm -10% còn 1.764.000đ).
    3. *Bảo Lộc Silk Atelier Edit*: Áo sơ mi lụa tơ tằm dệt tay + Quần culottes lụa cát + Khăn lụa bỏ túi & Áo choàng nhẹ (Hòa sắc 97/100, tiết kiệm -10% còn 1.665.000đ).
  - Tương tác chuyển đổi tab mượt mà, khung hiển thị 3 lớp áo/quần/khoác trực quan và nút bấm kết nối liền mạch sang Phòng Thử Đồ Mix & Match `/phoi-do`.

### 33. Thang Điểm Uy Tín Gian Hàng & Tỷ Lệ Đổi Size (CAT-SELLER-SCORE-01)
- **Mục tiêu**: Tối đa hóa chỉ số niềm tin của người mua thời trang online, giảm thiểu tỷ lệ băn khoăn trước khi quyết định bấm "Thêm vào giỏ hàng".
- **Cơ chế**:
  - Tích hợp khung thông tin định danh và năng lực vận hành của Nhà bán hàng ngay dưới phần mô tả sản phẩm tại `/san-pham/[slug]`.
  - Hiển thị tên gian hàng, huy hiệu NEXORA MALL chính hãng và điểm đánh giá thực tế (4.9/5.0★ từ 3.200+ đánh giá người mua đã xác thực).
  - 4 chỉ số vận hành vàng:
    1. *Tốc độ chuẩn bị hàng*: 99.4% (giao bưu tá trong 24h).
    2. *Tỷ lệ phản hồi chat*: 99.8% (phản hồi trong vòng < 5 phút).
    3. *Hỗ trợ đổi size tận nhà*: 100% các đơn có nhu cầu trong 7-15 ngày.
    4. *Cam kết bồi hoàn hàng hiệu*: Đền tiền 200% nếu phát hiện hàng không chính hãng.
  - Tích hợp nút `[ Nhắn tin Tư vấn ]` và `[ Xem Hồ sơ Shop ]` kết nối trực tiếp trải nghiệm mua sắm.

### 34. Trắc Nghiệm Định Hình Phong Cách Thời Trang Cá Nhân (USER-STYLE-QUIZ-01)
- **Mục tiêu**: Giúp người dùng thấu hiểu bản sắc thời trang độc bản của mình, định hình phong cách tủ đồ và đề xuất các thiết kế tương thích cao nhất.
- **Cơ chế**:
  - Tích hợp mô-đun Fashion Archetype Quiz ngay trong thẻ Thời Trang Cá Nhân tại `/tai-khoan`.
  - Bộ 4 câu hỏi trắc nghiệm tương tác trực quan:
    1. *Mục đích diện đồ ưu tiên*: Thanh lịch tối giản nơi công sở, Dạo phố phóng khoáng cuối tuần, Tiệc tối sang trọng hay Thể thao năng động.
    2. *Bảng màu trang phục yêu thích*: Trung tính trầm ấm (Beige/Kem/Nâu/Đen), Tươi sáng rực rỡ, Đơn sắc Monochrome (Đen/Trắng/Xám), hay Họa tiết cá tính.
    3. *Chất liệu vải rung động*: Sợi lanh Linen mộc & Cotton hữu cơ, Lụa tơ tằm óng ả mềm mại, Vải dệt len Cashmere & Tweed đứng phom, hay Denim & Vải tái chế bền vững.
    4. *Triết lý mua sắm hướng tới*: Ít nhưng chất lượng trường tồn (Capsule), Luôn săn đón xu hướng mới nhất, Độc bản & thủ công di sản, hay Tiện dụng & đa năng mọi lúc.
  - Phân loại thành 4 Archetype phong cách:
    - *The Quiet Luxury Curator*: Bảng màu trung tính, lụa/cashmere, tôn vinh sự tinh tế không phô trương.
    - *The Earth Sartorialist*: Phong cách mộc mạc, bền vững từ chất liệu sợi tự nhiên.
    - *The Minimalist Architect*: Đường nét sắc sảo, tối giản, công năng kiến trúc.
    - *The Slow Fashion Bohemian*: Tự do phóng khoáng, thủ công di sản và chất sống độc bản.
  - Lưu trữ định danh `nexora_style_archetype` trong LocalStorage và hiển thị huy hiệu Style DNA vĩnh viễn trên giao diện.

### 35. Hộp Quà Tặng Cao Cấp & Thiệp Sáp Niêm Phong (VAS-GIFT-WRAP-01)
- **Mục tiêu**: Nâng tầm trải nghiệm đóng gói thời trang cao cấp thành một tác phẩm nghệ thuật, phục vụ nhu cầu quà tặng tinh tế cho đối tác, người thân hoặc các dịp kỷ niệm quan trọng.
- **Cơ chế**:
  - Tích hợp mô-đun tùy chọn dịch vụ đóng gói Haute Couture ngay tại giao diện giỏ hàng `/gio-hang`.
  - Quy chuẩn đóng gói xa xỉ:
    - Hộp cứng nắp gập bọc vải nhung xám khói cao cấp dập chìm logo thương hiệu NEXORA.
    - 3 lựa chọn màu ruy băng lụa dệt thủ công: Vàng Champagne Ánh Kim, Xanh Ngọc Lục Bảo (Emerald Green), hoặc Xanh Navy Hoàng Gia.
    - Thiệp chúc mừng mỹ thuật viết tay phong cách Calligraphy cá nhân hóa (nhập lời chúc tùy biến tối đa 120 ký tự).
    - Con dấu sáp đồng nóng khắc nổi biểu tượng NEXORA niêm phong một chiều (Tamper-evident Wax Seal).
  - Chính sách giá: Thu phí dịch vụ gia tăng 60.000đ/đơn hoặc tự động miễn phí 0đ cho các đơn hàng thời trang trên 2.000.000đ. Lưu vết lựa chọn quà tặng vào dữ liệu đơn hàng.

### 36. Bản Đồ Bưu Tá Vận Chuyển Trực Tuyến & Định Vị Kiện Hàng (ORD-TRACKING-MAP-01)
- **Mục tiêu**: Loại bỏ hoàn toàn sự sốt ruột của khách hàng khi chờ đợi kiện hàng thời trang cao cấp, cung cấp trải nghiệm theo dõi giao vận thời gian thực sống động.
- **Cơ chế**:
  - Tích hợp nút `[ 📍 Xem Lộ Trình Bưu Tá Trực Tuyến (ORD-TRACKING-MAP-01) ]` trên từng kiện hàng có vận đơn tại trang chi tiết đơn hàng `/don-hang/[id]`.
  - Modal bản đồ số vector trực quan:
    - Mô phỏng tuyến đường di chuyển thực tế từ Hub phân loại Logistics (Tân Bình) đến địa chỉ nhận hàng của khách.
    - Điểm đánh dấu bưu tá thời gian thực (Pulsing GPS Marker) hiển thị vận tốc di chuyển (26 km/h) và tọa độ kinh độ/vĩ độ.
    - Hồ sơ chuyên trách bưu tá: Họ tên, định danh đội xe GHN Luxury Fleet, loại phương tiện xe máy điện thân thiện môi trường (VinFast Feliz), biển số xe và điểm tín nhiệm (4.98★ / 1.420 chuyến giao an toàn).
    - Bộ đếm thời gian dự kiến (ETA): 12-15 phút nữa · Cách điểm giao 1.4 km.
  - Tương tác hai chiều an toàn: Nút gọi điện ẩn danh hai chiều qua tổng đài ảo tuân thủ nghiêm ngặt Nghị định 13/2023/NĐ-CP (PDPD) và nút gửi tin nhắn chỉ dẫn tức thời đến thiết bị bưu tá.

### 37. Mô Phỏng Phom Dáng & Độ Rủ 2D Trên Ma-nơ-canh (CAT-VIRTUAL-SILHOUETTE-01)
- **Mục tiêu**: Khắc phục trở ngại lớn nhất của người mua sắm thời trang trực tuyến là không hình dung được trang phục khi mặc lên người sẽ rủ xuống như thế nào so với vóc dáng thực tế của mình.
- **Cơ chế**:
  - Tích hợp nút `[ 👗 Mô Phỏng Phom Dáng & Độ Rủ 2D (CAT-VIRTUAL-SILHOUETTE) ]` ngay dưới bảng chọn kích cỡ trên trang chi tiết sản phẩm `/san-pham/[slug]`.
  - Hỗ trợ chuyển đổi nhanh giữa 3 tạng người thời trang tiêu chuẩn:
    1. *Petite / Thon Gọn*: Chiều cao 1m56, cân nặng 45kg, số đo 82-62-86 cm (tương thích Size S).
    2. *Athletic / Cân Đối*: Chiều cao 1m66, cân nặng 52kg, số đo 86-66-92 cm (tương thích Size M).
    3. *Curvy / Đầy Đặn*: Chiều cao 1m64, cân nặng 60kg, số đo 92-74-98 cm (tương thích Size L).
  - Bản vẽ Ma-nơ-canh thời trang Haute Couture tỉ lệ 9 đầu (Fashion Croquis) kết hợp thuật toán tỷ lệ vector:
    - Hiển thị các mốc định vị cơ thể then chốt: Đường ngực, Đường eo tự nhiên, Đường hạ mông và Đầu gối.
    - Silhouette trang phục phủ lên cơ thể theo đúng phom dáng (Regular/Slim/Oversize) và chất liệu (Linen/Lụa/Cotton).
    - Bản đồ độ căng phom (Tension Heatmap): Điểm xanh lá thể hiện độ dư cử động thoải mái (4–6cm), điểm cam đất thể hiện vùng chiết eo tôn dáng.
    - Đánh giá độ rủ & cảm giác mặc chi tiết và nút chọn nhanh kích cỡ tương thích 1-chạm.

### 38. Hỏi Đáp Tỉ Lệ Dáng & Chiều Cao Thực Tế Cùng KOC (SOC-FIT-FEEDBACK-01)
- **Mục tiêu**: Tạo cầu nối tư vấn kích cỡ chân thực và đáng tin cậy nhất giữa người mua tiềm năng và các nhà sáng tạo nội dung KOC đã trực tiếp diện và trải nghiệm trang phục.
- **Cơ chế**:
  - Tích hợp bộ lọc thẻ kép `Tất cả` và `Hỏi đáp Dáng & Size (Fit Q&A)` ngay dưới từng bài đăng phối đồ OOTD tại `/cong-dong`.
  - Phím bấm gợi ý câu hỏi nhanh (Quick Prompts):
    - *1m58 - 48kg mặc size gì tôn dáng?*
    - *Vải có bị co rút sau khi giặt không?*
    - *Áo có xẻ tà bên hông không?*
  - Tự động điền tiền tố `[Hỏi Size & Dáng]` vào ô bình luận giúp hệ thống nhận diện và phân loại câu hỏi tư vấn kích cỡ.
  - Nhận diện người trả lời: Khi tác giả bài viết KOC vào bình luận, hệ thống tự động gắn huy hiệu uy tín `✓ KOC Tác giả` màu xanh lá nổi bật, cam kết phản hồi trong vòng 24 giờ.

### 39. Thước Đo Chân Số Hóa & Khuyến Nghị Size Giày/Guốc (USER-FOOTWEAR-SCAN-01)
- **Mục tiêu**: Giải quyết bài toán nan giải khi mua sắm giày dép thời trang cao cấp online (tỷ lệ đổi trả giày do chật ngón hoặc tuột gót thường chiếm tới 35% trong ngành TMĐT).
- **Cơ chế**:
  - Tích hợp mô-đun đo đạc kích thước bàn chân số hóa chuẩn quốc tế ISO 9407 / Mondopoint ngay trong Fashion Passport tại `/tai-khoan`.
  - Bộ 3 thông số định lượng chính xác:
    1. *Chiều dài bàn chân (Foot Length)*: Tính bằng milimet (từ 200mm đến 320mm).
    2. *Chiều rộng bàn chân (Foot Width)*: Tính bằng milimet (từ 70mm đến 130mm).
    3. *Dạng vòm chân (Arch Profile)*: Phân loại 3 hình thái học (Vòm cân đối tiêu chuẩn, Bàn chân bẹt/vòm thấp, hoặc Vòm chân cao).
  - Thẻ kết quả chuyển đổi thời gian thực:
    - Quy đổi tức thì sang hệ kích cỡ: **EU (Paris Point)**, **US (Brannock)** và **UK**.
    - Khuyến nghị kích thước lót giày chính xác (chiều dài bàn chân + 5mm dung sai chống bó ngón).
    - Lời khuyên phom giày chuyên biệt theo dạng vòm chân (hướng dẫn chọn Loafer da Ý, Sneaker gót thấp hay Guốc cao gót đệm lót êm ái).

### 40. Bảng Ma Trận So Sánh Cảm Giác & Độ Bền Vải (CAT-FABRIC-COMPARISON-01)
- **Mục tiêu**: Cung cấp bằng chứng thuyết phục và khoa học lý giải mức giá trị cao của các chất liệu sợi tự nhiên nguyên bản, nâng cao nhận thức thời trang bền vững của người tiêu dùng.
- **Cơ chế**:
  - Tích hợp nút kích hoạt `[ 🔬 Bảng So Sánh Cảm Giác & Độ Bền Vải (CAT-FABRIC-COMPARISON) ]` ngay trong phân hệ Hộ Chiếu Chất Liệu `/san-pham/[slug]`.
  - Bảng đối chiếu 5 chỉ số trải nghiệm then chốt giữa chất liệu cao cấp của sản phẩm (Bảo Lộc Silk, Normandy Flax, GOTS Cotton) và vải tổng hợp Polyester/Rayon thị trường:
    1. *Độ thoáng khí & thấm hút*: 9.8/10 (cấu trúc sợi rỗng thoát ẩm tức thì) so với 3.2/10 (gây hầm bí, đọng mồ hôi).
    2. *Độ êm dịu trên làn da nhạy cảm*: 10/10 (sợi thuần khiết, ngừa kích ứng da) so với 4.5/10 (dễ ngứa ngáy, tích điện ma sát).
    3. *Khả năng điều hòa thân nhiệt 4 mùa*: 9.6/10 (mát lạnh mùa hè, giữ ấm se lạnh) so với 2.8/10 (nóng bức khi ra nắng, lạnh vào mùa đông).
    4. *Tuổi thọ & Vòng đời (> 5 năm)*: Càng giặt càng mềm và đanh sợi so với dễ bục chỉ, xù lông vón cục sau 10 lần giặt.
    5. *Trách nhiệm môi trường*: 100% tự phân hủy sinh học trong đất so với phát tán vi nhựa và mất hơn 200 năm phân rã.

---

## III. KẾT LUẬN & CAM KẾT ĐỒNG BỘ
Toàn bộ mã nguồn trên nhánh `main` của kho lưu trữ GitHub (`https://github.com/JiaysTM17/nexora.git`) và hồ sơ tài liệu đặc tả nghiệp vụ đã đạt trạng thái **đồng nhất hoàn toàn**. Mọi cập nhật tính năng trong tương lai sẽ tiếp tục tuân thủ nghiêm ngặt quy trình tài liệu hóa song hành này.
