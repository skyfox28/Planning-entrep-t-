import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
import datetime

wb = openpyxl.Workbook()

# ── Palette ──────────────────────────────────────────────────────────────────
C = {
    'title_bg':    '0070C0',
    'title_txt':   'FFFFFF',
    'header_bg':   '1F4E79',
    'header_txt':  'FFFFFF',
    'role_bg':     '2E75B6',
    'role_txt':    'FFFFFF',
    'matin_bg':    'FFE699',   # jaune doux
    'matin_txt':   '7F6000',
    'aprem_bg':    'BDD7EE',   # bleu clair
    'aprem_txt':   '1F4E79',
    'nuit_bg':     '2E4057',   # marine
    'nuit_txt':    'FFFFFF',
    'journee_bg':  'E2EFDA',   # vert pâle
    'journee_txt': '375623',
    'row_odd':     'DEEAF1',
    'row_even':    'FFFFFF',
    'weekend':     'F2F2F2',
    'border':      'BDD7EE',
    'legend_title':'1F4E79',
}

def fill(hex_color):
    return PatternFill(fill_type='solid', fgColor=hex_color)

def font(hex_color, bold=False, size=11, name='Calibri'):
    return Font(color=hex_color, bold=bold, size=size, name=name)

def border_thin(color='BDD7EE'):
    s = Side(style='thin', color=color)
    return Border(left=s, right=s, top=s, bottom=s)

def border_medium():
    s = Side(style='medium', color='1F4E79')
    return Border(left=s, right=s, top=s, bottom=s)

def center(wrap=False):
    return Alignment(horizontal='center', vertical='center', wrap_text=wrap)

def left(wrap=False):
    return Alignment(horizontal='left', vertical='center', wrap_text=wrap)

# ── Feuille PLANNING ─────────────────────────────────────────────────────────
ws = wb.active
ws.title = 'Planning Entrepôt'
ws.sheet_view.showGridLines = False

# Congeler volet au-delà de la colonne B et ligne 5
ws.freeze_panes = 'C5'

# Semaine de référence (lundi courant)
today = datetime.date.today()
monday = today - datetime.timedelta(days=today.weekday())
days_fr = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

# ── Ligne 1 : Titre ───────────────────────────────────────────────────────────
ws.merge_cells('A1:I1')
ws.row_dimensions[1].height = 40
t = ws['A1']
t.value = '📦  PLANNING ENTREPÔT  –  Semaine du {} au {}'.format(
    monday.strftime('%d/%m/%Y'), (monday + datetime.timedelta(6)).strftime('%d/%m/%Y'))
t.fill   = fill(C['title_bg'])
t.font   = font(C['title_txt'], bold=True, size=16)
t.alignment = center()
t.border = border_medium()

# ── Ligne 2 : Légende équipes ─────────────────────────────────────────────────
ws.row_dimensions[2].height = 24
legend = [
    ('Matin (M)',       C['matin_bg'],   C['matin_txt']),
    ('Après-midi (AM)', C['aprem_bg'],   C['aprem_txt']),
    ('Nuit (N)',        C['nuit_bg'],    C['nuit_txt']),
    ('Journée (J)',     C['journee_bg'], C['journee_txt']),
]
ws.merge_cells('A2:B2')
lbl = ws['A2']
lbl.value   = 'Légende équipes'
lbl.fill    = fill(C['legend_title'])
lbl.font    = font('FFFFFF', bold=True)
lbl.alignment = center()
lbl.border  = border_thin()

for idx, (label, bg, txt) in enumerate(legend):
    col_letter = get_column_letter(3 + idx * 2)
    col_end    = get_column_letter(4 + idx * 2)
    ws.merge_cells(f'{col_letter}2:{col_end}2')
    cell = ws[f'{col_letter}2']
    cell.value     = label
    cell.fill      = fill(bg)
    cell.font      = font(txt, bold=True)
    cell.alignment = center()
    cell.border    = border_thin()

# ── Ligne 3 : vide (séparateur) ───────────────────────────────────────────────
ws.row_dimensions[3].height = 8
ws.merge_cells('A3:I3')
ws['A3'].fill = fill('E9EFF7')

# ── Ligne 4 : En-têtes colonnes ───────────────────────────────────────────────
ws.row_dimensions[4].height = 32

# Colonne A : Poste
ws.column_dimensions['A'].width = 24
a4 = ws['A4']
a4.value     = 'POSTE'
a4.fill      = fill(C['header_bg'])
a4.font      = font(C['header_txt'], bold=True, size=11)
a4.alignment = center()
a4.border    = border_thin('FFFFFF')

