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
