import zipfile
import xml.etree.ElementTree as ET
import os

W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

def extract_docx_content(docx_path):
    with zipfile.ZipFile(docx_path) as z:
        xml_content = z.read('word/document.xml')
    tree = ET.fromstring(xml_content)
    
    body = tree.find(f'{{{W_NS}}}body')
    if body is None:
        return ''
    
    output = []
    for child in body:
        tag = child.tag
        if tag == f'{{{W_NS}}}p':
            p_text = ''.join(node.text for node in child.iter(f'{{{W_NS}}}t') if node.text)
            if p_text.strip():
                output.append(p_text.strip())
        elif tag == f'{{{W_NS}}}tbl':
            output.append('--- TABLE START ---')
            for tr in child.findall(f'{{{W_NS}}}tr'):
                row = []
                for tc in tr.findall(f'{{{W_NS}}}tc'):
                    tc_text = ' '.join(''.join(node.text for node in p.iter(f'{{{W_NS}}}t') if node.text).strip()
                                       for p in tc.findall(f'{{{W_NS}}}p'))
                    row.append(tc_text.strip())
                output.append(' | '.join(row))
            output.append('--- TABLE END ---')
    return '\n'.join(output)

folder = r'D:\A - Học Tập\Thương Mại Điện Tử\BAO_CAO_NGHIEP_VU_WORD\02_Dac_Ta_Cac_Module_He_Thong'
for fname in sorted(os.listdir(folder)):
    if fname.endswith('.docx'):
        path = os.path.join(folder, fname)
        text = extract_docx_content(path)
        out_name = fname.replace('.docx', '.txt')
        out_path = os.path.join(r'd:\A - Học Tập\Thương Mại Điện Tử\.agents\teamwork\teamwork_spec_miner_survey_3', out_name)
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f'Extracted {fname} -> {out_name} ({len(text)} chars, {len(text.splitlines())} lines)')
