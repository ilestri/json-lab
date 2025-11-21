<template>
  <header
    class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm"
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
      <div class="flex items-center gap-3">
        <span
          class="rounded-full border border-[var(--color-border)] bg-white/70 px-3 py-1 text-xs text-[var(--color-muted)] shadow-sm"
        >
          Vue 3 · Vite · Tailwind
        </span>
        <button
          type="button"
          class="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-xs font-medium text-[var(--color-heading)] transition hover:-translate-y-0.5 hover:shadow-sm"
          aria-label="테마 토글 준비 중"
        >
          Light / Dark 준비 중
        </button>
      </div>
    </div>
  </header>
</template>
