export const loadFromStorage = <T>(key: string): T | null => {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch (error) {
    console.error('스토리지 로드 실패', error)
    return null
  }
}

export const saveToStorage = <T>(key: string, value: T) => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('스토리지 저장 실패', error)
  }
}
