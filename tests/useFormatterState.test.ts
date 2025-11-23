import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useFormatterState } from '@/composables/useFormatterState'
import { compressToEncodedURIComponent } from 'lz-string'

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

  it('adds recent snippet on successful format and saves to storage', () => {
    const state = useFormatterState()
    state.rawInput.value = '{"share":true}'
    state.handleFormat()
    expect(state.recentSnippets.value.length).toBe(1)
    expect(state.recentSnippets.value[0].content).toContain('"share":true')

    const saved = JSON.parse(localStorage.getItem('json-lab:recent-snippets') || '[]')
    expect(saved[0].content).toContain('"share":true')
  })

  it('loads JSON from shared URL param and formats it', () => {
    const payload = compressToEncodedURIComponent('{"from":"shared"}')
    window.history.replaceState({}, '', `/?data=${payload}`)
    const state = useFormatterState()
    expect(state.rawInput.value).toContain('"from":"shared"')
    expect(state.formattedPreview.value).toContain('"from": "shared"')
  })

  it('accepts .txt file with JSON content', async () => {
    const state = useFormatterState()
    const file = {
      name: 'sample.txt',
      type: 'text/plain',
      size: 15,
      text: vi.fn().mockResolvedValue('{"txt":true}'),
    } as unknown as File
    vi.useFakeTimers()
    await state.handleFileInput(file)
    await vi.runAllTimersAsync()
    vi.useRealTimers()
    expect(state.rawInput.value).toContain('"txt":true')
    expect(state.status.value).toBe('valid')
  })
})
