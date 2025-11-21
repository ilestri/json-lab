<script setup lang="ts">
import FooterBar from './components/FooterBar.vue'
import HeaderBar from './components/HeaderBar.vue'
import JsonDiffViewer from './components/JsonDiffViewer.vue'
import JsonInputPanel from './components/JsonInputPanel.vue'
import JsonOutputPanel from './components/JsonOutputPanel.vue'
import JsonTreeView from './components/JsonTreeView.vue'
import SettingsBar from './components/SettingsBar.vue'
import JsonSchemaValidator from './components/JsonSchemaValidator.vue'
import { useFormatterState } from './composables/useFormatterState'

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
  lastParsed,
  remoteUrl,
  fetching,
  errorHighlightLine,
  toastMessage,
  toastVisible,
  handleFormat,
  handleFileInput,
  handleIndentChange,
  handleThemeChange,
  handleSortChange,
  handleAutoFormatChange,
  handleCopy,
  handleFetchUrl,
} = useFormatterState()
</script>

<template>
  <div class="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
    <div
      v-if="toastVisible"
      class="fixed right-4 top-4 z-50 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg transition-opacity"
      role="status"
      aria-live="polite"
    >
      {{ toastMessage }}
    </div>
    <div class="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-5 pb-12 pt-8">
      <HeaderBar />

      <section
        class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
      >
        <div class="flex flex-col gap-3">
          <p class="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Guide</p>
          <h2 class="text-xl font-semibold text-[var(--color-heading)]">
            입력·출력·설정 흐름 미리보기
          </h2>
          <p class="text-sm leading-6 text-[var(--color-muted)]">
            좌측에서 JSON을 붙여넣거나 파일을 올리고, 포맷팅 결과와 상태를 우측에서 확인하세요.
            설정에서 들여쓰기와 테마를 변경할 수 있습니다.
          </p>
          <div class="grid gap-3 sm:grid-cols-3">
            <div
              class="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4"
            >
              <p class="text-sm font-semibold text-[var(--color-heading)]">입력</p>
              <p class="mt-1 text-sm text-[var(--color-muted)]">textarea, 파일 선택, 드래그&드롭</p>
            </div>
            <div
              class="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4"
            >
              <p class="text-sm font-semibold text-[var(--color-heading)]">출력</p>
              <p class="mt-1 text-sm text-[var(--color-muted)]">상태바 + 코드 블록 + 버튼</p>
            </div>
            <div
              class="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4"
            >
              <p class="text-sm font-semibold text-[var(--color-heading)]">반응형</p>
              <p class="mt-1 text-sm text-[var(--color-muted)]">넓은 화면 2열, 좁은 화면 1열</p>
            </div>
          </div>
        </div>
      </section>

      <SettingsBar
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

      <section class="grid gap-4 lg:grid-cols-2">
        <div
          class="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
        >
          <div class="flex items-center justify-between gap-2">
            <div>
              <p class="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">Fetch</p>
              <h3 class="text-lg font-semibold text-[var(--color-heading)]">
                URL에서 JSON 불러오기
              </h3>
              <p class="text-sm text-[var(--color-muted)]">GET 요청 후 입력 영역에 삽입합니다.</p>
            </div>
            <button
              type="button"
              class="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-sm font-semibold text-[var(--color-heading)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="fetching"
              @click="handleFetchUrl"
            >
              {{ fetching ? '불러오는 중...' : '불러오기' }}
            </button>
          </div>
          <input
            v-model="remoteUrl"
            type="url"
            class="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-heading)] outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            placeholder="https://api.example.com/data.json"
          />
          <p class="text-xs text-[var(--color-muted)]">
            CORS 정책을 준수하는 공개 JSON 엔드포인트를 입력하세요.
          </p>
        </div>
        <JsonTreeView :data="lastParsed.data" />
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <JsonSchemaValidator :data="lastParsed.data" />
        <JsonDiffViewer :source-a="rawInput" />
      </section>

      <FooterBar />
    </div>
  </div>
</template>
