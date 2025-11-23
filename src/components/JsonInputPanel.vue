<script setup lang="ts">
import { computed, ref } from 'vue'

import AppButton from './ui/AppButton.vue'
import AppCard from './ui/AppCard.vue'

const props = defineProps<{
  modelValue: string
  highlightLine?: number | null
  recentSnippets?: Array<{ id: string; preview: string }>
  clipboardPermission?: 'unknown' | 'granted' | 'denied' | 'prompt'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'file-select', file: File | null, options?: { minifyOverride?: boolean }): void
  (e: 'file-drop', file: File | null, options?: { minifyOverride?: boolean }): void
  (e: 'paste-from-clipboard'): void
  (e: 'load-sample'): void
  (e: 'copy-share'): void
  (e: 'load-snippet', id: string): void
}>()

const isDragging = ref(false)
const dropFormat = ref<'pretty' | 'minify'>('pretty')
const highlightStyle = computed(() => {
  if (!props.highlightLine || props.highlightLine < 1) return {}
  const lineHeight = 24
  const start = (props.highlightLine - 1) * lineHeight
  const end = props.highlightLine * lineHeight
  const gradient = `linear-gradient(180deg, transparent ${start}px, rgba(248, 113, 113, 0.18) ${start}px, rgba(248, 113, 113, 0.18) ${end}px, transparent ${end}px)`
  return { backgroundImage: gradient, lineHeight: `${lineHeight}px` }
})

const dropZoneClass = computed(() =>
  isDragging.value
    ? 'border-sky-400 bg-sky-50/60 dark:bg-sky-900/30'
    : 'border-dashed border-[var(--color-border)]'
)

const clipboardStatusLabel = computed(() => {
  if (props.clipboardPermission === 'granted') return '클립보드 읽기 허용됨'
  if (props.clipboardPermission === 'denied') return '클립보드 읽기 거부됨'
  if (props.clipboardPermission === 'prompt') return '클립보드 권한 요청 예정'
  return '클립보드 권한 확인 중'
})

const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  emit('file-select', file, { minifyOverride: dropFormat.value === 'minify' })
}

const onDragEnter = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const onDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0] ?? null
  emit('file-drop', file, { minifyOverride: dropFormat.value === 'minify' })
}
</script>

<template>
  <AppCard
    eyebrow="입력"
    title="JSON 입력"
    description="붙여넣기 · 파일 선택 · 드래그&드롭"
    role="region"
    class="h-full"
  >
    <template #actions>
      <AppButton
        tag="label"
        variant="primary"
        size="sm"
        class="cursor-pointer"
        aria-label="JSON 파일 선택"
      >
        <input type="file" accept=".json,application/json" class="hidden" @change="onFileChange" />
        <span class="text-sm">파일 선택</span>
      </AppButton>
      <AppButton variant="neutral" size="sm" @click="$emit('paste-from-clipboard')">
        붙여넣기
      </AppButton>
      <AppButton variant="ghost" size="sm" @click="$emit('load-sample')"> 샘플 JSON </AppButton>
      <AppButton variant="neutral" size="sm" @click="$emit('copy-share')"> 공유 링크 </AppButton>
      <span class="text-xs text-[var(--color-muted)]">{{ clipboardStatusLabel }}</span>
    </template>

    <div class="flex flex-1 flex-col gap-3">
      <textarea
        :value="props.modelValue"
        class="min-h-[220px] flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 font-mono text-sm text-[var(--color-heading)] shadow-inner outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        placeholder="{ 'message': '여기에 JSON을 붙여넣어 주세요' }"
        spellcheck="false"
        :style="highlightStyle"
        aria-label="JSON 입력 텍스트에어리어"
        @input="onInput"
      />

      <div
        class="rounded-xl border bg-[var(--color-background)] p-4 text-sm transition"
        :class="dropZoneClass"
        aria-label="JSON 파일 드래그 앤 드롭 영역"
        @dragenter="onDragEnter"
        @dragover.prevent
        @dragleave="onDragLeave"
        @drop="onDrop"
      >
        <p class="font-medium text-[var(--color-heading)]">드래그&드롭 업로드</p>
        <p class="mt-1 text-[var(--color-muted)]">
          .json 파일을 이 영역에 끌어다 놓으면 업로드됩니다.
        </p>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <p class="text-xs text-[var(--color-muted)]">드롭 포맷</p>
          <div
            class="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-1"
          >
            <AppButton
              variant="neutral"
              size="sm"
              :class="dropFormat === 'pretty' ? 'border-sky-200 bg-sky-50 text-sky-900' : ''"
              @click.prevent="dropFormat = 'pretty'"
            >
              Pretty
            </AppButton>
            <AppButton
              variant="neutral"
              size="sm"
              :class="dropFormat === 'minify' ? 'border-sky-200 bg-sky-50 text-sky-900' : ''"
              @click.prevent="dropFormat = 'minify'"
            >
              Minify
            </AppButton>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-semibold text-[var(--color-heading)]">최근 JSON</p>
          <p class="text-xs text-[var(--color-muted)]">최대 5개까지 저장됩니다.</p>
        </div>
        <p v-if="!props.recentSnippets?.length" class="text-sm text-[var(--color-muted)]">
          최근에 포맷한 JSON이 없습니다.
        </p>
        <ul v-else class="mt-2 space-y-1">
          <li
            v-for="snippet in props.recentSnippets"
            :key="snippet.id"
            class="flex items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
          >
            <span class="line-clamp-1 text-[var(--color-muted)]">{{ snippet.preview }}</span>
            <AppButton size="sm" variant="neutral" @click="$emit('load-snippet', snippet.id)">
              불러오기
            </AppButton>
          </li>
        </ul>
      </div>
    </div>
  </AppCard>
</template>
