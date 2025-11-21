import { ref, watch } from 'vue'

import {
  formatJson,
  parseJson,
  type FormatOptions,
  type IndentOption,
  type JsonStatus,
} from '@/utils/jsonFormatter'
import { loadFromStorage, saveToStorage } from '@/utils/storage'

type Theme = 'light' | 'dark'
type Settings = {
  indent: IndentOption
  theme: Theme
  autoFormat: boolean
}
type LastParsed = {
  data: unknown | null
}

const STORAGE_KEY = 'json-lab:settings'

const DEFAULT_INPUT = `{
  "message": "왼쪽 영역에 JSON을 붙여넣어 보세요.",
  "info": "파일 업로드/드래그&드롭도 지원합니다."
}`

const DEFAULT_OUTPUT = `{
  "message": "포맷팅 결과가 여기에 표시됩니다.",
  "note": "포맷팅/검증 로직이 연결되면 자동으로 업데이트됩니다."
}`

export const useFormatterState = () => {
  const rawInput = ref(DEFAULT_INPUT)
  const formattedPreview = ref<string>(DEFAULT_OUTPUT)
  const status = ref<JsonStatus>('idle')
  const statusMessage = ref('포맷팅 버튼을 누르면 결과가 표시됩니다.')
  const statusDetails = ref<string[]>([])
  const indentOption = ref<IndentOption>(2)
  const theme = ref<Theme>('light')
  const sortKeys = ref(false)
  const autoFormat = ref(false)
  const lastFormatOptions = ref<Pick<FormatOptions, 'minify'>>({ minify: false })
  const lastParsed = ref<LastParsed>({ data: null })
  const remoteUrl = ref('')
  const fetching = ref(false)
  const autoFormatTimer = ref<number | null>(null)
  const errorHighlightLine = ref<number | null>(null)
  const toastMessage = ref('')
  const toastVisible = ref(false)
  const toastTimer = ref<number | null>(null)

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
    if (!stored || !stored.indent || !stored.theme) return false
    indentOption.value = stored.indent
    theme.value = stored.theme
    autoFormat.value = stored.autoFormat ?? false
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

  watch(
    [indentOption, theme, autoFormat],
    ([indentValue, themeValue, autoFormatValue]) => {
      saveToStorage(STORAGE_KEY, {
        indent: indentValue,
        theme: themeValue,
        autoFormat: autoFormatValue,
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
      file.type === 'application/json' ||
      file.type === 'text/json' ||
      file.type === 'application/ld+json'
    )
  }

  const handleFormat = (opts: Pick<FormatOptions, 'minify'> = { minify: false }) => {
    const parsed = parseJson(rawInput.value)

    if (parsed.ok === false) {
      status.value = 'invalid'
      const location =
        parsed.line && parsed.column ? ` (줄 ${parsed.line}, 열 ${parsed.column})` : ''
      statusMessage.value = `에러: ${parsed.message}${location}`
      statusDetails.value = [
        parsed.position != null
          ? `에러 위치: ${parsed.position}번째 문자${location}`
          : '에러 위치 정보를 찾지 못했습니다.',
        'JSON 구조(괄호·쉼표·따옴표)를 다시 확인하세요.',
      ]
      errorHighlightLine.value = parsed.line ?? null
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
    errorHighlightLine.value = null
  }

  const handleFileInput = async (file: File | null) => {
    if (!file) {
      status.value = 'idle'
      statusMessage.value = '파일을 선택하지 않았습니다.'
      statusDetails.value = []
      lastParsed.value = { data: null }
      errorHighlightLine.value = null
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
      statusDetails.value = [error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.']
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

  const scheduleAutoFormat = () => {
    if (!autoFormat.value) return
    if (autoFormatTimer.value) window.clearTimeout(autoFormatTimer.value)
    autoFormatTimer.value = window.setTimeout(() => {
      handleFormat({ minify: lastFormatOptions.value.minify })
    }, 500)
  }

  watch(rawInput, () => {
    statusMessage.value = '입력 내용이 변경되었습니다.'
    scheduleAutoFormat()
  })

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
  }
}
