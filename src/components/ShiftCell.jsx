import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { SHIFTS, SHIFT_BY_CODE, SHIFT_GROUPS } from '../data/shifts'

function ShiftBadge({ shift, compact = false }) {
  if (!shift) return (
    <span className="text-slate-300 text-lg select-none">—</span>
  )
  return (
    <div
      className="rounded-md px-1.5 py-0.5 text-center leading-tight select-none"
      style={{ background: shift.bg, color: shift.text, border: `1px solid ${shift.border}` }}
    >
      <div className="font-bold text-xs">{shift.code}</div>
      {!compact && shift.detail && (
        <div className="text-[10px] opacity-80 whitespace-nowrap">{shift.detail}</div>
      )}
    </div>
  )
}

export default function ShiftCell({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const shift = value ? SHIFT_BY_CODE[value] : null

  useEffect(() => {
    if (!open) return
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <button
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`w-full min-h-[48px] flex items-center justify-center rounded transition-all
          ${disabled ? 'cursor-default' : 'cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-offset-1'}
          ${open ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
        `}
      >
        <ShiftBadge shift={shift} />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 w-72">
          {/* Arrow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45" />

          {SHIFT_GROUPS.map(groupe => {
            const groupShifts = SHIFTS.filter(s => s.groupe === groupe)
            return (
              <div key={groupe} className="mb-2 last:mb-0">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 px-1">
                  {groupe}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {groupShifts.map(s => (
                    <button
                      key={s.code}
                      onClick={() => { onChange(s.code); setOpen(false) }}
                      className="rounded-md px-2 py-1 text-left transition-transform hover:scale-105 hover:shadow-md"
                      style={{ background: s.bg, color: s.text, border: `1.5px solid ${s.border}` }}
                    >
                      <div className="font-bold text-xs">{s.code}</div>
                      {s.detail && <div className="text-[10px] opacity-80">{s.detail}</div>}
                      {!s.detail && <div className="text-[10px] opacity-80">{s.label}</div>}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="border-t border-slate-100 mt-2 pt-2">
            <button
              onClick={() => { onChange(null); setOpen(false) }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors px-1"
            >
              <X size={12} /> Effacer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
