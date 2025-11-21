<template>
  <footer
    class="mt-auto flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-muted)] shadow-sm sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex items-center gap-2">
      <span class="font-medium text-[var(--color-heading)]">json-lab</span>
      <span class="text-xs">v0.1.0</span>
      <span aria-hidden="true">·</span>
      <span>MIT License</span>
    </div>
    <div class="flex items-center gap-3">
      <a
        class="rounded-full border border-[var(--color-border)] px-3 py-1 transition hover:-translate-y-0.5 hover:shadow-sm"
        href="https://github.com/ilestri/json-lab"
        target="_blank"
        rel="noreferrer"
      >
        GitHub
      </a>
      <a
        class="rounded-full border border-[var(--color-border)] px-3 py-1 transition hover:-translate-y-0.5 hover:shadow-sm"
        href="https://ilestri.github.io/json-lab/"
        target="_blank"
        rel="noreferrer"
      >
        Live
      </a>
    </div>
  </footer>
</template>
