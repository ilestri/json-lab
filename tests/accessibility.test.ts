import { flushPromises } from '@vue/test-utils'
import { configureAxe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'

import { mountAppWithRouter } from './testUtils'

const axeOptions = {
  rules: {
    // jsdom 환경에서는 색상 대비 계산이 부정확할 수 있어 비활성화
    'color-contrast': { enabled: false },
    // 링크/버튼 조합에서 발생하는 aria-allowed-role 경고는 컴포넌트 설계상 허용
    'aria-allowed-role': { enabled: false },
  },
}

describe('Accessibility', () => {
  const runAxe = configureAxe(axeOptions)

  it('home view has no axe violations', async () => {
    const { wrapper } = await mountAppWithRouter('/')
    await flushPromises()
    const results = await runAxe(wrapper.element)
    expect(results.violations).toHaveLength(0)
  })

  it('tools view has no axe violations', async () => {
    const { wrapper } = await mountAppWithRouter('/tools')
    await flushPromises()
    const results = await runAxe(wrapper.element)
    expect(results.violations).toHaveLength(0)
  })
})
