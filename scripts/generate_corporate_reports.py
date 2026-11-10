import os
import re
import sys

# Ensure UTF-8 output
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=80, bottom=80, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="000000", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:left w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'  <w:insideH w:val="single" w:sz="2" w:space="0" w:color="D1D5DB"/>'
        f'  <w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_styled_heading(doc, text, level):
    p = doc.add_paragraph()
    p.paragraph_format.keep_with_next = True
    
    if level == 1:
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        run = p.add_run(text.upper())
        run.font.name = 'Times New Roman'
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0) # PURE BLACK
    elif level == 2:
        p.paragraph_format.space_before = Pt(13)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0) # PURE BLACK
    elif level == 3:
        p.paragraph_format.space_before = Pt(9)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.italic = True
        run.font.color.rgb = RGBColor(0, 0, 0) # PURE BLACK
    else:
        p.paragraph_format.space_before = Pt(7)
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(11.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0) # PURE BLACK
    return p

def add_formatted_runs(paragraph, text, base_font="Times New Roman", base_size=11.5):
    # Pure Monochrome: No rainbow colors. Only Bold, Italic, Code font, Underline.
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
            run.font.color.rgb = RGBColor(0, 0, 0)
        elif token.startswith('*') and token.endswith('*') and len(token) >= 2:
            run = paragraph.add_run(token[1:-1])
            run.font.italic = True
            run.font.name = base_font
            run.font.size = Pt(base_size)
            run.font.color.rgb = RGBColor(0, 0, 0)
        elif token.startswith('`') and token.endswith('`') and len(token) >= 2:
            run = paragraph.add_run(token[1:-1])
            run.font.name = 'Consolas'
            run.font.size = Pt(base_size - 1.0)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x1F, 0x29, 0x37) # Dark Charcoal
        elif token.startswith('[') and '](' in token and token.endswith(')'):
            m = re.match(r'\[(.*?)\]\((.*?)\)', token)
            if m:
                label = m.group(1)
                run = paragraph.add_run(label)
                run.font.name = base_font
                run.font.size = Pt(base_size)
                run.font.bold = True
                run.font.underline = True
                run.font.color.rgb = RGBColor(0, 0, 0)
            else:
                run = paragraph.add_run(token)
                run.font.name = base_font
                run.font.size = Pt(base_size)
                run.font.color.rgb = RGBColor(0, 0, 0)
        else:
            run = paragraph.add_run(token)
            run.font.name = base_font
            run.font.size = Pt(base_size)
            run.font.color.rgb = RGBColor(0, 0, 0)

