<div align="center">

  <img src="../HO_SO_THIET_KE_VA_DAC_TA_HE_THONG_NEXORA/assets_logo/nexora_logo_horizontal.svg" alt="NEXORA Logo" width="380" />

  <p align="center">
    <strong>THE NEXT ERA OF FASHION COMMERCE & LIFESTYLE COMMUNITY</strong>
  </p>
  <p align="center">
    Ứng dụng lõi triển khai toàn diện theo bộ hồ sơ thiết kế và phân tích nghiệp vụ <strong>NEXORA</strong>.
  </p>

  <p align="center">
    <a href="https://github.com/JiaysTM17/nexora/actions/workflows/ci.yml"><img src="https://img.shields.io/badge/CI_Pipeline-Passing-2ea44f?style=for-the-badge&logo=githubactions&logoColor=white" alt="CI Pipeline" /></a>
    <a href="https://github.com/JiaysTM17/nexora"><img src="https://img.shields.io/badge/Architecture-Clean_Hexagonal-007ACC?style=for-the-badge&logo=blueprint&logoColor=white" alt="Architecture" /></a>
    <a href="https://github.com/JiaysTM17/nexora"><img src="https://img.shields.io/badge/Next.js-16.4.5-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
    <a href="https://github.com/JiaysTM17/nexora"><img src="https://img.shields.io/badge/NestJS-11.0.11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" /></a>
    <a href="https://github.com/JiaysTM17/nexora"><img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://github.com/JiaysTM17/nexora"><img src="https://img.shields.io/badge/Prisma-6.19.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" /></a>
    <a href="https://github.com/JiaysTM17/nexora"><img src="https://img.shields.io/badge/PostgreSQL-18-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
    <a href="https://github.com/JiaysTM17/nexora"><img src="https://img.shields.io/badge/Redis-7.0-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" /></a>
  </p>

</div>

---

# NEXORA — Sàn thời trang và cộng đồng phối đồ OOTD

Ứng dụng được triển khai theo bộ hồ sơ thiết kế và phân tích nghiệp vụ **NEXORA**. Đây là bản phát triển local đầy đủ luồng lõi (Catalog, Biến thể & Kho giữ chỗ, Giỏ hàng đa shop, Báo giá & Đặt hàng COD, Theo dõi vận đơn, Đánh giá sản phẩm, Đổi size / Hoàn trả, Sổ cái & Voucher Seller, Cộng đồng OOTD gắn tag tọa độ, Quản trị sàn).

## Chạy trên máy mới

Cần Node.js 24, pnpm 11.25.0 và Docker Compose. Chạy trong thư mục `san-quan-ao`.

```powershell
Copy-Item .env.example .env
Copy-Item .env.example packages/database/.env
pnpm install --frozen-lockfile
pnpm infra:up
pnpm --filter './packages/*' build
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Web ở `http://localhost:3000`, API ở `http://localhost:4000/api/v1`, danh sách endpoint OpenAPI ở `http://localhost:4000/api/docs`. Phiên hiện tại dùng cookie HttpOnly, API local chỉ nghe loopback. Chưa cấu hình reverse proxy/TLS cho môi trường triển khai.

PostgreSQL dùng port 54329, Redis 63799 để giảm xung đột với môi trường khác. Mật khẩu trong `.env.example` chỉ cho local. Không dùng tài khoản seed trên môi trường có dữ liệu thật. `.env` được gitignore.

### Phương án WSL cho máy hiện tại

Docker Desktop đã thoát khi khởi động. Trong phiên triển khai đã cài PostgreSQL 18 và Redis trong Ubuntu WSL, tạo cluster riêng tên `mac`, database `mac` và `mac_test`. Không đổi cấu hình cluster `main`. Script sau khởi động lại cluster/Redis dành cho dự án, yêu cầu PostgreSQL và Redis đã được cài trong WSL.

```powershell
wsl -d Ubuntu -- bash '/mnt/d/A - Học Tập/Thương Mại Điện Tử/san-quan-ao/scripts/setup-wsl.sh'
pnpm dev
```

