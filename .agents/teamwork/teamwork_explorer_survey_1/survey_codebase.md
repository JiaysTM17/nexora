# Báo Cáo Khảo Sát Hiện Trạng Codebase Nexora (san-quan-ao)

**Thời gian khảo sát:** 2026-11-12T08:35:00Z  
**Khảo sát viên:** Survey Explorer 1 (`teamwork_explorer_survey_1`)  
**Thư mục làm việc dự án:** `D:\A - Học Tập\Thương Mại Điện Tử\san-quan-ao`  
**Git Repository Root:** `D:\A - Học Tập\Thương Mại Điện Tử`  
**Remote Git:** `https://github.com/JiaysTM17/nexora.git` (branch `main`, gh auth: `JiaysTM17`)

---

## 1. Tổng Quan Kiến Trúc Monorepo

Hệ thống được tổ chức dưới dạng monorepo hiện đại quản lý bằng **pnpm workspace** (pnpm v11.25.0, Node.js v24.21.0), cấu hình phân tầng độc lập giữa cơ sở dữ liệu (`packages/database`), hợp đồng dữ liệu giao tiếp (`packages/contracts`), REST API backend (`apps/api`), background worker (`apps/worker`), và giao diện web người dùng (`apps/web`).

### 1.1 Cấu trúc Monorepo & Cấu hình Gốc
- **File cấu hình workspace:** `pnpm-workspace.yaml`
  ```yaml
  packages:
    - apps/*
    - packages/*
  allowBuilds:
    '@prisma/client': true
    '@prisma/engines': true
    prisma: true
    esbuild: true
    sharp: true
    '@nestjs/core': true
  ```
- **Root `package.json`:**
  - `name`: `mac-marketplace`
  - `version`: `0.1.0`
  - `packageManager`: `pnpm@11.25.0`
  - `engines`: `{ "node": ">=22.12" }`
  - `scripts`:
    - `predev`: `pnpm --filter './packages/*' build`
    - `dev`: `pnpm --parallel --filter './apps/*' dev`
    - `build`: `pnpm --filter @mac/database generate && pnpm -r build`
    - `typecheck`: `pnpm -r typecheck`
    - `test`: `pnpm --filter @mac/api test`
    - `test:integration`: `pnpm --filter @mac/api test:integration`
    - `db:generate`: `pnpm --filter @mac/database generate`
    - `db:migrate`: `pnpm --filter @mac/database migrate`
    - `db:seed`: `pnpm --filter @mac/database seed`
    - `infra:up`: `docker compose up -d`
    - `infra:down`: `docker compose down`
- **Môi trường & Hạ tầng (`docker-compose.yml`, `.env.example`):**
  - PostgreSQL 17 Alpine (`127.0.0.1:54329`, db: `mac`, user: `mac`)
  - Redis 7 Alpine (`127.0.0.1:63799`)
  - MinIO S3 Object Storage (`127.0.0.1:9009` API, `9010` Console)

---

## 2. Chi Tiết Các Gói (Packages) và Ứng Dụng (Apps)

