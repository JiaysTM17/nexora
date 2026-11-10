import os
import re
import sys
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

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
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
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(8)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(18)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A) # Deep Navy
    elif level == 2:
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x25, 0x63, 0xEB) # Royal Blue
    elif level == 3:
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x0F, 0x76, 0x6E) # Teal Dark
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
    # Regex pattern to match bold, italic, code, link
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
            run.font.size = Pt(base_size - 1)
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

def convert_md_file(md_path, docx_path, title=None):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    doc = Document()
    
    # Set standard margins (1 inch = 1440 dxa)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        # Add Header & Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("NEXORA E-COMMERCE SPECIFICATION SUITE")
        hrun.font.name = 'Times New Roman'
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Tài Liệu Đặc Tả Nghiệp Vụ Chính Thức • Trang Tài Liệu")
        frun.font.name = 'Times New Roman'
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

    i = 0
    n = len(lines)
    in_code_block = False
    code_lines = []

    while i < n:
        line = lines[i].rstrip('\r\n')
        stripped = line.strip()

        # Handle Code block toggle
        if stripped.startswith('```'):
            if in_code_block:
                # End of code block: write to document as callout box
                in_code_block = False
                code_text = '\n'.join(code_lines)
                table = doc.add_table(rows=1, cols=1)
                table.alignment = WD_TABLE_ALIGNMENT.CENTER
                cell = table.cell(0, 0)
                cell.width = Inches(6.5)
                set_cell_background(cell, "F8FAFC")
                set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
                set_table_borders(table, color="E2E8F0", sz="6", val="single")
                cp = cell.paragraphs[0]
                cp.paragraph_format.space_before = Pt(0)
                cp.paragraph_format.space_after = Pt(0)
                cp.paragraph_format.line_spacing = 1.15
                crun = cp.add_run(code_text)
                crun.font.name = 'Consolas'
                crun.font.size = Pt(9.5)
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

        # Blank line
        if not stripped:
            i += 1
            continue

        # Horizontal rule
        if re.match(r'^(-{3,}|\*{3,}|_{3,})$', stripped):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(8)
            run = p.add_run("—" * 55)
            run.font.color.rgb = RGBColor(0xCB, 0xD5, 0xE1)
            run.font.size = Pt(10)
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

        # Markdown Table Detection
        if '|' in stripped and stripped.startswith('|') and stripped.endswith('|'):
            # Collect all table lines
            table_lines = []
            while i < n and lines[i].strip().startswith('|') and lines[i].strip().endswith('|'):
                table_lines.append(lines[i].strip())
                i += 1
            
            if len(table_lines) >= 2:
                # Parse rows
                raw_rows = []
                for tl in table_lines:
                    # check if separator row
                    if re.match(r'^\|[\s\-:|]+\|$', tl):
                        continue
                    cols = [c.strip() for c in tl.strip('|').split('|')]
                    raw_rows.append(cols)
                
                if raw_rows:
                    num_cols = max(len(r) for r in raw_rows)
                    # equalize columns
                    for r in raw_rows:
                        while len(r) < num_cols:
                            r.append('')
                    
                    table = doc.add_table(rows=len(raw_rows), cols=num_cols)
                    table.alignment = WD_TABLE_ALIGNMENT.CENTER
                    set_table_borders(table, color="D1D5DB", sz="4", val="single")

                    # Header row
                    hdr_row = table.rows[0]
                    hdr_tr = hdr_row._tr.get_or_add_trPr()
                    hdr_tr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

                    for c_idx, text in enumerate(raw_rows[0]):
                        cell = hdr_row.cells[c_idx]
                        set_cell_background(cell, "1E3A8A") # Navy Blue
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

                    # Body rows
                    for r_idx, row_data in enumerate(raw_rows[1:], start=1):
                        row = table.rows[r_idx]
                        bg_color = "F8FAFC" if (r_idx % 2 == 0) else "FFFFFF"
                        for c_idx, text in enumerate(row_data):
                            cell = row.cells[c_idx]
                            set_cell_background(cell, bg_color)
                            set_cell_margins(cell, top=90, bottom=90, left=130, right=130)
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
            p.paragraph_format.left_indent = Inches(0.4)
            p.paragraph_format.right_indent = Inches(0.3)
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.15
            run_bar = p.add_run("┃ ")
            run_bar.font.bold = True
            run_bar.font.color.rgb = RGBColor(0x4F, 0x46, 0xE5) # Indigo border
            add_formatted_runs(p, quote_text, base_font="Times New Roman", base_size=11.0, base_color=(0x4B, 0x55, 0x63))
            i += 1
            continue

        # Bullet list item
        if re.match(r'^[-*+]\s+', stripped) or re.match(r'^\d+\.\s+', stripped):
            is_checkbox = False
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
    print(f"[OK] Converted: {os.path.basename(md_path)} -> {os.path.basename(docx_path)} ({os.path.getsize(docx_path)} bytes)")

if __name__ == '__main__':
    if len(sys.argv) >= 3:
        convert_md_file(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python convert_md_to_docx.py <input.md> <output.docx>")
