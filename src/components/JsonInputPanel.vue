<script setup lang="ts">
import { computed, ref, withDefaults } from 'vue'

import AppButton from './ui/AppButton.vue'
import AppCard from './ui/AppCard.vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    highlightLine?: number | null
    recentSnippets?: Array<{ id: string; preview: string }>
    clipboardPermission?: 'unknown' | 'granted' | 'denied' | 'prompt'
    textSize?: 'normal' | 'large'
    lineHeight?: 'normal' | 'relaxed'
  }>(),
  {
    textSize: 'normal',
    lineHeight: 'normal',
  }
)

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
const dragPreview = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const readableLineHeight = computed(() => (props.lineHeight === 'relaxed' ? 28 : 24))
const readableFontSize = computed(() => (props.textSize === 'large' ? '16px' : '14px'))
const readabilityStyle = computed(() => ({ fontSize: readableFontSize.value }))
const highlightStyle = computed(() => {
  const lineHeight = readableLineHeight.value
  if (!props.highlightLine || props.highlightLine < 1) return { lineHeight: `${lineHeight}px` }
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

const dragLiveMessage = computed(() => {
  if (dragPreview.value) return `드래그 중: ${dragPreview.value}`
  if (isDragging.value) return '드래그 상태: JSON 파일을 놓으면 업로드합니다.'
  return '드래그 앤 드롭 대기 중입니다.'
})

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

const updateDragPreview = (event: DragEvent) => {
  const item = event.dataTransfer?.items?.[0]
  const file =
    item && item.kind === 'file' ? item.getAsFile() : (event.dataTransfer?.files?.[0] ?? null)
  if (file) {
    const kb = Math.max(file.size / 1024, 0.1).toFixed(1)
    dragPreview.value = `${file.name} · ${kb} KB`
  } else {
    dragPreview.value = 'JSON 파일을 놓으면 업로드합니다.'
  }
}

const onDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  dragPreview.value = ''
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0] ?? null
  emit('file-drop', file, { minifyOverride: dropFormat.value === 'minify' })
  dragPreview.value = ''
}

const onDropZoneKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    fileInputRef.value?.click()
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    resetDropArea()
  }
}

const resetDropArea = () => {
  isDragging.value = false
  dragPreview.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
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
      <div class="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
        <AppButton
          tag="label"
          variant="primary"
          size="md"
          class="w-full cursor-pointer sm:w-auto"
          aria-label="JSON 파일 선택"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept=".json,.txt,application/json,text/plain"
            class="hidden"
            @change="onFileChange"
          />
          <span class="text-sm">파일 선택</span>
        </AppButton>
        <AppButton
          variant="neutral"
          size="md"
          class="w-full sm:w-auto"
          @click="$emit('paste-from-clipboard')"
        >
          붙여넣기
        </AppButton>
        <AppButton variant="ghost" size="md" class="w-full sm:w-auto" @click="$emit('load-sample')">
          샘플 JSON
        </AppButton>
        <AppButton
          variant="neutral"
          size="md"
          class="w-full sm:w-auto"
          @click="$emit('copy-share')"
        >
          공유 링크
        </AppButton>
        <span class="text-xs text-[var(--color-muted)]">{{ clipboardStatusLabel }}</span>
      </div>
    </template>

    <div class="flex flex-1 flex-col gap-3">
      <textarea
        :value="props.modelValue"
        class="min-h-[220px] flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 font-mono text-sm text-[var(--color-heading)] shadow-inner outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        placeholder="{ 'message': '여기에 JSON을 붙여넣어 주세요' }"
        spellcheck="false"
        :style="[highlightStyle, readabilityStyle]"
        aria-label="JSON 입력 텍스트에어리어"
        @input="onInput"
      />

      <div
        class="rounded-xl border bg-[var(--color-background)] p-4 text-sm transition"
        :class="dropZoneClass"
        :aria-label="dragPreview ? `드래그 중: ${dragPreview}` : 'JSON 파일 드래그 앤 드롭 영역'"
        tabindex="0"
        aria-live="polite"
        aria-describedby="dropzone-guide"
        @dragenter="onDragEnter"
        @dragover.prevent="updateDragPreview"
        @dragleave="onDragLeave"
        @drop="onDrop"
        @keydown="onDropZoneKeydown"
      >
        <p class="sr-only">{{ dragLiveMessage }}</p>
        <p class="font-medium text-[var(--color-heading)]">드래그&드롭 업로드</p>
        <p class="mt-1 text-[var(--color-muted)]">
          .json 파일을 이 영역에 끌어다 놓으면 업로드됩니다.
        </p>
        <p class="text-xs text-[var(--color-muted)]">
          지원: .json, .txt (application/json, text/plain)
        </p>
        <p v-if="dragPreview" class="mt-2 text-xs font-medium text-sky-700">{{ dragPreview }}</p>
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
          <AppButton
            variant="ghost"
            size="sm"
            class="ml-auto"
            :disabled="!isDragging && !dragPreview"
            @click="resetDropArea"
          >
            드래그 취소
          </AppButton>
        </div>
        <p id="dropzone-guide" class="mt-2 text-xs text-[var(--color-muted)]">
          Tab으로 이 영역에 포커스를 옮긴 뒤 Enter/Space로 파일 선택을 열 수 있습니다. 드래그 중에는
          취소 버튼이나 Esc 키로 초기화하세요.
        </p>
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
