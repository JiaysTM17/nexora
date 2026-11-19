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
