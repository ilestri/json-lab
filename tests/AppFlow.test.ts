import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { mountAppWithRouter } from './testUtils'

const findButtonByLabel = (wrapper: ReturnType<typeof mount>, label: string) =>
  wrapper.findAll('button').find((btn) => btn.text().includes(label))

describe('App basic flow', () => {
  it('formats valid JSON and updates output', async () => {
    const { wrapper } = await mountAppWithRouter('/')
    const textarea = wrapper.get('textarea')
    await textarea.setValue('{"hello":"world"}')

    const formatButton = findButtonByLabel(wrapper, '포맷팅')
    await formatButton?.trigger('click')
    await flushPromises()

    const outputSection = wrapper.findAll('section').find((section) =>
      section.text().includes('포맷 결과')
    )
    expect(outputSection?.text()).toContain('"hello": "world"')
    expect(wrapper.text()).toContain('포맷팅이 완료되었습니다')
  })

  it('shows error message on invalid JSON', async () => {
    const { wrapper } = await mountAppWithRouter('/')
    const textarea = wrapper.get('textarea')
    await textarea.setValue('{"hello": }')

    const formatButton = findButtonByLabel(wrapper, '포맷팅')
    await formatButton?.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('JSON 파싱 오류')
    expect(wrapper.text()).toContain('Invalid JSON')
  })
})
