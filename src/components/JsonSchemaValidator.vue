<script setup lang="ts">
import Ajv from 'ajv'
import { ref } from 'vue'

const props = defineProps<{
  data: unknown | null
}>()

type Status = 'idle' | 'valid' | 'invalid' | 'empty'

const schemaText = ref<string>(`{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "message": { "type": "string" },
    "info": { "type": "string" }
  },
  "required": ["message"]
}`)

const status = ref<Status>('idle')
const message = ref('JSON Schema를 입력하고 검증을 실행하세요.')
const errors = ref<string[]>([])

const validate = () => {
  errors.value = []

  if (!props.data) {
    status.value = 'empty'
    message.value = '검증할 JSON이 없습니다. 포맷팅을 먼저 실행하세요.'
    return
  }

  let schema: unknown
  try {
    schema = JSON.parse(schemaText.value)
  } catch (error) {
    status.value = 'invalid'
    message.value = '스키마 파싱 실패: JSON 형식을 확인하세요.'
    errors.value = [error instanceof Error ? error.message : '알 수 없는 오류']
    return
  }

  try {
    const ajv = new Ajv({ allErrors: true, strict: false })
    const validateFn = ajv.compile(schema)
    const result = validateFn(props.data)
    if (result) {
      status.value = 'valid'
      message.value = '스키마 검증을 통과했습니다.'
      return
    }

    status.value = 'invalid'
    message.value = '스키마 검증에 실패했습니다.'
    errors.value = validateFn.errors?.map((err) => `${err.instancePath || '/'} ${err.message}`) ?? [
      '알 수 없는 검증 오류',
    ]
  } catch (error) {
    status.value = 'invalid'
    message.value = '스키마 컴파일 중 오류가 발생했습니다.'
    errors.value = [error instanceof Error ? error.message : '알 수 없는 오류']
  }
}
</script>

<template>
  <div
    class="flex h-full flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
  >
    <div class="flex items-center justify-between gap-2">
      <div>
        <p class="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Schema</p>
        <h3 class="text-lg font-semibold text-[var(--color-heading)]">JSON Schema 검증</h3>
        <p class="text-sm text-[var(--color-muted)]">
          현재 포맷된 JSON을 제공한 스키마로 검증합니다.
        </p>
      </div>
      <button
        type="button"
        class="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-sm font-semibold text-[var(--color-heading)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-sm"
        @click="validate"
      >
        검증
      </button>
    </div>

    <textarea
      v-model="schemaText"
      class="min-h-[200px] w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3 font-mono text-xs text-[var(--color-heading)] outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
      spellcheck="false"
    />

    <div
      class="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3"
      :class="{
        'border-emerald-200 bg-emerald-50': status === 'valid',
        'border-rose-200 bg-rose-50': status === 'invalid',
        'border-[var(--color-border)]': status === 'idle' || status === 'empty',
      }"
    >
      <p
        class="text-sm font-semibold"
        :class="{
          'text-emerald-700': status === 'valid',
          'text-rose-700': status === 'invalid',
          'text-[var(--color-heading)]': status === 'idle' || status === 'empty',
        }"
      >
        {{ message }}
      </p>
      <ul v-if="errors.length" class="mt-2 space-y-1 text-xs text-[var(--color-muted)]">
        <li
          v-for="(err, index) in errors"
          :key="index"
          class="rounded bg-[var(--color-surface)] px-2 py-1"
        >
          {{ err }}
        </li>
      </ul>
    </div>
  </div>
</template>
