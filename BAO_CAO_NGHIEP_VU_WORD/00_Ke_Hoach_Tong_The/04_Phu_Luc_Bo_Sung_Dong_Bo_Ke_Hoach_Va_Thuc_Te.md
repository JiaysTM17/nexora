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

11. **Trọng Tài Sàn Phân Xử Khiếu Nại Đa Phương SLA 48h (RET-DISPUTE)**:
   - Hồ sơ: Module 05 Hậu mãi & Xử lý Tranh chấp.
   - Thực tế: Nút khiếu nại lên Hội đồng Trọng tài Sàn trên trang `/don-hang/[id]`, Cổng Trọng tài tại `/admin` cho phép Admin ra phán quyết độc lập: duyệt hoàn tiền cưỡng chế từ ví shop hoặc bác khiếu nại, tự động phong tỏa và giải phóng số dư tranh chấp (`disputed`).

12. **Thuật Toán Hoàn Tiền Không Cần Trả Hàng (RET-RETURNLESS)**:
   - Hồ sơ: Module 05 Hậu mãi & Quản trị Rủi ro.
   - Thực tế: Cho phép người bán quyết định hoàn tiền nhanh mà không yêu cầu khách gửi trả kiện hàng vật lý, tiết kiệm chi phí logistics ngược và nâng cao trải nghiệm khách hàng.

13. **Cơ Chế Flash Sale & Đồng Hồ Đếm Ngược Giờ Vàng (CART-FLASH-03)**:
   - Hồ sơ: Module 03 Giỏ hàng & Khuyến mãi Đa tầng.
   - Thực tế: Khung đếm ngược thời gian thực trên trang chủ, cơ chế phân lập tồn kho Flash Sale độc lập và khóa giá động 15 phút chống nghẽn và bán âm tồn kho.

14. **Phương Thức Mua Trước Trả Sau NEXORA PayLater 0% (PAY-BNPL-MIDFLOW-05)**:
   - Hồ sơ: Module 03 Giỏ hàng, BNPL & Thanh toán Đa nguồn.
   - Thực tế: Lựa chọn thanh toán PayLater tại Giỏ hàng chia 3 kỳ thanh toán 0% lãi suất (hôm nay, 30 ngày, 60 ngày), kèm bảng lịch trình trả góp chi tiết hiển thị trên trang theo dõi đơn hàng `/don-hang/[id]`.

15. **Sàn Diễn Trực Tiếp & Mua Sắm 1-Chạm Liền Mạch (SOC-LIVE-01)**:
   - Hồ sơ: Module 06 Cộng đồng Phối đồ & Social Commerce.
   - Thực tế: Phòng Live Runway Studio tại `/live` với màn hình trình diễn thời trang, ghim deal độc quyền giảm 35% có đồng hồ đếm ngược và thanh đo lượng tồn kho còn lại, cơ chế chốt đơn 1-chạm không gián đoạn luồng phát, tương tác chat thời gian thực và hiệu ứng thả tim bay sinh động.

16. **Cầu Dao Ngắt Mạch Khẩn Cấp Giá Flash Sale (SOC-PRICE-ERROR Circuit Breaker)**:
   - Hồ sơ: Module 06 Quản trị Rủi ro Giá & An ninh Sàn.
   - Thực tế: Cầu dao ngắt khẩn cấp (Emergency Kill Switch) tại Cổng Quản trị `/admin` và Kênh Người Bán `/seller`, cho phép khóa và gỡ lập tức sản phẩm sang trạng thái `HIDDEN` khi phát hiện nhầm lẫn giá flash sale hoặc sự cố vận hành, đồng thời ghi nhận nhật ký kiểm toán bất biến `AuditLog`.

17. **Trung Tâm Mẫu Thử KOC & Điểm Tín Nhiệm Nhà Sáng Tạo (SOC-CREATOR-SAMPLE)**:
   - Hồ sơ: Module 06 Tiếp thị Liên kết & Hợp tác Nhà sáng tạo.
   - Thực tế: Thang Bậc Điểm Tín Nhiệm Nhà Sáng Tạo (Creator Trust Score 0-100: Hạng Kim Cương / Vàng / Bạc) gắn huy hiệu định danh uy tín, phân hệ Trung tâm Mẫu thử KOC tại `/cong-dong` hỗ trợ KOC xin mẫu thử thời trang miễn phí với cam kết duyệt trong SLA 48h và đối soát bài đăng OOTD trong 14 ngày.

18. **Động Cơ Xếp Chồng 5 Tầng Voucher & Cấn Trừ Xu Thưởng (CART-STACK-COIN)**:
   - Hồ sơ: Module 03 Giỏ hàng & Động cơ Voucher Xếp chồng.
   - Thực tế: Tích hợp đầy đủ 5 tầng ưu đãi tại khâu Checkout Giỏ hàng `/gio-hang`: Tầng 1 (Shop Voucher), Tầng 2 (Voucher Sàn/Trade-In), Tầng 3 (Voucher Freeship Xtra -30.000đ `_freeship`), Tầng 4 (PayLater 0%), Tầng 5 (Xu thưởng NEXORA Coins `_coins` cấn trừ 1 xu = 1đ).

19. **Nhật Ký Biến Thiên Cân Nặng Bưu Tá 3 Trạm (FUL-WEIGHT-AUDIT)**:
   - Hồ sơ: Module 04 Vận chuyển, Giao nhận & Chống Gian lận Vận đơn.
   - Thực tế: Khung kiểm soát biến thiên khối lượng kiện hàng quang học qua 3 trạm bưu tá (Xuất kho -> Sorting Hub -> Bưu tá phát) với dung sai an toàn ΔW ≤ 50g, bảo vệ người mua và nhà bán hàng khỏi nạn tráo hàng tại màn hình `/don-hang/[id]`.

