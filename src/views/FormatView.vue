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
  sortKeys,
  errorHighlightLine,
  recentSnippets,
  handleFormat,
  handleFileInput,
  handleCopy,
  copyShareLink,
  loadRecentSnippet,
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
    <section class="grid gap-5 lg:grid-cols-[1.08fr_1fr]">
      <JsonInputPanel
        v-model="rawInput"
        :highlight-line="errorHighlightLine"
        :recent-snippets="recentSnippets"
        @file-select="handleFileInput"
        @file-drop="handleFileInput"
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
        @format="handleFormat"
        @minify="() => handleFormat({ minify: true })"
        @copy="handleCopy"
      />
    </section>
  </div>
</template>
