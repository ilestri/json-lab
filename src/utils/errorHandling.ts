export type ErrorContext =
  | 'parse'
  | 'upload'
  | 'fetch'
  | 'schema'
  | 'diff'
  | 'storage'
  | 'clipboard'
  | 'share'

type UserFeedback = {
  message: string
  details: string[]
}

const LABELS: Record<ErrorContext, string> = {
  parse: 'JSON 파싱 오류',
  upload: '업로드 오류',
  fetch: '불러오기 오류',
  schema: '스키마 검증 오류',
  diff: '비교 도구 오류',
  storage: '저장소 오류',
  clipboard: '클립보드 오류',
  share: '공유 링크 오류',
}

const HINTS: Partial<Record<ErrorContext, string[]>> = {
  parse: ['JSON 괄호, 쉼표, 따옴표를 다시 확인하세요.'],
  upload: ['파일 확장자가 .json인지 확인하세요.'],
  fetch: ['URL/CORS/네트워크 상태를 확인하세요.'],
  schema: ['스키마 형식과 draft 버전을 확인하세요.'],
  diff: ['양쪽 JSON이 올바른지 다시 입력하세요.'],
  storage: ['브라우저 저장소 권한을 확인하세요.'],
  clipboard: ['브라우저 권한과 HTTPS 환경 여부를 확인하세요.'],
  share: ['공유 링크가 잘렸거나 만료되지 않았는지 확인하세요.'],
}

export const extractErrorMessage = (
  error: unknown,
  fallback = '예상치 못한 오류가 발생했습니다.'
) => (error instanceof Error ? error.message : fallback)

export const logError = (context: ErrorContext, error: unknown) =>
  console.error(`[json-lab:${context}]`, error)

export const formatErrorFeedback = (
  context: ErrorContext,
  description: string,
  extras: string[] = []
): UserFeedback => {
  const hintList = HINTS[context] ?? []
  const label = LABELS[context] ?? '오류'
  return {
    message: `${label}: ${description}`,
    details: [...extras, ...hintList],
  }
}

export const buildErrorFeedback = (
  context: ErrorContext,
  error: unknown,
  extras: string[] = [],
  fallback?: string
): UserFeedback => {
  const description = extractErrorMessage(error, fallback ?? '알 수 없는 오류가 발생했습니다.')
  return formatErrorFeedback(context, description, extras)
}