### 2.1 `packages/database` (Cơ Sở Dữ Liệu & Prisma ORM)
- **Công nghệ:** Prisma ORM v6.19.3 (`@prisma/client` và CLI `prisma`).
- **Thư mục:** `packages/database/`
  - `prisma/schema.prisma`: Đã định nghĩa 35 models và 6 enums phục vụ sàn thương mại điện tử cốt lõi ban đầu (User, Session, Shop, ShopMember, Address, Category, Product, ProductImage, SizeChartVersion, Variant, InventoryBalance, StockMovement, CartLine, Voucher, CheckoutQuote, Order, ShopOrder, OrderItem, Reservation, Shipment, ProviderEvent, SellerLedgerEntry, ReturnRequest, ReturnItem, Post, PostMedia, ProductTag, Follow, Reaction, SavedPost, Comment, Report, Review, AuditLog, OutboxEvent).
  - `prisma/migrations/`: 2 migration SQL đã áp dụng (`202611060001_initial`, `202611060002_constraints`).
  - `src/index.ts`: Re-export `PrismaClient`, `Prisma`, các kiểu dữ liệu generated, và hàm bảo trì `expirePendingOrders`.
  - `src/jobs.ts`: Triển khai hàm `expirePendingOrders` chạy giao dịch Serializable với cơ chế tự động thử lại khi gặp lỗi conflict `P2034`, hủy đơn hàng quá hạn giữ (`holdUntil`), giải phóng số lượng giữ hàng (`Reservation` -> `RELEASED`, decrement `InventoryBalance.reserved`), hoàn trả voucher và ghi nhận outbox event.
  - `src/seed.ts`: Script khởi tạo dữ liệu mẫu gồm 4 tài khoản (`buyer-demo`, `seller-a`, `seller-b`, `admin-demo`), 3 danh mục thời trang (`ao`, `quan`, `vay`), 2 shop độc lập (`Nếp Studio` tại TP.HCM, `Mộc Everyday` tại Đà Nẵng), 4 sản phẩm chính, 24 SKU đa biến thể kèm bảng thông số size chi tiết (Garment measurements) và bài đăng phối đồ outfit đầu tiên.
- **Hiện trạng kiểm tra:** Chạy `pnpm --filter @mac/database generate && tsc` thành công tuyệt đối 100%, không có lỗi typecheck.

### 2.2 `packages/contracts` (Data Contracts & DTOs)
- **Công nghệ:** TypeScript contract package (`@mac/contracts`).
- **Thư mục:** `packages/contracts/src/index.ts`.
- **Hiện trạng:** Rất tinh gọn (16 dòng mã nguồn), hiện chỉ định nghĩa:
  - `Money`: Kiểu số nguyên VND (tránh lỗi làm tròn số thực).
  - `QuoteItem`, `QuoteShop`, `QuoteData`: Cấu trúc báo giá checkout đa shop.
  - `PublicUser`: Thông tin người dùng công khai.
  - `ORDER_LABELS`: Ánh xạ nhãn trạng thái đơn hàng tiếng Việt (`PENDING`, `CONFIRMED`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `DELIVERY_FAILED`, `RETURNED`).
- **Khoảng trống cần bổ sung theo R1:** Cần mở rộng định nghĩa data contracts/DTOs cho 14 bảng nghiệp vụ cốt lõi theo đặc tả hệ thống (Trade-in thời trang 2 vòng, VAS Care giặt hấp/spa đồ hiệu, Ví người bán 3 tầng, Khấu trừ thuế TT40, Xuất hóa đơn TT78, Mặt nạ vận đơn PDPD, 3-Strike NDR, và Chống gian lận).