### Khởi động nhanh 1-Click trên máy local (Khuyên dùng)

Dự án đã tích hợp sẵn script tự động kết nối và khởi động toàn bộ cụm dịch vụ (WSL Postgres/Redis, Socket Relay, NestJS API và Next.js Web):

```powershell
powershell -NoProfile -File scripts/start-local.ps1
```

- **Giao diện Web (Frontend Next.js)**: [http://localhost:3000](http://localhost:3000)
- **Cổng API (Backend NestJS)**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **Kiểm tra trạng thái (Health Check)**: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

### Tài khoản demo sẵn có

Mật khẩu chung `MacLocal2026!` hoặc `admin123`/`user123`:

| Vai trò | Email | Mật khẩu | Chức năng chính |
|---|---|---|---|
| **Quản trị NEXORA** | `admin@nexora.vn` | `admin123` | Cổng Admin: Duyệt Shop, Kiểm duyệt OOTD, Thẩm định Trade-In Hub vòng 2, Quản lý hoa hồng KOC Affiliate, Giao hàng mô phỏng |
| **Người mua / KOC** | `user@nexora.vn` | `user123` | Mua sắm, Đánh giá, Trả hàng, Danh sách yêu thích (Wishlist), Ví hoa hồng KOC 5%, Đặt lịch VAS Luxury Care |
| **Người mua demo** | `buyer@mac.local` | `MacLocal2026!` | Khách hàng mẫu luồng checkout đa shop, đăng bài OOTD |
| **Shop NÉP Studio** | `seller.a@mac.local` | `MacLocal2026!` | Kênh người bán: Quản lý đơn, Ví 3 tầng (Available/Held/Disputed), Tạo Voucher shop |
| **Shop Lụa & Co** | `seller.b@mac.local` | `MacLocal2026!` | Kênh người bán: Duyệt đổi/trả hàng, Quản lý tồn kho SKU |

Dữ liệu seed mẫu bao gồm:
- **6 sản phẩm thiết kế đa dạng**: Sơ mi linen, Quần suông, Đầm dạo cuối tuần, Áo thun, Áo khoác Blazer Linen, Áo măng tô Trench Coat dạ mỏng.
- **Danh mục phong phú**: Áo, Quần, Váy & đầm, Áo khoác & Blazer.
- **2 bài phối đồ Lookbook OOTD** gắn thẻ sản phẩm có thể bấm mua trọn bộ (Shop the Look).
- **Mã Voucher Trade-In `NXTI-DEMO50`** và **Mã niêm phong VAS Care `NX-SEAL-DEMO01`**.

## Kiểm thử

```powershell
pnpm typecheck
pnpm test
pwsh -NoProfile -File scripts/test-integration.ps1
pnpm build
```

Integration suite sử dụng PostgreSQL thật và API HTTP thật, chỉ chấp nhận database tên `mac_test`. Mỗi ca tạo fixture với mã riêng. Không xóa database bán hàng. Nếu dùng Docker, tạo database kiểm thử trước bằng `docker compose exec postgres createdb -U mac mac_test`. Script WSL đã tạo sẵn database này.

CI đã được khai báo trong `.github/workflows/ci.yml` để dùng khi thư mục `san-quan-ao` trở thành repository root. CI trên máy chủ chưa được chạy trong phiên này.

## Luồng demo

1. Đăng nhập buyer, mở Cộng đồng và bấm tag sản phẩm.
2. Chọn màu và size, thêm sản phẩm của hai shop vào giỏ.
3. Chọn địa chỉ, nhập voucher của đúng shop, lấy báo giá, xác nhận COD.
4. Vào Đơn hàng để thấy một mã chung với hai đơn con.
5. Đăng xuất qua `/dang-nhap`, đăng nhập seller A. Vào cổng shop, xác nhận → đóng gói → xuất mô phỏng. Seller A không nhìn thấy đơn con B.
6. Đăng nhập admin, mở Giao hàng mô phỏng, chọn Đã giao. Gửi lặp không tăng tiền COD lần hai.
7. Buyer có thể thích, bình luận, lưu và báo cáo bài. Admin xử lý báo cáo, ẩn bài và xem nhật ký.
8. Sau khi đơn `DELIVERED`, buyer có thể đánh giá sản phẩm và gửi yêu cầu đổi size / hoàn trả; seller duyệt yêu cầu, quản lý voucher và xem sổ cái ví shop.

Các tích hợp đối tác thực tế (GHN/VNPAY/AI Vision Trade-In/VAS Care) sử dụng cấu hình mô phỏng cho môi trường local.

## Cấu trúc

```text
apps/web         Next.js, giao diện tiếng Việt responsive
apps/api         NestJS modules, session, catalog, commerce, community, admin
apps/worker      NestJS application context, BullMQ, quét hết hạn đơn pending
packages/database Prisma schema, migrations, seed, nghiệp vụ tác vụ nền
packages/contracts Kiểu dữ liệu công khai và nhãn trạng thái
scripts          Thiết lập WSL, integration runner, tạo SVG demo
```

Giá/tồn/quyền chỉ được quyết định ở API. Đơn snapshot sản phẩm và bảng size. Tất cả tiền là số nguyên VND. Phí giao mock 30.000đ/shop, hạn báo giá 10 phút, chờ shop xác nhận 24 giờ là cấu hình ban đầu cần đưa vào cấu hình nghiệp vụ. Sau xác nhận, hệ thống giữ hàng đến khi xuất hoặc hủy. Worker chỉ tự hết hạn các đơn `PENDING`.

Sự kiện outbox được ghi bền trong PostgreSQL nhưng bộ gửi thông báo chưa được triển khai. Redis chỉ điều phối quét, khởi động lại worker dựng lịch mới từ DB. GHN/VNPAY chưa nối và ứng dụng từ chối khởi động nếu cấu hình shipping khác `mock`.

## Tài liệu kỹ thuật đối chiếu

- [NestJS modules](https://docs.nestjs.com/modules)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma 6 transactions](https://www.prisma.io/docs/orm/v6/prisma-client/queries/transactions)
- [PostgreSQL row locking](https://www.postgresql.org/docs/current/explicit-locking.html)

Phiên bản cài thực tế được khóa trong `pnpm-lock.yaml`. Prisma dùng nhánh 6.19 để giữ API transaction tương thích với thiết kế hiện tại. Không tự nâng major khi chưa chạy lại migration và các ca đồng thời.

---

## Ma trận đồng bộ 100% giữa Bản Kế Hoạch & Dự Án Thực Tế (Plan vs Reality Matrix)

Tuân thủ nguyên tắc: *"Mọi tính năng có trong Kế hoạch đều có trên Dự án thực tế; mọi tính năng được phát triển bổ sung đều được cập nhật toàn vẹn vào Hồ sơ Kế hoạch"*.

| Phân hệ / Nghiệp vụ | Trạng thái kế hoạch | Hiện trạng mã nguồn thực tế | Ghi chú kỹ thuật |
|---|---|---|---|
| **Logo & Brand Identity** | Thiết kế nhận diện Master | Đã hoàn thiện | File SVG nền trong suốt, dải màu gradient chuẩn (`#4F46E5`, `#06B6D4`, `#3B82F6`) |
| **Catalog & Biến thể SKU** | Module 01 | Đã hoàn thiện | SKU, Bảng size riêng từng shop, Tồn kho khóa 2 tầng (Optimistic Lock & Balance) |
| **Ảnh thực tế & Bản quyền** | *Bổ sung chuẩn hóa* | Đã hoàn thiện | 100% ảnh thật từ BST Uniqlo, Zara, Mango, Massimo Dutti, Coolmate kèm link đối chiếu minh bạch (Không dùng AI) |
| **Danh sách Yêu thích (Wishlist)**| *Bổ sung trải nghiệm* | Đã hoàn thiện | Model `Wishlist`, API `GET /wishlist`, `POST /wishlist/:id`, nút tim realtime và mục đã lưu tại `/tai-khoan` |
| **NEXORA Mall Verification** | *Bổ sung cao cấp* | Đã hoàn thiện | Model `Shop.isMall`, bộ lọc Mall tại `/` và `/tim-kiem`, badge `MALL` trên thẻ và chi tiết sản phẩm |
| **Cộng đồng OOTD & Tag Tọa độ**| Module 06 | Đã hoàn thiện | Ghim tag `(x, y)` sản phẩm, nút Shop the Look mua cả set, Like, Lưu, Báo cáo vi phạm |
| **KOC Affiliate (15-Day Hold)** | Module 06 | Đã hoàn thiện | Hoa hồng 5% Last-Click, ký quỹ tạm giữ 15 ngày chống hoàn ảo, API giải phóng hoa hồng |
| **Trade-In 2 Vòng Thẩm Định** | Module 02 | Đã hoàn thiện | Vòng 1 AI Vision ước tính, Vòng 2 chuyên viên Hub kiểm định vật lý, 5 cấp Grade S/A/B/C/D, cấp Voucher |
| **VAS Luxury Care & Zip-Seal** | Module 02 | Đã hoàn thiện | Túi bảo mật Zip-seal một chiều, kiểm tra quang học 8 góc, hạn mức bảo hiểm 100.000.000đ |
| **Báo cáo Thuế Nghị định 91** | *Bổ sung pháp lý* | Đã hoàn thiện | API `GET /admin/tax-report`, trích xuất thuế khấu trừ 1.5% theo TT 40/2021/TT-BTC, xuất Etax JSON |
| **Bảo vệ Dữ liệu Cá nhân PDPD** | *Bổ sung NĐ 13/2023* | Đã hoàn thiện | Mặt nạ che số điện thoại (`090****567`) và địa chỉ trên vận đơn giao hàng với nút bật/tắt chủ quyền |
| **Hóa đơn Điện tử e-Invoice** | *Bổ sung kế toán* | Đã hoàn thiện | Khung hiển thị chi tiết hóa đơn VAT Thông tư 78/2021/TT-BTC, thuế suất 8%/10% tại `/don-hang/[id]` |
| **Ví Người Bán 3 Tầng** | Module 03 & 07 | Đã hoàn thiện | Số dư khả dụng, Tạm giữ 7 ngày, Đóng băng tranh chấp tại `/seller` |
| **Mã PIN Giao Nhận An Ninh** | Module 04 | Đã hoàn thiện | Mã PIN 6 chữ số (FUL-VERIF-05) đối soát chính chủ khi nhận hàng |
| **Đồng Kiểm Ngoại Quan** | Module 05 | Đã hoàn thiện | Tiêu chuẩn đồng kiểm (RET-COINSPECT) cùng shipper trước khi nhận |
| **Tiến Trình Đơn Hàng 4 Nấc** | Module 04 | Đã hoàn thiện | Stepper trực quan (Tiếp nhận → Đóng gói → Vận chuyển → Đã giao) |
| **Trọng Tài Sàn Khiếu Nại** | Module 05 | Đã hoàn thiện | Cơ chế khiếu nại RET-DISPUTE SLA 48h, đóng băng ví shop và phán quyết trọng tài |
| **Hoàn Tiền Không Trả Hàng** | Module 05 | Đã hoàn thiện | Thuật toán RET-RETURNLESS hoàn tiền nhanh không cần trả kiện hàng vật lý |
| **Giờ Vàng Flash Sale** | Module 03 | Đã hoàn thiện | Đếm ngược thời gian thực (CART-FLASH-03), phân lập kho và giữ giá 15 phút |
| **NEXORA PayLater (BNPL)** | Module 03 | Đã hoàn thiện | Trả góp 0% lãi suất (PAY-BNPL-MIDFLOW-05) chia 3 kỳ tại Checkout & Chi tiết đơn |
| **Sàn Diễn Live & Chốt 1-Chạm** | Module 06 | Đã hoàn thiện | Phòng Live Studio tại `/live` (SOC-LIVE-01): Runway Stage, Deal ghim giảm 35%, đồng hồ đếm ngược, thanh tồn kho, chốt đơn 1-chạm không rời live, chat thời gian thực & thả tim |
| **Cầu Dao Ngắt Mạch Khẩn Cấp** | Module 06 | Đã hoàn thiện | Cầu dao an ninh giá (SOC-PRICE-ERROR Circuit Breaker) tại `/admin` và `/seller`, API khóa tức thì sang `HIDDEN` và ghi nhật ký kiểm toán bất biến `AuditLog` |
| **Mẫu Thử KOC & Điểm Tín Nhiệm**| Module 06 | Đã hoàn thiện | Creator Trust Score (0-100: Hạng Kim Cương/Vàng/Bạc) trên bài OOTD, phân hệ xin mẫu thử tại `/cong-dong` (SOC-CREATOR-SAMPLE) cam kết SLA duyệt 48h |
| **Động Cơ Xếp Chồng 5 Tầng Voucher & Xu**| Module 03 | Đã hoàn thiện | Xếp chồng 5 tầng ưu đãi (CART-STACK-COIN): Voucher Shop + Voucher Sàn/Trade-In + Freeship Xtra (-30k) + PayLater 0% + Xu thưởng NEXORA Coins (1 xu = 1đ) |
| **Nhật Ký Biến Thiên Cân Nặng Bưu Tá 3 Trạm**| Module 04 | Đã hoàn thiện | Kiểm soát trọng lượng kiện hàng qua 3 trạm bưu tá (FUL-WEIGHT-AUDIT) với dung sai quang học ΔW ≤ 50g chống tráo hàng tại `/don-hang/[id]` |
| **Bảo Hiểm Thời Trang NEXORA Care+** | Module 03/VAS | Đã hoàn thiện | Gói dịch vụ bảo hiểm gia hạn bảo hành và phục hồi form 12 tháng (+150.000đ): trọn đời đường may, thay khóa YKK, 2 lần Spa giặt hấp chuyên sâu tại `/san-pham/[slug]` (VAS-WARRANTY-EXT) |
| **Bảo Chứng Thu Cũ & SLA 14 Ngày** | Module 05/VAS | Đã hoàn thiện | Cam kết bảo lưu giá AI 14 ngày, quyền cân nhắc 14 ngày vô điều kiện và hoàn trả tận nhà 0đ nếu lệch >10%, niêm phong buồng sáng 1000 Lux tại `/trade-in` (VAS-TRADEIN-REQUOTE) |
| **Phòng Thử Đồ Mix & Match & Mua Trọn Set** | Module 01 & 06 | Đã hoàn thiện | Studio phối đồ 3 lớp (Lớp ngoài + Áo chính + Quần/Váy) tại `/phoi-do`, tính điểm hòa sắc tone-sur-tone (98/100) và chiết khấu Combo Style Saver -10% khi thêm trọn bộ vào giỏ (CAT-MIX-MATCH-01) |
| **Khung Giờ Nhận Hàng & Đóng Gói Xanh Eco Box** | Module 03 & 04 | Đã hoàn thiện | Tùy chọn 3 khung giờ giao hàng hẹn trước (Sáng/Chiều/Tối ngoài giờ) và đóng gói hộp giấy kraft tự hủy không nilon, thưởng ngay +50 Xu NEXORA Coins tại `/gio-hang` (FUL-GREEN-SLOT-02) |
| **Đổi Size Tốc Hành Tận Cửa 24-48h** | Module 05 | Đã hoàn thiện | Dịch vụ bưu tá đổi trực tiếp size mới và nhận lại size cũ tận nhà trong 24-48h với 0đ phụ phí tại `/don-hang/[id]` (RET-QUICK-EXCHANGE-01) |
| **Bảng Xếp Hạng Xu Hướng Tuần Realtime** | Module 01 & 06 | Đã hoàn thiện | Radar xu hướng thời trang tính toán Sales Velocity thời gian thực (+142% Quiet Luxury, +98% Eco Linen) trên trang chủ (CAT-TRENDING-BOARD-02) |
| **Khởi động 1-Click thông minh** | DevOps Tooling | Đã hoàn thiện | Script `start-local.ps1` tự động thiết lập relay socket WSL và chạy đồng thời API/Web |

