import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import JsonOutputPanel from '@/components/JsonOutputPanel.vue'

const factory = (props?: Partial<InstanceType<typeof JsonOutputPanel>['$props']>) =>
  mount(JsonOutputPanel, {
    props: {
      formattedValue: '{\n  "a": 1\n}',
      status: 'valid',
      message: 'ok',
      details: ['detail'],
      ...props,
    },
  })

describe('JsonOutputPanel', () => {
  it('renders status chip and message', () => {
    const wrapper = factory()
    expect(wrapper.text()).toContain('Valid JSON')
    expect(wrapper.text()).toContain('ok')
    expect(wrapper.text()).toContain('detail')
  })

  it('emits format/minify/copy when buttons are clicked', async () => {
    const wrapper = factory()
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click') // 포맷팅
    await buttons[1].trigger('click') // Minify
    await buttons[2].trigger('click') // 복사

    expect(wrapper.emitted('format')).toBeTruthy()
    expect(wrapper.emitted('minify')).toBeTruthy()
    expect(wrapper.emitted('copy')).toBeTruthy()
  })
})
