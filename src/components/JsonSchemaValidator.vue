<script setup lang="ts">
import Ajv, { type ErrorObject } from 'ajv'
import { computed, ref, watch } from 'vue'

import { buildErrorFeedback, formatErrorFeedback, logError } from '@/utils/errorHandling'

import AppButton from './ui/AppButton.vue'
import AppCard from './ui/AppCard.vue'
import StatusBadge from './ui/StatusBadge.vue'

const props = defineProps<{
  data: unknown | null
}>()

type Status = 'idle' | 'valid' | 'invalid' | 'empty'

const emit = defineEmits<{
  (
    e: 'notify',
    payload: { type: 'error' | 'info' | 'success'; message: string; details?: string[] }
  ): void
}>()

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
const statusMessage = ref('JSON Schema를 입력하고 검증을 실행하세요.')
const errors = ref<string[]>([])
const schemaFileName = ref('')
const autoValidate = ref(true)
const debounceTimer = ref<number | null>(null)

const formatErrors = (ajvErrors: ErrorObject[]) =>
  ajvErrors.map((err) => {
    const path = err.instancePath && err.instancePath !== '' ? err.instancePath : '/'
    return `${path} ${err.message ?? ''}`.trim()
  })

const statusBadge = computed(() => {
  if (status.value === 'valid') {
    return { label: '검증 통과', tone: 'success' as const, icon: '✅' }
  }
  if (status.value === 'invalid') {
    return { label: '검증 실패', tone: 'danger' as const, icon: '❌' }
  }
  if (status.value === 'empty') {
    return { label: '대상 없음', tone: 'warning' as const, icon: '⚠️' }
  }
  return { label: '대기 중', tone: 'muted' as const, icon: '⏸️' }
})

const applyFeedback = (nextStatus: Status, feedback: { message: string; details: string[] }) => {
  status.value = nextStatus
  statusMessage.value = feedback.message
  errors.value = feedback.details
}

const notifyError = (feedback: { message: string; details: string[] }) => {
  emit('notify', { type: 'error', message: feedback.message, details: feedback.details })
}

const validate = () => {
  errors.value = []

  if (!props.data) {
    applyFeedback(
      'empty',
      formatErrorFeedback('schema', '검증할 JSON이 없습니다.', ['포맷팅을 먼저 실행하세요.'])
    )
    return
  }

  let schema: unknown
  try {
    schema = JSON.parse(schemaText.value)
  } catch (error) {
    const feedback = buildErrorFeedback(
      'schema',
      error,
      [],
      '스키마 파싱 실패: JSON 형식을 확인하세요.'
    )
    applyFeedback('invalid', feedback)
    notifyError(feedback)
    logError('schema', error)
    return
  }

  try {
    const ajv = new Ajv({ allErrors: true, strict: false })
    const validateFn = ajv.compile(schema)
    const result = validateFn(props.data)
    if (result) {
      status.value = 'valid'
      statusMessage.value = '스키마 검증을 통과했습니다.'
      return
    }

    const feedback = formatErrorFeedback(
      'schema',
      '스키마 검증에 실패했습니다.',
      validateFn.errors ? formatErrors(validateFn.errors) : ['알 수 없는 검증 오류']
    )
    applyFeedback('invalid', feedback)
    notifyError(feedback)
  } catch (error) {
    const feedback = buildErrorFeedback(
      'schema',
      error,
      [],
      '스키마 컴파일 중 오류가 발생했습니다.'
    )
    applyFeedback('invalid', feedback)
    notifyError(feedback)
    logError('schema', error)
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
    const feedback = buildErrorFeedback(
      'schema',
      error,
      [file.name],
      '스키마 파일을 읽는 중 오류가 발생했습니다.'
    )
    applyFeedback('invalid', feedback)
    notifyError(feedback)
    logError('schema', error)
  }
}

const copyResult = async () => {
  const result = [statusMessage.value, ...errors.value].join('\n')
  try {
    await navigator.clipboard.writeText(result)
    statusMessage.value = '검증 결과를 복사했습니다.'
  } catch (error) {
    const feedback = buildErrorFeedback('clipboard', error, [], '결과 복사에 실패했습니다.')
    applyFeedback('invalid', feedback)
    notifyError(feedback)
    logError('clipboard', error)
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
  <AppCard
    class="h-full"
    eyebrow="Schema"
    title="JSON Schema 검증"
    description="현재 포맷된 JSON을 제공한 스키마로 검증합니다."
  >
    <template #actions>
      <AppButton tag="label" variant="neutral" size="sm" class="cursor-pointer">
        스키마 파일
        <input type="file" accept=".json,application/json" class="hidden" @change="onSchemaFile" />
      </AppButton>
      <AppButton variant="neutral" size="sm" @click="validate">검증</AppButton>
    </template>

    <div class="flex flex-col gap-3">
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
        <AppButton variant="neutral" size="sm" class="ml-auto" @click="copyResult">
          결과 복사
        </AppButton>
      </div>

      <textarea
        v-model="schemaText"
        class="min-h-[200px] w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3 font-mono text-xs text-[var(--color-heading)] outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        spellcheck="false"
      />

      <div
        class="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3"
      >
        <div class="flex items-center gap-2">
          <StatusBadge
            :label="statusBadge.label"
            :tone="statusBadge.tone"
            :icon="statusBadge.icon"
          />
          <p
            class="text-sm font-semibold"
            :class="{
              'text-emerald-700': status === 'valid',
              'text-rose-700': status === 'invalid',
              'text-[var(--color-heading)]': status === 'idle' || status === 'empty',
            }"
          >
            {{ statusMessage }}
          </p>
        </div>
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
  </AppCard>
</template>
