<script setup lang="ts">
import { ref } from 'vue'

import AppButton from './ui/AppButton.vue'

const showShortcuts = ref(false)

const shortcuts = [
  { label: '포맷 실행', combo: '⌘/Ctrl + Enter' },
  { label: 'Minify 출력', combo: 'Alt + M' },
  { label: '결과 복사', combo: 'Shift + ⌘/Ctrl + C' },
]

const toggleShortcuts = () => {
  showShortcuts.value = !showShortcuts.value
}
</script>

<template>
  <header
    class="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm"
    role="banner"
  >
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-400 text-lg font-bold text-white shadow"
        >
          { }
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">json-lab</p>
          <h1 class="text-xl font-semibold text-[var(--color-heading)]">JSON Formatter</h1>
          <p class="text-sm text-[var(--color-muted)]">브라우저에서 바로 JSON을 보기 좋게</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <AppButton
          size="sm"
          variant="neutral"
          aria-haspopup="dialog"
          :aria-expanded="showShortcuts"
          @click="toggleShortcuts"
        >
          단축키
        </AppButton>
      </div>
    </div>

    <div
      v-if="showShortcuts"
      class="absolute right-4 top-[72px] z-10 w-[320px] rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-lg"
      role="dialog"
      aria-label="키보드 단축키 안내"
    >
      <p class="text-sm font-semibold text-[var(--color-heading)]">키보드 단축키</p>
      <p class="mb-3 text-xs text-[var(--color-muted)]">
        포맷터와 도구 화면에서 공통으로 사용할 수 있는 빠른 조작 키입니다.
      </p>
      <ul class="space-y-2 text-sm text-[var(--color-heading)]">
        <li
          v-for="item in shortcuts"
          :key="item.label"
          class="flex items-center justify-between gap-2 rounded-lg bg-[var(--color-surface)] px-3 py-2"
        >
          <span>{{ item.label }}</span>
          <span class="text-xs text-[var(--color-muted)]">{{ item.combo }}</span>
        </li>
      </ul>
    </div>
  </header>
</template>
