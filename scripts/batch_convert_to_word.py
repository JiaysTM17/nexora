import os
import re
import sys

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:left w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_styled_heading(doc, text, level):
    p = doc.add_paragraph()
    p.paragraph_format.keep_with_next = True
    
    if level == 1:
        p.paragraph_format.space_before = Pt(20)
        p.paragraph_format.space_after = Pt(8)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(17)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A) # Navy Blue
    elif level == 2:
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x25, 0x63, 0xEB) # Royal Blue
    elif level == 3:
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x0F, 0x76, 0x6E) # Teal
    else:
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x37, 0x41, 0x51)
    return p

def add_formatted_runs(paragraph, text, base_font="Times New Roman", base_size=11.5, base_color=(0x1F, 0x29, 0x37)):
    pattern = re.compile(r'(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))')
    tokens = pattern.split(text)
    
    for token in tokens:
        if not token:
            continue
        if token.startswith('**') and token.endswith('**') and len(token) >= 4:
            run = paragraph.add_run(token[2:-2])
            run.font.bold = True
            run.font.name = base_font
            run.font.size = Pt(base_size)
            run.font.color.rgb = RGBColor(*base_color)
        elif token.startswith('*') and token.endswith('*') and len(token) >= 2:
            run = paragraph.add_run(token[1:-1])
            run.font.italic = True
            run.font.name = base_font
            run.font.size = Pt(base_size)
            run.font.color.rgb = RGBColor(*base_color)
        elif token.startswith('`') and token.endswith('`') and len(token) >= 2:
            run = paragraph.add_run(token[1:-1])
            run.font.name = 'Consolas'
            run.font.size = Pt(base_size - 1.5)
            run.font.color.rgb = RGBColor(0x99, 0x1B, 0x1B) # Crimson code
        elif token.startswith('[') and '](' in token and token.endswith(')'):
            m = re.match(r'\[(.*?)\]\((.*?)\)', token)
            if m:
                label = m.group(1)
                run = paragraph.add_run(label)
                run.font.name = base_font
                run.font.size = Pt(base_size)
                run.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)
                run.font.underline = True
            else:
                run = paragraph.add_run(token)
                run.font.name = base_font
                run.font.size = Pt(base_size)
        else:
            run = paragraph.add_run(token)
            run.font.name = base_font
            run.font.size = Pt(base_size)
            run.font.color.rgb = RGBColor(*base_color)

