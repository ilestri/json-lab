<script setup lang="ts">
import AppButton from './ui/AppButton.vue'
import AppCard from './ui/AppCard.vue'

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

const indentOptions: Array<{ label: string; value: IndentOption; hint: string }> = [
  { label: '2 spaces', value: 2, hint: '기본 권장' },
  { label: '4 spaces', value: 4, hint: '들여쓰기 넉넉하게' },
  { label: 'Tab', value: 'tab', hint: '탭 문자 사용' },
]

const toggleTheme = () => {
  emit('update:theme', props.theme === 'dark' ? 'light' : 'dark')
}
</script>

<template>
  <AppCard
    eyebrow="Settings"
    title="들여쓰기 & 테마"
    description="포맷팅 시 기본 들여쓰기와 라이트/다크 테마를 선택하세요."
    aria-label="설정"
  >
    <template #actions>
      <AppButton variant="neutral" size="sm" @click="toggleTheme">
        <span aria-hidden="true">{{ props.theme === 'dark' ? '🌙' : '☀️' }}</span>
        <span>{{ props.theme === 'dark' ? '다크 모드' : '라이트 모드' }}</span>
      </AppButton>
    </template>

    <div class="grid gap-3 sm:grid-cols-3">
      <button
        v-for="option in indentOptions"
        :key="option.value"
        type="button"
        class="rounded-xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
        :class="
          props.indent === option.value
            ? 'border-sky-200 bg-sky-50 text-sky-900'
            : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-heading)]'
        "
        @click="$emit('update:indent', option.value)"
      >
        <p class="text-sm font-semibold">
          {{ option.label }}
          <span v-if="props.indent === option.value" class="ml-1 text-xs text-sky-700">(선택)</span>
        </p>
        <p class="mt-1 text-xs text-[var(--color-muted)]">{{ option.hint }}</p>
      </button>
    </div>

    <div
      class="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3"
    >
      <div class="flex flex-col">
        <p class="text-sm font-semibold text-[var(--color-heading)]">키 정렬</p>
        <p class="text-xs text-[var(--color-muted)]">알파벳 순으로 키를 정렬해 출력</p>
      </div>
      <AppButton
        :variant="props.sortKeys ? 'success' : 'neutral'"
        size="sm"
        class="ml-auto"
        @click="$emit('update:sortKeys', !props.sortKeys)"
      >
        <span aria-hidden="true">{{ props.sortKeys ? '✅' : '⬜️' }}</span>
        <span>{{ props.sortKeys ? '정렬 켜짐' : '정렬 끄기' }}</span>
      </AppButton>
    </div>

    <div
      class="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3"
    >
      <div class="flex flex-col">
        <p class="text-sm font-semibold text-[var(--color-heading)]">실시간 포맷</p>
        <p class="text-xs text-[var(--color-muted)]">입력 후 잠시 멈추면 자동 포맷</p>
      </div>
      <AppButton
        :variant="props.autoFormat ? 'primary' : 'neutral'"
        size="sm"
        class="ml-auto"
        @click="$emit('update:autoFormat', !props.autoFormat)"
      >
        <span aria-hidden="true">{{ props.autoFormat ? '✅' : '⬜️' }}</span>
        <span>{{ props.autoFormat ? '자동 포맷 켜짐' : '자동 포맷 끄기' }}</span>
      </AppButton>
    </div>
  </AppCard>
</template>
