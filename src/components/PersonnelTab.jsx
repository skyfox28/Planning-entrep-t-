import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ROLES } from '../data/roles'
import { ROLE_COLORS } from '../data/roles'

function RoleBadge({ poste }) {
  const c = ROLE_COLORS[poste] || { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' }
  return (
    <span
      className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {poste}
    </span>
  )
}

function EmployeeModal({ employee, onSave, onClose }) {
  const [form, setForm] = useState(
    employee || { prenom: '', nom: '', poste: ROLES[0] }
  )
  const valid = form.prenom.trim() && form.nom.trim() && form.poste

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-[#003366] px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">
            {employee ? 'Modifier un employé' : 'Ajouter un employé'}
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
              <input
                autoFocus
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.prenom}
                onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                placeholder="Prénom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value.toUpperCase() }))}
                placeholder="NOM"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Poste</label>
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={form.poste}
              onChange={e => setForm(f => ({ ...f, poste: e.target.value }))}
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {form.poste && (
            <div className="pt-1">
              <RoleBadge poste={form.poste} />
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => valid && onSave(form)}
            disabled={!valid}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#003366] text-white rounded-lg hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Check size={16} />
            {employee ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PersonnelTab() {
  const { state, dispatch } = useApp()
  const [modal, setModal] = useState(null) // null | 'add' | employee object
  const [deleteId, setDeleteId] = useState(null)
  const [filterPoste, setFilterPoste] = useState('Tous')

  const displayed = filterPoste === 'Tous'
    ? state.employees
    : state.employees.filter(e => e.poste === filterPoste)

  function handleSave(form) {
    if (modal === 'add') {
      dispatch({ type: 'ADD_EMPLOYEE', payload: { ...form, id: crypto.randomUUID() } })
    } else {
      dispatch({ type: 'UPDATE_EMPLOYEE', payload: { ...modal, ...form } })
    }
    setModal(null)
  }

  function confirmDelete(id) {
    dispatch({ type: 'DELETE_EMPLOYEE', payload: id })
    setDeleteId(null)
  }

  // Group by poste for count summary
  const countByPoste = ROLES.reduce((acc, r) => {
    acc[r] = state.employees.filter(e => e.poste === r).length
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#003366] text-white p-2.5 rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Personnel</h1>
            <p className="text-sm text-slate-500">{state.employees.length} employé{state.employees.length > 1 ? 's' : ''} enregistré{state.employees.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 bg-[#003366] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-900 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Ajouter un employé
        </button>
      </div>

      {/* Poste summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {ROLES.map(r => {
          const c = ROLE_COLORS[r] || {}
          return (
            <button
              key={r}
              onClick={() => setFilterPoste(filterPoste === r ? 'Tous' : r)}
              className={`rounded-xl p-3 text-left transition-all border-2 ${
                filterPoste === r ? 'shadow-md scale-105' : 'hover:scale-102 hover:shadow-sm'
              }`}
              style={{
                background: c.bg,
                borderColor: filterPoste === r ? c.border : 'transparent',
              }}
            >
              <div className="font-bold text-lg" style={{ color: c.text }}>
                {countByPoste[r]}
              </div>
              <div className="text-[11px] leading-tight font-medium" style={{ color: c.text }}>
                {r}
              </div>
            </button>
          )
        })}
      </div>

      {/* Filter pill */}
      {filterPoste !== 'Tous' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Filtre :</span>
          <button
            onClick={() => setFilterPoste('Tous')}
            className="flex items-center gap-1.5 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
          >
            {filterPoste} <X size={12} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-10">#</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Nom</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Prénom</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Poste</th>
              <th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayed.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">
                  Aucun employé — cliquez sur « Ajouter un employé »
                </td>
              </tr>
            )}
            {displayed.map((emp, i) => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{emp.nom}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{emp.prenom}</td>
                <td className="px-4 py-3">
                  <RoleBadge poste={emp.poste} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => setModal(emp)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteId(emp.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modal && (
        <EmployeeModal
          employee={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteId && (() => {
        const emp = state.employees.find(e => e.id === deleteId)
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="font-bold text-slate-800 mb-2">Supprimer {emp?.prenom} {emp?.nom} ?</h3>
              <p className="text-sm text-slate-500 mb-6">Cette action retirera cet employé de tous les plannings.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => confirmDelete(deleteId)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
