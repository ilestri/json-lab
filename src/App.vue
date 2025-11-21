<script setup lang="ts">
import { provide } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import FooterBar from './components/FooterBar.vue'
import HeaderBar from './components/HeaderBar.vue'
import AppToast from './components/ui/AppToast.vue'
import { formatterKey } from './composables/formatterContext'
import { useFormatterState } from './composables/useFormatterState'

const formatter = useFormatterState()
provide(formatterKey, formatter)

const { toastMessage, toastVisible, toastTone } = formatter

const route = useRoute()

const navItems = [
  { to: '/', label: '포맷터', description: '입력 · 설정 · 출력' },
  { to: '/tools', label: '도구', description: 'Diff · Schema · Tree · Fetch' },
]

const isActive = (path: string) => route.path === path
</script>

<template>
  <div class="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
    <AppToast :visible="toastVisible" :message="toastMessage" :tone="toastTone" />
    <div class="mx-auto flex min-h-screen max-w-6xl flex-col gap-5 px-5 pb-10 pt-8">
      <HeaderBar />

      <nav
        class="flex flex-wrap gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-sm"
        aria-label="페이지 내비게이션"
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex min-w-[140px] flex-col rounded-xl border px-3 py-2 text-sm transition hover:-translate-y-0.5 hover:shadow-sm"
          :class="
            isActive(item.to)
              ? 'border-sky-200 bg-sky-50 text-sky-900'
              : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-heading)]'
          "
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          <span class="font-semibold">{{ item.label }}</span>
          <span class="text-xs text-[var(--color-muted)]">{{ item.description }}</span>
        </RouterLink>
      </nav>

      <main class="flex-1">
        <RouterView />
      </main>

      <FooterBar />
    </div>
  </div>
</template>