### 2.3 `apps/api` (Backend REST API)
- **Công nghệ & Framework:** NestJS v11 (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/swagger`, `@nestjs/throttler`), Express engine, Zod validator, Helmet, Cookie Parser.
- **Cấu trúc & Nguyên tắc thiết kế:**
  - `src/main.ts`: Khởi động ứng dụng NestJS tại port 4000 (mặc định), cấu hình tiền tố toàn cục `api/v1`, CORS credentials, bảo vệ CSRF nghiêm ngặt (chặn request mutating thiếu header `X-Requested-With: mac-web` hoặc sai Origin), filter bắt lỗi toàn cục `Errors`, tích hợp Swagger UI tại `/api/docs`.
  - `src/common.ts`: Chứa thuật toán phân bổ giảm giá theo phương pháp phần dư lớn nhất (`allocateDiscount` - Largest Remainder Method), bảo toàn từng đồng VND, các Zod schema chung (`money`, `addressInput`, `id`), và ExceptionFilter xử lý lỗi Prisma/Zod/HttpException chuẩn REST API.
  - `src/db.ts`: Provider `Db` kế thừa `PrismaClient` với hàm bọc giao dịch mức độ cô lập `serial` (`Serializable`) tự động retry khi gặp serialization deadlock/contention.
  - `src/auth.ts`: Module xác thực session cookie HttpOnly (`mac_session`), mã hóa mật khẩu an toàn với thuật toán `scrypt` kèm salt ngẫu nhiên và so sánh thời gian bất biến (`timingSafeEqual`), các guard phân quyền `SignedIn`, `AdminOnly`.
  - `src/catalog.ts`: Quản lý danh mục, tìm kiếm sản phẩm phân trang kết hợp nhiều điều kiện (từ khóa, màu sắc, size, lọc còn hàng tồn theo SKU), quản lý shop của seller, tạo sản phẩm mới kèm bảng size và SKU inventory, điều chỉnh tồn kho SKU.
  - `src/commerce.ts`: Quy trình thương mại điện tử cốt lõi: quản lý sổ địa chỉ giao hàng, giỏ hàng người dùng, báo giá checkout đa shop (`checkout/quote`), tạo đơn hàng với khóa chống trùng lặp (`idempotencyKey`), giữ hàng tồn tạm thời (`Reservation`), chia đơn theo từng shop (`ShopOrder`), hủy đơn, quy trình chuyển trạng thái đơn hàng của seller (`CONFIRMED` -> `PACKED` -> `SHIPPED`).
  - `src/community.ts`: Mạng xã hội OOTD: cấp feed bài viết thời trang, ghim tag sản phẩm theo tọa độ hình ảnh (`x, y, mediaPosition`), tương tác thả tim (`like`), lưu bài (`save`), bình luận (`comment`), theo dõi người dùng (`follow`), báo cáo bài viết vi phạm (`report`).
  - `src/admin.ts`: Cổng quản trị sàn: tổng quan số liệu thống kê (shop, đơn hàng, báo cáo, người dùng), duyệt/đình chỉ shop, xử lý bài viết vi phạm, xem nhật ký kiểm toán hệ thống (`auditLog`), danh sách vận đơn và bộ mô phỏng sự kiện vận chuyển mock carrier.
- **Kiểm thử tự động:**
  - `test/unit.test.ts`: Bộ kiểm thử đơn vị kiểm tra tính toàn vẹn của thuật toán chia giảm giá không để mất đồng nào và fail-closed khi dữ liệu sai.
  - `test/integration.test.ts`: 10 kịch bản kiểm thử tích hợp chuyên sâu bao gồm xác thực phiên, tìm kiếm SKU, tranh chấp đặt hàng đồng thời trên món cuối cùng, tự động từ chối khi giá thay đổi, hủy đơn độc lập giữa nhiều shop, sự kiện giao hàng trùng lặp/đến muộn, và hủy đơn quá hạn bằng worker.

### 2.4 `apps/worker` (Background Worker Process)
- **Công nghệ & Framework:** Standalone NestJS application context kết hợp **BullMQ v5** và **ioredis v5**.
- **Cấu trúc:** `apps/worker/src/main.ts`
  - Kết nối Redis thông qua `REDIS_URL` (`redis://localhost:63799`).
  - Khởi tạo queue `mac-maintenance` và worker xử lý đồng thời (`concurrency: 1`).
  - Lịch trình định kỳ: `upsertJobScheduler('expire-pending-orders', { every: 30000 })` quét cơ sở dữ liệu mỗi 30 giây để xử lý các đơn hàng `PENDING` quá hạn giữ chỗ (`holdUntil`).
- **Khoảng trống cần bổ sung theo R2:** Cần mở rộng thêm các job/worker xử lý tác vụ nền cho:
  - Thẩm định và nhắc lịch giao nhận gói đồ Trade-In thời trang.
  - Quản lý vòng đời dịch vụ chăm sóc cao cấp VAS Care (nhắc hẹn, phân bổ kỹ thuật viên, chuyển trạng thái giặt hấp/spa).
  - Đối soát thanh toán VietQR và tự động xác nhận đơn hàng khi nhận IPN/Webhook.
  - Đối soát và giải phóng số dư ví người bán (chuyển từ số dư chờ đối soát sang khả dụng sau thời gian khiếu nại).
  - Tự động kết xuất hóa đơn điện tử TT78 và tính khấu trừ thuế TT40.
  - Quét cảnh báo chống gian lận và đánh giá chỉ số rủi ro đơn hàng / tài khoản.
  - Cập nhật số lần giao thất bại (3-Strike NDR) và tự động chuyển về trả hàng.

### 2.5 `apps/web` (Giao Diện Frontend Web Next.js)
- **Công nghệ & Framework:** Next.js v16.4.5 (App Router), React v19.2.0, Tailwind CSS v4.1.0, Lucide React icons.
- **Cấu hình:** `next.config.ts` với `transpilePackages: ['@mac/contracts']`, build target sử dụng webpack compiler.
- **Cấu trúc trang (`apps/web/app/`):**
  - `layout.tsx`: Root Layout định nghĩa metadata, typography và bao bọc toàn bộ ứng dụng trong component giao diện chung `Shell`. Đã được cập nhật thương hiệu NEXORA.
  - `page.tsx`: Trang chủ Khám phá Sản phẩm với bộ lọc đa tiêu chí (danh mục, màu sắc, size, trạng thái còn hàng), banner cộng đồng thời trang.
  - `san-pham/[slug]/page.tsx`: Trang Chi tiết Sản phẩm với gallery hình ảnh theo màu sắc, bộ chọn biến thể SKU, hiển thị tồn kho thời gian thực, bảng thông số kích cỡ đo đạc chi tiết (Size Chart), chính sách đổi size của shop, và nút thêm vào giỏ hàng.
  - `cong-dong/page.tsx`: Mạng xã hội OOTD với feed bài đăng, hiển thị pin tag tọa độ tương tác trực tiếp dẫn tới sản phẩm của từng shop, modal chia sẻ bộ đồ phối mới, tương tác like/save/comment/report.
  - `gio-hang/page.tsx`: Giỏ hàng và Checkout đa shop với cơ chế báo giá thời gian thực từ server, quản lý sổ địa chỉ giao nhận, áp mã voucher riêng cho từng shop, tổng kết tiền hàng và phí vận chuyển, nút xác nhận đặt hàng COD với khóa chống trùng lặp.
  - `don-hang/page.tsx`: Trang quản lý và tra cứu đơn hàng của người mua, xem chi tiết từng đơn hàng con theo shop, trạng thái vận đơn, và tính năng hủy đơn trước khi shop đóng gói/xuất kho.
  - `seller/page.tsx`: Cổng thông tin người bán (Seller Portal) cho phép đăng ký mở shop, xem danh sách đơn hàng cần xử lý và chuyển đổi trạng thái đơn (Xác nhận -> Đóng gói -> Xuất hàng), đăng tải sản phẩm mới kèm bảng size, và điều chỉnh tồn kho SKU.
  - `admin/page.tsx`: Cổng quản trị sàn (Admin Portal) xem số liệu tổng quan hệ thống, phê duyệt/tạm dừng hoạt động của shop, xử lý bài đăng bị báo cáo, mô phỏng sự kiện giao vận mock carrier, và theo dõi nhật ký kiểm toán hệ thống (Audit Log).
  - `dang-nhap/page.tsx`: Trang đăng nhập và đăng ký tài khoản người dùng/người bán.
  - `ui.tsx` & `api.ts`: Bộ UI kit cơ bản và client fetch API tích hợp hook `useResource` quản lý trạng thái tải/dữ liệu tự động.
- **Hiện trạng kiểm tra:** Chạy `pnpm --filter @mac/web build` thành công xuất sắc, Next.js build và prerender toàn bộ 9 route tĩnh/động không phát sinh bất kỳ lỗi compile nào.

---

## 3. Khảo Sát Hệ Thống Git & Quản Lý Mã Nguồn

| Thông số | Giá trị quan sát |
|---|---|
| **Git Working Directory** | `D:\A - Học Tập\Thương Mại Điện Tử` |
| **Current Branch** | `main` |
| **Tracking Remote** | `origin/main` (Up to date) |
| **Remote Origin URL** | `https://github.com/JiaysTM17/nexora.git` |
| **Commit Gần Nhất** | `a5b7e98 feat(nexora): initial release of Nexora Fashion E-Commerce platform and system architecture documentation` |
| **GitHub CLI (`gh`)** | Đã xác thực tài khoản `JiaysTM17` (protocols: https, scopes: gist, read:org, repo, workflow) |
| **Git User Config** | Name: `Kiệt Trương`, Email: `truonggiakiet110806@gmail.com` |
| **Uncommitted Changes** | 5 files modified (`apps/web/app/layout.tsx`, `page.tsx`, `ui.tsx`, `next.config.ts`, `package.json`), 2 untracked files (`public/nexora-icon.svg`, `public/nexora-logo.svg`) |

---

## 4. Đối Chiếu Yêu Cầu Dự Án (ORIGINAL_REQUEST.md) & Phân Tích Khoảng Trống (Gap Analysis)

Dựa trên yêu cầu nghiệp vụ chi tiết của dự án Nexora và hồ sơ thiết kế trong thư mục `HO_SO_THIET_KE_VA_DAC_TA_HE_THONG_NEXORA` và `BAO_CAO_NGHIEP_VU_WORD/02_Dac_Ta_Cac_Module_He_Thong`, dưới đây là ma trận đối chiếu hiện trạng và các hạng mục cần triển khai:

| Hạng mục / Yêu cầu cốt lõi | Hiện trạng trong Codebase | Khoảng trống cần triển khai (Gaps) |
|---|---|---|
| **R1. Prisma Schema & Data Contracts** | Có 35 bảng sàn cơ bản (User, Shop, Product, Order, Inventory, Post). Contracts chỉ có 16 dòng. | **Cần bổ sung 14 bảng nghiệp vụ cốt lõi:**<br>1. Trade-in yêu cầu thu cũ (`TradeInRequest`, `TradeInItem`, `TradeInEvaluation`, `TradeInVoucher`)<br>2. Dịch vụ VAS Care (`VasPackage`, `VasBooking`, `VasBookingItem`, `VasTicket`)<br>3. Ví người bán 3 tầng (`SellerWallet`, `SellerWalletHold`, `SellerPayoutRequest`)<br>4. Khấu trừ thuế TT40 (`TaxDeductionRecord`)<br>5. Hóa đơn điện tử TT78 (`EInvoiceRecord`)<br>6. Mặt nạ vận đơn PDPD (`ShippingLabelMask`)<br>7. 3-Strike NDR (`NdrStrikeRecord`, `NdrAttemptLog`)<br>8. Chống gian lận (`FraudRiskScore`, `FraudRuleCheckLog`) |
| **R2. Backend REST API (`apps/api`)** | Đã có auth, catalog, commerce cơ bản, community, admin cơ bản. | **Cần bổ sung/mở rộng các domain REST API:**<br>- API Trade-In (gửi yêu cầu thu cũ, định giá 2 vòng, sinh voucher đổi mới).<br>- API VAS Care (đặt lịch giặt hấp/spa đồ hiệu, cập nhật tiến trình ticket).<br>- API Thanh toán VietQR (tạo QR code VietQR chuẩn NAPAS 247, webhook xử lý thanh toán).<br>- API Ví người bán (truy vấn 3 tầng số dư: chờ đối soát, khả dụng, đã rút).<br>- API Kế toán thuế TT40 & Hóa đơn TT78 (tính thuế khấu trừ, xuất hóa đơn điện tử).<br>- API Mặt nạ PDPD & NDR 3-Strike (ẩn thông tin nhạy cảm trên vận đơn, ghi nhận lịch sử giao bất thành). |
| **R3. Background Worker (`apps/worker`)** | Chỉ có 1 cron job `expire-pending-orders` (hủy đơn quá hạn 30s). | **Cần bổ sung các BullMQ job xử lý nền:**<br>- Job đối soát thanh toán VietQR tự động.<br>- Job đáo hạn số dư ví người bán (sau 7 ngày giao thành công không khiếu nại).<br>- Job quét và nhắc việc thẩm định Trade-In & VAS Care.<br>- Job đồng bộ hóa đơn điện tử TT78.<br>- Job tự động kích hoạt chế độ NDR 3-Strike khi đơn giao thất bại 3 lần. |
| **R4. Frontend Web (`apps/web`)** | Giao diện Next.js 16 App Router sạch sẽ, hỗ trợ discovery, detail, community OOTD, cart COD, seller, admin cơ bản. | **Cần hoàn thiện các luồng giao diện mới:**<br>- Luồng đăng ký & theo dõi Thu cũ đổi mới Trade-In (khảo sát tình trạng đồ cũ, nhận ước tính voucher).<br>- Luồng đặt dịch vụ chăm sóc cao cấp VAS Care (chọn gói giặt hấp/spa/bảo dưỡng đồ hiệu, chọn ngày hẹn).<br>- Phương thức thanh toán VietQR với mã QR hiển thị trực tiếp và bộ đếm thời gian thanh toán.<br>- Bảng điều khiển tài chính ví người bán 3 tầng trong trang `/seller`.<br>- Bổ sung tab kiểm tra hóa đơn TT78 & mặt nạ vận đơn PDPD trong đơn hàng. |
| **R5. Quy trình Git & GitHub** | Repo sạch, remote origin kết nối `JiaysTM17/nexora`, gh CLI sẵn sàng. | Bắt buộc thực hiện commit và push liên tục theo chuẩn Conventional Commits cho từng gói công việc hoàn thành. |

---

## 5. Kết Luận & Khuyến Nghị Thực Hiện

1. **Nền tảng codebase hiện tại cực kỳ vững chắc:** Monorepo được tổ chức chuẩn mực, `pnpm typecheck` và `pnpm build` toàn hệ thống đều đạt Exit code 0, các bài test tích hợp phản ánh đúng tư duy kiến trúc bất biến (Serializable isolation, không âm tồn kho, idempotency key).
2. **Kế hoạch triển khai chia pha đề xuất:**
   - **Pha 1 (Data Layer):** Cập nhật `packages/database/prisma/schema.prisma` cho đầy đủ 14 bảng nghiệp vụ, chạy `prisma generate`, tạo migration/seed script, và đồng bộ toàn bộ DTOs/types sang `packages/contracts`. Commit & push GitHub.
   - **Pha 2 (Backend Core & Worker):** Triển khai các module Clean Architecture mới trong `apps/api` (Trade-in, VAS Care, VietQR, Wallet, Tax/Invoice, PDPD, NDR) và bổ sung các processor tương ứng trong `apps/worker`. Commit & push GitHub.
   - **Pha 3 (Frontend Web):** Xây dựng các trang và component giao diện người dùng mới trong `apps/web` (Trade-in, VAS Care, VietQR Checkout, Seller Wallet, TT78 Viewer). Commit & push GitHub.
   - **Pha 4 (End-to-End Validation & Sync):** Chạy `pnpm typecheck`, `pnpm build`, `pnpm test`, đối soát chất lượng toàn cục và đẩy commit hoàn thiện lên `origin/main`.
