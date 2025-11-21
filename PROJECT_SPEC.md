# JSON Formatter 웹 앱 기획서

## 0. 메타 정보

- 프로젝트 이름: `json-lab` (가칭)
- 목적: 브라우저에서 JSON 문자열/파일을 넣으면 자동으로 보기 좋게 포맷팅(Pretty Print)해 주는 정적 웹 페이지
- 대상 사용자
    - 프론트/백엔드 개발자
    - API 응답을 눈으로 빠르게 확인하고 싶은 사람
    - JSON 문법 검사를 간단히 하고 싶은 사람
- 개발 방식: 프론트엔드 중심 (초기에는 완전 정적. 추후 백엔드 API 연동)
- 이 문서는 에이전트/AI가 작업 내용을 이해하고, 구현 시 참조하기 위한 스펙 문서임.

---

## 1. 핵심 기능 정의

### 1.1 필수 기능 (MVP)

1. **JSON 입력**
    - 텍스트 영역(Textarea)에 JSON 문자열 직접 입력
    - `파일 선택` 버튼으로 `.json` 파일 업로드
    - 드래그 & 드롭으로 JSON 파일을 올리면 자동으로 읽기

2. **JSON 포맷팅**
    - `포맷팅` 버튼 클릭 시:
        - JSON 파싱 시도
        - 성공: 지정한 들여쓰기(기본 2 space)로 예쁘게 정렬
        - 실패: 에러 메시지를 사용자에게 표시 (에러 위치 정보 포함 가능하면 좋음)
    - 실시간 모드(선택): 입력 영역에서 변경이 일정 시간 동안 멈추면 자동 포맷팅

3. **JSON 유효성 검사**
    - 유효한 JSON인지 여부를 상단 상태 표시줄에 표시
        - ✅ Valid JSON / ❌ Invalid JSON
    - 에러 발생 시:
        - 에러 타입 (예: `Unexpected token } in JSON at position 123`)
        - 가능한 원인 간단 설명

4. **결과 표시 영역**
    - 포맷팅된 JSON을 **읽기 전용 코드 블록**으로 표시
    - 줄 번호 표시 옵션 (On/Off)
    - `복사` 버튼으로 결과 전체 복사

5. **간단한 설정**
    - 들여쓰기 단위 선택: 2 / 4 space, tab
    - 테마: Light / Dark 모드

---

## 2. 향후 확장 기능 (백로그)

에이전트가 이후 단계에서 구현 가능하도록 미리 정의.

1. **JSON Minify**
    - 공간 절약용으로 JSON을 한 줄로 압축(minify)하는 기능

2. **키 정렬 옵션**
    - 알파벳 순으로 키를 정렬해서 포맷팅

3. **JSON 구조 탐색**
    - 왼쪽에 JSON 트리 뷰
    - 노드를 클릭하면 오른쪽에 상세 값 표시

4. **JSON 비교(디프) 도구**
    - JSON A / JSON B 두 개를 입력하여 차이점 하이라이트

5. **URL에서 JSON 불러오기 (백엔드 전환 이후)**
    - URL 입력 → 백엔드가 요청 → 응답 JSON을 포맷팅해서 보여주기

6. **JSON 스키마 검증 (고급)**
    - JSON Schema를 입력하고, 대상 JSON이 스키마를 만족하는지 검사

---

## 3. 화면 설계 (간단 와이어프레임 수준)

### 3.1 메인 페이지 레이아웃

- 상단 헤더
    - 로고/타이틀: `JSON Formatter`
    - Light/Dark 토글
    - 간단 설명 텍스트

- 메인 2열 레이아웃 (좌우 영역)
    - 왼쪽: JSON 입력 영역
        - 탭:
            - `텍스트 입력`
            - `파일 업로드`
        - 텍스트 입력 textarea (자동 높이 조절)
        - 파일 업로드 버튼 + 드래그&드롭 영역
    - 오른쪽: 포맷팅 결과 영역
        - 코드 블록 + 줄 번호
        - 상단에 상태바: Valid / Invalid, 에러 메시지
        - 상단 우측에 버튼:
            - `포맷팅`
            - `Minify` (추후)
            - `복사`

- 하단 푸터
    - 버전 정보 (예: v0.1.0)
    - GitHub 리포지토리 링크(추후)
    - 라이선스 표기 (MIT 등)

---

## 4. 동작 플로우 정의

### 4.1 기본 플로우 (텍스트 입력 기준)

1. 사용자가 왼쪽 textarea에 JSON 문자열 입력
2. `포맷팅` 버튼 클릭
3. 프론트엔드에서 `JSON.parse` 시도
4. 성공 시:
    - `JSON.stringify` + 선택된 들여쓰기 옵션 적용
    - 오른쪽 결과 영역에 표시
    - 상태바에 ✅ Valid JSON
5. 실패 시:
    - 에러 객체(message, position 등)에서 정보 추출
    - 상태바에 ❌ Invalid JSON + 에러 메시지 표시
    - 가능하다면 에러 위치 줄/컬럼 강조(추후)

### 4.2 파일 업로드 플로우

1. 사용자가 파일 선택 / 드래그&드롭으로 `.json` 파일 업로드
2. FileReader로 파일 내용 읽기
3. 읽은 내용을 입력 textarea에 채움
4. 자동 또는 수동으로 포맷팅 플로우(4.1) 실행

---

## 5. 기술 스택 (초기 버전)

- 런타임: 브라우저(정적 HTML/JS/CSS)
- 언어: TypeScript (가능하면), 초기 프로토타입 단계에서 순수 JS도 허용
- 프레임워크 (권장): Vue 3 + Vite (또는 React + Vite)
- 스타일링: Tailwind CSS (또는 최소한의 커스텀 CSS)
- 번들러/개발 서버: Vite
- 테스트(선택): Vitest 또는 Jest + Playwright (E2E는 추후)

---

## 6. 디렉터리 구조(초기안)

```text
root/
  ├─ index.html
  ├─ src/
  │   ├─ main.ts
  │   ├─ App.vue
  │   ├─ components/
  │   │   ├─ JsonInputPanel.vue
  │   │   ├─ JsonOutputPanel.vue
  │   │   └─ SettingsBar.vue
  │   └─ utils/
  │       └─ jsonFormatter.ts
  ├─ public/
  │   └─ favicon.svg
  ├─ styles/
  │   └─ tailwind.css
  ├─ vite.config.ts
  ├─ package.json
  └─ PROJECT_SPEC.md  ← 이 문서
