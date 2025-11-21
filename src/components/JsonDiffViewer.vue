<script setup lang="ts">
import { ref } from 'vue'

import { parseJson } from '@/utils/jsonFormatter'

type DiffType = 'added' | 'removed' | 'changed' | 'type' | 'array-length'

type DiffItem = {
  path: string
  type: DiffType
  detail: string
}

const props = withDefaults(
  defineProps<{
    sourceA?: string
    sourceB?: string
  }>(),
  {
    sourceA: '',
    sourceB: '',
  }
)

const inputA = ref(props.sourceA)
const inputB = ref(props.sourceB)
const status = ref<'idle' | 'same' | 'diff' | 'error'>('idle')
const message = ref('두 JSON을 비교해 보세요.')
const diffs = ref<DiffItem[]>([])

const buildPath = (base: string, key: string | number) =>
  base === '' || base === 'root' ? `root.${key}` : `${base}.${key}`

const compareValues = (a: unknown, b: unknown, path = 'root') => {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      diffs.value.push({
        path,
        type: 'array-length',
        detail: `길이 다름: ${a.length} vs ${b.length}`,
      })
    }
    const max = Math.max(a.length, b.length)
    for (let i = 0; i < max; i += 1) {
      compareValues(a[i], b[i], buildPath(path, i))
    }
    return
  }

  if (
    a &&
    typeof a === 'object' &&
    b &&
    typeof b === 'object' &&
    !Array.isArray(a) &&
    !Array.isArray(b)
  ) {
    const keys = new Set([
      ...Object.keys(a as Record<string, unknown>),
      ...Object.keys(b as Record<string, unknown>),
    ])
    keys.forEach((key) => {
      const hasA = Object.prototype.hasOwnProperty.call(a, key)
      const hasB = Object.prototype.hasOwnProperty.call(b, key)
      const nextPath = buildPath(path, key)
      if (!hasA) {
        diffs.value.push({ path: nextPath, type: 'added', detail: 'B에만 존재' })
        return
      }
      if (!hasB) {
        diffs.value.push({ path: nextPath, type: 'removed', detail: 'A에만 존재' })
        return
      }
      compareValues(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        nextPath
      )
    })
    return
  }

  if (typeof a !== typeof b) {
    diffs.value.push({
      path,
      type: 'type',
      detail: `타입 다름: ${typeof a} vs ${typeof b}`,
    })
    return
  }

  if (a !== b) {
    diffs.value.push({
      path,
      type: 'changed',
      detail: `값 다름: ${String(a)} vs ${String(b)}`,
    })
  }
}

const handleDiff = () => {
  diffs.value = []

  const parsedA = parseJson(inputA.value)
  if (parsedA.ok === false) {
    status.value = 'error'
    message.value = `A 파싱 오류: ${parsedA.message}`
    return
  }

  const parsedB = parseJson(inputB.value)
  if (parsedB.ok === false) {
    status.value = 'error'
    message.value = `B 파싱 오류: ${parsedB.message}`
    return
  }

  compareValues(parsedA.data, parsedB.data)

  if (diffs.value.length === 0) {
    status.value = 'same'
    message.value = '두 JSON이 동일합니다.'
  } else {
    status.value = 'diff'
    message.value = `${diffs.value.length}개의 차이가 있습니다.`
  }
}
</script>

<template>
  <div
    class="flex h-full flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
  >
    <div class="flex items-center justify-between gap-2">
      <div>
        <p class="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Diff</p>
        <h3 class="text-lg font-semibold text-[var(--color-heading)]">JSON 비교</h3>
        <p class="text-sm text-[var(--color-muted)]">두 JSON을 파싱해 구조/값 차이를 추출합니다.</p>
      </div>
      <button
        type="button"
        class="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-sm font-semibold text-[var(--color-heading)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-sm"
        @click="handleDiff"
      >
        비교
      </button>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <textarea
        v-model="inputA"
        class="min-h-[160px] w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3 font-mono text-xs text-[var(--color-heading)] outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        placeholder="A JSON 입력"
        spellcheck="false"
      />
      <textarea
        v-model="inputB"
        class="min-h-[160px] w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3 font-mono text-xs text-[var(--color-heading)] outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        placeholder="B JSON 입력"
        spellcheck="false"
      />
    </div>

    <div
      class="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3"
    >
      <p
        class="text-sm font-semibold"
        :class="{
          'text-emerald-700': status === 'same',
          'text-rose-700': status === 'error',
          'text-amber-700': status === 'diff',
          'text-[var(--color-heading)]': status === 'idle',
        }"
      >
        {{ message }}
      </p>
      <ul v-if="diffs.length" class="mt-2 space-y-1 text-xs text-[var(--color-muted)]">
        <li
          v-for="(item, index) in diffs"
          :key="index"
          class="rounded bg-[var(--color-surface)] px-2 py-1"
        >
          <span class="font-semibold text-[var(--color-heading)]">{{ item.path }}</span>
          <span class="ml-2 text-[var(--color-muted)]">[{{ item.type }}]</span>
          <span class="ml-2">{{ item.detail }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
