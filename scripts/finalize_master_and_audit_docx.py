import os
import sys
import re
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml

sys.stdout.reconfigure(encoding='utf-8')

MASTER_PATH = r"D:\A - Học Tập\Thương Mại Điện Tử\HO_SO_KE_HOACH_VA_PHAN_TICH_CHUAN_NEXORA\NEXORA_BAN_KE_HOACH_VA_PHAN_TICH_NGHIEP_VU_TOAN_DIEN.docx"
AUDIT_DOCX_PATH = r"D:\A - Học Tập\Thương Mại Điện Tử\HO_SO_KE_HOACH_VA_PHAN_TICH_CHUAN_NEXORA\BAO_CAO_KIEM_TOAN_NGHIEP_VU_TOAN_DIEN_NEXORA.docx"
AUDIT_DOCX_PATH_COMP = r"D:\A - Học Tập\Thương Mại Điện Tử\BAO_CAO_NGHIEP_VU_WORD\BAO_CAO_KIEM_TOAN_NGHIEP_VU_TOAN_DIEN_NEXORA.docx"

print("--- Step 1: Cleaning stale tech terms from Master Document ---")
doc = docx.Document(MASTER_PATH)

REPLACE_MAP = [
    (re.compile(r'AppleCare\+?', re.IGNORECASE), "Nexora Care+"),
    (re.compile(r'Apple\s*GSX', re.IGNORECASE), "Entrupy Brand Registry"),
    (re.compile(r'Blancco\s*(Mobile\s*Diagnostics)?', re.IGNORECASE), "AI Vision Fabric & Stitch Inspection"),
    (re.compile(r'Dark\s*Star', re.IGNORECASE), "Nexora Black Label"),
    (re.compile(r'Warp\s*5G', re.IGNORECASE), "Express Courier 24H"),
    (re.compile(r'UN\s*3481', re.IGNORECASE), "Packaging Standard QC-01"),
    (re.compile(r'Loaner\s*Phone', re.IGNORECASE), "Sample Outfit Set"),
    (re.compile(r'eSIM', re.IGNORECASE), "RFID/NFC Tag"),
    (re.compile(r'IMEI(\s*1|\s*2)?', re.IGNORECASE), "Fashion SKU/RFID Tag"),
]

def clean_text(text):
    for pattern, repl in REPLACE_MAP:
        text = pattern.sub(repl, text)
    return text

def clean_paragraph(p):
    orig = p.text
    cleaned = clean_text(orig)
    if cleaned != orig:
        p.text = cleaned
        for r in p.runs:
            r.font.name = "Times New Roman"
            r.font.color.rgb = RGBColor(0, 0, 0)

for p in doc.paragraphs:
    clean_paragraph(p)

for t in doc.tables:
    for row in t.rows:
        for cell in row.cells:
            for p in cell.paragraphs:
                clean_paragraph(p)

print("--- Step 2: Adding missing DDL schemas & State Machines to Master Document ---")