def convert_md_to_corporate_docx(md_path, docx_path, doc_code, doc_title, doc_scope):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    doc = Document()
    
    # Standard Administrative / Corporate Page Margins (TCVN / ISO):
    # Left: 3.0 cm (đóng gáy), Right: 2.0 cm, Top: 2.0 cm, Bottom: 2.0 cm
    for section in doc.sections:
        section.top_margin = Cm(2.0)
        section.bottom_margin = Cm(2.0)
        section.left_margin = Cm(3.0)
        section.right_margin = Cm(2.0)
        
        # Header (Clean, professional, single line)
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run(f"DỰ ÁN TMĐT NEXORA • {doc_code.upper()} — BÁO CÁO PHÂN TÍCH NGHIỆP VỤ")
        hrun.font.name = 'Times New Roman'
        hrun.font.size = Pt(8.5)
        hrun.font.italic = True
        hrun.font.color.rgb = RGBColor(0x4B, 0x55, 0x63) # Gray
        
        # Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Tài Liệu Đặc Tả Nghiệp Vụ Chính Thức • Bản Quyền & Lưu Hành Dự Án NEXORA")
        frun.font.name = 'Times New Roman'
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(0x6B, 0x72, 0x80)

    # ==========================================
    # 1. BẢNG KIỂM SOÁT TÀI LIỆU (DOCUMENT CONTROL BLOCK)
    # ==========================================
    ctrl_table = doc.add_table(rows=5, cols=2)
    ctrl_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(ctrl_table, color="000000", sz="6", val="single")
    
    # Column widths: 1.8 in and 4.2 in
    for row in ctrl_table.rows:
        row.cells[0].width = Inches(1.8)
        row.cells[1].width = Inches(4.4)
        set_cell_margins(row.cells[0], top=50, bottom=50, left=80, right=80)
        set_cell_margins(row.cells[1], top=50, bottom=50, left=80, right=80)

    meta_items = [
        ("DỰ ÁN / HỆ THỐNG", "HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ & CỘNG ĐỒNG NEXORA"),
        ("TÊN TÀI LIỆU", doc_title.upper()),
        ("MÃ TÀI LIỆU / PHIÊN BẢN", f"{doc_code} • Phiên bản: 2.0 (Phát hành chính thức)"),
        ("BỘ PHẬN BIÊN SOẠN", "Đội ngũ Phân tích Nghiệp vụ & Kiến trúc Hệ thống (BA & SA Team)"),
        ("TRẠNG THÁI KIỂM DUYỆT", "ĐÃ PHÊ DUYỆT (CHÍNH THỨC SỬ DỤNG CHO TRIỂN KHAI LẬP TRÌNH)")
    ]

    for idx, (label, val) in enumerate(meta_items):
        c0 = ctrl_table.rows[idx].cells[0]
        set_cell_background(c0, "F3F4F6") # Light Gray 100
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(1)
        p0.paragraph_format.space_after = Pt(1)
        r0 = p0.add_run(label)
        r0.font.name = 'Times New Roman'
        r0.font.size = Pt(9.5)
        r0.font.bold = True
        r0.font.color.rgb = RGBColor(0, 0, 0)

        c1 = ctrl_table.rows[idx].cells[1]
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(1)
        p1.paragraph_format.space_after = Pt(1)
        r1 = p1.add_run(val)
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(9.5)
        if idx in (1, 4):
            r1.font.bold = True
        r1.font.color.rgb = RGBColor(0, 0, 0)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Document Title Presentation
    tp = doc.add_paragraph()
    tp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    tp.paragraph_format.space_before = Pt(12)
    tp.paragraph_format.space_after = Pt(4)
    trun = tp.add_run(doc_title.upper())
    trun.font.name = 'Times New Roman'
    trun.font.size = Pt(16)
    trun.font.bold = True
    trun.font.color.rgb = RGBColor(0, 0, 0)

    # Subtitle
    if doc_scope:
        sp = doc.add_paragraph()
        sp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        sp.paragraph_format.space_after = Pt(12)
        srun = sp.add_run(f"Phạm vi: {doc_scope}")
        srun.font.name = 'Times New Roman'
        srun.font.size = Pt(11)
        srun.font.italic = True
        srun.font.color.rgb = RGBColor(0x37, 0x41, 0x51)

    # Divider double line
    div_p = doc.add_paragraph()
    div_p.paragraph_format.space_before = Pt(2)
    div_p.paragraph_format.space_after = Pt(10)
    div_run = div_p.add_run("=" * 68)
    div_run.font.name = 'Times New Roman'
    div_run.font.size = Pt(9)
    div_run.font.bold = True
    div_run.font.color.rgb = RGBColor(0, 0, 0)
    div_p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # ==========================================
    # 2. PARSE AND RENDER CONTENT (PURE MONOCHROME)
    # ==========================================
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
                cell.width = Inches(6.2)
                set_cell_background(cell, "F9FAFB") # Off white / subtle gray
                set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
                set_table_borders(table, color="4B5563", sz="4", val="single") # Black/Dark gray border
                cp = cell.paragraphs[0]
                cp.paragraph_format.space_before = Pt(0)
                cp.paragraph_format.space_after = Pt(0)
                cp.paragraph_format.line_spacing = 1.15
                crun = cp.add_run(code_text)
                crun.font.name = 'Consolas'
                crun.font.size = Pt(9.0)
                crun.font.color.rgb = RGBColor(0, 0, 0)
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
            run = p.add_run("—" * 68)
            run.font.color.rgb = RGBColor(0x9C, 0xA3, 0xAF)
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
                    # Clean Black Table Borders
                    set_table_borders(table, color="000000", sz="6", val="single")

                    # Header Row: Light Gray Background, Bold Black Text
                    hdr_row = table.rows[0]
                    hdr_tr = hdr_row._tr.get_or_add_trPr()
                    hdr_tr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

                    for c_idx, text in enumerate(raw_rows[0]):
                        cell = hdr_row.cells[c_idx]
                        set_cell_background(cell, "E5E7EB") # Gray 200
                        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
                        cp = cell.paragraphs[0]
                        cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        cp.paragraph_format.space_before = Pt(2)
                        cp.paragraph_format.space_after = Pt(2)
                        run = cp.add_run(text)
                        run.font.name = 'Times New Roman'
                        run.font.size = Pt(10.5)
                        run.font.bold = True
                        run.font.color.rgb = RGBColor(0, 0, 0) # Black

                    # Data Rows: Clean White and subtle alternating rows
                    for r_idx, row_data in enumerate(raw_rows[1:], start=1):
                        row = table.rows[r_idx]
                        bg_color = "F9FAFB" if (r_idx % 2 == 0) else "FFFFFF"
                        for c_idx, text in enumerate(row_data):
                            cell = row.cells[c_idx]
                            set_cell_background(cell, bg_color)
                            set_cell_margins(cell, top=70, bottom=70, left=100, right=100)
                            cp = cell.paragraphs[0]
                            cp.alignment = WD_ALIGN_PARAGRAPH.LEFT
                            cp.paragraph_format.space_before = Pt(1)
                            cp.paragraph_format.space_after = Pt(1)
                            cp.paragraph_format.line_spacing = 1.15
                            add_formatted_runs(cp, text, base_font="Times New Roman", base_size=10.0)

                    doc.add_paragraph().paragraph_format.space_after = Pt(6)
            continue

        # Blockquote (> text) -> Clean Black Vertical Bar
        if stripped.startswith('>'):
            quote_text = re.sub(r'^>\s?', '', stripped)
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.4)
            p.paragraph_format.right_indent = Inches(0.2)
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.18
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            run_bar = p.add_run("▌ ")
            run_bar.font.bold = True
            run_bar.font.color.rgb = RGBColor(0, 0, 0) # Pure Black Accent Bar
            add_formatted_runs(p, quote_text, base_font="Times New Roman", base_size=11.0)
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
            p.paragraph_format.line_spacing = 1.18
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            
            run_bullet = p.add_run(bullet_prefix)
            run_bullet.font.name = 'Times New Roman'
            run_bullet.font.size = Pt(11.5)
            run_bullet.font.bold = True
            run_bullet.font.color.rgb = RGBColor(0, 0, 0)

            add_formatted_runs(p, content_text, base_font="Times New Roman", base_size=11.5)
            i += 1
            continue

        # Regular Body Paragraph -> Justified, Pure Black, 11.5pt, 1.2 spacing
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.2
        add_formatted_runs(p, stripped, base_font="Times New Roman", base_size=11.5)
        i += 1

    os.makedirs(os.path.dirname(docx_path), exist_ok=True)
    doc.save(docx_path)
    print(f"[OK] {os.path.basename(docx_path)} ({os.path.getsize(docx_path):,} bytes)")

