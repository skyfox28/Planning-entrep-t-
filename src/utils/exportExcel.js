import * as XLSX from 'xlsx'
import { SHIFT_BY_CODE } from '../data/shifts'
import { getWeekDays, fmtShort, getWeekNumber, fmtLong } from './dates'

export function exportToExcel(weekStart, rows, employees) {
  const days = getWeekDays(weekStart)
  const weekNum = getWeekNumber(weekStart)
  const wb = XLSX.utils.book_new()

  // ── Planning sheet ─────────────────────────────────────────────────────────
  const aoa = []

  // Title row
  aoa.push([
    `PLANNING ENTREPÔT  –  Semaine ${weekNum}  (${fmtLong(days[0])} au ${fmtLong(days[6])})`,
  ])
  aoa.push([]) // blank

  // Header
  aoa.push([
    'Poste', 'Employé',
    ...days.map((d, i) => `${['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'][i]}\n${fmtShort(d)}`),
  ])

  // Data rows
  for (const row of rows) {
    const emp = employees.find(e => e.id === row.employeeId)
    if (!emp) continue
    aoa.push([
      emp.poste,
      `${emp.nom} ${emp.prenom}`,
      ...row.shifts.map(code => {
        if (!code) return ''
        const s = SHIFT_BY_CODE[code]
        return s ? `${code}${s.detail ? '  ' + s.detail : ''}` : code
      }),
    ])
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa)

  // Column widths
  ws['!cols'] = [
    { wch: 22 }, { wch: 22 },
    ...Array(7).fill({ wch: 18 }),
  ]

  // Merge title
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }]

  XLSX.utils.book_append_sheet(wb, ws, 'Planning')

  // ── Légende sheet ──────────────────────────────────────────────────────────
  const legend = [
    ['Code', 'Libellé', 'Horaire', 'Groupe'],
    ...Object.values(SHIFT_BY_CODE).map(s => [s.code, s.label, s.detail || '—', s.groupe]),
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(legend)
  ws2['!cols'] = [{ wch: 8 }, { wch: 14 }, { wch: 18 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Légende Horaires')

  XLSX.writeFile(wb, `Planning_Semaine${weekNum}.xlsx`)
}
