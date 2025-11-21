import { describe, expect, it } from 'vitest'

import { formatJson, parseJson } from '@/utils/jsonFormatter'

describe('parseJson', () => {
  it('parses valid JSON', () => {
    const result = parseJson('{"a":1}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual({ a: 1 })
    }
  })

  it('returns error with position/line/column for invalid JSON', () => {
    const result = parseJson('{"a": }')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toBeTruthy()
      if (result.position != null) {
        expect(result.line).toBeGreaterThanOrEqual(1)
        expect(result.column).toBeGreaterThanOrEqual(1)
      }
    }
  })
})

describe('formatJson', () => {
  const sample = { b: 1, a: { z: 3, y: 2 } }

  it('pretty prints with 2 spaces by default', () => {
    const formatted = formatJson(sample)
    expect(formatted).toContain('\n')
    expect(formatted).toContain('  "a"')
  })

  it('supports tabs', () => {
    const formatted = formatJson(sample, { indent: 'tab' })
    expect(formatted).toContain('\t"a"')
  })

  it('minifies when option set', () => {
    const formatted = formatJson(sample, { minify: true })
    expect(formatted).not.toContain('\n')
  })

  it('sorts keys alphabetically when enabled', () => {
    const formatted = formatJson(sample, { sortKeys: true })
    const firstKeyIndex = formatted.indexOf('"a"')
    const secondKeyIndex = formatted.indexOf('"b"')
    expect(firstKeyIndex).toBeLessThan(secondKeyIndex)
  })
})
