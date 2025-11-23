import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useFormatterState } from '@/composables/useFormatterState'

const STORAGE_KEY = 'json-lab:settings'

describe('useFormatterState storage migration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('restores legacy settings and fills missing flags with defaults', () => {
    const legacySettings = {
      indent: 4,
      theme: 'dark' as const,
      autoFormat: true,
      // legacy에는 sortKeys, preferredMinify, autoFormatUpload/Fetch가 없다고 가정
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacySettings))

    const formatter = useFormatterState()

    expect(formatter.indentOption.value).toBe(4)
    expect(formatter.theme.value).toBe('dark')
    expect(formatter.autoFormat.value).toBe(true)

    expect(formatter.sortKeys.value).toBe(false)
    expect(formatter.preferredMinify.value).toBe(false)
    expect(formatter.autoFormatUpload.value).toBe(true)
    expect(formatter.autoFormatFetch.value).toBe(true)

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    expect(stored.sortKeys).toBe(false)
    expect(stored.preferredMinify).toBe(false)
    expect(stored.autoFormatUpload).toBe(true)
    expect(stored.autoFormatFetch).toBe(true)
  })
})