20. **Bảo Hiểm Thời Trang NEXORA Care+ (VAS-WARRANTY-EXT)**:
   - Hồ sơ: Module 03 Giỏ hàng & Dịch vụ Giá trị Gia tăng (VAS).
   - Thực tế: Khối tùy chọn gia hạn bảo hành và phục hồi form trang phục cao cấp 12 tháng (+150.000đ) tích hợp trên trang chi tiết sản phẩm `/san-pham/[slug]`, bao gồm bảo hành đường may trọn đời, thay thế khóa kéo YKK chính hãng và miễn phí 2 lần Spa giặt hấp đồ hiệu chuyên sâu tại NEXORA Atelier.

21. **Bảo Chứng Thu Cũ & Quyền Cân Nhắc 14 Ngày (VAS-TRADEIN-REQUOTE)**:
   - Hồ sơ: Module 05 Thời trang Tuần hoàn & Giám định Thu cũ Đổi mới.
   - Thực tế: Cam kết bảo lưu giá trị định giá sơ bộ Vòng 1 trong 14 ngày, quyền cân nhắc 14 ngày vô điều kiện và cam kết hoàn trả tận nơi 0đ nếu kết quả giám định Vòng 2 chênh lệch >10%, quy trình niêm phong quang học buồng sáng 1000 Lux tại `/trade-in`.

22. **Phòng Thử Đồ Mix & Match & Mua Trọn Set (CAT-MIX-MATCH-01)**:
   - Hồ sơ: Module 01 Quản trị Danh mục & Module 06 Trải nghiệm Thời trang Tương tác.
   - Thực tế: Studio phối đồ trực quan tại tuyến `/phoi-do` cho phép chọn 3 lớp trang phục, tự động xếp chồng trên Lookbook Canvas, đánh giá hòa sắc tone-sur-tone (98/100) và chiết khấu Combo Style Saver (-10%) khi thêm trọn bộ vào giỏ hàng 1-click.

23. **Khung Giờ Giao Hàng Hẹn Trước & Đóng Gói Xanh Eco Box (FUL-GREEN-SLOT-02)**:
   - Hồ sơ: Module 03 Giỏ hàng & Module 04 Vận chuyển Xanh Bền vững.
   - Thực tế: Tùy chọn 3 khung giờ bưu tá giao hàng (Sáng/Chiều/Tối ngoài giờ) và đóng gói hộp giấy kraft tự hủy không nilon, thưởng ngay +50 Xu NEXORA Coins vào tài khoản tại màn hình Checkout `/gio-hang` và lưu vết tại `/don-hang/[id]`.

24. **Đổi Size Tốc Hành Tận Cửa 24-48h (RET-QUICK-EXCHANGE-01)**:
   - Hồ sơ: Module 05 Hậu mãi & Xử lý Khiếu nại/Đổi hàng.
   - Thực tế: Lựa chọn `DOORSTEP_EXCHANGE` trên đơn hàng đã giao tại `/don-hang/[id]`, shipper mang trực tiếp trang phục size mới đến tận nhà đổi và nhận lại sản phẩm ban đầu trong cùng 1 lần giao nhận, giảm thời gian đổi hàng còn 24-48h với 0đ phụ phí.

25. **Bảng Xếp Hạng Xu Hướng Thời Trang Tuần Realtime (CAT-TRENDING-BOARD-02)**:
   - Hồ sơ: Module 01 Catalog & Module 06 Khám phá Xu hướng Thời trang.
   - Thực tế: Phân hệ Trend Radar tính toán Sales Velocity thời gian thực trên trang chủ (+142% Quiet Luxury, +98% Eco Linen, +85% Tone Đất Sartorial), kết nối trực quan sang Phòng Thử Đồ `/phoi-do`.

26. **Hồ Sơ Số Đo Cá Nhân & Gợi Ý Smart Fit (USER-PASSPORT-01)**:
   - Hồ sơ: Module 01 Quản trị Danh mục & Module 07 Quản trị Hồ sơ Người dùng.
   - Thực tế: Phân hệ Fashion Passport lưu trữ số đo cơ thể cá nhân (Chiều cao, Cân nặng, 3 Vòng, Gu mặc) tại `/tai-khoan`, thuật toán Smart Fit Matching tự động gợi ý size chuẩn xác (Khớp 96%) và nút bấm 1-chạm chọn size ngay trên trang sản phẩm `/san-pham/[slug]`.

27. **Trung Tâm Thông Báo Đa Kênh Thời Gian Thực (NOTIF-CENTER-02)**:
   - Hồ sơ: Module 07 Trải nghiệm Khách hàng & Tương tác Đa kênh.
   - Thực tế: Biểu tượng Chuông Thông Báo trên Header với badge đếm tin chưa đọc, ngăn popover hiển thị trạng thái vận đơn an ninh 3 trạm, thông báo thưởng Xu Xanh Eco Box, ưu đãi combo Mix & Match và quyền lợi bảo hiểm Care+.

28. **Bản Thể Hiện Hóa Đơn Điện Tử VAT Đạt Chuẩn TT 78 & Xuất HĐĐT (ORD-EXPORT-PDF-01)**:
   - Hồ sơ: Module 03 Kế toán Thanh toán & Module 04 Bán lẻ Sàn TMĐT.
   - Thực tế: Nút `[ In / Xuất Hóa Đơn VAT ]` tại `/don-hang/[id]`, modal hiển thị hóa đơn GTGT điện tử chuẩn Thông tư 78/2021/TT-BTC & Nghị định 123/2020/NĐ-CP (Mẫu 1C26TNO/C26MNE), bảng kê sản phẩm, thuế suất GTGT 8%, mã CQT cấp, QR tra cứu và chứng thư số điện tử hợp chuẩn, hỗ trợ in ấn trực tiếp không gián đoạn.

