import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import App from '@/App.vue'

const findButtonByLabel = (wrapper: ReturnType<typeof mount>, label: string) =>
  wrapper.findAll('button').find((btn) => btn.text().includes(label))

describe('App basic flow', () => {
  it('formats valid JSON and updates output', async () => {
    const wrapper = mount(App)
    const textarea = wrapper.get('textarea')
    await textarea.setValue('{"hello":"world"}')

    const formatButton = findButtonByLabel(wrapper, '포맷팅')
    await formatButton?.trigger('click')
    await flushPromises()

    const preBlocks = wrapper.findAll('pre')
    const output = preBlocks[preBlocks.length - 1]?.text()
    expect(output).toContain('"hello"')
    expect(wrapper.text()).toContain('포맷팅이 완료되었습니다')
  })

  it('shows error message on invalid JSON', async () => {
    const wrapper = mount(App)
    const textarea = wrapper.get('textarea')
    await textarea.setValue('{"hello": }')

    const formatButton = findButtonByLabel(wrapper, '포맷팅')
    await formatButton?.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('에러:')
    expect(wrapper.text()).toContain('Invalid')
  })
})
