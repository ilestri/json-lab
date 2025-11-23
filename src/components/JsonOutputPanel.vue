<script setup lang="ts">
import { computed } from 'vue'

import AppButton from './ui/AppButton.vue'
import AppCard from './ui/AppCard.vue'
import StatusBadge from './ui/StatusBadge.vue'

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
  (e: 'copy-status'): void
}>()

const lines = computed(() =>
  props.formattedValue ? props.formattedValue.split('\n') : ['결과가 여기에 표시됩니다.']
)

const lineHeight = 24
const lineStyle = { lineHeight: `${lineHeight}px` }

const statusChip = computed(() => {
  if (props.status === 'valid') {
    return {
      label: 'Valid JSON',
      tone: 'success' as const,
      icon: '✅',
    }
  }
  if (props.status === 'invalid') {
    return {
      label: 'Invalid JSON',
      tone: 'danger' as const,
      icon: '❌',
    }
  }
  return {
    label: 'Waiting',
    tone: 'muted' as const,
    icon: '⏸️',
  }
})
</script>

<template>
  <AppCard
    class="h-full"
    eyebrow="출력"
    title="포맷 결과"
    description="포맷팅 상태와 결과 JSON이 표시됩니다."
    role="region"
  >
    <template #actions>
      <AppButton variant="primary" size="sm" @click="$emit('format')">포맷팅</AppButton>
      <AppButton variant="warning" size="sm" @click="$emit('minify')">Minify</AppButton>
      <AppButton variant="neutral" size="sm" @click="$emit('copy')">복사</AppButton>
    </template>

    <div class="flex h-full flex-col gap-4">
      <div
        class="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3"
        aria-live="polite"
      >
        <div class="flex flex-wrap items-center gap-3">
          <StatusBadge
            :label="statusChip.label"
            :tone="statusChip.tone"
            :icon="statusChip.icon"
            role="status"
            :aria-label="`상태: ${statusChip.label}`"
          />
          <p class="text-sm text-[var(--color-muted)]">{{ props.message }}</p>
          <div class="ml-auto flex flex-wrap items-center gap-2 text-xs">
            <AppButton variant="neutral" size="sm" @click="$emit('copy-status')"
              >상태 복사</AppButton
            >
            <AppButton variant="ghost" size="sm" @click="$emit('format')">다시 시도</AppButton>
          </div>
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
          <div class="grid min-w-full max-w-full grid-cols-[auto,1fr]">
            <div class="border-r border-slate-800 bg-slate-900/60 text-sm text-slate-400">
              <div
                v-for="(line, index) in lines"
                :key="index"
                class="px-4 py-0 text-right font-mono tabular-nums"
                :style="lineStyle"
              >
                {{ index + 1 }}
              </div>
            </div>
            <div class="bg-slate-950/90 min-w-0 overflow-x-auto">
              <div
                v-for="(line, index) in lines"
                :key="index"
                class="px-4 py-0 font-mono text-sm text-slate-50 whitespace-pre"
                :style="lineStyle"
              >
                {{ line || ' ' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppCard>
</template>
