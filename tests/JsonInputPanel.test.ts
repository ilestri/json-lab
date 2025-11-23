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

    const emitted = wrapper.emitted()['file-select']?.[0]
    const emittedFile = emitted?.[0] as File
    const options = emitted?.[1] as { minifyOverride?: boolean }
    expect(emittedFile?.name).toBe('data.json')
    expect(options?.minifyOverride).toBe(false)
  })

  it('emits minify preference on drop when toggled', async () => {
    const wrapper = mount(JsonInputPanel, {
      props: {
        modelValue: '',
      },
    })
    const dropButtons = wrapper.findAll('button').filter((btn) => btn.text().includes('Minify'))
    await dropButtons[0]?.trigger('click')

    const dropZone = wrapper.get('[aria-label="JSON 파일 드래그 앤 드롭 영역"]')
    await dropZone.trigger('drop', {
      dataTransfer: {
        files: [new File(['{}'], 'drop.json', { type: 'application/json' })],
      },
      preventDefault: () => {},
    } as unknown as DragEvent)

    const emitted = wrapper.emitted()['file-drop']?.[0]
    const options = emitted?.[1] as { minifyOverride?: boolean }
    expect(options?.minifyOverride).toBe(true)
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
