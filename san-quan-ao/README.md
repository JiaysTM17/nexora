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

### Tài khoản demo

Mật khẩu chung `MacLocal2026!`. Đây là dữ liệu phát triển, không gửi email hay thanh toán thật.

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị NEXORA | admin@nexora.vn | admin123 |
| Người mua NEXORA | user@nexora.vn | user123 |
| Người mua demo | buyer@mac.local | MacLocal2026! |
| Shop NÉP Studio | seller.a@mac.local | MacLocal2026! |
| Shop Lụa & Co / Mộc Everyday | seller.b@mac.local | MacLocal2026! |
| Quản trị sàn | admin@mac.local | MacLocal2026! |

Seed chạy lại không ghi đè dữ liệu đang thử. Có 2 shop, 4 mẫu, 24 SKU, 1 bài phối đồ gắn 2 sản phẩm và 1 địa chỉ mẫu. Áo sơ mi màu đen chỉ còn L với tồn 1. Voucher `CHAO50` của Nếp giảm 50.000đ cho đơn từ 400.000đ. Hình minh họa SVG được viết riêng cho bộ dữ liệu mẫu.

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
