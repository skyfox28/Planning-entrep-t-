import { SHIFT_BY_CODE } from '../data/shifts'
import { ROLE_COLORS } from '../data/roles'
import { getWeekDays, fmtShort, fmtLong, getWeekNumber } from './dates'

// Generates a clean printable HTML and opens the browser print dialog
export function exportToPDF(weekStart, rows, employees) {
  const days = getWeekDays(weekStart)
  const weekNum = getWeekNumber(weekStart)
  const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  const rowsHtml = rows.map(row => {
    const emp = employees.find(e => e.id === row.employeeId)
    if (!emp) return ''
    const rc = ROLE_COLORS[emp.poste] || { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' }
    const cells = row.shifts.map((code, i) => {
      const isWe = i >= 5
      if (!code) return `<td class="shift-cell${isWe ? ' weekend' : ''}"><span class="empty">—</span></td>`
      const s = SHIFT_BY_CODE[code]
      if (!s) return `<td class="shift-cell${isWe ? ' weekend' : ''}"><span>${code}</span></td>`
      return `
        <td class="shift-cell${isWe ? ' weekend' : ''}">
          <div class="badge" style="background:${s.bg};color:${s.text};border:1.5px solid ${s.border}">
            <strong>${s.code}</strong>
            ${s.detail ? `<br><small>${s.detail}</small>` : ''}
          </div>
        </td>`
    }).join('')

    return `
      <tr>
        <td class="emp-cell">
          <div class="emp-name">${emp.nom} ${emp.prenom}</div>
          <span class="role-badge" style="background:${rc.bg};color:${rc.text};border:1px solid ${rc.border}">${emp.poste}</span>
        </td>
        ${cells}
      </tr>`
  }).join('')

  const legendHtml = Object.values(SHIFT_BY_CODE).map(s =>
    `<span class="leg-item" style="background:${s.bg};color:${s.text};border:1.5px solid ${s.border}">
      <strong>${s.code}</strong> ${s.detail || s.label}
    </span>`
  ).join('')

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Planning Semaine ${weekNum}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1e293b; background: white; }
    @page { size: A4 landscape; margin: 10mm; }

    .header { background: #003366; color: white; padding: 10px 16px; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 15px; font-weight: 700; }
    .header .sub { font-size: 10px; opacity: 0.75; }

    .legend { padding: 6px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
    .legend-title { font-size: 9px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .05em; margin-right: 4px; }
    .leg-item { border-radius: 4px; padding: 2px 6px; font-size: 9px; white-space: nowrap; }

    table { width: 100%; border-collapse: collapse; margin-top: 0; }
    thead tr { background: #1e3a5f; }
    thead th { color: white; font-size: 10px; font-weight: 600; padding: 6px 4px; text-align: center; border: 1px solid #2d5282; }
    thead th.emp-th { text-align: left; padding-left: 10px; min-width: 130px; }
    thead th.weekend { background: #2d4a6e; color: #94a3b8; }

    tr:nth-child(even) td { background: #f8fafc; }
    tr:nth-child(odd) td { background: #ffffff; }
    td { border: 1px solid #e2e8f0; vertical-align: middle; }

    .emp-cell { padding: 4px 8px; min-width: 130px; }
    .emp-name { font-weight: 700; font-size: 11px; }
    .role-badge { display: inline-block; font-size: 8px; padding: 1px 5px; border-radius: 10px; margin-top: 2px; font-weight: 500; }

    .shift-cell { text-align: center; padding: 3px; width: 90px; }
    .shift-cell.weekend { background: #f1f5f9 !important; }
    .badge { border-radius: 5px; padding: 3px 5px; display: inline-block; text-align: center; min-width: 70px; }
    .badge strong { font-size: 11px; display: block; }
    .badge small { font-size: 8px; opacity: .85; }
    .empty { color: #cbd5e1; font-size: 13px; }

    .footer { margin-top: 6px; display: flex; justify-content: space-between; color: #94a3b8; font-size: 9px; padding: 0 2px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>📦 Planning Entrepôt — Semaine ${weekNum}</h1>
      <div class="sub">${fmtLong(days[0])} au ${fmtLong(days[6])}</div>
    </div>
    <div class="sub">${rows.length} employé${rows.length > 1 ? 's' : ''} planifié${rows.length > 1 ? 's' : ''}</div>
  </div>

  <div class="legend">
    <span class="legend-title">Légende</span>
    ${legendHtml}
  </div>

  <table>
    <thead>
      <tr>
        <th class="emp-th">Employé</th>
        ${DAYS.map((d, i) => `<th class="${i >= 5 ? 'weekend' : ''}">${d}<br><span style="font-weight:400;opacity:.8">${fmtShort(days[i])}</span></th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="8" style="text-align:center;padding:20px;color:#94a3b8">Aucun employé planifié cette semaine</td></tr>'}
    </tbody>
  </table>

  <div class="footer">
    <span>Imprimé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
    <span>Planning Entrepôt — Semaine ${weekNum} / ${days[0].getFullYear()}</span>
  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`

  const w = window.open('', '_blank')
  w.document.write(html)
  w.document.close()
}
