# Repository Guidelines

## 제품 맥락 & 목표
- JSON Formatter 정적 웹앱으로 브라우저에서 JSON 문자열/파일을 입력하면 보기 좋게 포맷팅하고 유효성 상태를 보여주는 것이 핵심입니다.
- 초기 대상은 API 응답을 빠르게 확인하려는 프론트/백엔드 개발자이며, 완전 프론트엔드만으로 동작합니다.
- 기본 들여쓰기는 2 space, 실패 시에는 에러 메시지를 사용자에게 명확히 노출합니다.

## 필수 기능(MVP)
- 입력: textarea 직접 입력, `.json` 파일 선택, 드래그&드롭 업로드를 모두 지원합니다.
- 포맷팅: 버튼 클릭(또는 실시간 모드 선택 시)으로 `JSON.parse` → 성공 시 지정 들여쓰기 `JSON.stringify`, 실패 시 에러 메시지/위치 정보를 표시합니다.
- 유효성 표시: 상단 상태바에 ✅ Valid / ❌ Invalid 를 노출하고 에러 유형을 함께 보여줍니다.
- 출력: 포맷된 JSON을 읽기 전용 코드 블록에 표시하며 줄 번호 옵션과 전체 복사 버튼을 둡니다.
- 설정: 들여쓰기(2/4/tab) 선택과 Light/Dark 테마 토글을 제공합니다.

## 화면/UX 기본 설계
- 헤더: 로고/타이틀 `JSON Formatter`, 라이트/다크 토글, 간단 설명 텍스트.
- 메인 2열: 왼쪽은 입력 패널(텍스트 입력/파일 업로드 탭, textarea 자동 높이, 업로드 버튼, 드래그&드롭), 오른쪽은 결과 패널(코드 블록+줄 번호, 상태바, `포맷팅`/`Minify`(추후)/`복사` 버튼).
- 푸터: 버전 정보, GitHub 링크, 라이선스 표기. 좁은 화면에서는 상하 레이아웃으로 전환합니다.

## 진행 순서(TODO 정렬)
- 0) 환경: Node 버전 확인, Vite(Vue 3 + TS) 프로젝트 기본 설정, Tailwind 설치, eslint/prettier 선택 적용, dev/build/preview 스크립트 확인.
- 1) 레이아웃: App 틀(헤더/2열 메인/푸터), `JsonInputPanel`(textarea, 파일 업로드, 드래그&드롭), `JsonOutputPanel`(코드 영역, 상태바, `포맷팅`/`복사` 버튼), 안내 텍스트 추가.
- 2) 포맷팅 로직: `utils/jsonFormatter.ts` 생성, `parseJson`(에러 메시지/위치 포함)과 `formatJson(indent)` 구현, 입력값은 `v-model`로 관리, 버튼 클릭 시 성공/실패 플로우 연결.
- 3) 유효성 상태: `status: 'idle' | 'valid' | 'invalid'` 정의, 상태바에 성공/실패 시각화와 에러 정보 표시, 색상/아이콘 포함.
- 4) 파일 업로드/드래그&드롭: FileReader로 내용 읽어 textarea 반영, JSON만 허용, 드롭 시 시각적 하이라이트, 필요 시 자동 포맷 옵션.
- 5) 설정: `SettingsBar` 컴포넌트, 들여쓰기 옵션(2/4/tab), Light/Dark 토글(`prefers-color-scheme` 반영 가능), 선택 상태를 로컬스토리지에 저장 여부는 선택.
- 6) UX 다듬기: 반응형(좁은 화면 상하 배치), 코드 영역 줄 번호 스타일, 복사 버튼+토스트, 기본 폰트/색상/간격 다듬기.
- 7) 배포 준비: `npm run build` 확인, README에 배포 방법/URL 기록, 정적 빌드 결과 점검.
- 8) 백로그: Minify, 키 정렬, JSON 트리 뷰, URL 로드 후 포맷, JSON 비교(디프), JSON Schema 검증.

