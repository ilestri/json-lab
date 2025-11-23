<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import { useFormatter } from '@/composables/formatterContext'
import type { JsonStatus } from '@/utils/jsonFormatter'

const JsonSchemaValidator = defineAsyncComponent(
  () => import('@/components/JsonSchemaValidator.vue')
)
const JsonDiffViewer = defineAsyncComponent(() => import('@/components/JsonDiffViewer.vue'))
const JsonTreeView = defineAsyncComponent(() => import('@/components/JsonTreeView.vue'))

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
  { key: 'schema', label: 'Schema', hint: 'Ajv 검증' },
  { key: 'diff', label: 'Diff', hint: 'A/B 비교' },
  { key: 'tree', label: 'Tree', hint: '구조 탐색' },
  { key: 'fetch', label: 'Fetch', hint: 'URL 로드' },
]

const activeTool = ref<ToolKey>('schema')

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
    <div
      class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-sm"
    >
      <div>
        <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">tools</p>
        <h2 class="text-lg font-semibold text-[var(--color-heading)]">
          필요한 도구만 탭으로 열어보세요
        </h2>
        <p class="text-sm text-[var(--color-muted)]">스키마·디프·트리·Fetch를 빠르게 전환합니다.</p>
      </div>
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
    </div>

    <div
      v-if="activeTool === 'schema'"
      id="schema-panel"
      role="tabpanel"
      :aria-labelledby="'schema-tab'"
    >
      <Suspense>
        <template #default>
          <JsonSchemaValidator :data="lastParsed.data" @notify="handleToolNotify" />
        </template>
        <template #fallback>
          <AppCard eyebrow="Schema" title="Ajv 로딩 중">
            <p class="text-sm text-[var(--color-muted)]">스키마 검증 도구를 불러오고 있습니다...</p>
          </AppCard>
        </template>
      </Suspense>
    </div>

    <div
      v-else-if="activeTool === 'diff'"
      id="diff-panel"
      role="tabpanel"
      :aria-labelledby="'diff-tab'"
    >
      <Suspense>
        <template #default>
          <JsonDiffViewer :source-a="rawInput" @notify="handleToolNotify" />
        </template>
        <template #fallback>
          <AppCard eyebrow="Diff" title="비교 도구 로딩 중">
            <p class="text-sm text-[var(--color-muted)]">A/B 비교 컴포넌트를 불러오는 중입니다.</p>
          </AppCard>
        </template>
      </Suspense>
    </div>

    <div
      v-else-if="activeTool === 'tree'"
      id="tree-panel"
      role="tabpanel"
      :aria-labelledby="'tree-tab'"
    >
      <Suspense>
        <template #default>
          <AppCard
            eyebrow="Tree"
            title="트리 뷰"
            description="포맷된 JSON 구조를 펼쳐서 탐색합니다."
          >
            <div
              class="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4"
            >
              <JsonTreeView :data="lastParsed.data" />
            </div>
          </AppCard>
        </template>
        <template #fallback>
          <AppCard eyebrow="Tree" title="트리 뷰 로딩 중">
            <p class="text-sm text-[var(--color-muted)]">트리 뷰어를 불러오는 중입니다.</p>
          </AppCard>
        </template>
      </Suspense>
    </div>

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
