<script setup lang="ts"></script>

<template>
  <div class="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
    <div class="mx-auto max-w-4xl px-6 py-12">
      <p class="text-sm font-medium uppercase tracking-[0.12em] text-[var(--color-muted)]">
        json-lab
      </p>
      <h1 class="mt-2 text-3xl font-semibold text-[var(--color-heading)]">
        JSON Formatter 환경 세팅 완료
      </h1>
      <p class="mt-4 text-base leading-7 text-[var(--color-muted)]">
        Vite (Vue 3 + TypeScript), Tailwind CSS, ESLint, Prettier가 준비되었습니다. TODO 1부터
        레이아웃과 기능을 구현해 주세요.
      </p>
      <div
        class="mt-8 grid gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm sm:grid-cols-2"
      >
        <div class="space-y-1">
          <p class="text-sm font-semibold text-[var(--color-heading)]">개발 스크립트</p>
          <ul class="text-sm text-[var(--color-muted)]">
            <li><code class="rounded bg-slate-100 px-2 py-1">npm run dev</code> 개발 서버</li>
            <li><code class="rounded bg-slate-100 px-2 py-1">npm run build</code> 프로덕션 빌드</li>
            <li>
              <code class="rounded bg-slate-100 px-2 py-1">npm run preview</code> 빌드 미리보기
            </li>
          </ul>
        </div>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-[var(--color-heading)]">품질 도구</p>
          <ul class="text-sm text-[var(--color-muted)]">
            <li><code class="rounded bg-slate-100 px-2 py-1">npm run lint</code> ESLint</li>
            <li>
              <code class="rounded bg-slate-100 px-2 py-1">npm run type-check</code> 타입 검사
            </li>
            <li>
              <code class="rounded bg-slate-100 px-2 py-1">npm run format</code> Prettier 확인
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
