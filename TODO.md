# TODO – JSON Formatter 웹 앱

> 규칙: 큰 단계부터 순서대로 진행. 각 단계 안에서도 위에서 아래로 순서대로 처리.

## 0. 프로젝트 환경 세팅

- [x] Node.js / pnpm/npm 버전 확인 및 정리 (Node v20.19.5)
- [x] 새 Vite 프로젝트 생성 (Vue 3 + TypeScript 기준)
- [x] Tailwind CSS 설치 및 기본 설정
- [x] eslint / prettier 설정 (선택)
- [x] 개발용 스크립트 확인 (`dev`, `build`, `preview`)

---

## 1. 기본 레이아웃 구현

- [x] `App` 레이아웃 틀 만들기
  - [x] 상단 헤더 영역
  - [x] 좌우 2열 메인 영역
  - [x] 하단 푸터 영역
- [x] 좌측 JSON 입력 패널 컴포넌트 생성 (`JsonInputPanel`)
  - [x] 텍스트 입력 textarea 배치
  - [x] 파일 업로드 버튼 배치
  - [x] 드래그&드롭 영역 스타일
- [x] 우측 JSON 출력 패널 컴포넌트 생성 (`JsonOutputPanel`)
  - [x] 코드 블록 영역
  - [x] 상태바(Valid/Invalid, 메시지) 영역
  - [x] `포맷팅`, `복사` 버튼 배치
- [x] 상단/중앙에 간단한 안내 텍스트 추가

---

## 2. JSON 포맷팅 로직 구현 (텍스트 입력)

- [x] `utils/jsonFormatter.ts` 파일 생성
- [x] `parseJson(raw: string)` 함수 구현
  - [x] 내부에서 `JSON.parse` 사용
  - [x] 에러 발생 시 에러 메시지/위치 정보 포함한 객체 리턴
- [x] `formatJson(obj: any, indent: number)` 함수 구현
  - [x] `JSON.stringify(obj, null, indent)` 사용
- [x] `JsonInputPanel`에서 입력 이벤트 처리
  - [x] `v-model`로 raw JSON 문자열 상태 관리
- [x] `App` 또는 상위에서 `포맷팅` 버튼 클릭 시 로직
  - [x] `parseJson` 호출
  - [x] 성공 시 `formatJson` 결과를 출력 패널로 전달
  - [x] 실패 시 상태바에 에러 정보 전달

---

## 3. JSON 유효성 검사 & 상태 표시

- [x] 포맷팅 성공/실패를 나타내는 상태값 정의 (`status: 'idle' | 'valid' | 'invalid'`)
- [x] 성공 시:
  - [x] 상태바에 ✅ Valid JSON 텍스트/아이콘 표시
- [x] 실패 시:
  - [x] 상태바에 ❌ Invalid JSON 표시
  - [x] 에러 메시지(에러 타입, 위치 등) 표시
- [x] 상태바 디자인 개선 (색상, 아이콘 등)

---

## 4. 파일 업로드 & 드래그&드롭

- [x] input[type="file"]로 `.json` 파일 선택 기능 구현
- [x] FileReader를 사용해 파일 내용 읽기
  - [x] 읽은 내용을 입력 textarea에 반영
- [x] 드래그&드롭 이벤트 처리
  - [x] dragover / drop 이벤트 핸들링
  - [x] 드롭 시 JSON 파일만 허용 (MIME, 확장자 체크)
  - [x] 드롭 영역 시각적 하이라이트 추가
- [x] 파일 읽기 후 자동 포맷팅 옵션 (필수는 아님)

---

## 5. 설정(Setting) 기능

- [x] SettingsBar 컴포넌트 생성
- [x] 들여쓰기 설정
  - [x] 옵션: 2 / 4 / tab
  - [x] 선택된 옵션을 `formatJson`에 전달
- [x] Light / Dark 모드 토글
  - [x] CSS 변수 또는 Tailwind 다크 모드 사용
  - [x] 브라우저 `prefers-color-scheme` 기본값 반영 (선택)
