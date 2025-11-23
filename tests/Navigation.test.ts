import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { mountAppWithRouter } from './testUtils'

describe('Navigation & accessibility', () => {
  it('shows format nav as current on home and switches to tools', async () => {
    const { wrapper, router } = await mountAppWithRouter('/')
    const formatLink = wrapper.findAll('a').find((a) => a.text().includes('포맷터'))
    expect(formatLink?.attributes('aria-current')).toBe('page')

    await router.push('/tools')
    await router.isReady()
    await flushPromises()

    const toolsLink = wrapper.findAll('a').find((a) => a.text().includes('도구'))
    expect(toolsLink?.attributes('aria-current')).toBe('page')
    expect(wrapper.text()).toContain('필요한 도구만 탭으로 열어보세요')
  })

  it('marks active tool tab with aria-selected and shows matching panel', async () => {
    const { wrapper, router } = await mountAppWithRouter('/tools')
    await router.isReady()
    await flushPromises()

    const diffTab = wrapper.findAll('[role="tab"]').find((btn) => btn.text().includes('Diff'))
    expect(diffTab).toBeTruthy()
    await diffTab?.trigger('click')
    await flushPromises()

    expect(diffTab?.attributes('aria-selected')).toBe('true')
    const panel = wrapper.find('#diff-panel')
    expect(panel.exists()).toBe(true)
  })
})
