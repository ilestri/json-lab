<script setup lang="ts">
import { computed, ref } from 'vue'

import { parseJson } from '@/utils/jsonFormatter'

import { buildErrorFeedback, formatErrorFeedback, logError } from '@/utils/errorHandling'
import AppButton from './ui/AppButton.vue'
import AppCard from './ui/AppCard.vue'
import StatusBadge from './ui/StatusBadge.vue'

type DiffType = 'added' | 'removed' | 'changed' | 'type' | 'array-length'

type DiffItem = {
  path: string
  type: DiffType
  detail: string
}

const props = withDefaults(
  defineProps<{
    sourceA?: string
    sourceB?: string
  }>(),
  {
    sourceA: '',
    sourceB: '',
  }
)

const inputA = ref(props.sourceA)
const inputB = ref(props.sourceB)
const status = ref<'idle' | 'same' | 'diff' | 'error'>('idle')
const statusMessage = ref('두 JSON을 비교해 보세요.')
const diffs = ref<DiffItem[]>([])
const notes = ref<string[]>([])
const mergedJson = ref<string>('')

const emit = defineEmits<{
  (
    e: 'notify',
    payload: { type: 'error' | 'info' | 'success'; message: string; details?: string[] }
  ): void
}>()

const statusBadge = computed(() => {
  if (status.value === 'same') return { label: '동일', tone: 'success' as const, icon: '✅' }
  if (status.value === 'diff') return { label: '차이 발견', tone: 'warning' as const, icon: '⚠️' }
  if (status.value === 'error') return { label: '비교 실패', tone: 'danger' as const, icon: '❌' }
  return { label: '대기 중', tone: 'muted' as const, icon: '⏸️' }
})

const notifyError = (feedback: { message: string; details: string[] }) => {
  emit('notify', { type: 'error', message: feedback.message, details: feedback.details })
}

const buildPath = (base: string, key: string | number) =>
  base === '' || base === 'root' ? `root.${key}` : `${base}.${key}`

const deepMerge = (a: unknown, b: unknown): unknown => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return b
  }
  if (a && typeof a === 'object' && b && typeof b === 'object') {
    const result: Record<string, unknown> = {}
    const keys = new Set([
      ...Object.keys(a as Record<string, unknown>),
      ...Object.keys(b as Record<string, unknown>),
    ])
    keys.forEach((key) => {
      const valA = (a as Record<string, unknown>)[key]
      const valB = (b as Record<string, unknown>)[key]
      if (valB === undefined) {
        result[key] = valA
        return
      }
      result[key] = deepMerge(valA, valB)
    })
    return result
  }
  if (b !== undefined) return b
  return a
}

const downloadText = (filename: string, text: string) => {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

const compareValues = (a: unknown, b: unknown, path = 'root') => {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      diffs.value.push({
        path,
        type: 'array-length',
        detail: `길이 다름: ${a.length} vs ${b.length}`,
      })
    }
    const max = Math.max(a.length, b.length)
    for (let i = 0; i < max; i += 1) {
      compareValues(a[i], b[i], buildPath(path, i))
    }
    return
  }

  if (
    a &&
    typeof a === 'object' &&
    b &&
    typeof b === 'object' &&
    !Array.isArray(a) &&
    !Array.isArray(b)
  ) {
    const keys = new Set([
      ...Object.keys(a as Record<string, unknown>),
      ...Object.keys(b as Record<string, unknown>),
    ])
    keys.forEach((key) => {
      const hasA = Object.prototype.hasOwnProperty.call(a, key)
      const hasB = Object.prototype.hasOwnProperty.call(b, key)
      const nextPath = buildPath(path, key)
      if (!hasA) {
        diffs.value.push({ path: nextPath, type: 'added', detail: 'B에만 존재' })
        return
      }
      if (!hasB) {
        diffs.value.push({ path: nextPath, type: 'removed', detail: 'A에만 존재' })
        return
      }
      compareValues(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        nextPath
      )
    })
    return
  }

  if (typeof a !== typeof b) {
    diffs.value.push({
      path,
      type: 'type',
      detail: `타입 다름: ${typeof a} vs ${typeof b}`,
    })
    return
  }

  if (a !== b) {
    diffs.value.push({
      path,
      type: 'changed',
      detail: `값 다름: ${String(a)} vs ${String(b)}`,
    })
  }
}