29. **Tủ Đồ Nhộng Thông Minh & Trợ Lý Phong Cách AI Stylist (SOC-WARDROBE-AI-01)**:
   - Hồ sơ: Module 01 Quản lý Danh mục, Module 06 Phong cách OOTD & Module 07 Quản trị Khách hàng.
   - Thực tế: Phân hệ Capsule Wardrobe tại `/tai-khoan`, thuật toán AI Stylist tự động lên lịch phối đồ 7 ngày từ 7 món đồ thiết yếu theo số đo Fashion Passport, hỗ trợ chuyển đổi thời tiết Nắng ấm/Se lạnh, ghim bộ đồ mặc hôm nay và chia sẻ Lookbook lên Cộng đồng OOTD `/cong-dong`.

30. **Hộ Chiếu Minh Bạch Chất Liệu & Xuất Xứ (CAT-FABRIC-TRACE-01)**:
   - Hồ sơ: Module 01 Quản lý Sản phẩm & Nguồn gốc Xuất xứ.
   - Thực tế: Khung Hộ Chiếu Chất Liệu tại `/san-pham/[slug]` công khai vùng nguyên liệu (Bảo Lộc Silk, Normandy Flax, Pima Cotton), chứng chỉ OEKO-TEX Standard 100/GOTS, chỉ số giảm -65% nước, -72% CO2e và hướng dẫn bảo quản Atelier Care Guide.

31. **Thanh Tìm Kiếm Nhanh & Gợi Ý Tức Thì (CAT-SEARCH-AUTOCOMPLETE-01)**:
   - Hồ sơ: Module 01 Tìm kiếm Sản phẩm & Trải nghiệm Giao diện Người dùng.
   - Thực tế: Hộp thoại tìm kiếm nhanh Command Palette mở bằng `Ctrl+K` hoặc biểu tượng kính lúp, tích hợp thẻ từ khóa xu hướng và gợi ý sản phẩm tự động kèm ảnh và mức giá VND thời gian thực.

32. **Đặt Lịch Hẹn VIP Tại Flagship Atelier (VAS-ATELIER-BOOKING-01)**:
   - Hồ sơ: Module 02 Dịch vụ Chăm sóc VAS & Trải nghiệm May đo O2O.
   - Thực tế: Phân hệ đặt lịch trực tiếp tại Flagship Atelier (Sài Gòn/Hà Nội) tại `/vas-care`, phòng thử đồ Private Suite, may đo phom dáng bespoke (0đ thành viên), tư vấn Senior Stylist và cấp thẻ VIP Ticket điện tử lưu vết trên hệ thống.

33. **Rừng Xanh NEXORA & Sổ Cái Cây Xanh Kỹ Thuật Số (ECO-TREE-OFFSET-01)**:
   - Hồ sơ: Module 04 Bán lẻ Sàn TMĐT & Module 07 Trách nhiệm Xã hội Doanh nghiệp (CSR/ESG).
   - Thực tế: Phân hệ Rừng Xanh NEXORA tại `/tai-khoan`, sổ cái kỹ thuật số Digital Tree Registry lưu vết mã số từng cây xanh bản địa được bảo trợ tại Cần Giờ, Cúc Phương, Cà Mau, đo lường 64.5 kg CO2e bù đắp và cấp huy hiệu danh dự NEXORA Eco Pioneer.

34. **Đăng Ký Nhận Thông Báo Khi Có Hàng Lại & Biến Động Giá (USER-STOCK-ALERT-01)**:
   - Hồ sơ: Module 01 Quản trị Danh mục & Module 07 Thông báo Cá nhân hóa.
   - Thực tế: Nút nhận thông báo khi có hàng lại hoặc giảm giá tại `/san-pham/[slug]`, đăng ký 1-chạm không cần điền form, lưu vết `nexora_stock_alerts` và tích hợp đồng bộ vào chuông Header.

35. **Bộ Sưu Tập Nhộng Mùa Mới · Capsule Lookbook Studio (CAT-CAPSULE-LOOKBOOK-01)**:
   - Hồ sơ: Module 01 Trưng bày Sản phẩm & Module 06 Phong cách OOTD Lookbook.
   - Thực tế: Phân hệ Capsule Lookbook 3 phong cách (Normandy Summer, Minimal Executive, Bảo Lộc Silk) trên trang chủ, hiển thị chi tiết 3 lớp đồ, chỉ số hòa sắc 97-99% và chiết khấu trọn bộ Combo Style Saver -10%.

36. **Thang Điểm Uy Tín Gian Hàng & Tỷ Lệ Đổi Size (CAT-SELLER-SCORE-01)**:
   - Hồ sơ: Module 01 Quản trị Danh mục & Module 02 Quản lý Gian hàng Nhà bán.
   - Thực tế: Khung định danh nhà bán tại `/san-pham/[slug]` với điểm số 4.9/5.0★ từ 3.200+ đánh giá, tốc độ chuẩn bị hàng 99.4%, phản hồi chat < 5 phút, tỷ lệ hỗ trợ đổi size 100% và bảo chứng đền bù 200% nếu phát hiện hàng giả.

37. **Trắc Nghiệm Định Hình Phong Cách Cá Nhân (USER-STYLE-QUIZ-01)**:
   - Hồ sơ: Module 06 Phong cách OOTD & Module 07 Cá nhân hóa Người dùng.
   - Thực tế: Bộ trắc nghiệm 4 câu hỏi Fashion Archetype Quiz tại `/tai-khoan` giúp người mua khám phá bản sắc độc bản (Quiet Luxury, Earth Sartorialist, Minimalist Architect, Slow Fashion Bohemian), lưu vết `nexora_style_archetype` và gắn huy hiệu Style DNA vĩnh viễn trên trang cá nhân.

