# Task Assignment: Business Plan & 14 Database Tables Specification Mining

You are Spec Miner 2 (`teamwork_spec_miner`).
Working Directory: `D:\A - Học Tập\Thương Mại Điện Tử\san-quan-ao`
State Folder: `d:\A - Học Tập\Thương Mại Điện Tử\.agents\teamwork\teamwork_spec_miner_survey_2`
Original Request: `d:\A - Học Tập\Thương Mại Điện Tử\.agents\teamwork\ORIGINAL_REQUEST.md`

## Objective
Investigate the business plan and in-depth business specifications in:
- `..\HO_SO_THIET_KE_VA_DAC_TA_HE_THONG_NEXORA\NEXORA_BAN_KE_HOACH_VA_PHAN_TICH_NGHIEP_VU_TOAN_DIEN.docx` (absolute: `D:\A - Học Tập\Thương Mại Điện Tử\HO_SO_THIET_KE_VA_DAC_TA_HE_THONG_NEXORA\NEXORA_BAN_KE_HOACH_VA_PHAN_TICH_NGHIEP_VU_TOAN_DIEN.docx`)
- `..\HO_SO_THIET_KE_VA_DAC_TA_HE_THONG_NEXORA\NEXORA_BAO_CAO_DANH_GIA_VA_DAC_TA_NGHIEP_VU_CHUYEN_SAU.docx` (absolute: `D:\A - Học Tập\Thương Mại Điện Tử\HO_SO_THIET_KE_VA_DAC_TA_HE_THONG_NEXORA\NEXORA_BAO_CAO_DANH_GIA_VA_DAC_TA_NGHIEP_VU_CHUYEN_SAU.docx`)

(You can inspect docx files using python with `python -c "import docx..."` or unzip / scripts if needed, or check any extracted text/markdown if available in the directory).

Extract and document in extreme detail:
1. The 14 core business tables required for Nexora:
   - Trade-in thời trang 2 vòng (Round 1: Thu cũ trợ giá, Round 2: Bán lại/tái chế/upcycling)
   - VAS Care (giặt hấp, spa túi xách/giày hiệu, bảo hiểm trang phục)
   - 3-tier seller wallet (Ví chờ quyết toán, Ví khả dụng, Ví ký quỹ/bảo đảm)
   - Khấu trừ thuế theo Thông tư 40/2021/TT-BTC
   - Xuất hóa đơn điện tử theo Thông tư 78/2021/TT-BTC & Nghị định 123/2020/NĐ-CP
   - Mặt nạ vận đơn PDPD (Bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP)
   - Chính sách 3-Strike NDR (Non-Delivery Report)
   - Chống gian lận (Fraud Detection, velocity checks, device fingerprinting, risk score)
   - Any auxiliary tables related to these domains.
2. For each table, document: Table Name, Fields, Data Types, Nullability, Primary/Foreign Keys, Enums, Business Rules.

Write your findings to:
`d:\A - Học Tập\Thương Mại Điện Tử\.agents\teamwork\teamwork_spec_miner_survey_2\survey_database_specs.md`
and write a standard `handoff.md` in your state folder.


## 2026-11-12T08:17:03Z
[Message] timestamp=2026-11-12T08:17:03Z sender=b88b23bb-b38a-4ae6-b1b3-b5b4bf5f5cdf priority=MESSAGE_PRIORITY_HIGH content=You are Spec Miner 2. Read your task assignment at:
d:\A - Học Tập\Thương Mại Điện Tử\.agents\teamwork\teamwork_spec_miner_survey_2\DISPATCH.md
Read the authoritative request at:
d:\A - Học Tập\Thương Mại Điện Tử\.agents\teamwork\ORIGINAL_REQUEST.md

Investigate the business plan and in-depth business specifications in:
- D:\A - Học Tập\Thương Mại Điện Tử\HO_SO_THIET_KE_VA_DAC_TA_HE_THONG_NEXORA\NEXORA_BAN_KE_HOACH_VA_PHAN_TICH_NGHIEP_VU_TOAN_DIEN.docx
- D:\A - Học Tập\Thương Mại Điện Tử\HO_SO_THIET_KE_VA_DAC_TA_HE_THONG_NEXORA\NEXORA_BAO_CAO_DANH_GIA_VA_DAC_TA_NGHIEP_VU_CHUYEN_SAU.docx

Extract full technical specifications for the 14 core database tables (Trade-in 2 rounds, VAS Care, 3-tier seller wallet, Tax TT40, E-invoice TT78, Waybill mask PDPD, 3-Strike NDR, Fraud prevention).
Save your report to:
d:\A - Học Tập\Thương Mại Điện Tử\.agents\teamwork\teamwork_spec_miner_survey_2\survey_database_specs.md
and write handoff.md in your state folder:
d:\A - Học Tập\Thương Mại Điện Tử\.agents\teamwork\teamwork_spec_miner_survey_2\handoff.md
Notify parent when done.


## 2026-11-12T08:28:24Z
[Message] timestamp=2026-11-12T08:28:24Z sender=b88b23bb-b38a-4ae6-b1b3-b5b4bf5f5cdf priority=MESSAGE_PRIORITY_HIGH content=**Context**: Server Restart Recovery
**Content**: Hệ thống vừa trải qua server restart. Vui lòng tiếp tục ngay nhiệm vụ bóc tách đặc tả 14 bảng CSDL cốt lõi từ 2 file docx trong HO_SO_THIET_KE_VA_DAC_TA_HE_THONG_NEXORA. Xuất báo cáo chi tiết schema, fields, types, relations, enums tại survey_database_specs.md và handoff.md trong state folder của bạn.
**Action**: Tiếp tục thực thi và gửi tin nhắn báo cáo khi hoàn tất.
