<script setup lang="ts">
import AppButton from './ui/AppButton.vue'

import type { IndentOption } from '@/utils/jsonFormatter'

type Theme = 'light' | 'dark'

const props = defineProps<{
  indent: IndentOption
  theme: Theme
  sortKeys: boolean
  autoFormat: boolean
}>()

const emit = defineEmits<{
  (e: 'update:indent', value: IndentOption): void
  (e: 'update:theme', value: Theme): void
  (e: 'update:sortKeys', value: boolean): void
  (e: 'update:autoFormat', value: boolean): void
}>()

const indentOptions: Array<{ label: string; value: IndentOption }> = [
  { label: '2', value: 2 },
  { label: '4', value: 4 },
  { label: 'Tab', value: 'tab' },
]

const toggleTheme = () => {
  emit('update:theme', props.theme === 'dark' ? 'light' : 'dark')
}
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-sm"
    aria-label="빠른 설정"
  >
    <div class="flex items-center gap-2">
      <span class="text-xs font-semibold text-[var(--color-muted)]">들여쓰기</span>
      <div class="flex items-center gap-1">
        <button
          v-for="option in indentOptions"
          :key="option.value"
          type="button"
          class="rounded-lg border px-2.5 py-1 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-sm"
          :class="
            props.indent === option.value
              ? 'border-sky-200 bg-sky-50 text-sky-900'
              : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-heading)]'
          "
          :aria-pressed="props.indent === option.value"
          @click="$emit('update:indent', option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <span class="text-xs font-semibold text-[var(--color-muted)]">정렬</span>
      <AppButton
        :variant="props.sortKeys ? 'success' : 'neutral'"
        size="sm"
        aria-label="키 정렬 토글"
        @click="$emit('update:sortKeys', !props.sortKeys)"
      >
        {{ props.sortKeys ? 'A→Z on' : 'A→Z off' }}
      </AppButton>
    </div>

    <div class="flex items-center gap-2">
      <span class="text-xs font-semibold text-[var(--color-muted)]">자동</span>
      <AppButton
        :variant="props.autoFormat ? 'primary' : 'neutral'"
        size="sm"
        aria-label="실시간 포맷 토글"
        @click="$emit('update:autoFormat', !props.autoFormat)"
      >
        {{ props.autoFormat ? '실시간 켜짐' : '실시간 꺼짐' }}
      </AppButton>
    </div>

    <div class="ml-auto flex items-center gap-2">
      <span class="text-xs font-semibold text-[var(--color-muted)]">테마</span>
      <AppButton variant="ghost" size="sm" aria-label="테마 전환" @click="toggleTheme">
        {{ props.theme === 'dark' ? '🌙 Dark' : '☀️ Light' }}
      </AppButton>
    </div>
  </div>
</template>
