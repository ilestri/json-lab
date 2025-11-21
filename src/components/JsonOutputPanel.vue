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
}>()

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
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">출력</p>
        <h2 class="text-lg font-semibold text-[var(--color-heading)]">포맷 결과</h2>
        <p class="text-sm text-[var(--color-muted)]">포맷팅 상태와 결과 JSON이 표시됩니다.</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-full border border-sky-200 bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow"
          @click="$emit('format')"
        >
          포맷팅
        </button>
        <button
          type="button"
          class="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-sm font-semibold text-[var(--color-heading)] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
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

    <div class="flex-1 overflow-hidden rounded-xl border border-[var(--color-border)]">
      <pre
        class="h-full max-h-[520px] whitespace-pre overflow-auto bg-slate-950/90 p-4 font-mono text-sm leading-relaxed text-slate-50"
        >{{ props.formattedValue }}</pre
      >
    </div>
  </section>
</template>
