import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
from openpyxl.workbook.defined_name import DefinedName
import datetime

wb = openpyxl.Workbook()

# ── Palette ───────────────────────────────────────────────────────────────────
C = {
    'plan_title':  '003366',
    'emp_title':   '1A5C38',
    'hor_title':   'B35A00',
    'white':       'FFFFFF',
    'header':      '1F4E79',
    'role_col':    '2E75B6',
    'row_odd':     'DEEAF1',
    'row_even':    'FFFFFF',
    'formula_bg':  'EBF5FB',
    'sep':         'D6E4F0',
    'note_bg':     'EBF3FB',
    'note_txt':    '1F4E79',
    # Shifts
    'M1_bg':  'FFE699', 'M1_tx':  '7F6000',   # Matin 3×8
    'AM1_bg': 'BDD7EE', 'AM1_tx': '1F4E79',   # Après-midi 3×8
    'N1_bg':  '2E4057', 'N1_tx':  'FFFFFF',   # Nuit 3×8
    'M2_bg':  'FFD966', 'M2_tx':  '7F6000',   # Matin 3×7h36
    'AM2_bg': '9DC3E6', 'AM2_tx': '1F4E79',   # Après-midi 3×7h36
    'N2_bg':  '44546A', 'N2_tx':  'FFFFFF',   # Nuit 3×7h36
    'J_bg':   'E2EFDA', 'J_tx':   '375623',   # Journée
    'R_bg':   'E7E6E6', 'R_tx':   '595959',
    'CP_bg':  'FFF2CC', 'CP_tx':  'BF8F00',
    'RTT_bg': 'FCE4D6', 'RTT_tx': 'C55A11',
    'FM_bg':  'E9D7FD', 'FM_tx':  '7030A0',
    'MAL_bg': 'FFE7E7', 'MAL_tx': 'C00000',
    'ABS_bg': 'FFD7D7', 'ABS_tx': 'FF0000',
}

def xfill(h):
    return PatternFill(fill_type='solid', fgColor=h)

def xfont(color='000000', bold=False, size=11, italic=False):
    return Font(color=color, bold=bold, size=size, italic=italic, name='Calibri')

def xborder(color='BDD7EE', style='thin'):
    s = Side(style=style, color=color)
    return Border(left=s, right=s, top=s, bottom=s)

def xcenter(wrap=False):
    return Alignment(horizontal='center', vertical='center', wrap_text=wrap)

def xleft(indent=1, wrap=False):
    return Alignment(horizontal='left', vertical='center', indent=indent, wrap_text=wrap)

def hdr(cell, text, bg, txt='FFFFFF', bold=True, size=10, align='center', wrap=False):
    cell.value     = text
    cell.fill      = xfill(bg)
    cell.font      = xfont(txt, bold=bold, size=size)
    cell.alignment = xcenter(wrap) if align == 'center' else xleft(wrap=wrap)
    cell.border    = xborder('FFFFFF', 'thin')

# ── Sheet creation order ──────────────────────────────────────────────────────
ws_plan = wb.active
ws_plan.title = 'PLANNING'
ws_emp  = wb.create_sheet('BASE_EMPLOYES')
ws_hor  = wb.create_sheet('BASE_HORAIRES')

ws_plan.sheet_properties.tabColor = '003366'
ws_emp.sheet_properties.tabColor  = '1A5C38'
ws_hor.sheet_properties.tabColor  = 'B35A00'

ROLES = [
    'Coordinateur',
    'Réception',
    'Expédition',
    'Cariste Quai',
    'Cariste Entrée Silo',
    'Cariste Sortie Silo',
    'Cariste GMS',
    'Préparateur',
]

