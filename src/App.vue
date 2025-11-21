<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import FooterBar from './components/FooterBar.vue'
import HeaderBar from './components/HeaderBar.vue'
import JsonDiffViewer from './components/JsonDiffViewer.vue'
import JsonInputPanel from './components/JsonInputPanel.vue'
import JsonOutputPanel from './components/JsonOutputPanel.vue'
import JsonTreeView from './components/JsonTreeView.vue'
import SettingsBar from './components/SettingsBar.vue'
import JsonSchemaValidator from './components/JsonSchemaValidator.vue'
import {
  formatJson,
  parseJson,
  type FormatOptions,
  type IndentOption,
  type JsonStatus,
} from './utils/jsonFormatter'

type Theme = 'light' | 'dark'
type Settings = {
  indent: IndentOption
  theme: Theme
}
type LastParsed = {
  data: unknown | null
}

const STORAGE_KEY = 'json-lab:settings'

const rawInput = ref(`{
  "message": "왼쪽 영역에 JSON을 붙여넣어 보세요.",
  "info": "파일 업로드/드래그&드롭도 지원합니다."
}`)

const formattedPreview = ref<string>(
  `{
  "message": "포맷팅 결과가 여기에 표시됩니다.",
  "note": "포맷팅/검증 로직이 연결되면 자동으로 업데이트됩니다."
}`
)

const status = ref<JsonStatus>('idle')
const statusMessage = ref('포맷팅 버튼을 누르면 결과가 표시됩니다.')
const statusDetails = ref<string[]>([])
const indentOption = ref<IndentOption>(2)
const theme = ref<Theme>('light')
const sortKeys = ref(false)
const lastFormatOptions = ref<Pick<FormatOptions, 'minify'>>({ minify: false })
const lastParsed = ref<LastParsed>({ data: null })
const remoteUrl = ref('')
const fetching = ref(false)

const loadSettings = (): Settings | null => {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Settings>
    if (!parsed.indent || !parsed.theme) return null
    return {
      indent: parsed.indent as IndentOption,
      theme: parsed.theme as Theme,
    }
  } catch (error) {
    console.error('설정 로드 실패', error)
    return null
  }
}

const saveSettings = (settings: Settings) => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('설정 저장 실패', error)
  }
}

const applyTheme = (value: Theme) => {
  const root = document.documentElement
  if (value === 'dark') {
    root.classList.add('theme-dark')
  } else {
    root.classList.remove('theme-dark')
  }
}

const detectTheme = () => {
  const stored = loadSettings()
  if (stored) {
    indentOption.value = stored.indent
    theme.value = stored.theme
    applyTheme(theme.value)
    return
  }

  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  theme.value = prefersDark ? 'dark' : 'light'
  applyTheme(theme.value)
}

onMounted(() => {
  detectTheme()
})

watch(
  [indentOption, theme],
  ([indentValue, themeValue]) => {
    saveSettings({ indent: indentValue, theme: themeValue })
    applyTheme(themeValue)
  },
  { immediate: true }
)

const formatFileLabel = (file: File) => {
  const kb = Math.max(file.size / 1024, 0.1).toFixed(1)
  return `파일: ${file.name} (${kb} KB)`
}

const isJsonFile = (file: File | null) => {
  if (!file) return false
  const lowerName = file.name.toLowerCase()
  return (
    lowerName.endsWith('.json') ||
    file.type === 'application/json' ||
    file.type === 'text/json' ||
    file.type === 'application/ld+json'
  )
}

const handleFormat = (opts: Pick<FormatOptions, 'minify'> = { minify: false }) => {
  const parsed = parseJson(rawInput.value)

  if (parsed.ok === false) {
    status.value = 'invalid'
    const location = parsed.line && parsed.column ? ` (줄 ${parsed.line}, 열 ${parsed.column})` : ''
    statusMessage.value = `에러: ${parsed.message}${location}`
    statusDetails.value = [
      parsed.position != null
        ? `에러 위치: ${parsed.position}번째 문자${location}`
        : '에러 위치 정보를 찾지 못했습니다.',
      'JSON 구조(괄호·쉼표·따옴표)를 다시 확인하세요.',
    ]
    lastParsed.value = { data: null }
    return
  }

  formattedPreview.value = formatJson(parsed.data, {
    indent: indentOption.value,
    sortKeys: sortKeys.value,
    minify: opts.minify,
  })
  status.value = 'valid'
  statusMessage.value = '포맷팅이 완료되었습니다.'
  statusDetails.value = [
    opts.minify
      ? '들여쓰기: minify (공백 없이 출력)'
      : `들여쓰기: ${indentOption.value === 'tab' ? 'tab' : `${indentOption.value} space`}`,
    sortKeys.value ? '키 정렬: ON' : '키 정렬: OFF',
    '유효한 JSON입니다.',
  ]
  lastFormatOptions.value = { minify: opts.minify }
  lastParsed.value = { data: parsed.data }
}

