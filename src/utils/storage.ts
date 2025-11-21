import { logError } from './errorHandling'

export const loadFromStorage = <T>(key: string): T | null => {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch (error) {
    logError('storage', error)
    return null
  }
}

export const saveToStorage = <T>(key: string, value: T) => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    logError('storage', error)
  }
}
