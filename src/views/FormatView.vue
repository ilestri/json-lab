<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

import JsonInputPanel from '@/components/JsonInputPanel.vue'
import JsonOutputPanel from '@/components/JsonOutputPanel.vue'
import QuickSettingsBar from '@/components/QuickSettingsBar.vue'
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
  theme,
  sortKeys,
  autoFormat,
  errorHighlightLine,
  handleFormat,
  handleFileInput,
  handleIndentChange,
  handleThemeChange,
  handleSortChange,
  handleAutoFormatChange,
  handleCopy,
  showToast,
} = useFormatter()

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
    <div
      class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-sm"
    >
      <div>
        <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">formatter</p>
        <h2 class="text-lg font-semibold text-[var(--color-heading)]">필수 패널만 남겼어요</h2>
        <p class="text-sm text-[var(--color-muted)]">붙여넣기/업로드 후 바로 포맷하세요.</p>
      </div>
      <RouterLink class="text-sm text-sky-700 underline-offset-4 hover:underline" to="/settings">
        설정 전체 보기
      </RouterLink>
    </div>

    <QuickSettingsBar
      :indent="indentOption"
      :theme="theme"
      :sort-keys="sortKeys"
      :auto-format="autoFormat"
      @update:indent="handleIndentChange"
      @update:theme="handleThemeChange"
      @update:sort-keys="handleSortChange"
      @update:auto-format="handleAutoFormatChange"
    />

    <section class="grid gap-5 lg:grid-cols-[1.08fr_1fr]">
      <JsonInputPanel
        v-model="rawInput"
        :highlight-line="errorHighlightLine"
        @file-select="handleFileInput"
        @file-drop="handleFileInput"
        @paste-from-clipboard="handlePasteFromClipboard"
        @load-sample="handleLoadSample"
      />
      <JsonOutputPanel
        :formatted-value="formattedPreview"
        :status="status"
        :message="statusMessage"
        :details="statusDetails"
        @format="handleFormat"
        @minify="() => handleFormat({ minify: true })"
        @copy="handleCopy"
      />
    </section>
  </div>
</template>