- [x] 설정 상태를 로컬스토리지에 저장 (선택)

---

## 6. UI/UX 다듬기

- [x] 전체 레이아웃 반응형 조정
  - [x] 좁은 화면에서 상하 레이아웃으로 변경
- [x] 코드 영역에 줄 번호 스타일 적용
- [x] `복사` 버튼 클릭 시 클립보드 복사 기능
  - [x] 성공 시 토스트/알림 메시지 노출
- [x] 기본 폰트, 색상, 간격 조정

---

## 7. 배포 준비

- [x] `npm run build` / `pnpm build`로 빌드 확인
- [x] 정적 파일 빌드 결과(size, 성능) 점검
- [x] README에 빌드/배포 방법 정리
- [x] GitHub Pages로 배포
- [x] 실제 배포 URL을 푸터 또는 README에 기록 (https://ilestri.github.io/json-lab/)

---

## 8. 향후 기능 백로그 (v2+)

> 구현 순서 제안: 기능 확장 → 검증/가시성 → 퍼포먼스/접근성 → 테스트

### 8.1 포맷팅 옵션 확장
- [x] Minify 버튼 추가 (포맷/Minify 전환)
- [x] `formatJson`에 minify 모드 추가(옵션 플래그)
- [x] UI 토글/버튼 추가, 결과/상태 메시지 반영
- [x] 키 정렬 옵션 추가
- [x] 정렬 함수(알파벳 정렬) 추가, 중첩 객체 지원
- [x] UI 선택(정렬 여부) 및 포맷 시 반영

### 8.2 뷰어/도구 확장
- [x] JSON 트리 뷰
  - [x] 트리 렌더 컴포넌트(접기/펼치기), 노드 선택 시 상세 표시
  - [x] 입력 JSON과 동기화(포맷/업로드 후 반영)
- [x] JSON 비교(디프)
  - [x] A/B 입력 창 또는 탭 추가
  - [x] 디프 결과 시각화(추가/삭제/변경/타입 하이라이트)
- [x] URL에서 JSON 불러오기
  - [x] URL 입력 → fetch → 결과 입력 영역 반영
  - [x] CORS/에러 처리, 로딩 상태/에러 표시
- [x] JSON Schema 검증
  - [x] Ajv 사용해 스키마 컴파일/검증
  - [x] 스키마 입력 UI와 검증 결과(에러 리스트) 노출
  - [x] 스키마 파일 업로드, 실시간 검증 토글, 결과 복사 기능
- [x] JSON Schema 검증 2
  - [x] Schema 입력/업로드 지원
  - [x] 검증 결과(패스/에러 목록) UI 표시

### 8.3 사용성/품질 강화
- [x] 실시간 포맷(디바운스) 옵션
  - [x] SettingsBar에 실시간 포맷 토글 추가
  - [x] 입력 지연 후 자동 포맷, 옵션 on/off
  - [x] 포맷 실패 시 상태바 갱신 유지
- [x] 에러 위치 하이라이트
  - [x] `parseJson` 위치 정보를 기반으로 입력 textarea 라인 강조
  - [x] 상태바/줄 번호 영역과 스크롤 포커스 매칭(메시지/라인 안내)
- [x] 접근성 개선
  - [x] 포커스 이동/키보드 탐색, ARIA 라벨 점검
  - [x] 버튼 포커스 링/ARIA 적용, 상태 요소 role/label, 입력/드롭 구역 라벨 추가

### 8.4 검증/품질 자동화
- [x] 테스트 도입: Vitest + Vue Test Utils
  - [x] 유틸: `parseJson`/`formatJson` 성공/실패/에러 위치
  - [x] 컴포넌트: 입력/출력(포맷/Minify/복사 및 업로드/하이라이트) 기본 동작
  - [x] 추가 컴포넌트/도구(Diff/트리) 기본 동작 확인
  - [ ] 설정/URL fetch 등 추가 컴포넌트 보강
  - [ ] E2E(선택): 기본 포맷/업로드/복사 플로우 확인
