import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import App from '@/App.vue'

const findButton = (
  wrapper: { findAll: (selector: string) => Array<{ text: () => string }> },
  text: string
) => wrapper.findAll('button').find((btn) => btn.text().includes(text))

describe('App E2E flow', () => {
  it('formats, uploads via drop, and copies the result', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
    })

    const wrapper = mount(App)

    const textarea = wrapper.get('[aria-label="JSON 입력 텍스트에어리어"]')
    await textarea.setValue('{"hello": "world"}')

    const outputSection = wrapper.findAll('section').find((section) =>
      section.text().includes('포맷 결과')
    )
    expect(outputSection).toBeTruthy()

    const formatButton = findButton(outputSection!, '포맷팅')
    await formatButton?.trigger('click')
    await flushPromises()

    const outputBeforeUpload = outputSection!.get('pre').text()
    expect(outputBeforeUpload).toContain('"hello"')
    expect(wrapper.text()).toContain('포맷팅이 완료되었습니다.')

    const fileContent = JSON.stringify({ file: true }, null, 2)
    const file = {
      name: 'sample.json',
      type: 'application/json',
      size: fileContent.length,
      text: vi.fn().mockResolvedValue(fileContent),
    } as unknown as File
    const fileInput = wrapper.get('input[type="file"]')
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    })
    await fileInput.trigger('change')
    await flushPromises()

    const textAfterUpload = wrapper.text()
    expect(textAfterUpload).toContain('sample.json')
    expect(wrapper.get('[aria-label="JSON 입력 텍스트에어리어"]').element.value).toContain(
      '"file": true'
    )
    expect(wrapper.text()).toContain('Valid JSON')

    const copyButton = findButton(outputSection!, '복사')
    await copyButton?.trigger('click')
    await flushPromises()

    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('"file": true'))
    expect(wrapper.text()).toContain('포맷된 JSON을 복사했습니다.')
  })
})
