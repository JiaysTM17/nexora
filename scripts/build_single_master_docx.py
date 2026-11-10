import os
import re
import sys
import zipfile

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

def set_cell_margins(cell, top=70, bottom=70, left=110, right=110):
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

def add_part_header(doc, part_num_str, part_title):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(28)
    p.paragraph_format.space_after = Pt(10)
    p.paragraph_format.keep_with_next = True
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Border box around major part header
    part_table = doc.add_table(rows=1, cols=1)
    part_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = part_table.cell(0, 0)
    cell.width = Inches(6.4)
    set_cell_background(cell, "F3F4F6")
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    set_table_borders(part_table, color="000000", sz="12", val="single")
    
    cp = cell.paragraphs[0]
    cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r1 = cp.add_run(f"{part_num_str.upper()}\n")
    r1.font.name = 'Times New Roman'
    r1.font.size = Pt(13)
    r1.font.bold = True
    r1.font.color.rgb = RGBColor(0, 0, 0)
    
    r2 = cp.add_run(part_title.upper())
    r2.font.name = 'Times New Roman'
    r2.font.size = Pt(16)
    r2.font.bold = True
    r2.font.color.rgb = RGBColor(0, 0, 0)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

def add_styled_heading(doc, text, level):
    p = doc.add_paragraph()
    p.paragraph_format.keep_with_next = True
    
    if level == 1:
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(text.upper())
        run.font.name = 'Times New Roman'
        run.font.size = Pt(14.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
    elif level == 2:
        p.paragraph_format.space_before = Pt(13)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
    elif level == 3:
        p.paragraph_format.space_before = Pt(9)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.italic = True
        run.font.color.rgb = RGBColor(0, 0, 0)
    else:
        p.paragraph_format.space_before = Pt(7)
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(11.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
    return p

def add_formatted_runs(paragraph, text, base_font="Times New Roman", base_size=11.5):
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
            run.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
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

def render_markdown_lines(doc, lines):
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
                set_cell_background(cell, "F9FAFB")
                set_cell_margins(cell, top=90, bottom=90, left=130, right=130)
                set_table_borders(table, color="4B5563", sz="4", val="single")
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

        # Horizontal rule
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
                    set_table_borders(table, color="000000", sz="6", val="single")

                    # Header Row
                    hdr_row = table.rows[0]
                    hdr_tr = hdr_row._tr.get_or_add_trPr()
                    hdr_tr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

                    for c_idx, text in enumerate(raw_rows[0]):
                        cell = hdr_row.cells[c_idx]
                        set_cell_background(cell, "E5E7EB") # Gray 200
                        set_cell_margins(cell, top=90, bottom=90, left=110, right=110)
                        cp = cell.paragraphs[0]
                        cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        cp.paragraph_format.space_before = Pt(2)
                        cp.paragraph_format.space_after = Pt(2)
                        run = cp.add_run(text)
                        run.font.name = 'Times New Roman'
                        run.font.size = Pt(10.0)
                        run.font.bold = True
                        run.font.color.rgb = RGBColor(0, 0, 0)

                    # Data Rows
                    for r_idx, row_data in enumerate(raw_rows[1:], start=1):
                        row = table.rows[r_idx]
                        bg_color = "F9FAFB" if (r_idx % 2 == 0) else "FFFFFF"
                        for c_idx, text in enumerate(row_data):
                            cell = row.cells[c_idx]
                            set_cell_background(cell, bg_color)
                            set_cell_margins(cell, top=60, bottom=60, left=90, right=90)
                            cp = cell.paragraphs[0]
                            cp.alignment = WD_ALIGN_PARAGRAPH.LEFT
                            cp.paragraph_format.space_before = Pt(1)
                            cp.paragraph_format.space_after = Pt(1)
                            cp.paragraph_format.line_spacing = 1.15
                            add_formatted_runs(cp, text, base_font="Times New Roman", base_size=10.0)

                    doc.add_paragraph().paragraph_format.space_after = Pt(6)
            continue

        # Blockquote (> text)
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
            run_bar.font.color.rgb = RGBColor(0, 0, 0)
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

        # Regular Body Paragraph
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.2
        add_formatted_runs(p, stripped, base_font="Times New Roman", base_size=11.5)
        i += 1

def build_unified_master_specification():
    base_dir = r"D:\A - Học Tập\Thương Mại Điện Tử"
    zip_path = os.path.join(base_dir, "_archive", "markdown_source_files_backup.zip")
    
    # Target Folder & File
    target_folder = os.path.join(base_dir, "HO_SO_KE_HOACH_VA_PHAN_TICH_CHUAN_NEXORA")
    os.makedirs(target_folder, exist_ok=True)
    master_docx_path = os.path.join(target_folder, "NEXORA_BAN_KE_HOACH_VA_PHAN_TICH_NGHIEP_VU_TOAN_DIEN.docx")

    # Extract markdown files into a memory map
    files_data = {}
    with zipfile.ZipFile(zip_path, 'r') as z:
        for name in z.namelist():
            if name.endswith('.md'):
                with z.open(name) as f:
                    files_data[name] = f.read().decode('utf-8')

    doc = Document()

    # Administrative Page Setup (TCVN / ISO): Left 3.0cm, Right 2.0cm, Top 2.0cm, Bottom 2.0cm
    for section in doc.sections:
        section.top_margin = Cm(2.0)
        section.bottom_margin = Cm(2.0)
        section.left_margin = Cm(3.0)
        section.right_margin = Cm(2.0)
        
        # Header
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("DỰ ÁN TMĐT NEXORA • HỒ SƠ ĐẶC TẢ KỸ THUẬT & KẾ HOẠCH TOÀN DIỆN")
        hrun.font.name = 'Times New Roman'
        hrun.font.size = Pt(8.5)
        hrun.font.italic = True
        hrun.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)
        
        # Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Tài Liệu Đặc Tả Nghiệp Vụ Chuẩn Duy Nhất • Bản Quyền & Lưu Hành Dự Án NEXORA")
        frun.font.name = 'Times New Roman'
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(0x6B, 0x72, 0x80)

    # ====================================================
    # MASTER DOCUMENT CONTROL BLOCK (TRANG KIỂM SOÁT TỔNG THỂ)
    # ====================================================
    ctrl_table = doc.add_table(rows=6, cols=2)
    ctrl_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(ctrl_table, color="000000", sz="6", val="single")

    for row in ctrl_table.rows:
        row.cells[0].width = Inches(1.9)
        row.cells[1].width = Inches(4.3)
        set_cell_margins(row.cells[0], top=60, bottom=60, left=80, right=80)
        set_cell_margins(row.cells[1], top=60, bottom=60, left=80, right=80)

    meta_items = [
        ("DỰ ÁN / HỆ THỐNG", "HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ & CỘNG ĐỒNG PHỐI ĐỒ NEXORA"),
        ("TÊN TÀI LIỆU TOÀN DIỆN", "BẢN KẾ HOẠCH TỔNG THỂ & ĐẶC TẢ PHÂN TÍCH NGHIỆP VỤ HỢP NHẤT"),
        ("MÃ TÀI LIỆU CHÍNH THỨC", "NEX-MASTER-SPEC-2026 • PHIÊN BẢN 3.0 (BẢN HỢP NHẤT CHUẨN DUY NHẤT)"),
        ("NGÀY PHÁT HÀNH", "Tháng 11 Năm 2026"),
        ("ĐƠN VỊ BIÊN SOẠN", "Đội ngũ Phân tích Nghiệp vụ & Kiến trúc Sư Hệ thống (BA & SA Team)"),
        ("TRẠNG THÁI KIỂM DUYỆT", "ĐÃ PHÊ DUYỆT CHÍNH THỨC (OFFICIALLY ADOPTED FOR IMPLEMENTATION)")
    ]

    for idx, (label, val) in enumerate(meta_items):
        c0 = ctrl_table.rows[idx].cells[0]
        set_cell_background(c0, "F3F4F6")
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
        if idx in (1, 2, 5):
            r1.font.bold = True
        r1.font.color.rgb = RGBColor(0, 0, 0)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # Master Title
    tp = doc.add_paragraph()
    tp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    tp.paragraph_format.space_before = Pt(14)
    tp.paragraph_format.space_after = Pt(4)
    trun = tp.add_run("BẢN KẾ HOẠCH TỔNG THỂ & BỘ ĐẶC TẢ NGHIỆP VỤ HỆ THỐNG")
    trun.font.name = 'Times New Roman'
    trun.font.size = Pt(17)
    trun.font.bold = True
    trun.font.color.rgb = RGBColor(0, 0, 0)

    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_p.paragraph_format.space_after = Pt(14)
    srun = sub_p.add_run("Tài Liệu Hợp Nhất Toàn Diện: Kế Hoạch MVP • Thương Hiệu • 7 Module Nghiệp Vụ • CSDL & API")
    srun.font.name = 'Times New Roman'
    srun.font.size = Pt(11)
    srun.font.italic = True
    srun.font.color.rgb = RGBColor(0x37, 0x41, 0x51)

    div_p = doc.add_paragraph()
    div_p.paragraph_format.space_before = Pt(2)
    div_p.paragraph_format.space_after = Pt(14)
    div_run = div_p.add_run("=" * 68)
    div_run.font.name = 'Times New Roman'
    div_run.font.size = Pt(9)
    div_run.font.bold = True
    div_run.font.color.rgb = RGBColor(0, 0, 0)
    div_p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # ====================================================
    # MASTER SECTIONS TO CONCATENATE IN ORDER
    # ====================================================
    master_sections = [
        # PHẦN 1
        ("PHẦN I", "KẾ HOẠCH XÂY DỰNG SÀN & KIẾN TRÚC SẢN PHẨM (THE MASTER PLAN)",
         "docs/KE_HOACH_XAY_DUNG_SAN_VA_CONG_DONG.md"),
         
        # PHẦN 2
        ("PHẦN II", "HỒ SƠ ĐỊNH VỊ THƯƠNG HIỆU & QUY CHUẨN THIẾT KẾ LOGO NEXORA",
         "docs/branding/01_BRAND_IDENTITY_NEXORA.md"),
        (None, None, "docs/branding/02_LOGO_DESIGN_SPECIFICATIONS.md"),
         
        # PHẦN 3
        ("PHẦN III", "ĐẶC TẢ CHI TIẾT CÁC MODULE NGHIỆP VỤ HỆ THỐNG (7 MODULES CHUYÊN SÂU)",
         "docs/benchmarks_6_san_tmdt/01_CATALOG_BIEN_THE_VA_TINH_TRANG_THIET_BI.md"),
        (None, None, "docs/benchmarks_6_san_tmdt/02_DICH_VU_GIA_TANG_TRADE_IN_BAO_HANH_SIM.md"),
        (None, None, "docs/benchmarks_6_san_tmdt/03_GIO_HANG_XEP_CHONG_VOUCHER_THANH_TOAN_TRA_GOP.md"),
        (None, None, "docs/benchmarks_6_san_tmdt/04_VAN_CHUYEN_HOA_TOC_SUBSCRIBE_AND_SAVE_TRACKING.md"),
        (None, None, "docs/benchmarks_6_san_tmdt/05_HAU_MAI_DOI_TRA_HOAN_TIEN_TRANH_CHAP.md"),
        (None, None, "docs/benchmarks_6_san_tmdt/06_SOCIAL_COMMERCE_LIVE_SHOPPING_AFFILIATE.md"),
        (None, None, "docs/benchmarks_6_san_tmdt/07_KIEN_TRUC_CSDL_API_VA_MOHINH_TRANG_THAI.md"),
        
        # PHẦN 4
        ("PHẦN IV", "MA TRẬN ĐỐI CHIẾU KHOẢNG TRỐNG NGHIỆP VỤ (GAP ANALYSIS 6 SÀN TIÊU BIỂU)",
         "docs/benchmarks_6_san_tmdt/00_MA_TRAN_DOI_CHIEU_KHOANG_TRONG_NGHIEP_VU.md")
    ]

    for part_num, part_title, file_key in master_sections:
        if part_num and part_title:
            add_part_header(doc, part_num, part_title)
        
        raw_md = files_data.get(file_key, "")
        if raw_md:
            lines = raw_md.splitlines()
            render_markdown_lines(doc, lines)
            doc.add_page_break()

    doc.save(master_docx_path)
    print(f"[HOÀN TẤT MASTER] Đã tạo thành công tài liệu chuẩn duy nhất:\n{master_docx_path} ({os.path.getsize(master_docx_path):,} bytes)")

if __name__ == '__main__':
    build_unified_master_specification()
