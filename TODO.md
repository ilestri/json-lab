
---

## 2. AI용 체크 가능한 할 일 목록 (TODO.md 예시)

```md
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

- [ ] 포맷팅 성공/실패를 나타내는 상태값 정의 (`status: 'idle' | 'valid' | 'invalid'`)
- [ ] 성공 시:
  - [ ] 상태바에 ✅ Valid JSON 텍스트/아이콘 표시
- [ ] 실패 시:
  - [ ] 상태바에 ❌ Invalid JSON 표시
  - [ ] 에러 메시지(에러 타입, 위치 등) 표시
- [ ] 상태바 디자인 개선 (색상, 아이콘 등)

---

## 4. 파일 업로드 & 드래그&드롭

- [ ] input[type="file"]로 `.json` 파일 선택 기능 구현
- [ ] FileReader를 사용해 파일 내용 읽기
  - [ ] 읽은 내용을 입력 textarea에 반영
- [ ] 드래그&드롭 이벤트 처리
  - [ ] dragover / drop 이벤트 핸들링
  - [ ] 드롭 시 JSON 파일만 허용 (MIME, 확장자 체크)
  - [ ] 드롭 영역 시각적 하이라이트 추가
- [ ] 파일 읽기 후 자동 포맷팅 옵션 (필수는 아님)

---

## 5. 설정(Setting) 기능

- [ ] SettingsBar 컴포넌트 생성
- [ ] 들여쓰기 설정
  - [ ] 옵션: 2 / 4 / tab
  - [ ] 선택된 옵션을 `formatJson`에 전달
- [ ] Light / Dark 모드 토글
  - [ ] CSS 변수 또는 Tailwind 다크 모드 사용
  - [ ] 브라우저 `prefers-color-scheme` 기본값 반영 (선택)
- [ ] 설정 상태를 로컬스토리지에 저장 (선택)

---

## 6. UI/UX 다듬기

- [ ] 전체 레이아웃 반응형 조정
  - [ ] 좁은 화면에서 상하 레이아웃으로 변경
- [ ] 코드 영역에 줄 번호 스타일 적용
- [ ] `복사` 버튼 클릭 시 클립보드 복사 기능
  - [ ] 성공 시 토스트/알림 메시지 노출
- [ ] 기본 폰트, 색상, 간격 조정

---

## 7. 배포 준비

- [ ] `npm run build` / `pnpm build`로 빌드 확인
- [ ] 정적 파일 빌드 결과(size, 성능) 점검
- [ ] README에 빌드/배포 방법 정리
- [ ] GitHub Pages 또는 Vercel/Netlify에 배포
- [ ] 실제 배포 URL을 푸터 또는 README에 기록

---

## 8. 향후 기능 백로그

- [ ] Minify 기능 버튼 추가
- [ ] 키 정렬 옵션 추가
- [ ] JSON 트리 뷰(좌측 트리, 우측 상세) 추가
- [ ] URL에서 JSON 불러오기 (백엔드 연동)
- [ ] JSON 비교(디프) 페이지 추가
- [ ] JSON Schema 검증 기능 추가