def convert_md_to_docx(md_path, docx_path, doc_title=None, doc_subtitle=None):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    doc = Document()
    
    # Page setup
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        # Header
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("NEXORA E-COMMERCE PLATFORM • BÁO CÁO NGHIỆP VỤ HỆ THỐNG")
        hrun.font.name = 'Times New Roman'
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)
        
        # Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Tài Liệu Đặc Tả Kỹ Thuật Chính Thức — Được Phê Duyệt Triển Khai Mã Nguồn")
        frun.font.name = 'Times New Roman'
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

    # Add Official Cover Header Box
    if doc_title:
        title_table = doc.add_table(rows=1, cols=1)
        title_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        t_cell = title_table.cell(0, 0)
        t_cell.width = Inches(6.5)
        set_cell_background(t_cell, "1E3A8A") # Navy Blue Header
        set_cell_margins(t_cell, top=180, bottom=180, left=220, right=220)
        set_table_borders(title_table, color="1E3A8A", sz="12", val="single")
        
        tp = t_cell.paragraphs[0]
        tp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        trun1 = tp.add_run("HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ NEXORA\n")
        trun1.font.name = 'Times New Roman'
        trun1.font.size = Pt(11)
        trun1.font.bold = True
        trun1.font.color.rgb = RGBColor(0x93, 0xC5, 0xFD) # Light Ice Blue
        
        trun2 = tp.add_run(doc_title.upper() + "\n")
        trun2.font.name = 'Times New Roman'
        trun2.font.size = Pt(15)
        trun2.font.bold = True
        trun2.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF) # White
        
        if doc_subtitle:
            trun3 = tp.add_run(doc_subtitle)
            trun3.font.name = 'Times New Roman'
            trun3.font.size = Pt(10)
            trun3.font.color.rgb = RGBColor(0xE2, 0xE8, 0xF0)
            
        doc.add_paragraph().paragraph_format.space_after = Pt(10)

    i = 0
    n = len(lines)
    in_code_block = False
    code_lines = []

    while i < n:
        line = lines[i].rstrip('\r\n')
        stripped = line.strip()

        # Code block
        if stripped.startswith('```'):
            if in_code_block:
                in_code_block = False
                code_text = '\n'.join(code_lines)
                table = doc.add_table(rows=1, cols=1)
                table.alignment = WD_TABLE_ALIGNMENT.CENTER
                cell = table.cell(0, 0)
                cell.width = Inches(6.5)
                set_cell_background(cell, "F8FAFC")
                set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
                set_table_borders(table, color="E2E8F0", sz="6", val="single")
                cp = cell.paragraphs[0]
                cp.paragraph_format.space_before = Pt(0)
                cp.paragraph_format.space_after = Pt(0)
                cp.paragraph_format.line_spacing = 1.15
                crun = cp.add_run(code_text)
                crun.font.name = 'Consolas'
                crun.font.size = Pt(9.0)
                crun.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
                doc.add_paragraph().paragraph_format.space_after = Pt(4)
                code_lines = []
            else:
                in_code_block = True
                code_lines = []
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        if not stripped:
            i += 1
            continue

        # Horizontal Rule
        if re.match(r'^(-{3,}|\*{3,}|_{3,})$', stripped):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run("—" * 60)
            run.font.color.rgb = RGBColor(0xCB, 0xD5, 0xE1)
            run.font.size = Pt(9)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            i += 1
            continue

        # Headings
        if stripped.startswith('#'):
            m = re.match(r'^(#{1,6})\s+(.*)$', stripped)
            if m:
                level = len(m.group(1))
                htext = m.group(2)
                add_styled_heading(doc, htext, level)
                i += 1
                continue

        # Markdown Table
        if '|' in stripped and stripped.startswith('|') and stripped.endswith('|'):
            table_lines = []
            while i < n and lines[i].strip().startswith('|') and lines[i].strip().endswith('|'):
                table_lines.append(lines[i].strip())
                i += 1
            
            if len(table_lines) >= 2:
                raw_rows = []
                for tl in table_lines:
                    if re.match(r'^\|[\s\-:|]+\|$', tl):
                        continue
                    cols = [c.strip() for c in tl.strip('|').split('|')]
                    raw_rows.append(cols)
                
                if raw_rows:
                    num_cols = max(len(r) for r in raw_rows)
                    for r in raw_rows:
                        while len(r) < num_cols:
                            r.append('')
                    
                    table = doc.add_table(rows=len(raw_rows), cols=num_cols)
                    table.alignment = WD_TABLE_ALIGNMENT.CENTER
                    set_table_borders(table, color="CBD5E1", sz="4", val="single")

                    # Header Row
                    hdr_row = table.rows[0]
                    hdr_tr = hdr_row._tr.get_or_add_trPr()
                    hdr_tr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

                    for c_idx, text in enumerate(raw_rows[0]):
                        cell = hdr_row.cells[c_idx]
                        set_cell_background(cell, "1E3A8A")
                        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
                        cp = cell.paragraphs[0]
                        cp.alignment = WD_ALIGN_PARAGRAPH.LEFT
                        cp.paragraph_format.space_before = Pt(2)
                        cp.paragraph_format.space_after = Pt(2)
                        run = cp.add_run(text)
                        run.font.name = 'Times New Roman'
                        run.font.size = Pt(10.5)
                        run.font.bold = True
                        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

                    # Body Rows
                    for r_idx, row_data in enumerate(raw_rows[1:], start=1):
                        row = table.rows[r_idx]
                        bg_color = "F8FAFC" if (r_idx % 2 == 0) else "FFFFFF"
                        for c_idx, text in enumerate(row_data):
                            cell = row.cells[c_idx]
                            set_cell_background(cell, bg_color)
                            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
                            cp = cell.paragraphs[0]
                            cp.alignment = WD_ALIGN_PARAGRAPH.LEFT
                            cp.paragraph_format.space_before = Pt(1)
                            cp.paragraph_format.space_after = Pt(1)
                            cp.paragraph_format.line_spacing = 1.15
                            add_formatted_runs(cp, text, base_font="Times New Roman", base_size=10.0, base_color=(0x37, 0x41, 0x51))

                    doc.add_paragraph().paragraph_format.space_after = Pt(6)
            continue

        # Blockquote (> text)
        if stripped.startswith('>'):
            quote_text = re.sub(r'^>\s?', '', stripped)
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.35)
            p.paragraph_format.right_indent = Inches(0.25)
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.15
            run_bar = p.add_run("┃ ")
            run_bar.font.bold = True
            run_bar.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)
            add_formatted_runs(p, quote_text, base_font="Times New Roman", base_size=11.0, base_color=(0x4B, 0x55, 0x63))
            i += 1
            continue

        # Bullet List Item
        if re.match(r'^[-*+]\s+', stripped) or re.match(r'^\d+\.\s+', stripped):
            bullet_prefix = "• "
            content_text = re.sub(r'^[-*+]\s+', '', stripped)
            num_match = re.match(r'^(\d+\.)\s+(.*)', stripped)
            if num_match:
                bullet_prefix = num_match.group(1) + " "
                content_text = num_match.group(2)
            
            if content_text.startswith('[ ] '):
                bullet_prefix = "☐ "
                content_text = content_text[4:]
            elif content_text.startswith('[x] '):
                bullet_prefix = "☑ "
                content_text = content_text[4:]

            p = doc.add_paragraph()
            indent_level = len(line) - len(line.lstrip())
            p.paragraph_format.left_indent = Inches(0.25 + (indent_level // 2) * 0.2)
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            
            run_bullet = p.add_run(bullet_prefix)
            run_bullet.font.name = 'Times New Roman'
            run_bullet.font.size = Pt(11.5)
            run_bullet.font.bold = True
            run_bullet.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)

            add_formatted_runs(p, content_text, base_font="Times New Roman", base_size=11.5)
            i += 1
            continue

        # Regular Paragraph
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.2
        add_formatted_runs(p, stripped, base_font="Times New Roman", base_size=11.5)
        i += 1

    os.makedirs(os.path.dirname(docx_path), exist_ok=True)
    doc.save(docx_path)
    print(f"[OK] {os.path.basename(docx_path)}: {os.path.getsize(docx_path):,} bytes")

def run_batch():
    base_dir = r"D:\A - Học Tập\Thương Mại Điện Tử"
    out_dir = os.path.join(base_dir, "BAO_CAO_NGHIEP_VU_WORD")
    
    conversion_map = [
        # 00 - Kế Hoạch & Tổng Quan
        (
            os.path.join(base_dir, "docs", "KE_HOACH_XAY_DUNG_SAN_VA_CONG_DONG.md"),
            os.path.join(out_dir, "00_Ke_Hoach_Tong_The", "00_Ke_Hoach_San_TMDT_Va_Cong_Dong_Phoi_Do.docx"),
            "Kế Hoạch Xây Dựng Sàn Thương Mại Điện Tử & Cộng Đồng Phối Đồ",
            "Đặc tả mục tiêu, kiến trúc Next.js / NestJS / Prisma và mô hình vận hành MVP"
        ),
        (
            os.path.join(base_dir, "docs", "benchmarks_6_san_tmdt", "README.md"),
            os.path.join(out_dir, "00_Ke_Hoach_Tong_The", "00_Ban_Do_Dieu_Hanh_Toan_Bo_Tai_Lieu.docx"),
            "Bản Đồ Điều Hành & Tra Cứu Hệ Thống Báo Cáo Nghiệp Vụ",
            "Hướng dẫn áp dụng 10 module kỹ thuật cho các vai trò PO, BA, Dev, QA, Ops"
        ),
        
        # 01 - Thương Hiệu & Logo
        (
            os.path.join(base_dir, "docs", "branding", "01_BRAND_IDENTITY_NEXORA.md"),
            os.path.join(out_dir, "01_Thuong_Hieu_Va_Logo_NEXORA", "01_Y_Nghia_Va_Triet_Ly_Thuong_Hieu_NEXORA.docx"),
            "Ý Nghĩa Tên Gọi, Từ Nguyên Học & Triết Lý Thương Hiệu NEXORA",
            "Phân tích 5 tầng ý nghĩa (Nexus + Era + Aura) & Tâm lý học âm thanh Bouba/Kiki"
        ),
        (
            os.path.join(base_dir, "docs", "branding", "02_LOGO_DESIGN_SPECIFICATIONS.md"),
            os.path.join(out_dir, "01_Thuong_Hieu_Va_Logo_NEXORA", "02_Quy_Chuan_Thiet_Ke_Logo_X_Nexus.docx"),
            "Đặc Tả Quy Chuẩn Thiết Kế & Giải Mã Ý Nghĩa Biểu Tượng Logo X-Nexus",
            "Cấu trúc hình học, tỷ lệ vàng, hệ màu khoa học & quy tắc ứng dụng đa nền tảng"
        ),
        
        # 02 - Các Module Kỹ Thuật (Phục vụ trực tiếp viết code)
        (
            os.path.join(base_dir, "docs", "benchmarks_6_san_tmdt", "01_CATALOG_BIEN_THE_VA_TINH_TRANG_THIET_BI.md"),
            os.path.join(out_dir, "02_Dac_Ta_Cac_Module_He_Thong", "01_Module_Catalog_San_Pham_Va_Bien_The.docx"),
            "Đặc Tả Module Catalog: Cấu Hình Biến Thể, Bảng Size & Tình Trạng Thiết Bị",
            "Wizard 8 bước, tiêu chuẩn phân cấp Grade A/B/C, IMEI & kiểm tra tương thích"
        ),
        (
            os.path.join(base_dir, "docs", "benchmarks_6_san_tmdt", "02_DICH_VU_GIA_TANG_TRADE_IN_BAO_HANH_SIM.md"),
            os.path.join(out_dir, "02_Dac_Ta_Cac_Module_He_Thong", "02_Module_Dich_Vu_Gia_Tang_TradeIn_Bao_Hanh.docx"),
            "Đặc Tả Module Dịch Vụ Gia Tăng: Thu Cũ Đổi Mới (Trade-In), Bảo Hành Care+ & Viễn Thông",
            "Quy trình Re-quote online, tạm giữ bảo lãnh thẻ, kit thu hồi & cấp phát eSIM tức thì"
        ),
        (
            os.path.join(base_dir, "docs", "benchmarks_6_san_tmdt", "03_GIO_HANG_XEP_CHONG_VOUCHER_THANH_TOAN_TRA_GOP.md"),
            os.path.join(out_dir, "02_Dac_Ta_Cac_Module_He_Thong", "03_Module_Gio_Hang_Voucher_Va_Thanh_Toan.docx"),
            "Đặc Tả Module Giỏ Hàng: Động Cơ Xếp Chồng 5 Tầng Voucher, Flash Sale & Trả Góp BNPL",
            "Phân lập kho Flash Sale, khóa giá 15 phút, SPayLater eKYC 3 phút & Split Tenders"
        ),
        (
            os.path.join(base_dir, "docs", "benchmarks_6_san_tmdt", "04_VAN_CHUYEN_HOA_TOC_SUBSCRIBE_AND_SAVE_TRACKING.md"),
            os.path.join(out_dir, "02_Dac_Ta_Cac_Module_He_Thong", "04_Module_Van_Chuyen_Giao_Nhan_Va_Tracking.docx"),
            "Đặc Tả Module Vận Chuyển: Giao Hỏa Tốc 1-2H, Định Vị Live GPS, Tách Kiện & In-Store Pickup",
            "Bản đồ tài xế thời gian thực, mã OTP/PIN giao hàng, Apple Wallet Pass QR & Subscribe & Save"
        ),
        (
            os.path.join(base_dir, "docs", "benchmarks_6_san_tmdt", "05_HAU_MAI_DOI_TRA_HOAN_TIEN_TRANH_CHAP.md"),
            os.path.join(out_dir, "02_Dac_Ta_Cac_Module_He_Thong", "05_Module_Hau_Mai_Doi_Tra_Va_Tranh_Chap.docx"),
            "Đặc Tả Module Hậu Mãi: Quy Trình Đồng Kiểm, Returnless Refund & Xử Lý Tranh Chấp",
            "Shopee Đồng kiểm, thuật toán hoàn tiền không trả hàng, No Box No Label PUDO & SLA 48h"
        ),
        (
            os.path.join(base_dir, "docs", "benchmarks_6_san_tmdt", "06_SOCIAL_COMMERCE_LIVE_SHOPPING_AFFILIATE.md"),
            os.path.join(out_dir, "02_Dac_Ta_Cac_Module_He_Thong", "06_Module_Cong_Dong_Phoi_Do_Va_Social_Commerce.docx"),
            "Đặc Tả Module Social Commerce: Cộng Đồng Phối Đồ, Ghim Sản Phẩm Livestream & Affiliate",
            "Ghim deal 1 chạm không ngắt live, giỏ ảo livestream, duyệt mẫu thử KOC & hoa hồng 14 ngày"
        ),
        (
            os.path.join(base_dir, "docs", "benchmarks_6_san_tmdt", "07_KIEN_TRUC_CSDL_API_VA_MOHINH_TRANG_THAI.md"),
            os.path.join(out_dir, "02_Dac_Ta_Cac_Module_He_Thong", "07_Module_Kien_Truc_CSDL_API_Va_May_Trang_Thai.docx"),
            "Đặc Tả Kỹ Thuật: CSDL PostgreSQL DDL, 4 Máy Trạng Thái Tách Rời & Hợp Đồng OpenAPI 3.0",
            "22 bảng thực thể quan hệ, kiểm soát kế toán kép bất biến, CloudEvents & 20 kịch bản E2E"
        ),
        
        # 03 - Ma Trận Đối Chiếu
        (
            os.path.join(base_dir, "docs", "benchmarks_6_san_tmdt", "00_MA_TRAN_DOI_CHIEU_KHOANG_TRONG_NGHIEP_VU.md"),
            os.path.join(out_dir, "03_Doi_Chieu_Nghiep_Vu_6_San", "08_Ma_Tran_Doi_Chieu_Khoang_Trong_Nghiep_Vu.docx"),
            "Ma Trận Đối Chiếu Khoảng Trống Nghiệp Vụ (Gap Analysis Matrix)",
            "So sánh 45 chương nghiệp vụ với thực tiễn Apple Store, Amazon, Swiftronics, TikTok, Shopee"
        ),
    ]
    
    print(f"Bắt đầu chuyển đổi {len(conversion_map)} tài liệu sang Word (.docx)...")
    success_count = 0
    for src_md, dst_docx, title, subtitle in conversion_map:
        if os.path.exists(src_md):
            try:
                convert_md_to_docx(src_md, dst_docx, title, subtitle)
                success_count += 1
            except Exception as e:
                print(f"[ERROR] Thất bại khi chuyển {src_md}: {e}")
        else:
            print(f"[WARN] Không tìm thấy file nguồn: {src_md}")
            
    print(f"\n===> HOÀN TẤT: {success_count}/{len(conversion_map)} tài liệu Word đã được tạo thành công!")

if __name__ == '__main__':
    run_batch()
