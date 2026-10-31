import { createContext, useContext } from 'react'
import { useDesk } from './useDesk.js'

const DeskContext = createContext(null)

export function DeskProvider({ children }) {
  const desk = useDesk()
  return <DeskContext.Provider value={desk}>{children}</DeskContext.Provider>
}

export function useDeskContext() {
  return useContext(DeskContext)
}
