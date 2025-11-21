export type JsonStatus = 'idle' | 'valid' | 'invalid'

export type ParseResult =
  | {
      ok: true
      data: unknown
    }
  | {
      ok: false
      message: string
      position?: number
      line?: number
      column?: number
    }

export type IndentOption = 2 | 4 | 'tab'

const computeLineColumn = (input: string, position: number) => {
  let line = 1
  let column = 1

  for (let i = 0; i < position; i += 1) {
    if (input[i] === '\n') {
      line += 1
      column = 1
    } else {
      column += 1
    }
  }

  return { line, column }
}

const extractPosition = (errorMessage: string): number | undefined => {
  const match = errorMessage.match(/position (\d+)/i)
  if (!match) return undefined
  return Number.parseInt(match[1], 10)
}

export const parseJson = (raw: string): ParseResult => {
  try {
    const data = JSON.parse(raw)
    return { ok: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 JSON 파싱 오류'
    const position = extractPosition(message)
    const location = position != null ? computeLineColumn(raw, position) : undefined

    return {
      ok: false,
      message,
      position,
      line: location?.line,
      column: location?.column,
    }
  }
}

export const formatJson = (obj: unknown, indent: IndentOption = 2): string => {
  const indentValue = indent === 'tab' ? '\t' : indent
  return JSON.stringify(obj, null, indentValue)
}
