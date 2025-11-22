<script setup lang="ts">
import { RouterLink } from 'vue-router'

import pkg from '../../package.json'

const repoUrl = 'https://github.com/ilestri/json-lab'
const issuesUrl = 'https://github.com/ilestri/json-lab/issues'
const pagesUrl = 'https://ilestri.github.io/json-lab/'
</script>

<template>
  <footer
    class="mt-auto flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-muted)] shadow-sm sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex flex-wrap items-center gap-2 text-[var(--color-heading)]">
      <RouterLink to="/" class="font-semibold hover:underline">json-lab</RouterLink>
      <span class="text-xs text-[var(--color-muted)]">v{{ pkg.version }}</span>
      <span aria-hidden="true">·</span>
      <span>MIT License</span>
      <span aria-hidden="true">·</span>
      <a class="hover:underline" :href="pagesUrl" target="_blank" rel="noreferrer">GitHub Pages</a>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <RouterLink
        to="/settings"
        class="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-heading)] transition hover:-translate-y-0.5 hover:shadow-sm"
      >
        설정 · 단축키
      </RouterLink>
      <a
        class="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-heading)] transition hover:-translate-y-0.5 hover:shadow-sm"
        :href="repoUrl"
        target="_blank"
        rel="noreferrer"
      >
        Repo
      </a>
      <a
        class="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-heading)] transition hover:-translate-y-0.5 hover:shadow-sm"
        :href="issuesUrl"
        target="_blank"
        rel="noreferrer"
      >
        피드백/이슈
      </a>
    </div>
  </footer>
</template>