# Colonne B : Nom/Prénom
ws.column_dimensions['B'].width = 20
b4 = ws['B4']
b4.value     = 'NOM / PRÉNOM'
b4.fill      = fill(C['header_bg'])
b4.font      = font(C['header_txt'], bold=True, size=11)
b4.alignment = center()
b4.border    = border_thin('FFFFFF')

# Colonnes C..I : jours
for j in range(7):
    col = get_column_letter(3 + j)
    ws.column_dimensions[col].width = 16
    d = monday + datetime.timedelta(days=j)
    cell = ws[f'{col}4']
    cell.value     = f'{days_fr[j]}\n{d.strftime("%d/%m")}'
    cell.fill      = fill('F2F2F2' if j >= 5 else C['header_bg'])
    cell.font      = font('555555' if j >= 5 else C['header_txt'], bold=True, size=10)
    cell.alignment = center(wrap=True)
    cell.border    = border_thin('FFFFFF' if j < 5 else C['border'])

# ── Postes (rôles) ────────────────────────────────────────────────────────────
roles = [
    ('Coordinateur',          ''),
    ('Réception',             ''),
    ('Réception',             ''),
    ('Expédition',            ''),
    ('Expédition',            ''),
    ('Cariste Quai',          ''),
    ('Cariste Quai',          ''),
    ('Cariste Entrée Silo',   ''),
    ('Cariste Sortie Silo',   ''),
    ('Cariste GMS',           ''),
    ('Cariste GMS',           ''),
    ('Préparateur',           ''),
    ('Préparateur',           ''),
    ('Préparateur',           ''),
    ('Préparateur',           ''),
]

# Validation déroulante : 4 créneaux + absence
SHIFTS = '"Matin (M),Après-midi (AM),Nuit (N),Journée (J),Repos (R),CP,Absent"'
dv = DataValidation(
    type='list',
    formula1=SHIFTS,
    allow_blank=True,
    showDropDown=False,
    showErrorMessage=True,
    errorTitle='Valeur invalide',
    error='Sélectionnez un créneau dans la liste.',
)
ws.add_data_validation(dv)

first_data_row = 5

for i, (role, nom) in enumerate(roles):
    row = first_data_row + i
    ws.row_dimensions[row].height = 26
    is_odd = (i % 2 == 0)
    row_bg = C['row_odd'] if is_odd else C['row_even']

    # Colonne A : rôle
    ca = ws[f'A{row}']
    ca.value     = role
    ca.fill      = fill(C['role_bg'])
    ca.font      = font(C['role_txt'], bold=True, size=10)
    ca.alignment = left()
    ca.border    = border_thin()

    # Colonne B : nom (modifiable)
    cb = ws[f'B{row}']
    cb.value     = nom
    cb.fill      = fill(row_bg)
    cb.font      = Font(size=10, name='Calibri', color='1F4E79')
    cb.alignment = left()
    cb.border    = border_thin()

    # Colonnes C..I : créneaux avec dropdown
    for j in range(7):
        col = get_column_letter(3 + j)
        cell = ws[f'{col}{row}']
        cell.fill      = fill('F9F9F9' if j >= 5 else row_bg)
        cell.font      = Font(size=10, name='Calibri', bold=True)
        cell.alignment = center()
        cell.border    = border_thin()
        dv.add(cell)

# ── Formatage conditionnel (couleur selon créneau) ───────────────────────────
data_range = f'C{first_data_row}:I{first_data_row + len(roles) - 1}'

shift_styles = [
    ('Matin (M)',       C['matin_bg'],   C['matin_txt']),
    ('Après-midi (AM)', C['aprem_bg'],   C['aprem_txt']),
    ('Nuit (N)',        C['nuit_bg'],    C['nuit_txt']),
    ('Journée (J)',     C['journee_bg'], C['journee_txt']),
    ('Repos (R)',       'E7E6E6',        '595959'),
    ('CP',              'FFF2CC',        'BF8F00'),
    ('Absent',          'FFE7E7',        'C00000'),
]

for shift_val, bg, txt in shift_styles:
    rule = FormulaRule(
        formula=[f'C{first_data_row}="{shift_val}"'],
        fill=fill(bg),
        font=Font(bold=True, color=txt, size=10, name='Calibri'),
    )
    ws.conditional_formatting.add(data_range, rule)

# ── Bordure externe du tableau ────────────────────────────────────────────────
last_row = first_data_row + len(roles) - 1
thick = Side(style='medium', color='1F4E79')
thin  = Side(style='thin',   color=C['border'])

