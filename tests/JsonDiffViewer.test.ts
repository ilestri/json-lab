import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import JsonDiffViewer from '@/components/JsonDiffViewer.vue'

describe('JsonDiffViewer', () => {
  it('shows diff when inputs differ', async () => {
    const wrapper = mount(JsonDiffViewer, {
      props: {
        sourceA: '{"a":1}',
        sourceB: '{"a":2}',
      },
    })

    await wrapper.get('button').trigger('click')
    expect(wrapper.text()).toContain('차이가 있습니다')
    expect(wrapper.text()).toContain('값 다름')
  })

  it('copies merged JSON after diff', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
    })

    const wrapper = mount(JsonDiffViewer, {
      props: {
        sourceA: '{"a":1}',
        sourceB: '{"a":2,"b":3}',
      },
    })

    const buttons = wrapper.findAll('button')
    const compareBtn = buttons.find((b) => b.text().includes('비교'))
    await compareBtn?.trigger('click')

    const copyBtn = buttons.find((b) => b.text().includes('병합 복사'))
    await copyBtn?.trigger('click')

    expect(writeText).toHaveBeenCalledTimes(1)
    const merged = writeText.mock.calls[0][0] as string
    expect(merged).toContain('"a": 2')
    expect(merged).toContain('"b": 3')
  })

  it('shows identical message when inputs are same', async () => {
    const wrapper = mount(JsonDiffViewer, {
      props: {
        sourceA: '{"a":1}',
        sourceB: '{"a":1}',
      },
    })

    await wrapper.get('button').trigger('click')
    expect(wrapper.text()).toContain('동일합니다')
  })
})
