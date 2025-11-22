<script setup lang="ts">
import { computed, ref } from 'vue'

import AppButton from './ui/AppButton.vue'
import AppCard from './ui/AppCard.vue'

const props = defineProps<{
  modelValue: string
  highlightLine?: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'file-select', file: File | null): void
  (e: 'file-drop', file: File | null): void
  (e: 'paste-from-clipboard'): void
  (e: 'load-sample'): void
}>()

const isDragging = ref(false)
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

const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  emit('file-select', file)
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
  emit('file-drop', file)
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
      <AppButton variant="ghost" size="sm" @click="$emit('load-sample')">
        샘플 JSON
      </AppButton>
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
        role="button"
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
      </div>
    </div>
  </AppCard>
</template>
