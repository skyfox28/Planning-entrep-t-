import { useState, useRef } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, Trash2,
  FileSpreadsheet, Printer, Copy, Calendar, RotateCcw
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { SHIFTS, SHIFT_BY_CODE } from '../data/shifts'
import { ROLE_COLORS } from '../data/roles'
import { getWeekStart, getWeekDays, addDays, getWeekNumber, fmtShort, fmtLong } from '../utils/dates'
import { exportToExcel } from '../utils/exportExcel'
import { exportToPDF } from '../utils/exportPDF'
import ShiftCell from './ShiftCell'

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// Summary bar: count per shift code per day
function DaySummary({ shifts }) {
  const counts = {}
  shifts.forEach(code => { if (code) counts[code] = (counts[code] || 0) + 1 })
  if (!Object.keys(counts).length) return <div className="h-6" />
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {Object.entries(counts).map(([code, n]) => {
        const s = SHIFT_BY_CODE[code]
        if (!s) return null
        return (
          <span
            key={code}
            className="text-[9px] font-bold px-1 rounded"
            style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
          >
            {code}×{n}
          </span>
        )
      })}
    </div>
  )
}

export default function PlanningTab() {
  const { state, dispatch } = useApp()
  const [weekStart, setWeekStart] = useState(getWeekStart())
  const [addEmpId, setAddEmpId] = useState('')
  const gridRef = useRef(null)

  const days = getWeekDays(weekStart)
  const weekNum = getWeekNumber(weekStart)
  const rows = state.plannings[weekStart] || []

  const prevWeek = addDays(weekStart, -7)
  const nextWeek = addDays(weekStart, 7)

  // Employees not yet in this planning
  const usedIds = new Set(rows.map(r => r.employeeId))
  const available = state.employees.filter(e => !usedIds.has(e.id))

  function addEmployee() {
    if (!addEmpId) return
    dispatch({ type: 'ADD_PLANNING_ROW', payload: { weekStart, employeeId: addEmpId } })
    setAddEmpId('')
  }

  function removeRow(rowIndex) {
    dispatch({ type: 'REMOVE_PLANNING_ROW', payload: { weekStart, rowIndex } })
  }

  function setShift(rowIndex, dayIndex, code) {
    dispatch({ type: 'UPDATE_SHIFT', payload: { weekStart, rowIndex, dayIndex, shiftCode: code } })
  }

  function applyAll(rowIndex, code) {
    dispatch({ type: 'APPLY_SHIFT_ALL_WEEK', payload: { weekStart, rowIndex, shiftCode: code } })
  }

  function copyPrevious() {
    const prevRows = state.plannings[prevWeek]
    if (!prevRows?.length) return alert('Aucun planning la semaine précédente.')
    if (rows.length && !confirm('Écraser le planning de cette semaine ?')) return
    dispatch({ type: 'COPY_PREVIOUS_WEEK', payload: { fromWeek: prevWeek, toWeek: weekStart } })
  }

  function handleExcelExport() {
    exportToExcel(weekStart, rows, state.employees)
  }

  function handlePDFExport() {
    exportToPDF(weekStart, rows, state.employees)
  }

  // Per-day shifts for summary row
  const shiftsByDay = Array.from({ length: 7 }, (_, di) =>
    rows.map(r => r.shifts[di]).filter(Boolean)
  )

  return (
    <div className="space-y-4">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Week navigation */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => setWeekStart(prevWeek)}
            className="p-2.5 hover:bg-slate-100 transition-colors text-slate-600"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="px-3 text-center min-w-[180px]">
            <div className="text-xs text-slate-400 font-medium">Semaine {weekNum}</div>
            <div className="text-sm font-semibold text-slate-700">
              {fmtShort(days[0])} – {fmtShort(days[6])} {days[0].getFullYear()}
            </div>
          </div>
          <button
            onClick={() => setWeekStart(nextWeek)}
            className="p-2.5 hover:bg-slate-100 transition-colors text-slate-600"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Today */}
        <button
          onClick={() => setWeekStart(getWeekStart())}
          className="flex items-center gap-1.5 text-sm px-3 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Calendar size={15} />
          Aujourd'hui
        </button>

        {/* Add employee */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl shadow-sm px-3 py-1.5">
          <select
            className="text-sm text-slate-700 bg-transparent focus:outline-none min-w-[200px]"
            value={addEmpId}
            onChange={e => setAddEmpId(e.target.value)}
          >
            <option value="">— Ajouter un employé —</option>
            {available.map(e => (
              <option key={e.id} value={e.id}>
                {e.nom} {e.prenom}  ({e.poste})
              </option>
            ))}
          </select>
          <button
            onClick={addEmployee}
            disabled={!addEmpId}
            className="flex items-center gap-1 text-sm bg-[#003366] text-white px-3 py-1.5 rounded-lg disabled:opacity-30 hover:bg-blue-900 transition-colors"
          >
            <Plus size={14} /> Ajouter
          </button>
        </div>

        <div className="flex-1" />

        {/* Copy previous week */}
        <button
          onClick={copyPrevious}
          className="flex items-center gap-1.5 text-sm px-3 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Copy size={15} />
          Copier sem. préc.
        </button>

        {/* Exports */}
        <button
          onClick={handlePDFExport}
          className="flex items-center gap-1.5 text-sm px-3 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm"
        >
          <Printer size={15} />
          PDF
        </button>
        <button
          onClick={handleExcelExport}
          className="flex items-center gap-1.5 text-sm px-3 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <FileSpreadsheet size={15} />
          Excel
        </button>
      </div>

      {/* ── Legend strip ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Légende</span>
        {SHIFTS.map(s => (
          <span
            key={s.code}
            className="text-xs font-semibold px-2 py-0.5 rounded-md"
            style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
          >
            {s.code} {s.detail || s.label}
          </span>
        ))}
      </div>

      {/* ── Planning grid ─────────────────────────────────────────────────── */}
      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm py-20 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">Planning vide</h3>
          <p className="text-sm text-slate-400">Ajoutez des employés via le menu ci-dessus pour commencer.</p>
        </div>
      ) : (
        <div ref={gridRef} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full border-collapse" style={{ minWidth: 900 }}>

              {/* Header */}
              <thead>
                <tr className="bg-[#003366]">
                  <th
                    className="text-left px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider sticky left-0 z-20 bg-[#003366]"
                    style={{ minWidth: 200 }}
                  >
                    Employé
                  </th>
                  {days.map((d, i) => {
                    const isWe = i >= 5
                    return (
                      <th
                        key={i}
                        className={`text-center py-3 text-xs font-semibold uppercase tracking-wider ${isWe ? 'bg-[#1a3a5c] text-slate-300' : 'text-white'}`}
                        style={{ minWidth: 120 }}
                      >
                        <div>{DAYS_FR[i]}</div>
                        <div className="font-normal opacity-75 mt-0.5">{fmtShort(d)}</div>
                      </th>
                    )
                  })}
                  <th className="bg-[#003366] w-10" />
                </tr>
              </thead>

              <tbody>
                {rows.map((row, rowIdx) => {
                  const emp = state.employees.find(e => e.id === row.employeeId)
                  if (!emp) return null
                  const rc = ROLE_COLORS[emp.poste] || { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' }
                  const isEven = rowIdx % 2 === 0

                  return (
                    <tr key={rowIdx} className={isEven ? 'bg-white' : 'bg-slate-50/70'}>
                      {/* Employee column (sticky) */}
                      <td
                        className={`px-4 py-2 sticky left-0 z-10 border-r border-slate-200 ${isEven ? 'bg-white' : 'bg-slate-50'}`}
                        style={{ minWidth: 200 }}
                      >
                        <div className="font-semibold text-slate-800 text-sm leading-tight">
                          {emp.nom} {emp.prenom}
                        </div>
                        <span
                          className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5"
                          style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}
                        >
                          {emp.poste}
                        </span>
                      </td>

                      {/* Shift cells */}
                      {row.shifts.map((code, dayIdx) => {
                        const isWe = dayIdx >= 5
                        return (
                          <td
                            key={dayIdx}
                            className={`border-r border-slate-100 p-1 ${isWe ? 'bg-slate-50/80' : ''}`}
                            style={{ minWidth: 120 }}
                          >
                            <ShiftCell
                              value={code}
                              onChange={c => setShift(rowIdx, dayIdx, c)}
                            />
                          </td>
                        )
                      })}

                      {/* Remove row */}
                      <td className="p-1 text-center">
                        <button
                          onClick={() => removeRow(rowIdx)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}

                {/* Summary row */}
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td className="px-4 py-2 sticky left-0 bg-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total / jour
                  </td>
                  {shiftsByDay.map((dayShifts, i) => (
                    <td key={i} className="p-1.5 text-center">
                      <DaySummary shifts={dayShifts} />
                    </td>
                  ))}
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk-apply helper tip */}
      {rows.length > 0 && (
        <p className="text-xs text-slate-400 text-center">
          💡 Cliquez sur une cellule pour choisir le créneau · Le résumé en bas indique les effectifs par équipe et par jour
        </p>
      )}
    </div>
  )
}
