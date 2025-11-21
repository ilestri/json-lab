import { inject, type InjectionKey } from 'vue'

import type { FormatterState } from './useFormatterState'

export const formatterKey: InjectionKey<FormatterState> = Symbol('formatter')

export const useFormatter = () => {
  const ctx = inject(formatterKey)
  if (!ctx) {
    throw new Error('Formatter state가 제공되지 않았습니다.')
  }
  return ctx
}
