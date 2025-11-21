import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SettingsBar from '@/components/SettingsBar.vue'

const factory = (props?: Partial<InstanceType<typeof SettingsBar>['$props']>) =>
  mount(SettingsBar, {
    props: {
      indent: 2,
      theme: 'light',
      sortKeys: false,
      autoFormat: false,
      ...props,
    },
  })

describe('SettingsBar', () => {
  it('emits indent change', async () => {
    const wrapper = factory()
    const indentButtons = wrapper.findAll('button').filter((b) => b.text().includes('spaces') || b.text().includes('Tab'))
    await indentButtons[1].trigger('click')
    expect(wrapper.emitted()['update:indent']).toBeTruthy()
  })

  it('emits theme toggle', async () => {
    const wrapper = factory({ theme: 'light' })
    const themeButton = wrapper.find('button')
    await themeButton.trigger('click')
    expect(wrapper.emitted()['update:theme']?.[0]).toEqual(['dark'])
  })

  it('emits sort and auto format toggles', async () => {
    const wrapper = factory()
    const sortButton = wrapper.findAll('button').find((b) => b.text().includes('정렬'))!
    const autoButton = wrapper.findAll('button').find((b) => b.text().includes('자동 포맷'))!
    await sortButton.trigger('click')
    await autoButton.trigger('click')
    expect(wrapper.emitted()['update:sortKeys']).toBeTruthy()
    expect(wrapper.emitted()['update:autoFormat']).toBeTruthy()
  })
})