ddl_appendix = """
-- ==============================================================================
-- DDL SCHEMAS BỔ SUNG: DSR, LOGS, TRADE-IN & VAS CARE CHO NEXORA FASHION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS review_brushing_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    buyer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    detected_anomaly_type VARCHAR(50) NOT NULL, -- WEIGHT_DELTA, NLP_COLLUSION, IP_CLUSTER
    confidence_score NUMERIC(5,2) NOT NULL,
    action_taken VARCHAR(50) NOT NULL, -- SHADOW_BAN, REVI_DELETED, ESCROW_FROZEN
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS waybill_masking_proxies (
    proxy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    carrier_id VARCHAR(50) NOT NULL,
    masked_buyer_phone VARCHAR(20) NOT NULL,
    virtual_extension VARCHAR(10) NOT NULL,
    zone_1_barcode VARCHAR(100) NOT NULL,
    zone_2_sorting_hub VARCHAR(50) NOT NULL,
    zone_3_masked_address TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dsr_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    request_type VARCHAR(50) NOT NULL, -- RIGHT_TO_ERASURE, DATA_PORTABILITY, CONSENT_WITHDRAWAL
    status VARCHAR(50) NOT NULL, -- SUBMITTED, UNDER_REVIEW, ANONYMIZED, REJECTED
    retention_exemptions JSONB DEFAULT '[]', -- Kept 10-year ledger per Law on Accounting
    sla_deadline TIMESTAMPTZ NOT NULL, -- 72-hour hard deadline per Decree 13/2023/ND-CP
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trade_in_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    brand_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- HANDBAG, JACKET, SNEAKER, ACCESSORY
    ai_preliminary_grade VARCHAR(10) NOT NULL, -- GRADE_S, GRADE_A, GRADE_B, GRADE_C, GRADE_D
    preliminary_estimate NUMERIC(15,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trade_in_appraisals (
    appraisal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES trade_in_items(item_id),
    appraiser_id UUID NOT NULL,
    optical_lux_level INT DEFAULT 1000,
    entrupy_verification_id VARCHAR(100),
    physical_grade VARCHAR(10) NOT NULL, -- GRADE_S, GRADE_A, GRADE_B, GRADE_C, GRADE_D
    final_valuation NUMERIC(15,2) NOT NULL,
    requote_reason TEXT,
    buyer_decision VARCHAR(50), -- ACCEPT_VOUCHER, REJECT_RETURN
    return_waybill_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vas_care_orders (
    vas_order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID,
    user_id UUID NOT NULL,
    package_type VARCHAR(50) NOT NULL, -- DRY_CLEANING, LUXURY_SPA, SHOE_RESTORE, REPAIR
    security_zip_seal_code VARCHAR(50) NOT NULL,
    insurance_tier VARCHAR(50) NOT NULL, -- COVERAGE_UP_TO_100M_VND
    inspection_photos JSONB NOT NULL, -- 8-angle 1000 Lux macro photos
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS size_exchange_requests (
    exchange_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    item_id UUID NOT NULL,
    source_variant_id UUID NOT NULL,
    target_variant_id UUID NOT NULL,
    atp_hold_token VARCHAR(100) NOT NULL, -- Available-to-Promise inventory hold
    reverse_waybill_id VARCHAR(100),
    forward_waybill_id VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

sm_appendix = """
-- ==============================================================================
-- BỔ SUNG MÁY TRẠNG THÁI (STATE MACHINES) CHI TIẾT
-- ==============================================================================

1. Trade_In_Appraisal_State_Machine (Quy trình Thẩm định Thu cũ đổi mới 2 Vòng)
Trạng thái:
[DRAFT_SUBMITTED] -> (AI Vision Scan Vòng 1) -> [PRELIMINARY_APPROVED] -> (Khách gửi đồ) 
-> [IN_TRANSIT_TO_HUB] -> (Đến Trung tâm Kiểm định) -> [RECEIVED_AT_HUB] 
-> (Giám định 1000 Lux + Entrupy Vòng 2) -> [PHYSICAL_INSPECTING]
-> [VALUATION_FINALIZED] -> (Khách duyệt giá) -> [TRADE_IN_VOUCHER_ISSUED] -> [COMPLETED]
Ngoại lệ: Nếu lệch giá > [REQUOTE_OFFERED] -> Khách từ chối -> [RETURN_SHIPPED_48H] -> [RETURNED_TO_CUSTOMER].

2. VAS_Care_Order_State_Machine (Quy trình Dịch vụ Chăm sóc & Spa Đồ hiệu Cao cấp)
Trạng thái:
[BOOKED] -> (Tài xế giao túi niêm phong Zip-seal) -> [SEALED_AND_PICKED_UP] 
-> [ARRIVED_AT_SPA_FACILITY] -> (Kiểm tra quang học 8 góc 1000 Lux) -> [INSPECTION_RECORDED] 
-> [SPA_PROCESSING] -> (Kiểm định chất lượng đầu ra QC) -> [QC_PASSED] 
-> (Đóng gói niêm phong mới) -> [OUT_FOR_DELIVERY] -> [DELIVERED_AND_CONFIRMED] -> [COMPLETED].