def run_all_corporate_conversions():
    base_dir = r"D:\A - Học Tập\Thương Mại Điện Tử"
    temp_md = os.path.join(base_dir, "_temp_md_extract")
    out_dir = os.path.join(base_dir, "BAO_CAO_NGHIEP_VU_WORD")

    reports = [
        # 00 - Kế hoạch & Tổng quan
        (
            os.path.join(temp_md, "docs", "KE_HOACH_XAY_DUNG_SAN_VA_CONG_DONG.md"),
            os.path.join(out_dir, "00_Ke_Hoach_Tong_The", "00_Ke_Hoach_San_TMDT_Va_Cong_Dong_Phoi_Do.docx"),
            "NEX-PLAN-00",
            "Kế Hoạch Xây Dựng Sàn Thương Mại Điện Tử & Cộng Đồng Phối Đồ",
            "Đặc tả kiến trúc Next.js App Router, NestJS Modular Monolith, PostgreSQL Prisma & Vận hành MVP"
        ),
        (
            os.path.join(temp_md, "docs", "benchmarks_6_san_tmdt", "README.md"),
            os.path.join(out_dir, "00_Ke_Hoach_Tong_The", "00_Ban_Do_Dieu_Hanh_He_Thong_NEXORA.docx"),
            "NEX-GUIDE-00",
            "Bản Đồ Điều Hành & Tra Cứu Hệ Thống Báo Cáo Nghiệp Vụ",
            "Hướng dẫn tra cứu và quy chuẩn ứng dụng 10 module kỹ thuật cho các vai trò dự án"
        ),

        # 01 - Thương hiệu & Logo
        (
            os.path.join(temp_md, "docs", "branding", "01_BRAND_IDENTITY_NEXORA.md"),
            os.path.join(out_dir, "01_Thuong_Hieu_Va_Logo_NEXORA", "01_Y_Nghia_Va_Triet_Ly_Thuong_Hieu_NEXORA.docx"),
            "NEX-BRAND-01",
            "Hồ Sơ Định Vị Thương Hiệu & Ý Nghĩa Tên Gọi NEXORA",
            "Từ nguyên học (Nexus + Era + Aura), 5 tầng triết lý kinh doanh & Tâm lý học thần kinh Bouba/Kiki"
        ),
        (
            os.path.join(temp_md, "docs", "branding", "02_LOGO_DESIGN_SPECIFICATIONS.md"),
            os.path.join(out_dir, "01_Thuong_Hieu_Va_Logo_NEXORA", "02_Quy_Chuan_Thiet_Ke_Logo_X_Nexus.docx"),
            "NEX-LOGO-02",
            "Quy Chuẩn Thiết Kế & Giải Mã Ý Nghĩa Biểu Tượng Logo X-Nexus",
            "Cấu trúc hình học, tỷ lệ vàng, 6 tầng biểu tượng, hệ màu khoa học & quy tắc ứng dụng đa nền tảng"
        ),

        # 02 - Các Module Kỹ Thuật (Phục vụ viết code)
        (
            os.path.join(temp_md, "docs", "benchmarks_6_san_tmdt", "01_CATALOG_BIEN_THE_VA_TINH_TRANG_THIET_BI.md"),
            os.path.join(out_dir, "02_Dac_Ta_Cac_Module_He_Thong", "01_Module_Catalog_San_Pham_Va_Bien_The.docx"),
            "NEX-SPEC-CAT-01",
            "Đặc Tả Kỹ Thuật Module Catalog: Cấu Hình Biến Thể, Bảng Size & Tình Trạng Thiết Bị",
            "Wizard 8 bước, phân cấp 5 bậc tình trạng (New đến Grade C), kiểm định IMEI, RF và bảng size"
        ),
        (
            os.path.join(temp_md, "docs", "benchmarks_6_san_tmdt", "02_DICH_VU_GIA_TANG_TRADE_IN_BAO_HANH_SIM.md"),
            os.path.join(out_dir, "02_Dac_Ta_Cac_Module_He_Thong", "02_Module_Dich_Vu_Gia_Tang_TradeIn_Bao_Hanh.docx"),
            "NEX-SPEC-VAS-02",
            "Đặc Tả Kỹ Thuật Module Dịch Vụ Gia Tăng: Thu Cũ Đổi Mới, Bảo Hành & Viễn Thông",
            "Quy trình Re-quote online, tạm giữ hạn mức thẻ tín dụng, kit thu hồi tại nhà & cấp phát eSIM tức thì"
        ),
        (
            os.path.join(temp_md, "docs", "benchmarks_6_san_tmdt", "03_GIO_HANG_XEP_CHONG_VOUCHER_THANH_TOAN_TRA_GOP.md"),
            os.path.join(out_dir, "02_Dac_Ta_Cac_Module_He_Thong", "03_Module_Gio_Hang_Voucher_Va_Thanh_Toan.docx"),
            "NEX-SPEC-PAY-03",
            "Đặc Tả Kỹ Thuật Module Giỏ Hàng: Động Cơ Xếp Chồng 5 Tầng Voucher, Flash Sale & Trả Góp BNPL",
            "Động cơ xếp chồng voucher độc lập, phân lập kho Flash Sale 15 phút, SPayLater eKYC & Split Tenders"
        ),
        (
            os.path.join(temp_md, "docs", "benchmarks_6_san_tmdt", "04_VAN_CHUYEN_HOA_TOC_SUBSCRIBE_AND_SAVE_TRACKING.md"),
            os.path.join(out_dir, "02_Dac_Ta_Cac_Module_He_Thong", "04_Module_Van_Chuyen_Giao_Nhan_Va_Tracking.docx"),
            "NEX-SPEC-LOG-04",
            "Đặc Tả Kỹ Thuật Module Vận Chuyển: Giao Hỏa Tốc 1-2H, Live GPS, Tách Kiện & In-Store Pickup",
            "Bản đồ tài xế GPS thời gian thực, mã OTP/PIN giao hàng, nhận tại quầy Apple Wallet Pass QR & Subscribe & Save"
        ),
        (
            os.path.join(temp_md, "docs", "benchmarks_6_san_tmdt", "05_HAU_MAI_DOI_TRA_HOAN_TIEN_TRANH_CHAP.md"),
            os.path.join(out_dir, "02_Dac_Ta_Cac_Module_He_Thong", "05_Module_Hau_Mai_Doi_Tra_Va_Tranh_Chap.docx"),
            "NEX-SPEC-REV-05",
            "Đặc Tả Kỹ Thuật Module Hậu Mãi: Quy Trình Đồng Kiểm, Returnless Refund & Xử Lý Tranh Chấp",
            "Shopee Đồng kiểm khi nhận, thuật toán hoàn tiền không cần trả hàng, No Box No Label PUDO & SLA 48h"
        ),
        (
            os.path.join(temp_md, "docs", "benchmarks_6_san_tmdt", "06_SOCIAL_COMMERCE_LIVE_SHOPPING_AFFILIATE.md"),
            os.path.join(out_dir, "02_Dac_Ta_Cac_Module_He_Thong", "06_Module_Cong_Dong_Phoi_Do_Va_Social_Commerce.docx"),
            "NEX-SPEC-SOC-06",
            "Đặc Tả Kỹ Thuật Module Social Commerce: Cộng Đồng Phối Đồ, Ghim Sản Phẩm Livestream & Affiliate",
            "Ghim deal 1 chạm không ngắt live stream, giữ giỏ ảo khi cháy hàng, duyệt mẫu thử KOC & hoa hồng 14 ngày"
        ),
        (
            os.path.join(temp_md, "docs", "benchmarks_6_san_tmdt", "07_KIEN_TRUC_CSDL_API_VA_MOHINH_TRANG_THAI.md"),
            os.path.join(out_dir, "02_Dac_Ta_Cac_Module_He_Thong", "07_Module_Kien_Truc_CSDL_API_Va_May_Trang_Thai.docx"),
            "NEX-SPEC-ARCH-07",
            "Đặc Tả Kỹ Thuật: CSDL PostgreSQL DDL, 4 Máy Trạng Thái Tách Rời & Hợp Đồng OpenAPI 3.0",
            "22 bảng thực thể quan hệ, kiểm soát kế toán kép bất biến, CloudEvents Kafka schemas & 20 kịch bản E2E"
        ),

        # 03 - Ma trận đối chiếu
        (
            os.path.join(temp_md, "docs", "benchmarks_6_san_tmdt", "00_MA_TRAN_DOI_CHIEU_KHOANG_TRONG_NGHIEP_VU.md"),
            os.path.join(out_dir, "03_Doi_Chieu_Nghiep_Vu_6_San", "08_Ma_Tran_Doi_Chieu_Khoang_Trong_Nghiep_Vu.docx"),
            "NEX-BENCH-08",
            "Ma Trận Đối Chiếu Khoảng Trống Nghiệp Vụ (Gap Analysis Matrix)",
            "So sánh toàn diện 45 chương nghiệp vụ gốc với thực tiễn Apple Store, Amazon, Swiftronics, TikTok, Shopee"
        ),
    ]

    print(f"Bắt đầu chuyển đổi {len(reports)} tài liệu sang định dạng Chuẩn Báo Cáo Doanh Nghiệp (Monochrome Black & White)...")
    success_count = 0
    for src_md, dst_docx, code, title, scope in reports:
        if os.path.exists(src_md):
            try:
                convert_md_to_corporate_docx(src_md, dst_docx, code, title, scope)
                success_count += 1
            except Exception as e:
                print(f"[ERROR] {code} thất bại: {e}")
        else:
            print(f"[WARN] Không tìm thấy file nguồn: {src_md}")

    print(f"\n===> HOÀN TẤT THÀNH CÔNG: {success_count}/{len(reports)} báo cáo Word doanh nghiệp đã được tạo!")

if __name__ == '__main__':
    run_all_corporate_conversions()