38. **Hộp Quà Cao Cấp Kèm Thiệp Sáp Niêm Phong (VAS-GIFT-WRAP-01)**:
   - Hồ sơ: Module 02 Dịch vụ Chăm sóc VAS & Module 03 Giỏ hàng & Thanh toán.
   - Thực tế: Tùy chọn đóng gói Haute Couture tại `/gio-hang` với hộp cứng nhung xám khói, 3 màu nơ lụa dệt (Champagne, Emerald, Navy), thiệp chúc mừng viết tay Calligraphy niêm phong sáp đồng (+60.000đ hoặc 0đ cho đơn hàng > 2.000.000đ).

39. **Bản Đồ Bưu Tá Trực Tuyến & Định Vị Kiện Hàng (ORD-TRACKING-MAP-01)**:
   - Hồ sơ: Module 04 Quản lý Vận hành Đơn hàng & Logistics.
   - Thực tế: Nút xem lộ trình bưu tá trực tuyến trên từng kiện hàng tại `/don-hang/[id]`, modal bản đồ số Live GPS mô phỏng hành trình từ Hub Tân Bình, bưu tá xe điện VinFast Feliz, đếm ngược thời gian dự kiến (12-15 phút) và liên lạc thoại/tin nhắn bảo mật PDPD NĐ 13.

40. **Mô Phỏng Phom Dáng & Độ Rủ 2D (CAT-VIRTUAL-SILHOUETTE-01)**:
   - Hồ sơ: Module 01 Quản lý Danh mục & Trải nghiệm Thử đồ 3D/AI.
   - Thực tế: Nút mô phỏng phom dáng tại `/san-pham/[slug]`, modal Mannequin Croquis 9 đầu đối chiếu 3 tạng người (Petite/Athletic/Curvy), bản đồ độ căng phom và nút chọn size tương thích tự động.

41. **Hỏi Đáp Tỉ Lệ Dáng & Chiều Cao Thực Tế Cùng KOC (SOC-FIT-FEEDBACK-01)**:
   - Hồ sơ: Module 06 Mạng xã hội OOTD & Tương tác Cộng đồng.
   - Thực tế: Bộ lọc thẻ Fit Q&A dưới từng bài đăng `/cong-dong`, gợi ý câu hỏi chiều cao/cân nặng 1-chạm, gắn nhãn FIT Q&A và nhận diện phản hồi của KOC Tác giả cam kết SLA 24h.

42. **Thước Đo Chân Số Hóa & Khuyến Nghị Size Giày/Guốc (USER-FOOTWEAR-SCAN-01)**:
   - Hồ sơ: Module 07 Cá nhân hóa Người dùng & Công cụ Hỗ trợ Kích cỡ.
   - Thực tế: Mở rộng phân hệ Fashion Passport tại `/tai-khoan` bổ sung chiều dài/rộng chân (mm), hình thái vòm chân (Bẹt/Chuẩn/Cao), tự động quy đổi kích cỡ chuẩn quốc tế EU/US/UK và đưa ra lời khuyên chọn phom giày cao cấp.

43. **Bảng Ma Trận So Sánh Cảm Giác & Độ Bền Vải (CAT-FABRIC-COMPARISON-01)**:
   - Hồ sơ: Module 01 Quản lý Danh mục & Minh bạch Nguồn gốc Chất liệu.
   - Thực tế: Bảng ma trận đối chiếu 5 tiêu chuẩn vàng tại `/san-pham/[slug]` giữa sợi tự nhiên cao cấp (Lụa Bảo Lộc, Linen Normandy, GOTS Cotton) và vải tổng hợp Polyester thị trường (thoáng khí 9.8/10, an toàn da 10/10, điều hòa thân nhiệt 9.6/10 và độ bền >5 năm).

