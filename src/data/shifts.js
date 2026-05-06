export const SHIFTS = [
  { code: 'M1',  label: 'Matin',      detail: '05h00 – 13h00', groupe: '3×8',     bg: '#FFF3B0', text: '#7F6000', border: '#FFC107' },
  { code: 'AM1', label: 'Après-midi', detail: '13h00 – 21h00', groupe: '3×8',     bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
  { code: 'N1',  label: 'Nuit',       detail: '21h00 – 05h00', groupe: '3×8',     bg: '#1E293B', text: '#F1F5F9', border: '#334155' },
  { code: 'M2',  label: 'Matin',      detail: '05h00 – 12h36', groupe: '3×7h36',  bg: '#FEF08A', text: '#713F12', border: '#EAB308' },
  { code: 'AM2', label: 'Après-midi', detail: '12h24 – 20h00', groupe: '3×7h36',  bg: '#BAE6FD', text: '#0C4A6E', border: '#0EA5E9' },
  { code: 'N2',  label: 'Nuit',       detail: '20h00 – 03h36', groupe: '3×7h36',  bg: '#334155', text: '#E2E8F0', border: '#475569' },
  { code: 'J',   label: 'Journée',    detail: '08h00 – 16h16', groupe: 'Journée', bg: '#DCFCE7', text: '#14532D', border: '#22C55E' },
  { code: 'R',   label: 'Repos',      detail: '',               groupe: 'Absence', bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' },
  { code: 'CP',  label: 'Congés',     detail: '',               groupe: 'Absence', bg: '#FEF9C3', text: '#A16207', border: '#FACC15' },
  { code: 'RTT', label: 'RTT',        detail: '',               groupe: 'Absence', bg: '#FFEDD5', text: '#C2410C', border: '#FB923C' },
  { code: 'FM',  label: 'Formation',  detail: '',               groupe: 'Absence', bg: '#F3E8FF', text: '#6B21A8', border: '#A855F7' },
  { code: 'MAL', label: 'Maladie',    detail: '',               groupe: 'Absence', bg: '#FFE4E6', text: '#9F1239', border: '#F43F5E' },
  { code: 'ABS', label: 'Absence',    detail: '',               groupe: 'Absence', bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
]

export const SHIFT_BY_CODE = Object.fromEntries(SHIFTS.map(s => [s.code, s]))
export const SHIFT_GROUPS  = [...new Set(SHIFTS.map(s => s.groupe))]
