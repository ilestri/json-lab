import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi, afterEach } from 'vitest'

import App from '@/App.vue'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App URL fetch', () => {
  it('fetches JSON from URL and fills input', async () => {
    vi.useFakeTimers()
    const mockResponse = { foo: 'bar' }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(App)
    const urlInput = wrapper.get('input[type="url"]')
    await urlInput.setValue('https://api.example.com/data')
    const fetchButton = wrapper.findAll('button').find((b) => b.text().includes('불러오기'))
    await fetchButton?.trigger('click')
    await vi.runAllTimersAsync()
    await flushPromises()

    const textarea = wrapper.get('textarea')
    expect(textarea.element.value).toContain('"foo": "bar"')
    expect(fetchMock).toHaveBeenCalled()
    vi.useRealTimers()
  })
})