SHIFTS = [
    # code, libellé, début, fin, durée, groupe, bg, txt
    ('M1',  'Matin        05h00 – 13h00',   '05:00','13:00','8h00',  '3×8',     'FFE699','7F6000'),
    ('AM1', 'Après-midi   13h00 – 21h00',   '13:00','21:00','8h00',  '3×8',     'BDD7EE','1F4E79'),
    ('N1',  'Nuit         21h00 – 05h00',   '21:00','05:00','8h00',  '3×8',     '2E4057','FFFFFF'),
    ('M2',  'Matin        05h00 – 12h36',   '05:00','12:36','7h36',  '3×7h36',  'FFD966','7F6000'),
    ('AM2', 'Après-midi   12h24 – 20h00',   '12:24','20:00','7h36',  '3×7h36',  '9DC3E6','1F4E79'),
    ('N2',  'Nuit         20h00 – 03h36',   '20:00','03:36','7h36',  '3×7h36',  '44546A','FFFFFF'),
    ('J',   'Journée      08h00 – 16h16',   '08:00','16:16','7h36',  'Journée', 'E2EFDA','375623'),
    ('R',   'Repos',                         '—',   '—',   '—',     'Absence', 'E7E6E6','595959'),
    ('CP',  'Congés Payés',                  '—',   '—',   '—',     'Absence', 'FFF2CC','BF8F00'),
    ('RTT', 'RTT',                           '—',   '—',   '—',     'Absence', 'FCE4D6','C55A11'),
    ('FM',  'Formation',                     '—',   '—',   '—',     'Absence', 'E9D7FD','7030A0'),
    ('MAL', 'Maladie / Arrêt',               '—',   '—',   '—',     'Absence', 'FFE7E7','C00000'),
    ('ABS', 'Absence',                       '—',   '—',   '—',     'Absence', 'FFD7D7','FF0000'),
]

NUM_EMP   = 30   # employee rows in BASE_EMPLOYES
NUM_ROWS  = 30   # planning rows

# ═══════════════════════════════════════════════════════════════════════════════
#  BASE_HORAIRES
# ═══════════════════════════════════════════════════════════════════════════════
ws = ws_hor
ws.sheet_view.showGridLines = False
ws.column_dimensions['A'].width = 7
ws.column_dimensions['B'].width = 32
ws.column_dimensions['C'].width = 10
ws.column_dimensions['D'].width = 10
ws.column_dimensions['E'].width = 8
ws.column_dimensions['F'].width = 12
ws.column_dimensions['G'].width = 28

# Title
ws.merge_cells('A1:G1')
ws.row_dimensions[1].height = 38
hdr(ws['A1'], '⏰   BASE DES HORAIRES  –  Entrepôt', C['hor_title'], size=14)

# Instruction
ws.merge_cells('A2:G2')
ws.row_dimensions[2].height = 24
n = ws['A2']
n.value = ('La colonne CODE alimente les listes déroulantes du planning. '
           'Vous pouvez ajouter vos propres codes dans les lignes vides du bas. '
           'Ne pas modifier la colonne A des lignes existantes.')
n.fill = xfill('FFF3E0'); n.font = xfont('7F4F00', size=9, italic=True)
n.alignment = xleft(wrap=True); ws.row_dimensions[2].height = 28

# Column headers
ws.row_dimensions[3].height = 24
for ci, h in enumerate(['Code','Libellé','Début','Fin','Durée','Groupe','Remarque']):
    c = ws.cell(row=3, column=ci+1)
    hdr(c, h, C['header'])

# Shift rows
HOR_DATA_START = 4
for i, (code, label, deb, fin, dur, grp, bg, tx) in enumerate(SHIFTS):
    r = HOR_DATA_START + i
    ws.row_dimensions[r].height = 24
    vals = [code, label, deb, fin, dur, grp, '']
    for ci, v in enumerate(vals):
        c = ws.cell(row=r, column=ci+1, value=v)
        c.fill = xfill(bg)
        c.font = xfont(tx, bold=(ci == 0), size=10)
        c.alignment = xcenter() if ci in [0,2,3,4] else xleft()
        c.border = xborder()

# 5 blank rows for user additions
for i in range(5):
    r = HOR_DATA_START + len(SHIFTS) + i
    ws.row_dimensions[r].height = 22
    for ci in range(7):
        c = ws.cell(row=r, column=ci+1)
        c.fill = xfill('FAFAFA'); c.border = xborder('D0D0D0')

HOR_LAST = HOR_DATA_START + len(SHIFTS) - 1   # last row of actual shift codes

# ═══════════════════════════════════════════════════════════════════════════════
#  BASE_EMPLOYES
# ═══════════════════════════════════════════════════════════════════════════════
ws = ws_emp
ws.sheet_view.showGridLines = False
ws.column_dimensions['A'].width = 5
ws.column_dimensions['B'].width = 26
ws.column_dimensions['C'].width = 20
ws.column_dimensions['D'].width = 18
ws.column_dimensions['E'].width = 26
ws.column_dimensions['F'].width = 3
ws.column_dimensions['G'].width = 26

# Title
ws.merge_cells('A1:E1')
ws.row_dimensions[1].height = 38
hdr(ws['A1'], '👥   BASE DES EMPLOYÉS  –  Entrepôt', C['emp_title'], size=14)

