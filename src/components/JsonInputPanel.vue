<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'file-select', file: File | null): void
  (e: 'file-drop', file: File | null): void
}>()

const isDragging = ref(false)

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
  <section
    class="flex h-full flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">입력</p>
        <h2 class="text-lg font-semibold text-[var(--color-heading)]">JSON 입력 영역</h2>
        <p class="text-sm text-[var(--color-muted)]">
          텍스트 입력 또는 .json 파일을 선택하거나 드래그&드롭하세요.
        </p>
      </div>
      <label
        class="inline-flex cursor-pointer items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 transition hover:-translate-y-0.5 hover:shadow-sm"
      >
        <input type="file" accept=".json,application/json" class="hidden" @change="onFileChange" />
        <span class="text-sm">파일 선택</span>
      </label>
    </div>

    <div class="flex flex-1 flex-col gap-3">
      <textarea
        :value="props.modelValue"
        class="min-h-[220px] flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 font-mono text-sm text-[var(--color-heading)] shadow-inner outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        placeholder="{ 'message': '여기에 JSON을 붙여넣어 주세요' }"
        spellcheck="false"
        @input="onInput"
      />

      <div
        class="rounded-xl border bg-[var(--color-background)] p-4 text-sm transition"
        :class="dropZoneClass"
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
  </section>
</template>
