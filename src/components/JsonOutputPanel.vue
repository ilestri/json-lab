<script setup lang="ts">
import { computed } from 'vue'

type Status = 'idle' | 'valid' | 'invalid'

const props = withDefaults(
  defineProps<{
    formattedValue: string
    status: Status
    message?: string
    details?: string[]
  }>(),
  {
    message: '포맷팅을 실행하면 상태가 표시됩니다.',
    details: () => [],
  }
)

defineEmits<{
  (e: 'format'): void
  (e: 'copy'): void
  (e: 'minify'): void
}>()

const lines = computed(() =>
  props.formattedValue ? props.formattedValue.split('\n') : ['결과가 여기에 표시됩니다.']
)

const statusChip = computed(() => {
  if (props.status === 'valid') {
    return {
      label: 'Valid JSON',
      tone: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: '✅',
    }
  }
  if (props.status === 'invalid') {
    return {
      label: 'Invalid JSON',
      tone: 'text-rose-700 bg-rose-50 border-rose-200',
      icon: '❌',
    }
  }
  return {
    label: 'Waiting',
    tone: 'text-slate-600 bg-slate-50 border-slate-200',
    icon: '⏸️',
  }
})
</script>

<template>
  <section
    class="flex h-full flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
  >
    <div
      class="flex flex-wrap items-start justify-between gap-3"
      role="region"
      aria-label="출력 패널"
    >
      <div>
        <p class="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">출력</p>
        <h2 class="text-lg font-semibold text-[var(--color-heading)]">포맷 결과</h2>
        <p class="text-sm text-[var(--color-muted)]">포맷팅 상태와 결과 JSON이 표시됩니다.</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-full border border-sky-200 bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
          @click="$emit('format')"
        >
          포맷팅
        </button>
        <button
          type="button"
          class="rounded-full border border-amber-200 bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
          @click="$emit('minify')"
        >
          Minify
        </button>
        <button
          type="button"
          class="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-sm font-semibold text-[var(--color-heading)] shadow-sm transition hover:-translate-y-0.5 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border)]"
          @click="$emit('copy')"
        >
          복사
        </button>
      </div>
    </div>

    <div
      class="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3"
      aria-live="polite"
    >
      <div class="flex items-center gap-3">
        <div
          class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium"
          :class="statusChip.tone"
          role="status"
          :aria-label="`상태: ${statusChip.label}`"
        >
          <span>{{ statusChip.icon }}</span>
          <span>{{ statusChip.label }}</span>
        </div>
        <p class="text-sm text-[var(--color-muted)]">{{ props.message }}</p>
      </div>
      <ul v-if="props.details.length" class="list-disc pl-5 text-xs text-[var(--color-muted)]">
        <li v-for="(item, index) in props.details" :key="index">
          {{ item }}
        </li>
      </ul>
    </div>

    <div
      class="flex-1 overflow-hidden rounded-xl border border-[var(--color-border)] bg-slate-950/90"
    >
      <div class="h-full max-h-[520px] overflow-auto">
        <div class="grid min-w-full grid-cols-[auto,1fr]">
          <div class="border-r border-slate-800 bg-slate-900/60 text-xs text-slate-400">
            <div
              v-for="(line, index) in lines"
              :key="index"
              class="px-4 py-0.5 text-right font-mono tabular-nums"
            >
              {{ index + 1 }}
            </div>
          </div>
          <pre
            class="whitespace-pre overflow-auto bg-slate-950/90 p-4 font-mono text-sm leading-relaxed text-slate-50"
            >{{ props.formattedValue }}</pre
          >
        </div>
      </div>
    </div>
  </section>
</template>