# Roles list title (col G)
g1 = ws.cell(row=1, column=7, value='▸  Liste des postes')
g1.fill = xfill('1A5C38'); g1.font = xfont('FFFFFF', bold=True, size=11)
g1.alignment = xleft(); g1.border = xborder()

# Instruction
ws.merge_cells('A2:E2')
ws.row_dimensions[2].height = 28
n = ws['A2']
n.value = ('Saisissez le Poste (liste déroulante), le Nom et le Prénom. '
           'La colonne "Nom Complet" se calcule seule et alimente directement le planning.')
n.fill = xfill(C['note_bg']); n.font = xfont(C['note_txt'], size=9, italic=True)
n.alignment = xleft(wrap=True)

# Column headers
ws.row_dimensions[3].height = 26
for ci, h in enumerate(['N°', 'Poste', 'Nom', 'Prénom', 'Nom Complet  (auto ✓)']):
    c = ws.cell(row=3, column=ci+1)
    hdr(c, h, C['header'])

# Roles reference list (col G) — used as named range LISTE_POSTES
ROLES_START = 2
for ri, role in enumerate(ROLES):
    r = ROLES_START + ri
    ws.row_dimensions[r].height = 22
    c = ws.cell(row=r, column=7, value=role)
    c.fill = xfill(C['row_odd'] if ri % 2 == 0 else C['row_even'])
    c.font = xfont('1A5C38', bold=False, size=10)
    c.alignment = xleft(); c.border = xborder()

# Data validation on Poste column (col B) in BASE_EMPLOYES
dv_poste_emp = DataValidation(type='list', formula1='LISTE_POSTES',
                               allow_blank=True, showDropDown=False)
ws_emp.add_data_validation(dv_poste_emp)

# Employee rows
EMP_DATA_START = 4
example = [
    ('Coordinateur',          'MARTIN',   'Sophie'),
    ('Réception',             'DUPONT',   'Thomas'),
    ('Réception',             'BERNARD',  'Julie'),
    ('Réception',             'PETIT',    'Laura'),
    ('Expédition',            'ROBERT',   'Maxime'),
    ('Expédition',            'RICHARD',  'Claire'),
    ('Expédition',            'SIMON',    'Nicolas'),
    ('Cariste Quai',          'LAURENT',  'Kevin'),
    ('Cariste Quai',          'THOMAS',   'Antoine'),
    ('Cariste Entrée Silo',   'LEROY',    'Stéphane'),
    ('Cariste Entrée Silo',   'MOREAU',   'Emilie'),
    ('Cariste Sortie Silo',   'GARNIER',  'Lucas'),
    ('Cariste Sortie Silo',   'BLANC',    'Marie'),
    ('Cariste GMS',           'GUERIN',   'Alexis'),
    ('Cariste GMS',           'MOULIN',   'Sarah'),
    ('Préparateur',           'ADAM',     'Julien'),
    ('Préparateur',           'RENARD',   'Aurélie'),
    ('Préparateur',           'MOREL',    'Théo'),
    ('Préparateur',           'ANDRE',    'Céline'),
    ('Préparateur',           'CLEMENT',  'Baptiste'),
]

for i in range(NUM_EMP):
    r = EMP_DATA_START + i
    ws.row_dimensions[r].height = 22
    odd = (i % 2 == 0)
    bg  = C['row_odd'] if odd else C['row_even']

    # N°
    c = ws.cell(row=r, column=1, value=i+1)
    c.fill = xfill(C['role_col']); c.font = xfont('FFFFFF', bold=True, size=9)
    c.alignment = xcenter(); c.border = xborder()

    # Poste, Nom, Prénom
    poste, nom, prenom = example[i] if i < len(example) else ('', '', '')
    for ci, val in enumerate([poste, nom, prenom], start=2):
        c = ws.cell(row=r, column=ci, value=val)
        c.fill = xfill(bg); c.font = xfont('1F4E79', size=10)
        c.alignment = xleft(); c.border = xborder()
        if ci == 2:
            dv_poste_emp.add(c)

    # Nom Complet (formula)
    nc = ws.cell(row=r, column=5)
    nc.value = f'=IF(C{r}="","",C{r}&" "&D{r})'
    nc.fill = xfill(C['formula_bg'])
    nc.font = xfont('1F4E79', size=10, italic=True)
    nc.alignment = xleft(); nc.border = xborder('9DC3E6')

EMP_LAST = EMP_DATA_START + NUM_EMP - 1

