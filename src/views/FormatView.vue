<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import JsonInputPanel from '@/components/JsonInputPanel.vue'
import JsonOutputPanel from '@/components/JsonOutputPanel.vue'
import { useFormatter } from '@/composables/formatterContext'
import { formatJson } from '@/utils/jsonFormatter'

const sampleJson = {
  id: 'sample',
  title: 'json-lab 포맷 샘플',
  meta: {
    source: 'clipboard · upload · url',
    tags: ['format', 'schema', 'diff'],
    version: 2,
  },
  items: [
    { key: 'status', value: 'ok' },
    { key: 'count', value: 3 },
  ],
}

const {
  rawInput,
  formattedPreview,
  status,
  statusMessage,
  statusDetails,
  indentOption,
  textSize,
  lineHeight,
  contrastPreset,
  sortKeys,
  errorHighlightLine,
  recentSnippets,
  clipboardPermission,
  handleFormat,
  handleFileInput,
  handleTextSizeChange,
  handleLineHeightChange,
  handleContrastChange,
  handleCopy,
  handleCopyStatus,
  copyShareLink,
  loadRecentSnippet,
  showToast,
} = useFormatter()

const optionButtonClass = (active: boolean) =>
  active
    ? 'border-sky-200 bg-sky-50 text-sky-900'
    : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-heading)]'

const handlePasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (!text.trim()) {
      showToast('클립보드에 붙여넣을 JSON이 없습니다.', { tone: 'error' })
      return
    }
    rawInput.value = text
    handleFormat()
    showToast('클립보드 JSON을 불러왔습니다.', { tone: 'success' })
  } catch (error) {
    console.error(error)
    showToast('클립보드를 읽을 수 없습니다. 브라우저 권한을 확인하세요.', { tone: 'error' })
  }
}

const handleLoadSample = () => {
  rawInput.value = formatJson(sampleJson, {
    indent: indentOption.value,
    sortKeys: sortKeys.value,
    minify: false,
  })
  handleFormat({ minify: false })
  showToast('샘플 JSON을 불러왔습니다.', { tone: 'info' })
}

const handleKeydown = (event: KeyboardEvent) => {
  const isMeta = event.metaKey || event.ctrlKey
  if (isMeta && event.key === 'Enter') {
    event.preventDefault()
    handleFormat()
  }
  if (isMeta && event.shiftKey && (event.key === 'c' || event.key === 'C')) {
    event.preventDefault()
    handleCopy()
  }
  if (event.altKey && (event.key === 'm' || event.key === 'M')) {
    event.preventDefault()
    handleFormat({ minify: true })
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <section
      class="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-sm"
      aria-label="가독성 설정"
    >
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold text-[var(--color-muted)]">글자 크기</span>
        <button
          type="button"
          class="rounded-lg border px-3 py-1 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-sm"
          :class="optionButtonClass(textSize === 'normal')"
          :aria-pressed="textSize === 'normal'"
          @click="handleTextSizeChange('normal')"
        >
          기본
        </button>
        <button
          type="button"
          class="rounded-lg border px-3 py-1 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-sm"
          :class="optionButtonClass(textSize === 'large')"
          :aria-pressed="textSize === 'large'"
          @click="handleTextSizeChange('large')"
        >
          크게
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold text-[var(--color-muted)]">줄 간격</span>
        <button
          type="button"
          class="rounded-lg border px-3 py-1 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-sm"
          :class="optionButtonClass(lineHeight === 'normal')"
          :aria-pressed="lineHeight === 'normal'"
          @click="handleLineHeightChange('normal')"
        >
          기본
        </button>
        <button
          type="button"
          class="rounded-lg border px-3 py-1 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-sm"
          :class="optionButtonClass(lineHeight === 'relaxed')"
          :aria-pressed="lineHeight === 'relaxed'"
          @click="handleLineHeightChange('relaxed')"
        >
          넉넉하게
        </button>
      </div>

      <div class="ml-auto flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold text-[var(--color-muted)]">대비 프리셋</span>
        <button
          type="button"
          class="rounded-lg border px-3 py-1 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-sm"
          :class="optionButtonClass(contrastPreset === 'balanced')"
          :aria-pressed="contrastPreset === 'balanced'"
          @click="handleContrastChange('balanced')"
        >
          표준
        </button>
        <button
          type="button"
          class="rounded-lg border px-3 py-1 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-sm"
          :class="optionButtonClass(contrastPreset === 'strong')"
          :aria-pressed="contrastPreset === 'strong'"
          @click="handleContrastChange('strong')"
        >
          강한 대비
        </button>
      </div>

      <p class="basis-full text-xs text-[var(--color-muted)]">
        가독성 설정은 자동 저장되어 다시 방문해도 유지됩니다.
      </p>
    </section>

    <section class="grid gap-5 lg:grid-cols-[1.08fr_1fr]">
      <JsonInputPanel
        v-model="rawInput"
        :highlight-line="errorHighlightLine"
        :recent-snippets="recentSnippets"
        :clipboard-permission="clipboardPermission"
        :text-size="textSize"
        :line-height="lineHeight"
        @file-select="(file, options) => handleFileInput(file, options)"
        @file-drop="(file, options) => handleFileInput(file, options)"
        @paste-from-clipboard="handlePasteFromClipboard"
        @load-sample="handleLoadSample"
        @copy-share="copyShareLink"
        @load-snippet="loadRecentSnippet"
      />
      <JsonOutputPanel
        :formatted-value="formattedPreview"
        :status="status"
        :message="statusMessage"
        :details="statusDetails"
        :text-size="textSize"
        :line-height="lineHeight"
        @format="handleFormat"
        @minify="() => handleFormat({ minify: true })"
        @copy="handleCopy"
        @copy-status="handleCopyStatus"
      />
    </section>
  </div>
</template>