## 프로젝트 구조 & 모듈 구성
- Vite 기반 Vue 3 앱이며, 진입점은 `src/main.js`에서 `App.vue`를 `#app`에 마운트합니다.
- UI는 `src/components/`에 모듈화하며, 아이콘은 `src/components/icons/`, 정적 자산과 글로벌 스타일은 `src/assets/`(예: `main.css`, `base.css`)에 둡니다.
- `public/`의 파일은 빌드 시 루트 경로로 그대로 복사되며, `index.html`이 단일 페이지 엔트리입니다.
- Vite 설정과 별도 플러그인은 `vite.config.js`에서 관리합니다.
- 향후 테스트는 `src/__tests__/` 또는 `tests/`에 `ComponentName.spec.js` 형태로 배치하고, 픽스처나 목 데이터는 인접 폴더에 둡니다.

## 빌드·테스트·개발 명령
- `npm install`: Node 20.19+ 또는 22.12+ 환경에서 의존성 설치.
- `npm run dev`: 개발 서버(기본 `localhost:5173`)와 HMR 실행. 컨테이너/WSL에서 외부 접근 시 `npm run dev -- --host` 사용.
- `npm run build`: 프로덕션 번들 생성 후 `dist/` 출력.
- `npm run preview`: `dist/`를 로컬 서빙하며 배포 전 동작 검증.

## 코드 스타일 & 네이밍 규칙
- Vue Composition API `script setup`을 기본으로 하며, 2-스페이스 인덴트와 세미콜론 생략, 작은따옴표를 유지합니다.
- 컴포넌트 파일은 PascalCase(`HelloWorld.vue`), 템플릿 속성은 `kebab-case`, JS 변수/props는 `camelCase`를 사용합니다.
- 스타일은 가능하면 `<style scoped>`를 사용해 컴포넌트 단위 격리를 유지하고, 재사용 가능한 색상/여백 값은 `:root` CSS 변수로 통일합니다.
- 새로운 composable/유틸은 `src/` 하위에 `useX.js` 또는 `utils/`로 분리하고, 파일 하나당 단일 책임을 지킵니다.

## 테스트 지침
- 현재 테스트 스크립트는 없으므로, 도입 시 Vitest + Vue Test Utils를 기준으로 `npm test` 또는 `npm run test:unit` 스크립트를 추가해주세요.
- 단위 테스트는 컴포넌트 별 `*.spec.js`로 작성하고, 렌더링 스냅샷보다 동작 검증(이벤트, 상태 변화, props 처리)을 우선합니다.
- 새 기능 배포 전에 최소한 핵심 경로(렌더, 주요 상호작용, 주요 계산 로직) 커버리지를 확보하고, 실패 케이스도 하나 이상 포함합니다.

## 커밋 & PR 가이드라인
- 커밋 메시지는 영어 명령형 한 줄로 간결하게 작성하거나 `feat:`/`fix:`와 같은 Conventional Commits 접두어를 사용합니다(예: `feat: add loader for schema fetch`).
- PR에는 변경 요약, 동작 스크린샷/영상(UI 변경 시), 해결하는 이슈 링크, 실행한 명령(`npm run build`/`npm run preview`)을 체크리스트 형태로 남깁니다.
- 리뷰자가 빠르게 맥락을 파악할 수 있도록 주요 설계 선택지와 대안을 간단히 메모하고, 브레이킹 체인지가 있다면 마이그레이션 방법을 함께 적습니다.

## 보안·구성 팁
- Vite 환경 변수는 `.env.local`에 저장하고 버전 관리에서 제외합니다. HTTP 엔드포인트나 토큰을 코드에 하드코딩하지 마세요.
- 종속성 추가/업데이트 후에는 `package-lock.json`을 커밋해 빌드 재현성을 유지하고, `npm run build`로 최소 한 번 검증합니다.