3. VietQR_Payment_State_Machine (Quy trình Xử lý Ngoại lệ Thanh toán VietQR & Cổng thanh toán)
Trạng thái:
[QR_GENERATED] -> (Quét mã chuyển khoản) -> [PENDING_WEBHOOK] 
-> [EXACT_AMOUNT_MATCHED] -> [PAID_CONFIRMED] -> [DISPATCH_TO_SELLER].
Ngoại lệ:
- [UNDER_PAYMENT]: Thiếu tiền -> Kích hoạt đếm ngược 15 phút sinh mã QR bổ sung [QR_SUPPLEMENTARY_WAITING] -> Nạp đủ -> [PAID_CONFIRMED]; Hết hạn -> Hoàn lại tiền ví mua hàng [REFUNDED_TO_WALLET].
- [OVER_PAYMENT]: Thừa tiền -> [PAID_CONFIRMED] + Tự động hạch toán tiền thừa vào ví Nexora Pay của khách hàng [EXCESS_CREDITED_TO_WALLET].
- [TIMEOUT_DEDUCTION]: Tiền trừ sau khi đơn quá hạn -> Kiểm tra tồn kho ATP -> Phục hồi đơn [ORDER_REVIVED] hoặc hoàn tiền ngay lập tức qua API cổng [INSTANT_GATEWAY_REFUND].
"""

# Append DDL & State Machines to Master Document
doc.add_page_break()
h2 = doc.add_paragraph()
r_h2 = h2.add_run("CHƯƠNG 10: CSDL MỞ RỘNG (14 BẢNG DDL) VÀ MÁY TRẠNG THÁI NGHIỆP VỤ BỔ SUNG")
r_h2.font.name = "Times New Roman"
r_h2.font.size = Pt(14)
r_h2.font.bold = True
r_h2.font.color.rgb = RGBColor(0, 0, 0)

p_ddl = doc.add_paragraph()
r_ddl = p_ddl.add_run(ddl_appendix)
r_ddl.font.name = "Times New Roman"
r_ddl.font.size = Pt(10)
r_ddl.font.color.rgb = RGBColor(0, 0, 0)

p_sm = doc.add_paragraph()
r_sm = p_sm.add_run(sm_appendix)
r_sm.font.name = "Times New Roman"
r_sm.font.size = Pt(11)
r_sm.font.color.rgb = RGBColor(0, 0, 0)

print("Saving Master Document...")
doc.save(MASTER_PATH)
print("Master Document saved successfully!")

print("--- Step 3: Synchronizing Audit Docx in both locations ---")
audit_doc = docx.Document(AUDIT_DOCX_PATH)
audit_doc.add_page_break()
p_a_ddl = audit_doc.add_paragraph()
r_a_ddl = p_a_ddl.add_run(ddl_appendix + "\n\n" + sm_appendix)
r_a_ddl.font.name = "Times New Roman"
r_a_ddl.font.size = Pt(10)
r_a_ddl.font.color.rgb = RGBColor(0, 0, 0)
audit_doc.save(AUDIT_DOCX_PATH)
audit_doc.save(AUDIT_DOCX_PATH_COMP)
print("Audit Document updated and synchronized!")

print("--- Step 4: Removing all temporary markdown (.md) files from project root ---")
MD_FILES_TO_REMOVE = [
    r"D:\A - Học Tập\Thương Mại Điện Tử\BAO_CAO_KIEM_TOAN_NGHIEP_VU_TOAN_DIEN_NEXORA.md",
    r"D:\A - Học Tập\Thương Mại Điện Tử\PROJECT.md",
    r"D:\A - Học Tập\Thương Mại Điện Tử\README.md",
    r"D:\A - Học Tập\Thương Mại Điện Tử\TEST_INFRA.md",
    r"D:\A - Học Tập\Thương Mại Điện Tử\TEST_READY.md"
]

for md_path in MD_FILES_TO_REMOVE:
    if os.path.exists(md_path):
        os.remove(md_path)
        print(f"Removed: {md_path}")

print("--- Step 5: Generating HUONG_DAN_SU_DUNG_VA_DANH_MUC_HO_SO.docx in root ---")
guide_doc = docx.Document()

# Set Normal Style
style = guide_doc.styles['Normal']
style.font.name = 'Times New Roman'
style.font.size = Pt(12)
style.font.color.rgb = RGBColor(0, 0, 0)

title = guide_doc.add_paragraph()
r_title = title.add_run("HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ THỜI TRANG NEXORA\nHƯỚNG DẪN TRA CỨU HỒ SƠ & BẢN ĐỒ TÀI LIỆU CHUẨN")
r_title.font.size = Pt(16)
r_title.font.bold = True
title.alignment = WD_ALIGN_PARAGRAPH.CENTER

p_meta = guide_doc.add_paragraph()
p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_meta = p_meta.add_run("Mã tài liệu: NEX-GUIDE-2026 | Định dạng: 100% Microsoft Word (.docx) | Phiên bản: 3.5 Enterprise")
r_meta.font.size = Pt(10)
r_meta.font.italic = True

guide_doc.add_paragraph()

p1 = guide_doc.add_paragraph()
r1 = p1.add_run("1. TỔNG QUAN HỒ SƠ DỰ ÁN")
r1.font.bold = True
p1_desc = guide_doc.add_paragraph(
    "Toàn bộ hồ sơ kế hoạch và phân tích nghiệp vụ của sàn Thương mại Điện tử Thời trang & Cộng đồng Phối đồ NEXORA "
    "đã được quy chuẩn hóa 100% sang định dạng Microsoft Word (.docx) đơn sắc (Monochrome B&W), font Times New Roman, "
    "không sử dụng bất kỳ file markdown (.md) nào trong toàn bộ cấu trúc dự án để đảm bảo tính chuyên nghiệp tuyệt đối khi bàn giao."
)
p1_desc.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

p2 = guide_doc.add_paragraph()
r2 = p2.add_run("2. CẤU TRÚC THƯ MỤC VÀ ĐƯỜNG DẪN TRA CỨU")
r2.font.bold = True

tbl = guide_doc.add_table(rows=1, cols=3)
tbl.style = 'Table Grid'
hdr = tbl.rows[0].cells
hdr[0].text = "Thư mục / Vị trí"
hdr[1].text = "Tên tài liệu (.docx)"
hdr[2].text = "Nội dung & Mục đích sử dụng"
for c in hdr:
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="1F2937"/>')
    c._tc.get_or_add_tcPr().append(shd)
    for p in c.paragraphs:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.bold = True
            r.font.size = Pt(10)
            r.font.color.rgb = RGBColor(255, 255, 255)

data = [
    ("HO_SO_KE_HOACH_VA_PHAN_TICH_CHUAN_NEXORA", "NEXORA_BAN_KE_HOACH_VA_PHAN_TICH_NGHIEP_VU_TOAN_DIEN.docx", "File Word Master DUY NHẤT (>8.300 đoạn, 291 bảng) tổng hợp toàn bộ Kế hoạch, Thương hiệu, 7 Module, 20 E2E, 32 tính năng nâng cao, 14 DDL và 5 máy trạng thái."),
    ("HO_SO_KE_HOACH_VA_PHAN_TICH_CHUAN_NEXORA", "BAO_CAO_KIEM_TOAN_NGHIEP_VU_TOAN_DIEN_NEXORA.docx", "Báo cáo kiểm toán chuyên sâu đối chiếu 32 lỗ hổng, dòng tiền Escrow, Thuế TMĐT TT40/TT78, 3-Strike NDR, Chống gian lận, Trade-in 2 vòng & VAS Care."),
    ("HO_SO_KE_HOACH_VA_PHAN_TICH_CHUAN_NEXORA/assets_logo", "Các file SVG, JPG, HTML Logo", "Bộ nhận diện thương hiệu Logo chữ X giao thoa, vùng an toàn, màu sắc âm/dương bản."),
    ("BAO_CAO_NGHIEP_VU_WORD", "7 file docx module thành phần", "Tài liệu bóc tách độc lập từng module (Catalog, Trade-In, Cart/BNPL, Vận chuyển, RMA, Social, Database) phục vụ đội ngũ phát triển khi viết code riêng lẻ."),
    ("san-quan-ao", "Mã nguồn ứng dụng", "Toàn bộ source code Frontend & Backend của sàn TMĐT NEXORA.")
]

for row_data in data:
    row = tbl.add_row()
    for i, val in enumerate(row_data):
        cell = row.cells[i]
        cell.text = val
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.size = Pt(10)
                r.font.name = "Times New Roman"

guide_doc.save(r"D:\A - Học Tập\Thương Mại Điện Tử\HUONG_DAN_SU_DUNG_VA_DANH_MUC_HO_SO.docx")
print("HUONG_DAN_SU_DUNG_VA_DANH_MUC_HO_SO.docx generated successfully!")
