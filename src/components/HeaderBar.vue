<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

import AppButton from './ui/AppButton.vue'

const showShortcuts = ref(false)
const dialogRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)

const shortcuts = [
  { label: '포맷 실행', combo: '⌘/Ctrl + Enter' },
  { label: 'Minify 출력', combo: 'Alt + M' },
  { label: '결과 복사', combo: 'Shift + ⌘/Ctrl + C' },
]

const focusableSelector = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'

const closeShortcuts = () => {
  showShortcuts.value = false
  nextTick(() => triggerRef.value?.focus())
}

const toggleShortcuts = () => {
  showShortcuts.value = !showShortcuts.value
}

const focusFirstInDialog = () => {
  nextTick(() => {
    const first = dialogRef.value?.querySelector(focusableSelector) as HTMLElement | null
    first?.focus()
  })
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!showShortcuts.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closeShortcuts()
    return
  }
  if (event.key !== 'Tab') return
  const focusables = dialogRef.value?.querySelectorAll<HTMLElement>(focusableSelector)
  if (!focusables || focusables.length === 0) return
  const elements = Array.from(focusables).filter((el) => !el.hasAttribute('disabled'))
  if (!elements.length) return
  const first = elements[0]
  const last = elements[elements.length - 1]
  const active = document.activeElement as HTMLElement | null
  if (event.shiftKey) {
    if (active === first || !dialogRef.value?.contains(active)) {
      event.preventDefault()
      last.focus()
    }
  } else if (active === last) {
    event.preventDefault()
    first.focus()
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (!showShortcuts.value) return
  const target = event.target as Node
  if (dialogRef.value?.contains(target) || triggerRef.value?.contains(target)) return
  closeShortcuts()
}

watch(showShortcuts, (visible) => {
  if (visible) {
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('mousedown', handleClickOutside)
    focusFirstInDialog()
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('mousedown', handleClickOutside)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('mousedown', handleClickOutside)
})
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
          ref="triggerRef"
          size="sm"
          variant="neutral"
          aria-haspopup="dialog"
          :aria-expanded="showShortcuts"
          :aria-controls="showShortcuts ? 'shortcuts-dialog' : undefined"
          @click="toggleShortcuts"
        >
          단축키
        </AppButton>
      </div>
    </div>

    <div v-if="showShortcuts">
      <div class="fixed inset-0 z-10 bg-black/20 backdrop-blur-[1px]" aria-hidden="true" />
      <div
        id="shortcuts-dialog"
        ref="dialogRef"
        class="absolute right-4 top-[72px] z-20 w-[320px] rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label="키보드 단축키 안내"
      >
        <div class="mb-3 flex items-start justify-between gap-2">
          <div>
            <p class="text-sm font-semibold text-[var(--color-heading)]">키보드 단축키</p>
            <p class="text-xs text-[var(--color-muted)]">
              포맷터와 도구 화면에서 공통으로 사용할 수 있는 빠른 조작 키입니다.
            </p>
          </div>
          <AppButton
            variant="ghost"
            size="sm"
            aria-label="단축키 안내 닫기"
            @click="closeShortcuts"
          >
            닫기
          </AppButton>
        </div>
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
    </div>
  </header>
</template>
