import { ref, watch } from 'vue'

import {
  formatJson,
  parseJson,
  type FormatOptions,
  type IndentOption,
  type JsonStatus,
} from '@/utils/jsonFormatter'
import { buildErrorFeedback, formatErrorFeedback, logError } from '@/utils/errorHandling'
import { loadFromStorage, saveToStorage } from '@/utils/storage'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

type Theme = 'light' | 'dark'
type Settings = {
  indent: IndentOption
  theme: Theme
  autoFormat: boolean
  sortKeys: boolean
  preferredMinify: boolean
  autoFormatUpload: boolean
  autoFormatFetch: boolean
}
type LastParsed = {
  data: unknown | null
}
type RecentSnippet = {
  id: string
  content: string
  preview: string
  createdAt: number
}

const STORAGE_KEY = 'json-lab:settings'
const RECENT_STORAGE_KEY = 'json-lab:recent-snippets'
const DEFAULT_SETTINGS: Settings = {
  indent: 2,
  theme: 'light',
  autoFormat: false,
  sortKeys: false,
  preferredMinify: false,
  autoFormatUpload: true,
  autoFormatFetch: true,
}

const DEFAULT_INPUT = `{
  "message": "왼쪽 영역에 JSON을 붙여넣어 보세요.",
  "info": "파일 업로드/드래그&드롭도 지원합니다."
}`

const DEFAULT_OUTPUT = `{
  "message": "포맷팅 결과가 여기에 표시됩니다.",
  "note": "포맷팅/검증 로직이 연결되면 자동으로 업데이트됩니다."
}`

const AUTO_FORMAT_DELAY_MS = 500
const FETCH_DEBOUNCE_MS = 250
const UPLOAD_FORMAT_DELAY_MS = 200
const RECENT_LIMIT = 5

