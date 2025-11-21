import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import JsonInputPanel from '@/components/JsonInputPanel.vue'

describe('JsonInputPanel', () => {
  it('emits update on input change', async () => {
    const wrapper = mount(JsonInputPanel, {
      props: {
        modelValue: '',
      },
    })

    const textarea = wrapper.get('textarea')
    await textarea.setValue('{"a":1}')
    expect(wrapper.emitted()['update:modelValue']?.[0]).toEqual(['{"a":1}'])
  })

  it('emits file-select when file is chosen', async () => {
    const wrapper = mount(JsonInputPanel, {
      props: {
        modelValue: '',
      },
    })
    const fileInput = wrapper.get('input[type="file"]')
    const file = new File(['{}'], 'data.json', { type: 'application/json' })
    Object.defineProperty(fileInput.element, 'files', { value: [file] })
    await fileInput.trigger('change')

    const emitted = wrapper.emitted()['file-select']?.[0]?.[0] as File
    expect(emitted?.name).toBe('data.json')
  })

  it('applies highlight style when highlightLine prop is set', () => {
    const wrapper = mount(JsonInputPanel, {
      props: {
        modelValue: '',
        highlightLine: 2,
      },
    })
    const textarea = wrapper.get('textarea')
    expect(textarea.element.getAttribute('style')).toContain('background-image')
  })
})
