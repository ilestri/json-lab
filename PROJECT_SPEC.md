# JSON Formatter 웹 앱 기획서 (v2)

## 0. 메타 정보
- 프로젝트 이름: `json-lab`
- 목적: 브라우저에서 JSON 문자열/파일을 넣으면 보기 좋게 포맷팅(Pretty Print)하고 유효성 상태를 보여주는 정적 웹앱
- 대상: API 응답을 빠르게 확인하려는 프론트/백엔드 개발자, JSON 문법을 빠르게 검증하려는 사용자
- 개발 방식: 프론트엔드 단독(Vite + Vue 3 + TypeScript + Tailwind), GitHub Pages 배포
- 배포 URL: https://ilestri.github.io/json-lab/

---

## 1. 핵심 기능 (v2 구현 완료)
1) **입력**
   - 텍스트 영역에 JSON 직접 입력(`v-model`)
   - `.json` 파일 선택 + 드래그&드롭(확장자/MIME 검증), 업로드 후 자동 포맷
   - 클립보드 권한 감지 및 상태 표시, 드롭 시 Pretty/Minify 중 선택해 즉시 포맷
   - 공유 링크 생성(URL 파라미터에 압축 저장) 및 최근 JSON 스니펫(최대 5개) 불러오기
2) **포맷팅/유효성**
   - `parseJson`으로 파싱 + 에러 라인/컬럼/position 계산
   - `formatJson`으로 들여쓰기(2/4/tab) 적용, Minify 옵션 및 키 정렬(알파벳 순) 지원
   - 상태바에 ✅/❌, 메시지, 상세 리스트(에러 위치, 가이드)를 표시
3) **출력**
   - 읽기 전용 코드 블록, 줄 번호 표시, 전체 복사, 토스트 알림
4) **설정**
   - 들여쓰기 선택(2/4/tab), 라이트/다크 토글(`prefers-color-scheme` 감지)
   - LocalStorage로 설정(테마/들여쓰기) 영속
5) **도구/뷰어**
   - 트리 뷰로 포맷된 JSON 구조 탐색(가상 스크롤로 대용량에서도 성능 유지)
   - URL 입력 후 JSON fetch → 입력 영역에 삽입 및 포맷
   - JSON Schema 검증(Ajv)로 스키마 유효성 검사(실시간/파일 업로드/결과 복사)
   - Diff 뷰: 추가/삭제/변경/타입 차이, 병합 결과 다운로드/복사, diff 결과 다운로드
6) **사용성 보강**
   - 실시간 포맷 토글(입력 지연 후 자동 포맷)
   - 에러 위치 하이라이트(입력 라인 강조)
6) **배포**
   - GitHub Actions로 Pages 배포(워크플로우: `.github/workflows/deploy.yml`)
   - Vite `base: '/json-lab/'`

---

## 2. 다음 단계(백로그 v2+)
- 작업 히스토리/실험 모드: 포맷/Minify/정렬 전후 스냅샷 이동, 샘플 갤러리
- 텍스트 비교 추가 개선: key-path 단위 머지 UI, 세밀한 충돌 해소
- 대용량 입력/업로드/URL 케이스에 대한 디바운스/성능 측정 고도화
- 접근성 심화: Lighthouse CI 또는 a11y 매처 파이프라인, 대비/포커스 상태 정교화

---

## 3. 화면 설계
- **헤더**: 타이틀 `JSON Formatter`, 테마 토글, 간단 설명
- **메인 2열**:
  - 좌측: 입력 패널(텍스트 입력, 파일 선택 버튼, 드래그&드롭 영역)
  - 우측: 결과 패널(상태바, 코드 블록+줄 번호, `포맷팅`/`복사`/추후 `Minify`)
  - 설정 바: 들여쓰기/테마 옵션(현재 메인 섹션 상단)
- **푸터**: 버전/라이선스, GitHub 링크, 라이브 링크
- **반응형**: 좁은 화면에서는 상하 레이아웃으로 전환

---

## 4. 동작 플로우
1) 입력 → `포맷팅` 클릭 → `parseJson` → 성공 시 `formatJson` 결과 출력, 실패 시 에러 메시지/라인/컬럼 표시.
2) 파일 업로드/드롭 → JSON만 허용 → 읽은 내용으로 입력 채움 → 자동 포맷 → 상태 업데이트.
3) 설정 변경(들여쓰기/테마) → 즉시 적용 및 LocalStorage 저장 → 배포 URL에서도 동일 설정 유지.

---

## 5. 기술 스택 & 구성
- 프레임워크: Vue 3, Vite, TypeScript
- 스타일: Tailwind + 커스텀 CSS 변수(`:root` / `.theme-dark`)
- 진입점: `src/main.ts`
- 주요 컴포넌트: `JsonInputPanel`, `JsonOutputPanel`, `SettingsBar`, `HeaderBar`, `FooterBar`
- 유틸: `src/utils/jsonFormatter.ts`
- 배포: GitHub Pages(기본 브랜치 `main`, Actions 기반)
- 테스트: Vitest 도입(유틸/입출력/트리/디프/스키마/설정, URL fetch, 기본 플로우 통합 테스트 완료)

---

## 6. 테스트/품질 가이드
- 추천: Vitest + Vue Test Utils
- 우선 커버리지: `parseJson`/`formatJson` 유틸, 입력/출력 패널의 이벤트(포맷, 복사, 업로드), 설정 변경 흐름
- 명령 추가 예시: `npm run test` 또는 `npm run test:unit` (추후)
