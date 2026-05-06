import { createContext, useContext, useReducer, useEffect } from 'react'
import { getWeekStart, addDays } from '../utils/dates'

const AppContext = createContext(null)

const SAMPLE_EMPLOYEES = [
  { id: 'e1',  prenom: 'Sophie',   nom: 'MARTIN',   poste: 'Coordinateur' },
  { id: 'e2',  prenom: 'Thomas',   nom: 'DUPONT',   poste: 'Réception' },
  { id: 'e3',  prenom: 'Julie',    nom: 'BERNARD',  poste: 'Réception' },
  { id: 'e4',  prenom: 'Laura',    nom: 'PETIT',    poste: 'Réception' },
  { id: 'e5',  prenom: 'Maxime',   nom: 'ROBERT',   poste: 'Expédition' },
  { id: 'e6',  prenom: 'Claire',   nom: 'RICHARD',  poste: 'Expédition' },
  { id: 'e7',  prenom: 'Nicolas',  nom: 'SIMON',    poste: 'Expédition' },
  { id: 'e8',  prenom: 'Kevin',    nom: 'LAURENT',  poste: 'Cariste Quai' },
  { id: 'e9',  prenom: 'Antoine',  nom: 'THOMAS',   poste: 'Cariste Quai' },
  { id: 'e10', prenom: 'Stéphane', nom: 'LEROY',    poste: 'Cariste Entrée Silo' },
  { id: 'e11', prenom: 'Emilie',   nom: 'MOREAU',   poste: 'Cariste Sortie Silo' },
  { id: 'e12', prenom: 'Lucas',    nom: 'GARNIER',  poste: 'Cariste GMS' },
  { id: 'e13', prenom: 'Marie',    nom: 'BLANC',    poste: 'Cariste GMS' },
  { id: 'e14', prenom: 'Alexis',   nom: 'GUERIN',   poste: 'Préparateur' },
  { id: 'e15', prenom: 'Sarah',    nom: 'MOULIN',   poste: 'Préparateur' },
]

const INITIAL_STATE = {
  employees: SAMPLE_EMPLOYEES,
  plannings: {},
}

function makePlanningRow(employeeId) {
  return { employeeId, shifts: Array(7).fill(null) }
}

function reducer(state, action) {
  switch (action.type) {

    case 'ADD_EMPLOYEE': {
      return { ...state, employees: [...state.employees, action.payload] }
    }

    case 'UPDATE_EMPLOYEE': {
      return {
        ...state,
        employees: state.employees.map(e =>
          e.id === action.payload.id ? action.payload : e
        ),
      }
    }

    case 'DELETE_EMPLOYEE': {
      const id = action.payload
      const plannings = {}
      for (const [week, rows] of Object.entries(state.plannings)) {
        plannings[week] = rows.filter(r => r.employeeId !== id)
      }
      return { ...state, employees: state.employees.filter(e => e.id !== id), plannings }
    }

    case 'ADD_PLANNING_ROW': {
      const { weekStart, employeeId } = action.payload
      const current = state.plannings[weekStart] || []
      if (current.find(r => r.employeeId === employeeId)) return state
      return {
        ...state,
        plannings: {
          ...state.plannings,
          [weekStart]: [...current, makePlanningRow(employeeId)],
        },
      }
    }

    case 'REMOVE_PLANNING_ROW': {
      const { weekStart, rowIndex } = action.payload
      const rows = [...(state.plannings[weekStart] || [])]
      rows.splice(rowIndex, 1)
      return { ...state, plannings: { ...state.plannings, [weekStart]: rows } }
    }

    case 'UPDATE_SHIFT': {
      const { weekStart, rowIndex, dayIndex, shiftCode } = action.payload
      const rows = (state.plannings[weekStart] || []).map((row, i) => {
        if (i !== rowIndex) return row
        const shifts = [...row.shifts]
        shifts[dayIndex] = shiftCode
        return { ...row, shifts }
      })
      return { ...state, plannings: { ...state.plannings, [weekStart]: rows } }
    }

    case 'APPLY_SHIFT_ALL_WEEK': {
      const { weekStart, rowIndex, shiftCode } = action.payload
      const rows = (state.plannings[weekStart] || []).map((row, i) => {
        if (i !== rowIndex) return row
        return { ...row, shifts: Array(7).fill(shiftCode) }
      })
      return { ...state, plannings: { ...state.plannings, [weekStart]: rows } }
    }

    case 'COPY_PREVIOUS_WEEK': {
      const { fromWeek, toWeek } = action.payload
      const fromRows = state.plannings[fromWeek] || []
      if (!fromRows.length) return state
      const copied = fromRows.map(row => ({ ...row, shifts: [...row.shifts] }))
      return {
        ...state,
        plannings: { ...state.plannings, [toWeek]: copied },
      }
    }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, (initial) => {
    try {
      const saved = localStorage.getItem('planning-entrepot-v2')
      return saved ? { ...initial, ...JSON.parse(saved) } : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    localStorage.setItem('planning-entrepot-v2', JSON.stringify(state))
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
