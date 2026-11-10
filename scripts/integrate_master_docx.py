import os
import sys
import re
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml

# Ensure utf-8 output
sys.stdout.reconfigure(encoding='utf-8')

MASTER_PATH = r"D:\A - Học Tập\Thương Mại Điện Tử\HO_SO_KE_HOACH_VA_PHAN_TICH_CHUAN_NEXORA\NEXORA_BAN_KE_HOACH_VA_PHAN_TICH_NGHIEP_VU_TOAN_DIEN.docx"
AUDIT_DOCX_PATH = r"D:\A - Học Tập\Thương Mại Điện Tử\BAO_CAO_NGHIEP_VU_WORD\BAO_CAO_KIEM_TOAN_NGHIEP_VU_TOAN_DIEN_NEXORA.docx"

print("Loading Master Document...")
doc = docx.Document(MASTER_PATH)

# Replacements for stale tech terms in paragraphs and tables
STALE_MAP = {
    "IMEI/Serial": "Mã định danh SKU/NFC Tag thời trang",
    "IMEI": "Mã định danh SKU/NFC",
    "eSIM": "Tem niêm phong bảo mật RFID/QR",
    "Blancco Mobile Diagnostics": "Hệ thống kiểm định thị giác máy tính AI Vision",
    "Blancco": "AI Vision phân tích sợi vải & đường may",
    "AppleCare+": "Bảo hiểm đồ hiệu cao cấp Nexora Care+",
    "AppleCare": "Bảo hiểm đồ hiệu Nexora Care",
    "Dark Star": "Bộ sưu tập giới hạn Nexora Black Label",
    "Warp 5G": "Chuyển phát siêu tốc 24H",
    "UN 3481": "Quy chuẩn đóng gói phụ kiện thời trang cao cấp",
    "Loaner Phone": "Set đồ mẫu OOTD mặc thử",
    "Apple GSX": "Cơ sở dữ liệu xác thực chính hãng Entrupy & Brand Registry",
}

def replace_in_runs(paragraph, old_text, new_text):
    if old_text in paragraph.text:
        # Simple replace if contained in text
        # If in single run
        for run in paragraph.runs:
            if old_text in run.text:
                run.text = run.text.replace(old_text, new_text)
        # If spanning across runs
        if old_text in paragraph.text:
            paragraph.text = paragraph.text.replace(old_text, new_text)

print("Systematically replacing stale phone/electronics terms with Fashion Trade-in terms...")
stale_replaced = 0
for p in doc.paragraphs:
    for old_t, new_t in STALE_MAP.items():
        if old_t in p.text:
            replace_in_runs(p, old_t, new_t)
            stale_replaced += 1

for table in doc.tables:
    for row in table.rows:
        for cell in row.cells:
            for p in cell.paragraphs:
                for old_t, new_t in STALE_MAP.items():
                    if old_t in p.text:
                        replace_in_runs(p, old_t, new_t)
                        stale_replaced += 1

print(f"Replaced {stale_replaced} occurrences of stale terms.")

# Load Audit Document to integrate its sections into Master
print("Loading Audit Report Document...")
audit_doc = docx.Document(AUDIT_DOCX_PATH)

# Append Section Break
doc.add_page_break()

# Add Main Heading for Part V
h1 = doc.add_paragraph()
h1_run = h1.add_run("PHẦN V: ĐẶC TẢ BỔ SUNG NGHIỆP VỤ NÂNG CAO, DÒNG TIỀN, THUẾ, CHỐNG GIAN LẬN & CƠ SỞ DỮ LIỆU ĐỐI SOÁT")
h1_run.font.name = "Times New Roman"
h1_run.font.size = Pt(16)
h1_run.font.bold = True
h1_run.font.color.rgb = RGBColor(0, 0, 0)
h1.alignment = WD_ALIGN_PARAGRAPH.CENTER

intro_p = doc.add_paragraph()
intro_run = intro_p.add_run(
    "Phần V tích hợp toàn diện các kết quả kiểm toán nghiệp vụ, đặc tả kiến trúc dòng tiền ký quỹ Escrow tập trung, "
    "cơ chế khấu trừ thuế theo Thông tư 40/2021/TT-BTC & xuất hóa đơn điện tử Thông tư 78/2021/TT-BTC, "
    "quy trình vận chuyển 3-Strike NDR & mặt nạ vận đơn bảo vệ dữ liệu PDPD Nghị định 13/2023/NĐ-CP, "
    "hệ thống chống gian lận đa lớp, đồng bộ tồn kho Redis Redlock, "
    "luồng hoàn chỉnh Thu cũ đổi mới thời trang (Fashion Trade-in) thẩm định 2 vòng và Dịch vụ VAS Giặt hấp/Spa đồ hiệu cao cấp, "
    "cùng trọn bộ 14 bảng CSDL DDL và 5 máy trạng thái cốt lõi."
)
intro_run.font.name = "Times New Roman"
intro_run.font.size = Pt(12)
intro_p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_shading(cell, color_hex):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def copy_table(src_table, target_doc):
    num_rows = len(src_table.rows)
    num_cols = len(src_table.columns)
    if num_rows == 0 or num_cols == 0:
        return
    tgt_table = target_doc.add_table(rows=num_rows, cols=num_cols)
    tgt_table.style = 'Table Grid'
    tgt_table.alignment = docx.enum.table.WD_TABLE_ALIGNMENT.CENTER

    for r_idx, src_row in enumerate(src_table.rows):
        tgt_row = tgt_table.rows[r_idx]
        is_header = (r_idx == 0)
        for c_idx, src_cell in enumerate(src_row.cells):
            tgt_cell = tgt_row.cells[c_idx]
            tgt_cell.text = src_cell.text.strip()
            set_cell_margins(tgt_cell, 80, 80, 120, 120)
            if is_header:
                set_cell_shading(tgt_cell, "1F2937")
            else:
                if r_idx % 2 == 1:
                    set_cell_shading(tgt_cell, "F9FAFB")
            for p in tgt_cell.paragraphs:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER if is_header else WD_ALIGN_PARAGRAPH.LEFT
                for r in p.runs:
                    r.font.name = "Times New Roman"
                    r.font.size = Pt(10)
                    if is_header:
                        r.font.bold = True
                        r.font.color.rgb = RGBColor(255, 255, 255)
                    else:
                        r.font.color.rgb = RGBColor(0, 0, 0)

print("Copying Audit Report paragraphs and tables into Master Document...")
# Iterate through audit_doc elements in order
for element in audit_doc.element.body:
    tag = element.tag.split('}')[-1]
    if tag == 'p':
        p = docx.text.paragraph.Paragraph(element, audit_doc)
        txt = p.text.strip()
        if not txt:
            continue
        new_p = doc.add_paragraph()
        new_p.alignment = p.alignment
        for run in p.runs:
            new_run = new_p.add_run(run.text)
            new_run.font.name = "Times New Roman"
            new_run.font.size = run.font.size or Pt(12)
            new_run.font.bold = run.font.bold
            new_run.font.italic = run.font.italic
            new_run.font.color.rgb = RGBColor(0, 0, 0)
    elif tag == 'tbl':
        tbl = docx.table.Table(element, audit_doc)
        copy_table(tbl, doc)

print("Saving updated Master Document...")
doc.save(MASTER_PATH)
print("Saved successfully!")
