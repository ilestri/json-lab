import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import JsonSchemaValidator from '@/components/JsonSchemaValidator.vue'

describe('JsonSchemaValidator', () => {
  it('passes validation for matching schema', async () => {
    const wrapper = mount(JsonSchemaValidator, {
      props: { data: { message: 'ok' } },
    })

    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('통과했습니다')
  })

  it('shows error for invalid schema text', async () => {
    const wrapper = mount(JsonSchemaValidator, {
      props: { data: { message: 'ok' } },
    })
    const textarea = wrapper.get('textarea')
    await textarea.setValue('invalid json')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('스키마 검증 오류')
  })
})
