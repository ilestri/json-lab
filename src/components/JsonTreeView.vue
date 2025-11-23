<script setup lang="ts">
import VirtualJsonTree from './VirtualJsonTree.vue'

const props = defineProps<{
  data: unknown | null
}>()
</script>

<template>
  <div
    class="flex h-full flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
  >
    <div>
      <p class="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Tree View</p>
      <h3 class="text-lg font-semibold text-[var(--color-heading)]">JSON 구조</h3>
      <p class="text-sm text-[var(--color-muted)]">
        최근 포맷팅된 JSON 구조를 트리로 탐색할 수 있습니다.
      </p>
      <p class="text-xs text-[var(--color-muted)]">
        큰 JSON은 가상 스크롤로 렌더링되어 성능을 유지합니다.
      </p>
    </div>
    <VirtualJsonTree :data="props.data" />
  </div>
</template>
