<script setup lang="ts">
import { computed, ref } from 'vue'

import JsonDiffViewer from '@/components/JsonDiffViewer.vue'
import JsonSchemaValidator from '@/components/JsonSchemaValidator.vue'
import JsonTreeView from '@/components/JsonTreeView.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import { useFormatter } from '@/composables/formatterContext'
import type { JsonStatus } from '@/utils/jsonFormatter'

type ToolKey = 'schema' | 'diff' | 'tree' | 'fetch'
type ToolNoticeType = 'error' | 'info' | 'success'
type ToolNotice = { type: ToolNoticeType; message: string; details?: string[] }

const {
  lastParsed,
  rawInput,
  remoteUrl,
  fetching,
  status,
  statusMessage,
  statusDetails,
  handleFetchUrl,
  showToast,
} = useFormatter()

const tools: Array<{ key: ToolKey; label: string; hint: string }> = [
  { key: 'schema', label: 'Schema 검증', hint: 'Ajv로 스키마 유효성' },
  { key: 'diff', label: 'JSON 비교', hint: 'A/B 구조·값 차이' },
  { key: 'tree', label: '트리 뷰', hint: '구조 탐색·확인' },
  { key: 'fetch', label: 'URL 불러오기', hint: '원격 JSON 로드' },
]

const activeTool = ref<ToolKey>('schema')

const activeLabel = computed(
  () => tools.find((tool) => tool.key === activeTool.value)?.label ?? '도구'
)

const resolveTone = (tone: ToolNoticeType) => {
  if (tone === 'error') return 'error' as const
  if (tone === 'success') return 'success' as const
  return 'info' as const
}

const applyToolStatus = (nextStatus: JsonStatus, notice: ToolNotice) => {
  status.value = nextStatus
  statusMessage.value = notice.message
  statusDetails.value = notice.details ?? []
}

const handleToolNotify = (notice: ToolNotice) => {
  if (notice.type === 'error') {
    applyToolStatus('invalid', notice)
  } else {
    statusMessage.value = notice.message
    statusDetails.value = notice.details ?? []
  }
  showToast(notice.message, { tone: resolveTone(notice.type) })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <AppCard
      eyebrow="도구"
      title="JSON 도구를 필요할 때만 꺼내 쓰세요"
      :description="`현재 선택: ${activeLabel}`"
    >
      <div class="flex flex-wrap gap-2" role="tablist" aria-label="JSON 도구 선택">
        <AppButton
          v-for="tool in tools"
          :id="`${tool.key}-tab`"
          :key="tool.key"
          :variant="activeTool === tool.key ? 'primary' : 'neutral'"
          size="sm"
          role="tab"
          :aria-selected="activeTool === tool.key"
          :aria-controls="`${tool.key}-panel`"
          :tabindex="activeTool === tool.key ? 0 : -1"
          @click="activeTool = tool.key"
        >
          <span class="font-medium">{{ tool.label }}</span>
          <span class="text-[11px] text-[var(--color-muted)]">{{ tool.hint }}</span>
        </AppButton>
      </div>
    </AppCard>

    <div
      v-if="activeTool === 'schema'"
      id="schema-panel"
      role="tabpanel"
      :aria-labelledby="'schema-tab'"
    >
      <JsonSchemaValidator :data="lastParsed.data" @notify="handleToolNotify" />
    </div>

    <div
      v-else-if="activeTool === 'diff'"
      id="diff-panel"
      role="tabpanel"
      :aria-labelledby="'diff-tab'"
    >
      <JsonDiffViewer :source-a="rawInput" @notify="handleToolNotify" />
    </div>

    <AppCard
      v-else-if="activeTool === 'tree'"
      id="tree-panel"
      role="tabpanel"
      :aria-labelledby="'tree-tab'"
      eyebrow="Tree"
      title="트리 뷰"
      description="포맷된 JSON 구조를 펼쳐서 탐색합니다."
    >
      <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
        <JsonTreeView :data="lastParsed.data" />
      </div>
    </AppCard>

    <AppCard
      v-else
      id="fetch-panel"
      role="tabpanel"
      :aria-labelledby="'fetch-tab'"
      eyebrow="Fetch"
      title="URL에서 JSON 불러오기"
      description="GET 요청 후 입력 영역에 삽입합니다."
    >
      <div class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <input
            v-model="remoteUrl"
            type="url"
            class="w-full flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-heading)] outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            placeholder="https://api.example.com/data.json"
          />
          <AppButton
            variant="neutral"
            size="sm"
            class="shrink-0"
            :disabled="fetching"
            @click="handleFetchUrl"
          >
            {{ fetching ? '불러오는 중...' : '불러오기' }}
          </AppButton>
        </div>
        <p class="text-xs text-[var(--color-muted)]">
          CORS 정책을 준수하는 공개 JSON 엔드포인트를 입력하세요.
        </p>
      </div>
    </AppCard>
  </div>
</template>
