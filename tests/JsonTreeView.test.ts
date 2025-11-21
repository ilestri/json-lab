import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import JsonTreeView from '@/components/JsonTreeView.vue'

describe('JsonTreeView', () => {
  it('renders empty state when no data', () => {
    const wrapper = mount(JsonTreeView, {
      props: { data: null },
    })
    expect(wrapper.text()).toContain('포맷된 JSON이 없습니다')
  })

  it('renders tree nodes when data provided', () => {
    const wrapper = mount(JsonTreeView, {
      props: { data: { a: 1, b: { c: 2 } } },
    })
    expect(wrapper.text()).toContain('a')
    expect(wrapper.text()).toContain('b')
  })
})
