<script setup lang="ts">
import Ajv, { type ErrorObject } from 'ajv'
import { ref, watch } from 'vue'

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
const schemaFileName = ref('')
const autoValidate = ref(true)
const debounceTimer = ref<number | null>(null)

const formatErrors = (ajvErrors: ErrorObject[]) =>
  ajvErrors.map((err) => {
    const path = err.instancePath && err.instancePath !== '' ? err.instancePath : '/'
    return `${path} ${err.message ?? ''}`.trim()
  })

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
    errors.value = validateFn.errors ? formatErrors(validateFn.errors) : ['알 수 없는 검증 오류']
  } catch (error) {
    status.value = 'invalid'
    message.value = '스키마 컴파일 중 오류가 발생했습니다.'
    errors.value = [error instanceof Error ? error.message : '알 수 없는 오류']
  }
}

const onSchemaFile = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    schemaText.value = text
    schemaFileName.value = file.name
    if (autoValidate.value) validate()
  } catch (error) {
    status.value = 'invalid'
    message.value = '스키마 파일을 읽는 중 오류가 발생했습니다.'
    errors.value = [error instanceof Error ? error.message : '알 수 없는 오류']
  }
}

const copyResult = async () => {
  const result = [message.value, ...errors.value].join('\n')
  try {
    await navigator.clipboard.writeText(result)
    message.value = '검증 결과를 복사했습니다.'
  } catch (error) {
    message.value = '결과 복사에 실패했습니다.'
    console.error(error)
  }
}

const scheduleValidate = () => {
  if (!autoValidate.value) return
  if (debounceTimer.value) {
    window.clearTimeout(debounceTimer.value)
  }
  debounceTimer.value = window.setTimeout(() => {
    validate()
  }, 400)
}

watch(schemaText, scheduleValidate)
watch(
  () => props.data,
  () => {
    if (autoValidate.value) validate()
  }
)
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
      <div class="flex items-center gap-2">
        <label
          class="cursor-pointer rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-xs font-semibold text-[var(--color-heading)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          스키마 파일
          <input
            type="file"
            accept=".json,application/json"
            class="hidden"
            @change="onSchemaFile"
          />
        </label>
        <button
          type="button"
          class="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-sm font-semibold text-[var(--color-heading)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-sm"
          @click="validate"
        >
          검증
        </button>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <label class="inline-flex items-center gap-2 text-xs text-[var(--color-heading)]">
        <input
          v-model="autoValidate"
          type="checkbox"
          class="h-4 w-4 rounded border border-[var(--color-border)]"
        />
        실시간 검증
      </label>
      <p v-if="schemaFileName" class="text-xs text-[var(--color-muted)]">
        불러온 스키마: {{ schemaFileName }}
      </p>
      <button
        type="button"
        class="ml-auto rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-xs font-semibold text-[var(--color-heading)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-sm"
        @click="copyResult"
      >
        결과 복사
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
