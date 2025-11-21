# Repository Guidelines (v2 업데이트)

## 제품 맥락 & 목표
- JSON Formatter 정적 웹앱: 브라우저에서 JSON 문자열/파일을 입력하면 보기 좋게 포맷팅하고 유효성 상태를 표시.
- 대상: API 응답을 빠르게 확인하려는 프론트/백엔드 개발자. 완전 프론트엔드, TS + Vue 3 + Tailwind.
- 기본 들여쓰기 2 space, 실패 시 에러 메시지·위치 정보를 명확히 노출. 라이트/다크 테마와 설정 저장(LocalStorage) 지원.

## 현재 구현 (v2)
- 입력: textarea, `.json` 파일 선택, 드래그&드롭 업로드. JSON MIME/확장자만 허용, 업로드 후 자동 포맷.
- 포맷팅/유효성: `parseJson`으로 에러 위치(line/column/position) 계산, `formatJson`으로 2/4/tab 들여쓰기 적용. 상태바에 ✅/❌ + 메시지 + 상세 리스트 표시. Minify/키 정렬 옵션 포함.
- 출력: 읽기 전용 코드 블록에 줄 번호 표시, 전체 복사 + 토스트 알림.
- 설정/옵션: SettingsBar에서 들여쓰기(2/4/tab), 라이트/다크 토글(`prefers-color-scheme` 감지), 키 정렬 on/off, 실시간 포맷 토글, 설정 LocalStorage 영속.
- 뷰어/도구: 트리 뷰(포맷 결과 탐색), URL로 JSON 불러오기, JSON Schema 검증(Ajv + 실시간/파일 업로드/결과 복사), 간단 비교(Diff) 뷰.
- 테스트: Vitest 기본 도입(유틸 단위 테스트), 컴포넌트/E2E 커버리지는 추가 예정.
- 배포: GitHub Pages(`https://ilestri.github.io/json-lab/`), `vite.config.ts` base `/json-lab/`, Actions 워크플로우 `.github/workflows/deploy.yml`.

## 진행 순서(완료/다음)
- 0) 환경 세팅 완료: Node 20.19+, Vite(Vue3+TS), Tailwind, ESLint/Prettier, 스크립트(dev/build/preview/lint/type-check/format).
- 1) 레이아웃: 헤더/입력/출력/설정/푸터 2열 메인 틀 완료.
- 2) 포맷팅 로직: `utils/jsonFormatter.ts` (`parseJson`, `formatJson`) 완료.
- 3) 유효성 상태: `status: 'idle' | 'valid' | 'invalid'` 및 상태바 UI 완료.
- 4) 파일 업로드/드래그&드롭: JSON만 허용, 업로드 후 자동 포맷 흐름 완료.
- 5) 설정: 들여쓰기 옵션, 라이트/다크 토글, LocalStorage 저장/복원 완료.
- 6) UX 다듬기: 반응형, 줄 번호, 복사+토스트, 기본 타이포/색상 정리 완료.
- 7) 배포 준비/Pages 설정 완료.
- 8) 다음 백로그: Minify, 키 정렬 옵션, JSON 트리 뷰, URL 로드, JSON 비교(디프), JSON Schema 검증, 실시간 포맷(디바운스), 에러 위치 하이라이트, 테스트(Vitest) 도입, 접근성 개선.

## 프로젝트 구조 & 모듈 구성
- 진입점: `src/main.ts`가 `App.vue`를 `#app`에 마운트.
- 컴포넌트: `src/components/` (입력/출력/설정/헤더/푸터, 아이콘은 `components/icons/`).
- 유틸: `src/utils/jsonFormatter.ts`.
- 스타일: `src/assets/main.css`(Tailwind 지시자 + CSS 변수), 테마 토글은 `.theme-dark` 클래스 적용.
- 정적: `public/` 그대로 복사, `index.html`이 엔트리.
- Vite 설정: `vite.config.ts`에서 base `/json-lab/`, alias `@` → `src`.
- 테스트: 추후 `src/__tests__/` 또는 `tests/`에 `ComponentName.spec.ts` 권장.

## 빌드·테스트·개발 명령
- `npm install` (Node 20.19+ 또는 22.12+).
- `npm run dev` / `npm run build` / `npm run preview`.
- `npm run lint` / `npm run type-check` / `npm run format`.

## 코드 스타일 & 네이밍 규칙
- Vue Composition API `script setup`, 2-space, 세미콜론 생략, 작은따옴표.
- 컴포넌트 파일 PascalCase, 템플릿 속성 kebab-case, JS 변수/props camelCase.
- 가능하면 `<style scoped>`, 재사용 값은 CSS 변수(:root, `.theme-dark`)로 통일.
- 유틸/컴포저블은 `src/utils/` 또는 `useX.ts`로 단일 책임 분리.

## 테스트 지침
- 도입 시 Vitest + Vue Test Utils, `npm run test` 혹은 `npm run test:unit` 스크립트 추가.
- 스냅샷보다 동작 검증 위주(이벤트, 상태 변화, props 처리). 실패 케이스를 반드시 포함.

## 커밋 & PR 가이드라인
- 커밋: 영어 명령형 한 줄 또는 Conventional Commits(`feat: ...`, `fix: ...`).
- PR: 변경 요약, UI 변경 시 스크린샷/영상, 관련 이슈 링크, 실행한 명령(`npm run build`/`preview` 등) 체크리스트.
- 주요 설계 선택/대안 메모, 브레이킹 체인지 시 마이그레이션 방법 포함.

## 보안·구성 팁
- 민감한 값은 `.env.local`, 버전 관리 제외. 토큰/엔드포인트 하드코딩 금지.
- 종속성 추가 후 `package-lock.json` 커밋, 최소 한 번 `npm run build`로 확인.