# ═══════════════════════════════════════════════════════════════════════════════
#  NAMED RANGES
# ═══════════════════════════════════════════════════════════════════════════════
def add_named_range(name, sheet_title, col, row_start, row_end):
    dn = DefinedName(name)
    dn.attr_text = f"'{sheet_title}'!${col}${row_start}:${col}${row_end}"
    wb.defined_names.add(dn)

add_named_range('LISTE_HORAIRES', 'BASE_HORAIRES', 'A', HOR_DATA_START, HOR_LAST)
add_named_range('LISTE_EMPLOYES', 'BASE_EMPLOYES', 'E', EMP_DATA_START, EMP_LAST)
add_named_range('LISTE_POSTES',   'BASE_EMPLOYES', 'G', ROLES_START,
                ROLES_START + len(ROLES) - 1)

# ═══════════════════════════════════════════════════════════════════════════════
#  PLANNING
# ═══════════════════════════════════════════════════════════════════════════════
ws = ws_plan
ws.sheet_view.showGridLines = False
ws.freeze_panes = 'C6'   # freeze Poste + Employé + header rows

today  = datetime.date.today()
monday = today - datetime.timedelta(days=today.weekday())
DAYS   = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']

# Column widths
ws.column_dimensions['A'].width = 24   # Poste
ws.column_dimensions['B'].width = 22   # Employé
for j in range(7):
    ws.column_dimensions[get_column_letter(3+j)].width = 14

# ── Row 1 : Main title ────────────────────────────────────────────────────────
ws.merge_cells('A1:I1')
ws.row_dimensions[1].height = 44
t = ws['A1']
t.value = ('PLANNING  ENTREPÔT   ▸   '
           f'Semaine du {monday.strftime("%d/%m/%Y")}'
           f'  au  {(monday+datetime.timedelta(6)).strftime("%d/%m/%Y")}')
t.fill = xfill(C['plan_title'])
t.font = xfont('FFFFFF', bold=True, size=15)
t.alignment = xcenter()

# ── Rows 2-3 : Legend ─────────────────────────────────────────────────────────
legend_main = [
    ('M1  Matin 5h-13h',       'FFE699','7F6000'),
    ('AM1  Ap-midi 13h-21h',   'BDD7EE','1F4E79'),
    ('N1  Nuit 21h-5h',        '2E4057','FFFFFF'),
    ('M2  Matin 5h-12h36',     'FFD966','7F6000'),
    ('AM2  Ap-midi 12h24-20h', '9DC3E6','1F4E79'),
    ('N2  Nuit 20h-3h36',      '44546A','FFFFFF'),
    ('J  Journée 8h-16h16',    'E2EFDA','375623'),
]
legend_abs = [
    ('R  Repos',     'E7E6E6','595959'),
    ('CP  Congés',   'FFF2CC','BF8F00'),
    ('RTT',          'FCE4D6','C55A11'),
    ('FM  Formation','E9D7FD','7030A0'),
    ('MAL  Maladie', 'FFE7E7','C00000'),
    ('ABS  Absence', 'FFD7D7','FF0000'),
]

def make_legend_row(ws, row_num, height, label_text, label_bg, items):
    ws.row_dimensions[row_num].height = height
    ws.merge_cells(f'A{row_num}:B{row_num}')
    lbl = ws[f'A{row_num}']
    lbl.value = label_text; lbl.fill = xfill(label_bg)
    lbl.font = xfont('FFFFFF', bold=True, size=9); lbl.alignment = xcenter()
    lbl.border = xborder()
    for idx, (txt, bg, ftxt) in enumerate(items):
        col = get_column_letter(3 + idx)
        c = ws[f'{col}{row_num}']
        c.value = txt; c.fill = xfill(bg)
        c.font = xfont(ftxt, bold=True, size=8)
        c.alignment = xcenter(wrap=True); c.border = xborder()

make_legend_row(ws, 2, 20, 'ÉQUIPES', C['plan_title'], legend_main)
make_legend_row(ws, 3, 18, 'ABSENCES', '555555', legend_abs)

# ── Row 4 : Separator ─────────────────────────────────────────────────────────
ws.merge_cells('A4:I4')
ws.row_dimensions[4].height = 6
ws['A4'].fill = xfill(C['sep'])