44. **Khám Phá Xu Hướng & Bảng Màu OOTD (SOC-OOTD-TAG-DISCOVERY-02)**:
   - Hồ sơ: Module 06 Mạng xã hội OOTD & Khám phá Phong cách Sống.
   - Thực tế: Thanh khám phá hashtag và bảng màu thời trang tại `/cong-dong` hỗ trợ lọc tức thì các bài viết OOTD theo chủ đề (#QuietLuxury, #LinenNormandy, #BaoLocSilk, #SartorialSuit, #Minimalist) kết nối các sản phẩm thực tế.

45. **La Bàn Phối Đồ & Gợi Ý Phụ Kiện Tương Thích (CAT-STYLE-COMPASS-01)**:
   - Hồ sơ: Module 01 Quản lý Danh mục & Module 06 Tư vấn Thẩm mỹ Phối đồ.
   - Thực tế: Khối La bàn phong cách (Style Compass) tại `/san-pham/[slug]` gợi ý phụ kiện tuyển chọn (Thắt lưng da Ý, Khăn cài túi lụa tơ tằm dệt tay, Nón cói Panama đan tay), tính năng thêm nhanh vào danh sách phối đồ và kết nối phòng thử đồ ảo `/phoi-do`.

46. **Phân Tích Bảng Màu & Chi Phí Mỗi Lần Mặc CPW (USER-WARDROBE-ANALYTICS-01)**:
   - Hồ sơ: Module 06 Phong cách OOTD & Module 07 Cá nhân hóa Người dùng.
   - Thực tế: Biểu đồ phân bổ tỷ lệ màu sắc tủ đồ cá nhân (42% Neutral, 28% Indigo, 18% Noir, 12% Earth) và bộ tính chỉ số Cost-Per-Wear (CPW) theo số lần mặc thực tế, kèm cảnh báo thời trang bền vững và liên kết thu cũ đổi mới tại `/tai-khoan`.

47. **Mua Trọn Bộ Hoàn Chỉnh Tiết Kiệm -12% (CAT-BUNDLE-DISCOUNT-01)**:
   - Hồ sơ: Module 01 Quản lý Danh mục & Module 03 Giỏ hàng & Khuyến mãi.
   - Thực tế: Khối Combo Style Saver tại `/san-pham/[slug]` kết hợp trang phục chính cùng quần âu may đo và thắt lưng da, tự động chiết khấu -12% trọn gói và hỗ trợ thêm vào giỏ hàng 1-chạm.

48. **Tiền Thưởng Tác Quyền KOC & Ủng Hộ Phong Cách (SOC-CREATOR-TIP-01)**:
   - Hồ sơ: Module 06 Mạng xã hội OOTD & Nền kinh tế Sáng tạo (Creator Economy).
   - Thực tế: Nút tặng quà cà phê/xu sáng tạo tại `/cong-dong` hỗ trợ chuyển tiền thưởng trực tiếp vào ví Creator Wallet của tác giả bài viết, tuân thủ khấu trừ thuế TNCN 10% theo Thông tư 111/2013/TT-BTC.

49. **Chứng Thư Bù Đắp Carbon Đơn Hàng Chuẩn Xanh (ORD-CARBON-CERT-01)**:
   - Hồ sơ: Module 04 Vận hành Đơn hàng & Trách nhiệm Môi trường (ESG/CSR).
   - Thực tế: Khối Chứng thư Bù đắp Carbon số tại `/don-hang/[id]` xác nhận 1.85 kg CO2e đã trung hòa từ giao hàng xe điện VinFast Feliz và bao bì Kraft tái sinh, mã blockchain xác thực và modal in chứng thư Haute Couture.

50. **Bộ Giả Lập Định Giá Thu Cũ Đổi Mới Tức Thì (TRADEIN-ESTIMATE-SIMULATOR-01)**:
   - Hồ sơ: Module 07 Kinh tế tuần hoàn & Dịch vụ Trade-In.
   - Thực tế: Bộ giả lập định giá thời gian thực tại `/trade-in` cho phép dự phóng voucher đối ứng theo 4 phân loại và 4 cấp độ Grade S/A/B/C, đo lường giảm thải 3.2 kg CO2e và điền nhanh vào form gửi đồ.

51. **Cảm Âm Chất Liệu & Cẩm Nang Giọng Nói (CAT-FABRIC-VOICE-GUIDE-01)**:
   - Hồ sơ: Module 01 Trưng bày Sản phẩm & Trải nghiệm Đa giác quan AI.
   - Thực tế: Mô-đun cảm âm tại `/san-pham/[slug]` với trình phát Audio Equalizer mô phỏng âm thanh sột soạt tự nhiên của lụa (Silk Scroop) và giọng đọc trợ lý AI Stylist hướng dẫn giặt ủi chuẩn mực.

52. **Bảng Cảm Hứng & Ghim Phong Cách Cá Nhân (USER-STYLE-MOODBOARD-01)**:
   - Hồ sơ: Module 06 Phong cách OOTD & Module 07 Cá nhân hóa Người dùng.
   - Thực tế: Phân hệ Moodboard thị giác tại `/tai-khoan` lưu giữ các thẻ cảm hứng màu sắc, chất liệu và ghi chú phối đồ cá nhân, hỗ trợ thêm mới linh hoạt và chia sẻ lên Lookbook cộng đồng.

53. **Lookbook Sàn Diễn Đa Góc Nhìn & Hậu Trường (LIVE-RUNWAY-LOOKBOOK-01)**:
   - Hồ sơ: Module 01 Trưng bày Sản phẩm & Module 06 Trình diễn Livestream Runway.
   - Thực tế: Phân hệ Runway Lookbook Studio tại `/live` cho phép chuyển đổi 3 góc quan sát (Catwalk Front-View, Macro 4K sợi dệt, Backstage Styling) và chốt deal trực tiếp ưu đãi -15% từ sàn diễn.

54. **Bộ Đếm Tồn Kho Thủ Công & Khóa Giữ Hàng 180s (CAT-REALTIME-STOCK-RESERVATION-01)**:
   - Hồ sơ: Module 01 Trưng bày Sản phẩm & Module 05 Quản lý Tồn kho Độc quyền (D6-02/D6-03).
   - Thực tế: Phân hệ tồn kho may đo giới hạn tại `/san-pham/[slug]` với đồng hồ đếm ngược 180s mô phỏng Khóa Giữ Hàng Redis Lua Script chống oversell, cảnh báo nhu cầu thời gian thực và tự động giải phóng/gia hạn.

55. **Thu Hồi Thùng Đóng Gói Tuần Hoàn Eco-Box (ORD-ECO-PACK-RETURN-01)**:
   - Hồ sơ: Module 03 Quản trị Vận chuyển Chặng cuối & Module 07 Điểm thưởng Xanh Sinh thái.
   - Thực tế: Phân hệ lên lịch hẹn thu hồi hộp carton tái chế tuần hoàn tại `/don-hang/[id]`, điều phối Shipper VinFast Green lấy tận nhà theo 3 khung giờ hoặc gửi tại trạm Boutique, tặng +150 Điểm Xanh NEX-Green tích lũy.

56. **Gợi Ý Phối Đồ Theo Thời Tiết & Ngữ Cảnh (CAT-OUTFIT-WEATHER-SYNC-01)**:
   - Hồ sơ: Module 01 Trưng bày Sản phẩm & Module 06 Studio Mix & Match.
   - Thực tế: Phân hệ đề xuất outfit tự động tại `/phoi-do` theo 3 mẫu thời tiết (Sài Gòn 32°C, Hà Nội 19°C, Đà Lạt 14°C) và 3 ngữ cảnh (Công sở, Dạo phố, Dạ tiệc), phối lớp thích ứng sợi dệt Linen/Lụa/Dạ len.

57. **Thử Thách Phối Đồ Tuần & Bình Chọn Cộng Đồng (SOC-OOTD-CHALLENGE-01)**:
   - Hồ sơ: Module 06 Phong cách OOTD & Cộng đồng Xã hội.
   - Thực tế: Phân hệ Thử thách tuần `#LinenInTheCity` tại `/cong-dong` với quỹ thưởng 15 triệu đồng, nút tham gia nhận +500 Điểm Xanh và nút bình chọn phiếu thưởng KOC trực tiếp.

58. **Thước So Sánh Trước & Sau Spa Đồ Hiệu (VAS-BEFORE-AFTER-SLIDER-01)**:
   - Hồ sơ: Module 02 Dịch vụ Hậu mãi & Module 04 Thẩm định Bảo hiểm VAS Care.
   - Thực tế: Thước kéo đối chứng quang học 1000 Lux tại `/vas-care` cho phép so sánh Trước/Sau cho 3 dòng đồ hiệu (Blazer dạ, Đầm lụa, Túi da), đo độ phục hồi form 99.2% và bảo chứng 100 triệu VND.

59. **Phân Tách Địa Chỉ Giao Nhiều Điểm & Quà Tặng (CART-SPLIT-DELIVERY-01)**:
   - Hồ sơ: Module 03 Quản lý Giỏ hàng & Module 04 Vận chuyển Đa điểm đến.
   - Thực tế: Tùy chọn phân tách giao hàng nhiều địa chỉ tại `/gio-hang`, cho phép gán từng món đồ về Nhà riêng hoặc Quà tặng/Văn phòng, kèm thông tin người nhận riêng.

60. **Lọc Tìm Kiếm Bảng Màu Tự Nhiên & Tone-Sur-Tone (CAT-VISUAL-PALETTE-SEARCH-01)**:
   - Hồ sơ: Module 01 Trưng bày Sản phẩm & Trải nghiệm Tìm kiếm Thị giác.
   - Thực tế: Phân hệ lọc sắc thái tại `/tim-kiem` với 6 swatch màu tự nhiên (Cát mộc, Lam chàm, Đất nung, Đen sơn mài, Trắng ngà), lọc tức thì và hiển thị điểm hòa sắc tone-sur-tone 98/100.

61. **Xuất Gộp Hóa Đơn Điện Tử VAT & Báo Cáo Doanh Nghiệp (ORD-BULK-INVOICE-DOWNLOAD-01)**:
   - Hồ sơ: Module 03 Kế toán Tài chính & Module 04 Hóa đơn Điện tử TT 78.
   - Thực tế: Thanh công cụ tại `/don-hang` cho phép chọn nhiều đơn hàng để xuất Bảng kê chi phí khấu trừ thuế TNDN, tính thuế VAT 8%, in bảng kê và tải gói nén ZIP hóa đơn điện tử CQT.

62. **Hẹn Giờ Bưu Tá Thu Gom Đồ Cũ Tận Nhà (TRADEIN-COURIER-SLOT-01)**:
   - Hồ sơ: Module 05 Thời trang Tuần hoàn & Module 08 Logistics Chặng Đầu.
   - Thực tế: Phân hệ lên lịch hẹn bưu tá xe điện VinFast Green đến nhận đồ cũ tận cửa miễn phí 100% tại `/trade-in`, chọn 3 khung giờ hẹn (Sáng, Chiều, Tối), cung cấp sẵn Túi Niêm Phong Quang Học Tamper-Evident có mã QR bảo mật.

63. **Khán Giả Bình Chọn Set Trình Diễn Live (LIVE-STREAM-POLL-01)**:
   - Hồ sơ: Module 01 Trưng bày Sản phẩm & Module 06 Tương tác Trực tiếp Sàn diễn Runway.
   - Thực tế: Phân hệ bình chọn tương tác thời gian thực tại `/live`, khán giả bình chọn 3 set đồ để người mẫu diện lượt tiếp theo, tính tỷ lệ động và mở khóa Voucher Flash Deal -20% (Mã `RUNWAY20`).

64. **Đánh Giá Bưu Tá Xe Điện & Thưởng Tip Thân Thiện (ORD-DELIVERY-FEEDBACK-01)**:
   - Hồ sơ: Module 04 Vận chuyển Chặng cuối & Module 07 Gắn kết Khách hàng.
   - Thực tế: Phân hệ đánh giá bưu tá tại `/don-hang/[id]`: Chấm 1-5 sao cho bưu tá xe điện VinFast Feliz, chọn 5 tiêu chí khen ngợi, gửi tip động viên (10k/20k/50k) và ghi nhận vào hồ sơ dịch vụ.

65. **Hỏi Đáp Phong Cách Cùng AI Stylist (CAT-AI-STYLING-CONVERSATION-01)**:
   - Hồ sơ: Module 01 Trưng bày Sản phẩm & Module 06 Trợ lý Tư vấn Phong cách AI.
   - Thực tế: Phân hệ tư vấn phong cách tương tác 24/7 tại `/san-pham/[slug]` với Senior Stylist Elena Vũ, gợi ý câu hỏi nhanh (Gala, Công sở, Nhăn vải, Chọn size) và hội thoại tự động theo chất liệu sợi dệt và phom dáng riêng của sản phẩm.

66. **Lịch Trình Sự Kiện & Chuẩn Bị Trang Phục (USER-FASHION-CALENDAR-01)**:
   - Hồ sơ: Module 06 Phong cách OOTD & Module 07 Cá nhân hóa Người dùng.
   - Thực tế: Phân hệ lịch trình sự kiện thời trang tại `/tai-khoan`: Lên kế hoạch outfit theo ngày/giờ, đồng bộ dự báo thời tiết và tự động nhắc hẹn giặt ủi đồ hiệu VAS Care trước 48h.

67. **Chứng Nhận Xưởng May Xanh & Thẻ Điểm ESG (SELLER-SUSTAINABLE-BADGE-01)**:
   - Hồ sơ: Module 01 Quản trị Danh mục & Module 04 Bán lẻ Sàn TMĐT Bền Vững (ESG/CSR).
   - Thực tế: Tab Chuẩn Xanh ESG tại Kênh Người Bán `/seller`: Thẻ điểm sợi tự nhiên 94.5%, giảm 18.4 tấn CO2e, hồ sơ chứng chỉ GOTS/OEKO-TEX và huy hiệu Green Atelier Verified.

68. **Đối Soát & Thẩm Định Chứng Chỉ Xanh ESG Sàn (ADMIN-ESG-AUDIT-DASHBOARD-01)**:
   - Hồ sơ: Module 04 Quản trị Sàn TMĐT & Module 07 Kiểm toán Môi trường ESG.
   - Thực tế: Tab Thẩm định ESG tại Cổng Quản Trị `/admin`: Bảng đối soát chứng chỉ xanh xưởng may, giám sát 142.8 tấn CO2e trung hòa, tỷ lệ giao xe điện 88.6%, xuất báo cáo ESG kiểm toán.

69. **Masterclass Thời Trang Bền Vững & Workshop Trực Tuyến (SOC-STYLING-WORKSHOP-01)**:
   - Hồ sơ: Module 01 Trưng bày Sản phẩm & Module 06 Cộng đồng Tương tác Sáng tạo OOTD.
   - Thực tế: Phân hệ workshop stylist trực tuyến tại `/cong-dong`: Đăng ký giữ chỗ Workshop Smart Layering cùng Master Tailor Hoàng Nam, tặng +200 Điểm Xanh và nhận mã vé VIP.

70. **Cam Kết Tiêu Dùng Sinh Thái & Giao Hàng Không Rác Thải Nhựa (CART-CARBON-REDUCTION-PLEDGE-01)**:
   - Hồ sơ: Module 03 Giỏ hàng Thanh toán & Module 04 Bán lẻ Sàn TMĐT Bền Vững (ESG/CSR).
   - Thực tế: Phân hệ cam kết xanh tại `/gio-hang`: Khách hàng ký cam kết vận chuyển gom tuyến, 100% không xốp nilon bong bóng (thay bằng giấy tổ ong đệm kraft), tuần hoàn bao bì, tặng ngay danh hiệu Green Shopper Pioneer và +100 Điểm Xanh.

71. **Đặt Trước May Đo Giới Hạn & Theo Dõi Tiến Trình Nghệ Nhân (CAT-PRE-ORDER-ATELIER-01)**:
   - Hồ sơ: Module 01 Trưng bày Sản phẩm & Module 02 May Đo Thủ Công Độc Bản (Bespoke Haute Couture).
   - Thực tế: Phân hệ may đo độc bản tại `/san-pham/[slug]`: Giữ suất hàng chờ nghệ nhân (#07/15), thêu monogram tên ve áo, chọn lót lụa may đo, đặt cọc 30% bảo chứng Escrow D1-01, theo dõi 5 chặng chế tác Master Tailor và đồng bộ chi tiết tại `/tai-khoan`.

72. **Bác Sĩ Đồ Hiệu & Bộ Chẩn Đoán Tổn Thương Phục Hồi Sinh Học (VAS-GARMENT-DIAGNOSIS-01)**:
   - Hồ sơ: Module 02 Chăm Sóc Đồ Hiệu & Dịch Vụ Giá Trị Gia Tăng (VAS Care).
   - Thực tế: Phân hệ chẩn đoán tổn thương sợi dệt và đồ da tại `/vas-care`: Chọn dòng đồ & triệu chứng hư hại, lập phác đồ sinh học chuẩn 1000 Lux, tỷ lệ phục hồi 98.6%, điền tự động form bưu tá và tặng voucher cấp cứu đồ hiệu -50k (`RESCUE50`).

73. **Khung Thiết Kế Lookbook Cá Nhân & Thẻ Phối Đồ Nghệ Thuật (CAT-LOOKBOOK-CANVAS-EXPORT-01)**:
   - Hồ sơ: Module 01 Trưng bày Sản phẩm & Module 06 Studio Mix & Match và Lookbook OOTD.
   - Thực tế: Phân hệ xuất thẻ Lookbook tại `/phoi-do`: 3 không gian nghệ thuật (Atelier Kem Gỗ Sồi, Heritage Phố Cổ, Sơn Mài Midnight), chữ ký curator cá nhân, hòa sắc 98/100, lưu bộ sưu tập và đăng lên cộng đồng OOTD.

74. **Hộ Chiếu Tái Chế Sợi Dệt & Vòng Đời Tái Sinh Tuần Hoàn (TRADEIN-FABRIC-RECYCLING-INDEX-01)**:
   - Hồ sơ: Module 02 Thu Cũ Đổi Mới & Tuần Hoàn Thời Trang (Circular Fashion & LCA).
   - Thực tế: Phân hệ hộ chiếu LCA tại `/trade-in`: Đo lường bảo tồn tài nguyên sinh thái (Linen 2.700L nước, -3.2kg CO2e, -0.85kg hóa chất), phân bổ 3 hướng tái sinh (Upcycling 35%, Re-Loved 50%, Nỉ tiêu âm Bio-Felt 15%), cấp hộ chiếu điện tử độc bản `#PASSPORT-LCA-XXXXXX`.

75. **Sàn Đổi Đồ Tủ Áo Tuần Hoàn P2P & Hợp Đồng Escrow Đối Ứng (SOC-COMMUNITY-SWAP-MEET-01)**:
   - Hồ sơ: Module 06 Cộng đồng Tương tác Sáng tạo OOTD & Trao Đổi Ngang Hàng P2P.
   - Thực tế: Sàn giao lưu đồ tủ áo tại `/cong-dong`: Thuật toán định giá công bằng (Fair Value Match Score 96%), cọc bảo chứng Escrow giữ tiền chênh lệch, vận chuyển đồng kiểm 2 chiều VinFast Green, ký hợp đồng P2P `#SWAP-P2P-XXXXXX` và tích lũy +300 Điểm Xanh.

76. **Chỉ Số Độ Bền Sợi Dệt & Kiểm Định Ma Sát Giặt Máy (CAT-FABRIC-DURABILITY-INDEX-01)**:
   - Hồ sơ: Module 01 Trưng bày Sản phẩm & Quản Trị Chất Lượng Sợi Dệt (Quality Assurance & Fabric Testing).
   - Thực tế: Phân hệ kiểm định độ bền tại `/san-pham/[slug]`: Thử nghiệm ma sát Martindale 35.000 chu kỳ (Heavy Commercial Grade), chống xù lông cấp 4.5/5 (ISO 12945), lực kéo đứt 420N, tuổi thọ >80 chu kỳ giặt êm, tặng kèm túi giặt lưới dệt mịn micro-mesh.

77. **Hồ Sơ Tủ Đồ Số & Cam Kết Tương Thích Số Đo (USER-FIT-WARDROBE-INTEGRATION-01)**:
   - Hồ sơ: Module 01 Trưng bày Sản phẩm & Module 07 Cá nhân hóa Người dùng và Quản trị Tủ đồ Cá nhân.
   - Thực tế: Phân hệ tủ đồ số tại `/tai-khoan`: Tương thích sinh trắc học Fashion Passport đạt 98%, hiệu suất sử dụng tủ đồ nhộng 82% (41/50 ngày diện), kiểm tra độ khớp từng món trong tủ và cam kết đổi size tốc hành 24-48h tận nhà 0đ nếu lệch >2cm (Fit Guarantee).

78. **Két Bảo An & Tiến Trình Phục Hồi Vi Điểm (VAS-RESTORATION-VAULT-TRACKER-01)**:
   - Hồ sơ: Module 02 Chăm Sóc Đồ Hiệu & Dịch Vụ Giá Trị Gia Tăng (VAS Care & High-Security Vault).
   - Thực tế: Phân hệ két bảo an tại `/vas-care`: Két chống ẩm 45-50% RH (`#VAULT-NEX-882041`), 4 chặng phục hồi vi điểm (Soi quang học 1000 Lux, Enzyme sinh học pH 6.2, Căn chỉnh laser 3D, Niêm phong Zip-seal tamper-evident) và kính hiển vi quang học 50x.

79. **Radar Tương Thích Phong Cách & Chỉ Số Hòa Sắc Đa Chiều (CAT-STYLE-COMPATIBILITY-RADAR-01)**:
   - Hồ sơ: Module 01 Trưng bày Sản phẩm & Module 06 Studio Mix & Match và Lookbook OOTD.
   - Thực tế: Phân hệ radar thẩm mỹ tại `/phoi-do`: Điểm hòa hợp 95.0/100, 5 trục đối sánh (Bảng màu 96%, Phom dáng 94%, Chất liệu 95%, Ngữ cảnh 98%, Khí hậu 92%) và nhãn giám tuyển AI Stylist.

80. **Tuyến Giao Hàng Xanh & Trung Hòa Carbon (CART-CARBON-TAX-OFFSET-01)**:
   - Hồ sơ: Module 03 Giỏ hàng Thanh toán & Module 04 Bán lẻ Sàn TMĐT Bền Vững (ESG/CSR).
   - Thực tế: Phân hệ bù đắp phát thải tại `/gio-hang`: Phân tích xe điện VinFast Feliz (-0.45kg CO2e), đệm giấy tổ ong (-0.12kg CO2e), dấu chân ròng 0.08kg CO2e, tài trợ 1 mầm cây đước Rừng Cần Giờ 0đ và cấp chứng thư số `#NETZERO-XXXXXX`.

81. **Gương Soi Ảo AR & Mô Phỏng Độ Rủ Tương Tác (USER-VIRTUAL-TRYON-AR-01)**:
   - Hồ sơ: Module 01 Trưng bày Sản phẩm & Công nghệ Trải nghiệm Thực tế Tăng cường (3D/AR Drapery).
   - Thực tế: Phòng thử đồ AR tại `/san-pham/[slug]`: 3 nguồn sáng (Atelier 5500K, Nến ấm 2700K, Gallery 4000K), mô phỏng chuyển động gió 1.2 m/s, hệ số rủ 0.32, hồi nếp 96% và xuất snapshot Lookbook.

82. **Cảnh Báo Thời Tiết & Điều Phối Lộ Trình Thông Minh (ORD-DELIVERY-WEATHER-REROUTE-01)**:
   - Hồ sơ: Module 03 Quản trị Đơn hàng & Module 04 Logistics Chặng Cuối và Điều Phối An Toàn Shipper.
   - Thực tế: Phân hệ điều phối thời tiết tại `/don-hang/[id]`: Radar thời tiết đo mưa 62mm/h, nguy cơ ngập 68%, kích hoạt đệm an toàn bưu tá +25-35 phút, 3 lớp màng Bio-Cassava kháng nước, tặng +50 Điểm Xanh đền bù kiên nhẫn, gửi tin nhắn động viên tài xế và dời ca giao tối miễn phí.

83. **Thẩm Định Bao Bì Không Nhựa & Cấp Huy Hiệu Zero-Plastic (SELLER-ECO-PACKAGING-CERT-01)**:
   - Hồ sơ: Module 01 Quản trị Danh mục, Module 04 Kênh Người Bán & Bán Lẻ Bền Vững (ESG/CSR).
   - Thực tế: Phân hệ thẩm định bao bì xanh tại `/seller`: Khảo sát 4 chuẩn vật liệu (Túi màng sắn Bio-Cassava, Hộp sóng tổ ong FSC không keo, Băng keo giấy bột mì hoạt hóa nước, Tem mực đậu nành organic), cấp huy hiệu Zero-Plastic Certified (100/100) và kết nối 3 hợp tác xã bao bì xanh bản địa chiết khấu -15%.