for row in ws.iter_rows(min_row=4, max_row=last_row, min_col=1, max_col=9):
    for cell in row:
        top    = thick if cell.row == 4 else thin
        bottom = thick if cell.row == last_row else thin
        left_s = thick if cell.column == 1 else thin
        right_s= thick if cell.column == 9 else thin
        cell.border = Border(top=top, bottom=bottom, left=left_s, right=right_s)

# ── Feuille LÉGENDE HORAIRES ──────────────────────────────────────────────────
ws2 = wb.create_sheet('Légende & Paramètres')
ws2.sheet_view.showGridLines = False
ws2.column_dimensions['A'].width = 22
ws2.column_dimensions['B'].width = 28
ws2.column_dimensions['C'].width = 22
ws2.column_dimensions['D'].width = 28

ws2.merge_cells('A1:D1')
t2 = ws2['A1']
t2.value     = 'LÉGENDE DES CRÉNEAUX HORAIRES'
t2.fill      = fill(C['title_bg'])
t2.font      = font(C['title_txt'], bold=True, size=14)
t2.alignment = center()
ws2.row_dimensions[1].height = 35

headers2 = ['Code', 'Équipe', 'Horaire type', 'Couleur']
for ci, h in enumerate(headers2):
    cell = ws2.cell(row=2, column=ci+1, value=h)
    cell.fill      = fill(C['header_bg'])
    cell.font      = font(C['header_txt'], bold=True)
    cell.alignment = center()
    cell.border    = border_thin()
ws2.row_dimensions[2].height = 22

shifts_info = [
    ('M',  'Matin',       '06h00 – 14h00', C['matin_bg'],   C['matin_txt']),
    ('AM', 'Après-midi',  '14h00 – 22h00', C['aprem_bg'],   C['aprem_txt']),
    ('N',  'Nuit',        '22h00 – 06h00', C['nuit_bg'],    C['nuit_txt']),
    ('J',  'Journée',     '08h00 – 17h00', C['journee_bg'], C['journee_txt']),
    ('R',  'Repos',       '—',             'E7E6E6',         '595959'),
    ('CP', 'Congés payés','—',             'FFF2CC',         'BF8F00'),
    ('Abs','Absent',      '—',             'FFE7E7',         'C00000'),
]

for ri, (code, equipe, horaire, bg, txt) in enumerate(shifts_info):
    r = 3 + ri
    ws2.row_dimensions[r].height = 22
    for ci, val in enumerate([code, equipe, horaire]):
        cell = ws2.cell(row=r, column=ci+1, value=val)
        cell.fill      = fill(bg)
        cell.font      = font(txt, bold=(ci == 0), size=10)
        cell.alignment = center()
        cell.border    = border_thin()
    # Colonne D : swatch couleur
    swatch = ws2.cell(row=r, column=4, value='')
    swatch.fill   = fill(bg)
    swatch.border = border_thin()

# Paramètres modifiables
ws2.row_dimensions[12].height = 10
ws2.merge_cells('A12:D12')

ws2.merge_cells('A13:D13')
p = ws2['A13']
p.value     = 'PARAMÈTRES MODIFIABLES'
p.fill      = fill(C['legend_title'])
p.font      = font('FFFFFF', bold=True, size=12)
p.alignment = center()
ws2.row_dimensions[13].height = 28

params = [
    ('Établissement', 'Mon Entrepôt SA'),
    ('Responsable',   'Nom Responsable'),
    ('Site',          'Site / Zone'),
    ('Commentaire',   ''),
]
for pi, (param, val) in enumerate(params):
    r = 14 + pi
    ws2.row_dimensions[r].height = 22
    lbl_cell = ws2.cell(row=r, column=1, value=param)
    lbl_cell.fill      = fill(C['role_bg'])
    lbl_cell.font      = font(C['role_txt'], bold=True, size=10)
    lbl_cell.alignment = left()
    lbl_cell.border    = border_thin()

    ws2.merge_cells(f'B{r}:D{r}')
    val_cell = ws2.cell(row=r, column=2, value=val)
    val_cell.fill      = fill(C['row_odd'])
    val_cell.font      = Font(size=10, name='Calibri', color='1F4E79')
    val_cell.alignment = left()
    val_cell.border    = border_thin()

# ── Onglet couleur ────────────────────────────────────────────────────────────
ws.sheet_properties.tabColor  = '0070C0'
ws2.sheet_properties.tabColor = '70AD47'

# ── Sauvegarde ────────────────────────────────────────────────────────────────
out = 'Planning_Entrepot.xlsx'
wb.save(out)
print(f'Fichier créé : {out}')