# ── Row 5 : Column headers ────────────────────────────────────────────────────
ws.row_dimensions[5].height = 34
hdr(ws['A5'], 'POSTE',    C['header'], size=11)
hdr(ws['B5'], 'EMPLOYÉ',  C['header'], size=11)
for j in range(7):
    d    = monday + datetime.timedelta(days=j)
    col  = get_column_letter(3+j)
    iswe = (j >= 5)
    c = ws[f'{col}5']
    c.value     = f'{DAYS[j]}\n{d.strftime("%d/%m")}'
    c.fill      = xfill('C9C9C9' if iswe else C['header'])
    c.font      = xfont('444444' if iswe else 'FFFFFF', bold=True, size=10)
    c.alignment = xcenter(wrap=True)
    c.border    = xborder('FFFFFF' if not iswe else 'BBBBBB')

# ── Data rows ─────────────────────────────────────────────────────────────────
PLAN_START = 6

dv_poste = DataValidation(type='list', formula1='LISTE_POSTES',
                           allow_blank=True, showDropDown=False)
dv_emp   = DataValidation(type='list', formula1='LISTE_EMPLOYES',
                           allow_blank=True, showDropDown=False)
dv_shift = DataValidation(type='list', formula1='LISTE_HORAIRES',
                           allow_blank=True, showDropDown=False)
ws.add_data_validation(dv_poste)
ws.add_data_validation(dv_emp)
ws.add_data_validation(dv_shift)

# Pre-fill roles (~30 rows)
init_roles = (
    ['Coordinateur']      * 2 +
    ['Réception']         * 4 +
    ['Expédition']        * 4 +
    ['Cariste Quai']      * 4 +
    ['Cariste Entrée Silo']* 3 +
    ['Cariste Sortie Silo']* 3 +
    ['Cariste GMS']       * 4 +
    ['Préparateur']       * 6
)
init_roles = (init_roles + [''] * NUM_ROWS)[:NUM_ROWS]

for i in range(NUM_ROWS):
    r   = PLAN_START + i
    odd = (i % 2 == 0)
    bg  = C['row_odd'] if odd else C['row_even']
    ws.row_dimensions[r].height = 26

    # Col A – Poste
    ca = ws[f'A{r}']
    ca.value = init_roles[i]
    ca.fill  = xfill(C['role_col'])
    ca.font  = xfont('FFFFFF', bold=True, size=10)
    ca.alignment = xleft(); ca.border = xborder()
    dv_poste.add(ca)

    # Col B – Employé
    cb = ws[f'B{r}']
    cb.fill = xfill(bg)
    cb.font = xfont('1F4E79', size=10)
    cb.alignment = xleft(); cb.border = xborder()
    dv_emp.add(cb)

    # Cols C-I – Shifts
    for j in range(7):
        col  = get_column_letter(3+j)
        iswe = (j >= 5)
        c = ws[f'{col}{r}']
        c.fill      = xfill('F0F0F0' if iswe else bg)
        c.font      = xfont('1F4E79', bold=True, size=10)
        c.alignment = xcenter()
        c.border    = xborder()
        dv_shift.add(c)

# ── Conditional formatting ────────────────────────────────────────────────────
PLAN_END  = PLAN_START + NUM_ROWS - 1
cf_range  = f'C{PLAN_START}:I{PLAN_END}'

cf_rules = [(code, bg, tx) for code, _, _, _, _, _, bg, tx in SHIFTS]
for code, bg, tx in cf_rules:
    rule = FormulaRule(
        formula=[f'C{PLAN_START}="{code}"'],
        fill=xfill(bg),
        font=Font(bold=True, color=tx, size=10, name='Calibri'),
    )
    ws.conditional_formatting.add(cf_range, rule)

# ── Outer frame ───────────────────────────────────────────────────────────────
thick = Side(style='medium', color='1F4E79')
thin  = Side(style='thin',   color='BDD7EE')

for row in ws.iter_rows(min_row=5, max_row=PLAN_END, min_col=1, max_col=9):
    for cell in row:
        cell.border = Border(
            top    = thick if cell.row == 5          else thin,
            bottom = thick if cell.row == PLAN_END   else thin,
            left   = thick if cell.column == 1       else thin,
            right  = thick if cell.column == 9       else thin,
        )

# ── Print setup ───────────────────────────────────────────────────────────────
ws_plan.page_setup.orientation = 'landscape'
ws_plan.page_setup.fitToPage   = True
ws_plan.page_setup.fitToWidth  = 1
ws_plan.page_setup.fitToHeight = 0

# ── Save ──────────────────────────────────────────────────────────────────────
out = 'Planning_Entrepot.xlsx'
wb.save(out)
print(f'OK – {out}')