const handleFileInput = async (file: File | null) => {
  if (!file) {
    status.value = 'idle'
    statusMessage.value = '파일을 선택하지 않았습니다.'
    statusDetails.value = []
    lastParsed.value = { data: null }
    return
  }

  if (!isJsonFile(file)) {
    status.value = 'invalid'
    statusMessage.value = 'JSON 파일만 업로드 가능합니다.'
    statusDetails.value = [
      `파일명: ${file.name}`,
      file.type ? `파일 유형: ${file.type}` : '파일 유형을 확인할 수 없습니다.',
    ]
    return
  }

  try {
    const content = await file.text()
    rawInput.value = content
    status.value = 'idle'
    statusMessage.value = `${file.name} 파일을 불러왔습니다. 포맷팅을 실행합니다.`
    statusDetails.value = [formatFileLabel(file), '업로드 후 자동 포맷팅 실행']
    handleFormat({ minify: false })
    statusDetails.value = [formatFileLabel(file), ...statusDetails.value]
  } catch (error) {
    status.value = 'invalid'
    statusMessage.value = '파일을 읽는 중 오류가 발생했습니다.'
    statusDetails.value = [
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    ]
  }
}

const handleIndentChange = (value: IndentOption) => {
  indentOption.value = value
  const indentLabel = value === 'tab' ? 'tab' : `${value} space`
  statusMessage.value = `들여쓰기를 ${indentLabel}로 설정했습니다.`
  statusDetails.value = statusDetails.value.filter((item) => !item.startsWith('들여쓰기: '))

  if (status.value === 'valid') {
    const parsed = parseJson(rawInput.value)
    if (parsed.ok) {
      formattedPreview.value = formatJson(parsed.data, {
        indent: indentOption.value,
        sortKeys: sortKeys.value,
        minify: lastFormatOptions.value.minify,
      })
      statusDetails.value.unshift(`들여쓰기: ${indentLabel}`)
      lastParsed.value = { data: parsed.data }
      return
    }
  }

  statusDetails.value.unshift(`들여쓰기: ${indentLabel}`)
}

const handleThemeChange = (value: Theme) => {
  theme.value = value
  statusMessage.value = value === 'dark' ? '다크 모드가 켜졌습니다.' : '라이트 모드가 켜졌습니다.'
}

const handleSortChange = (value: boolean) => {
  sortKeys.value = value
  statusMessage.value = value ? '키 정렬이 켜졌습니다.' : '키 정렬이 꺼졌습니다.'
  statusDetails.value = statusDetails.value.filter((item) => !item.startsWith('키 정렬: '))

  if (status.value === 'valid') {
    const parsed = parseJson(rawInput.value)
    if (parsed.ok) {
      formattedPreview.value = formatJson(parsed.data, {
        indent: indentOption.value,
        sortKeys: sortKeys.value,
        minify: lastFormatOptions.value.minify,
      })
      statusDetails.value.unshift(`키 정렬: ${value ? 'ON' : 'OFF'}`)
      lastParsed.value = { data: parsed.data }
      return
    }
  }

  statusDetails.value.unshift(`키 정렬: ${value ? 'ON' : 'OFF'}`)
}

const toastMessage = ref('')
const toastVisible = ref(false)
const toastTimer = ref<number | null>(null)

const showToast = (message: string, duration = 1800) => {
  toastMessage.value = message
  toastVisible.value = true
  if (toastTimer.value) {
    window.clearTimeout(toastTimer.value)
  }
  toastTimer.value = window.setTimeout(() => {
    toastVisible.value = false
  }, duration)
}

const handleCopy = async () => {
  if (!formattedPreview.value) {
    statusMessage.value = '복사할 내용이 없습니다.'
    return
  }

  try {
    await navigator.clipboard.writeText(formattedPreview.value)
    statusMessage.value = '포맷된 JSON을 복사했습니다.'
    showToast('결과를 클립보드에 복사했어요.')
  } catch (error) {
    statusMessage.value = '복사에 실패했습니다. 브라우저 권한을 확인하세요.'
    showToast('복사에 실패했습니다.')
    console.error(error)
  }
}

const handleFetchUrl = async () => {
  if (!remoteUrl.value) {
    statusMessage.value = 'URL을 입력해주세요.'
    return
  }

  fetching.value = true
  statusMessage.value = 'URL에서 JSON을 불러오는 중...'
  try {
    const response = await fetch(remoteUrl.value)
    if (!response.ok) {
      throw new Error(`요청 실패: ${response.status}`)
    }
    const data = await response.json()
    rawInput.value = JSON.stringify(data, null, 2)
    statusMessage.value = 'URL에서 JSON을 불러왔습니다. 포맷팅합니다.'
    statusDetails.value = [
      `URL: ${remoteUrl.value}`,
      '원본 데이터를 들여쓰기 2 space로 정리했습니다.',
    ]
    handleFormat({ minify: false })
  } catch (error) {
    status.value = 'invalid'
    statusMessage.value = 'URL 불러오기 중 오류가 발생했습니다.'
    statusDetails.value = [
      error instanceof Error ? error.message : '알 수 없는 오류입니다.',
      'CORS나 URL 접근 가능 여부를 확인하세요.',
    ]
    lastParsed.value = { data: null }
  } finally {
    fetching.value = false
  }
}
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
        @update:indent="handleIndentChange"
        @update:theme="handleThemeChange"
        @update:sort-keys="handleSortChange"
      />

      <section class="grid gap-5 lg:grid-cols-[1.08fr_1fr]">
        <JsonInputPanel
          v-model="rawInput"
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