const handleDiff = () => {
  diffs.value = []
  notes.value = []
  mergedJson.value = ''
  let parsedA: ReturnType<typeof parseJson> | null = null
  let parsedB: ReturnType<typeof parseJson> | null = null

  parsedA = parseJson(inputA.value)
  if (parsedA.ok === false) {
    const feedback = formatErrorFeedback('diff', 'A JSON 파싱에 실패했습니다.', [
      parsedA.message,
      '입력 A 내용을 다시 확인하세요.',
    ])
    status.value = 'error'
    statusMessage.value = feedback.message
    notes.value = feedback.details
    notifyError(feedback)
    logError('diff', parsedA.message)
    return
  }

  parsedB = parseJson(inputB.value)
  if (parsedB.ok === false) {
    const feedback = formatErrorFeedback('diff', 'B JSON 파싱에 실패했습니다.', [
      parsedB.message,
      '입력 B 내용을 다시 확인하세요.',
    ])
    status.value = 'error'
    statusMessage.value = feedback.message
    notes.value = feedback.details
    notifyError(feedback)
    logError('diff', parsedB.message)
    return
  }

  compareValues(parsedA.data, parsedB.data)
  mergedJson.value = JSON.stringify(deepMerge(parsedA.data, parsedB.data), null, 2)

  if (diffs.value.length === 0) {
    status.value = 'same'
    statusMessage.value = '두 JSON이 동일합니다.'
    notes.value = []
  } else {
    status.value = 'diff'
    statusMessage.value = `${diffs.value.length}개의 차이가 있습니다.`
    notes.value = ['추가/삭제/타입 차이를 목록에서 확인하세요.']
  }
}

const handleDownloadDiff = () => {
  if (!diffs.value.length) return
  const payload = JSON.stringify({ summary: statusMessage.value, diffs: diffs.value }, null, 2)
  downloadText('json-diff.json', payload)
  emit('notify', { type: 'info', message: 'Diff 결과를 다운로드했습니다.' })
}

const handleDownloadMerged = () => {
  if (!mergedJson.value) return
  downloadText('json-merged.json', mergedJson.value)
  emit('notify', { type: 'info', message: '병합된 JSON을 다운로드했습니다.' })
}

const handleCopyMerged = async () => {
  if (!mergedJson.value) return
  try {
    await navigator.clipboard.writeText(mergedJson.value)
    emit('notify', { type: 'success', message: '병합된 JSON을 복사했습니다.' })
  } catch (error) {
    const feedback = buildErrorFeedback('clipboard', error, [], '병합 결과 복사에 실패했습니다.')
    notifyError(feedback)
  }
}
</script>

<template>
  <AppCard
    class="h-full"
    eyebrow="Diff"
    title="JSON 비교"
    description="두 JSON을 파싱해 구조/값 차이를 추출합니다."
  >
    <template #actions>
      <AppButton variant="neutral" size="sm" @click="handleDiff">비교</AppButton>
      <AppButton variant="ghost" size="sm" :disabled="!diffs.length" @click="handleDownloadDiff">
        Diff 다운로드
      </AppButton>
      <AppButton variant="ghost" size="sm" :disabled="!mergedJson" @click="handleDownloadMerged">
        병합 다운로드
      </AppButton>
      <AppButton variant="neutral" size="sm" :disabled="!mergedJson" @click="handleCopyMerged">
        병합 복사
      </AppButton>
    </template>

    <div class="flex flex-col gap-3">
      <div class="grid gap-3 md:grid-cols-2">
        <textarea
          v-model="inputA"
          class="min-h-[160px] w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3 font-mono text-xs text-[var(--color-heading)] outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          placeholder="A JSON 입력"
          spellcheck="false"
        />
        <textarea
          v-model="inputB"
          class="min-h-[160px] w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3 font-mono text-xs text-[var(--color-heading)] outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          placeholder="B JSON 입력"
          spellcheck="false"
        />
      </div>

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
              'text-emerald-700': status === 'same',
              'text-amber-700': status === 'diff',
              'text-rose-700': status === 'error',
              'text-[var(--color-heading)]': status === 'idle',
            }"
          >
            {{ statusMessage }}
          </p>
        </div>

        <ul v-if="notes.length" class="mt-1 list-disc pl-5 text-xs text-[var(--color-muted)]">
          <li v-for="(note, index) in notes" :key="index">
            {{ note }}
          </li>
        </ul>

        <ul v-if="diffs.length" class="mt-2 space-y-1 text-xs text-[var(--color-muted)]">
          <li
            v-for="(item, index) in diffs"
            :key="index"
            class="rounded bg-[var(--color-surface)] px-2 py-1"
          >
            <span class="font-semibold text-[var(--color-heading)]">{{ item.path }}</span>
            <span class="ml-2 text-[var(--color-muted)]">[{{ item.type }}]</span>
            <span class="ml-2">{{ item.detail }}</span>
          </li>
        </ul>
      </div>
    </div>
  </AppCard>
</template>
