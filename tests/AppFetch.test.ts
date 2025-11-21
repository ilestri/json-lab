import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi, afterEach } from 'vitest'

import { formatterKey } from '@/composables/formatterContext'
import { mountAppWithRouter } from './testUtils'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App URL fetch', () => {
  it('fetches JSON from URL and fills input', async () => {
    const mockResponse = { foo: 'bar' }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper, router } = await mountAppWithRouter('/tools')

    const fetchTab = wrapper.findAll('[role="tab"]').find((b) => b.text().includes('URL 불러오기'))
    await fetchTab?.trigger('click')

    const fetchPanel = wrapper.get('#fetch-panel')
    const urlInput = fetchPanel.get('input[type="url"]')
    await urlInput.setValue('https://api.example.com/data')
    const fetchButton = fetchPanel.findAll('button').find((b) => b.text().includes('불러오기'))
    await fetchButton?.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 400))
    await flushPromises()

    const formatter = (wrapper.vm as any)?.$?.provides?.[
      formatterKey as symbol
    ] as { rawInput: { value: string } }
    expect(formatter).toBeTruthy()
    expect(fetchMock).toHaveBeenCalled()
    expect(formatter.rawInput.value).toContain('"foo": "bar"')

  })
})