export const useFormatterState = () => {
  const rawInput = ref(DEFAULT_INPUT)
  const formattedPreview = ref<string>(DEFAULT_OUTPUT)
  const status = ref<JsonStatus>('idle')
  const statusMessage = ref('포맷팅 버튼을 누르면 결과가 표시됩니다.')
  const statusDetails = ref<string[]>([])
  const indentOption = ref<IndentOption>(DEFAULT_SETTINGS.indent)
  const theme = ref<Theme>(DEFAULT_SETTINGS.theme)
  const sortKeys = ref(DEFAULT_SETTINGS.sortKeys)
  const autoFormat = ref(DEFAULT_SETTINGS.autoFormat)
  const preferredMinify = ref(DEFAULT_SETTINGS.preferredMinify)
  const autoFormatUpload = ref(DEFAULT_SETTINGS.autoFormatUpload)
  const autoFormatFetch = ref(DEFAULT_SETTINGS.autoFormatFetch)
  const lastFormatOptions = ref<Pick<FormatOptions, 'minify'>>({
    minify: DEFAULT_SETTINGS.preferredMinify,
  })
  const lastParsed = ref<LastParsed>({ data: null })
  const remoteUrl = ref('')
  const fetching = ref(false)
  const autoFormatTimer = ref<number | null>(null)
  const errorHighlightLine = ref<number | null>(null)
  const toastMessage = ref('')
  const toastTone = ref<'info' | 'success' | 'error'>('info')
  const toastVisible = ref(false)
  const toastTimer = ref<number | null>(null)
  const fetchTimer = ref<number | null>(null)
  const uploadFormatTimer = ref<number | null>(null)
  const recentSnippets = ref<RecentSnippet[]>([])
  const clipboardPermission = ref<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown')

  const applyTheme = (value: Theme) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (value === 'dark') {
      root.classList.add('theme-dark')
    } else {
      root.classList.remove('theme-dark')
    }
  }

  const restoreSettings = () => {
    const stored = loadFromStorage<Partial<Settings>>(STORAGE_KEY)
    if (!stored) return false
    indentOption.value = stored.indent ?? DEFAULT_SETTINGS.indent
    theme.value = stored.theme ?? DEFAULT_SETTINGS.theme
    sortKeys.value = stored.sortKeys ?? DEFAULT_SETTINGS.sortKeys
    autoFormat.value = stored.autoFormat ?? DEFAULT_SETTINGS.autoFormat
    preferredMinify.value = stored.preferredMinify ?? DEFAULT_SETTINGS.preferredMinify
    autoFormatUpload.value = stored.autoFormatUpload ?? DEFAULT_SETTINGS.autoFormatUpload
    autoFormatFetch.value = stored.autoFormatFetch ?? DEFAULT_SETTINGS.autoFormatFetch
    lastFormatOptions.value = { minify: preferredMinify.value }
    applyTheme(theme.value)
    return true
  }

  const detectTheme = () => {
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = prefersDark ? 'dark' : 'light'
    applyTheme(theme.value)
  }

  const initializeSettings = () => {
    const restored = restoreSettings()
    if (!restored) {
      detectTheme()
    }
  }

  initializeSettings()

  const restoreRecentSnippets = () => {
    const stored = loadFromStorage<RecentSnippet[]>(RECENT_STORAGE_KEY)
    if (!stored) return
    recentSnippets.value = stored.slice(0, RECENT_LIMIT)
  }

  restoreRecentSnippets()

  const checkClipboardPermission = async () => {
    if (typeof navigator === 'undefined' || !navigator.permissions) return
    try {
      // @ts-expect-error PermissionName typing mismatch in lib.dom
      const status: PermissionStatus = await navigator.permissions.query({ name: 'clipboard-read' })
      clipboardPermission.value = status.state
      status.onchange = () => {
        clipboardPermission.value = status.state
      }
    } catch (error) {
      clipboardPermission.value = 'prompt'
      logError('clipboard', error)
    }
  }

  watch(
    [indentOption, theme, sortKeys, autoFormat, preferredMinify, autoFormatUpload, autoFormatFetch],
    ([
      indentValue,
      themeValue,
      sortKeysValue,
      autoFormatValue,
      preferredMinifyValue,
      autoFormatUploadValue,
      autoFormatFetchValue,
    ]) => {
      saveToStorage(STORAGE_KEY, {
        indent: indentValue,
        theme: themeValue,
        sortKeys: sortKeysValue,
        autoFormat: autoFormatValue,
        preferredMinify: preferredMinifyValue,
        autoFormatUpload: autoFormatUploadValue,
        autoFormatFetch: autoFormatFetchValue,
      })
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
      lowerName.endsWith('.txt') ||
      file.type === 'application/json' ||
      file.type === 'text/json' ||
      file.type === 'application/ld+json' ||
      file.type === 'text/plain'
    )
  }

  const handleFormat = (opts: Partial<Pick<FormatOptions, 'minify'>> = {}) => {
    const minify = opts.minify ?? preferredMinify.value
    const parsed = parseJson(rawInput.value)

    if (parsed.ok === false) {
      const locationLabel =
        parsed.line && parsed.column ? `줄 ${parsed.line}, 열 ${parsed.column}` : ''
      const positionLabel =
        parsed.position != null
          ? `에러 위치: ${parsed.position}번째 문자${locationLabel ? ` (${locationLabel})` : ''}`
          : '에러 위치 정보를 찾지 못했습니다.'
      const feedback = formatErrorFeedback('parse', parsed.message, [
        positionLabel,
        locationLabel
          ? `하이라이트된 ${locationLabel} 부근을 확인하세요.`
          : 'JSON 구조를 다시 확인하세요.',
      ])
      status.value = 'invalid'
      statusMessage.value = feedback.message
      statusDetails.value = feedback.details
      errorHighlightLine.value = parsed.line ?? null
      lastParsed.value = { data: null }
      return
    }

    formattedPreview.value = formatJson(parsed.data, {
      indent: indentOption.value,
      sortKeys: sortKeys.value,
      minify,
    })
    status.value = 'valid'
    statusMessage.value = '포맷팅이 완료되었습니다.'
    statusDetails.value = [
      minify
        ? '들여쓰기: minify (공백 없이 출력)'
        : `들여쓰기: ${indentOption.value === 'tab' ? 'tab' : `${indentOption.value} space`}`,
      sortKeys.value ? '키 정렬: ON' : '키 정렬: OFF',
      minify ? '출력 모드: Minify' : '출력 모드: Pretty',
      '유효한 JSON입니다.',
    ]
    lastFormatOptions.value = { minify }
    lastParsed.value = { data: parsed.data }
    errorHighlightLine.value = null

    const preview = rawInput.value.trim().split('\n')[0]?.slice(0, 80) || 'JSON 입력'
    const newSnippet: RecentSnippet = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      content: rawInput.value,
      preview,
      createdAt: Date.now(),
    }
    const existing = recentSnippets.value.filter((item) => item.content !== newSnippet.content)
    recentSnippets.value = [newSnippet, ...existing].slice(0, RECENT_LIMIT)
    saveToStorage(RECENT_STORAGE_KEY, recentSnippets.value)
  }

  const handleFileInput = async (file: File | null, options: { minifyOverride?: boolean } = {}) => {
    if (!file) {
      status.value = 'idle'
      statusMessage.value = '파일을 선택하지 않았습니다.'
      statusDetails.value = []
      lastParsed.value = { data: null }
      errorHighlightLine.value = null
      return
    }

    if (!isJsonFile(file)) {
      const feedback = formatErrorFeedback('upload', 'JSON 파일만 업로드 가능합니다.', [
        `파일명: ${file.name}`,
        file.type ? `파일 유형: ${file.type}` : '파일 유형을 확인할 수 없습니다.',
      ])
      status.value = 'invalid'
      statusMessage.value = feedback.message
      statusDetails.value = feedback.details
      showToast(feedback.message, { tone: 'error' })
      return
    }

    try {
      const content = await file.text()
      rawInput.value = content
      status.value = 'idle'
      statusMessage.value = `${file.name} 파일을 불러왔습니다. 포맷팅을 실행합니다.`
      statusDetails.value = [formatFileLabel(file)]
      if (!autoFormatUpload.value) {
        statusMessage.value = `${file.name} 파일을 불러왔습니다. 포맷팅을 실행하세요.`
        statusDetails.value.push('업로드 후 자동 포맷팅 꺼짐')
        return
      }
      statusMessage.value = `${file.name} 파일을 불러왔습니다. 포맷팅을 실행합니다.`
      statusDetails.value.push('업로드 후 자동 포맷팅 실행')
      if (uploadFormatTimer.value) {
        window.clearTimeout(uploadFormatTimer.value)
      }
      const nextMinify = options.minifyOverride ?? preferredMinify.value
      uploadFormatTimer.value = window.setTimeout(() => {
        handleFormat({ minify: nextMinify })
        statusDetails.value = [formatFileLabel(file), ...statusDetails.value]
      }, UPLOAD_FORMAT_DELAY_MS)
    } catch (error) {
      const feedback = buildErrorFeedback('upload', error, [formatFileLabel(file)])
      status.value = 'invalid'
      statusMessage.value = feedback.message
      statusDetails.value = feedback.details
      logError('upload', error)
      showToast(feedback.message, { tone: 'error' })
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

  const handleAutoFormatChange = (value: boolean) => {
    autoFormat.value = value
    statusMessage.value = value ? '실시간 포맷이 켜졌습니다.' : '실시간 포맷이 꺼졌습니다.'
  }

  const handlePreferredMinifyChange = (value: boolean) => {
    preferredMinify.value = value
    lastFormatOptions.value = { minify: value }
    statusMessage.value = value
      ? '기본 출력이 Minify로 설정되었습니다.'
      : '기본 출력이 Pretty로 설정되었습니다.'
  }

  const handleAutoFormatUploadChange = (value: boolean) => {
    autoFormatUpload.value = value
    statusMessage.value = value
      ? '업로드 후 자동 포맷이 켜졌습니다.'
      : '업로드 후 자동 포맷이 꺼졌습니다.'
  }

  const handleAutoFormatFetchChange = (value: boolean) => {
    autoFormatFetch.value = value
    statusMessage.value = value
      ? 'URL 불러오기 후 자동 포맷이 켜졌습니다.'
      : 'URL 불러오기 후 자동 포맷이 꺼졌습니다.'
  }

  const showToast = (
    message: string,
    options: { duration?: number; tone?: 'info' | 'success' | 'error' } = {}
  ) => {
    toastMessage.value = message
    toastTone.value = options.tone ?? 'info'
    toastVisible.value = true
    if (toastTimer.value) {
      window.clearTimeout(toastTimer.value)
    }
    toastTimer.value = window.setTimeout(() => {
      toastVisible.value = false
    }, options.duration ?? 1800)
  }

  const handleCopy = async () => {
    if (!formattedPreview.value) {
      statusMessage.value = '복사할 내용이 없습니다.'
      return
    }

    try {
      await navigator.clipboard.writeText(formattedPreview.value)
      statusMessage.value = '포맷된 JSON을 복사했습니다.'
      statusDetails.value = ['클립보드에 복사 완료']
      showToast('결과를 클립보드에 복사했어요.', { tone: 'success' })
    } catch (error) {
      const feedback = buildErrorFeedback('clipboard', error, [], '복사에 실패했습니다.')
      statusMessage.value = feedback.message
      statusDetails.value = feedback.details
      showToast(feedback.message, { tone: 'error' })
      logError('clipboard', error)
    }
  }

  const handleCopyStatus = async () => {
    const payload = [statusMessage.value, ...statusDetails.value].filter(Boolean).join('\n')
    if (!payload.trim()) {
      statusMessage.value = '복사할 상태 메시지가 없습니다.'
      return
    }
    try {
      await navigator.clipboard.writeText(payload)
      showToast('상태 메시지를 복사했습니다.', { tone: 'success' })
    } catch (error) {
      const feedback = buildErrorFeedback(
        'clipboard',
        error,
        [],
        '상태 메시지 복사에 실패했습니다.'
      )
      statusMessage.value = feedback.message
      statusDetails.value = feedback.details
      showToast(feedback.message, { tone: 'error' })
      logError('clipboard', error)
    }
  }

  const handleFetchUrl = async () => {
    if (!remoteUrl.value) {
      statusMessage.value = 'URL을 입력해주세요.'
      return
    }

    if (fetchTimer.value) window.clearTimeout(fetchTimer.value)
    fetchTimer.value = window.setTimeout(async () => {
      fetching.value = true
      statusMessage.value = 'URL에서 JSON을 불러오는 중...'
      try {
        const response = await fetch(remoteUrl.value)
        if (!response.ok) {
          throw new Error(`요청 실패: ${response.status}`)
        }
        const data = await response.json()
        rawInput.value = JSON.stringify(data, null, 2)
        statusDetails.value = [
          `URL: ${remoteUrl.value}`,
          `원본 데이터를 들여쓰기 2 space로 정리했습니다.`,
          autoFormatFetch.value ? '불러온 후 자동 포맷 실행' : '자동 포맷 꺼짐',
        ]
        if (autoFormatFetch.value) {
          statusMessage.value = 'URL에서 JSON을 불러왔습니다. 포맷팅합니다.'
          handleFormat({ minify: preferredMinify.value })
        } else {
          statusMessage.value = 'URL에서 JSON을 불러왔습니다. 포맷팅을 실행하세요.'
        }
      } catch (error) {
        status.value = 'invalid'
        const feedback = buildErrorFeedback(
          'fetch',
          error,
          [`URL: ${remoteUrl.value}`],
          'URL 불러오기 중 오류가 발생했습니다.'
        )
        statusMessage.value = feedback.message
        statusDetails.value = feedback.details
        lastParsed.value = { data: null }
        showToast(feedback.message, { tone: 'error' })
        logError('fetch', error)
      } finally {
        fetching.value = false
      }
    }, FETCH_DEBOUNCE_MS)
  }

  const scheduleAutoFormat = () => {
    if (!autoFormat.value) return
    if (autoFormatTimer.value) window.clearTimeout(autoFormatTimer.value)
    autoFormatTimer.value = window.setTimeout(() => {
      handleFormat({ minify: lastFormatOptions.value.minify })
    }, AUTO_FORMAT_DELAY_MS)
  }

  watch(rawInput, () => {
    statusMessage.value = '입력 내용이 변경되었습니다.'
    scheduleAutoFormat()
  })

  const copyShareLink = async () => {
    if (typeof window === 'undefined') {
      statusMessage.value = '공유 링크는 브라우저에서만 생성할 수 있습니다.'
      return
    }
    try {
      const base = new URL(import.meta.env.BASE_URL, window.location.origin)
      const encoded = compressToEncodedURIComponent(rawInput.value)
      base.searchParams.set('data', encoded)
      const shareUrl = base.toString()
      await navigator.clipboard.writeText(shareUrl)
      statusMessage.value = '공유 링크를 클립보드에 복사했습니다.'
      statusDetails.value = ['현재 입력 내용을 압축해 링크에 담았습니다.']
      showToast('공유 링크를 복사했습니다.', { tone: 'success' })
    } catch (error) {
      const feedback = buildErrorFeedback('clipboard', error, [], '공유 링크 생성에 실패했습니다.')
      statusMessage.value = feedback.message
      statusDetails.value = feedback.details
      logError('share', error)
      showToast(feedback.message, { tone: 'error' })
    }
  }

  const loadRecentSnippet = (id: string) => {
    const target = recentSnippets.value.find((item) => item.id === id)
    if (!target) return
    rawInput.value = target.content
    statusMessage.value = '최근 JSON을 불러왔습니다.'
    handleFormat({ minify: preferredMinify.value })
  }

  const applySharedParam = () => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const payload = params.get('data')
    if (!payload) return
    try {
      const decoded = decompressFromEncodedURIComponent(payload)
      if (!decoded) throw new Error('공유 링크를 해석하지 못했습니다.')
      rawInput.value = decoded
      statusMessage.value = '공유 링크에서 JSON을 불러왔습니다.'
      handleFormat({ minify: preferredMinify.value })
      params.delete('data')
      const nextUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '')
      window.history.replaceState({}, '', nextUrl)
    } catch (error) {
      const feedback = buildErrorFeedback('share', error, [], '공유 링크를 불러오지 못했습니다.')
      statusMessage.value = feedback.message
      statusDetails.value = feedback.details
      logError('share', error)
    }
  }

  const resetSettings = () => {
    indentOption.value = DEFAULT_SETTINGS.indent
    theme.value = DEFAULT_SETTINGS.theme
    sortKeys.value = DEFAULT_SETTINGS.sortKeys
    autoFormat.value = DEFAULT_SETTINGS.autoFormat
    preferredMinify.value = DEFAULT_SETTINGS.preferredMinify
    autoFormatUpload.value = DEFAULT_SETTINGS.autoFormatUpload
    autoFormatFetch.value = DEFAULT_SETTINGS.autoFormatFetch
    lastFormatOptions.value = { minify: preferredMinify.value }
    saveToStorage(STORAGE_KEY, DEFAULT_SETTINGS)
    applyTheme(theme.value)
    statusMessage.value = '설정을 기본값으로 되돌렸습니다.'
    statusDetails.value = ['들여쓰기: 2 space', '키 정렬: OFF', '출력 모드: Pretty']
    showToast('설정을 기본값으로 되돌렸습니다.', { tone: 'success' })
  }

  applySharedParam()
  checkClipboardPermission()

  return {
    rawInput,
    formattedPreview,
    status,
    statusMessage,
    statusDetails,
    indentOption,
    theme,
    sortKeys,
    autoFormat,
    preferredMinify,
    autoFormatUpload,
    autoFormatFetch,
    lastParsed,
    remoteUrl,
    fetching,
    errorHighlightLine,
    toastMessage,
    toastTone,
    toastVisible,
    showToast,
    handleFormat,
    handleFileInput,
    handleIndentChange,
    handleThemeChange,
    handleSortChange,
    handleAutoFormatChange,
    handlePreferredMinifyChange,
    handleAutoFormatUploadChange,
    handleAutoFormatFetchChange,
    handleCopy,
    handleCopyStatus,
    handleFetchUrl,
    resetSettings,
    recentSnippets,
    copyShareLink,
    loadRecentSnippet,
    clipboardPermission,
  }
}

export type FormatterState = ReturnType<typeof useFormatterState>
