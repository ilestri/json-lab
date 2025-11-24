# JSON Formatter 웹 앱 기획서 (v2)

---

## 0. 메타 정보
- 프로젝트 이름: `json-lab`
- 목적: 브라우저에서 JSON 문자열/파일을 포맷팅하고 유효성을 빠르게 확인하는 정적 웹앱
- 대상: API 응답 확인, JSON 문법 검증이 필요한 프론트/백엔드 개발자
- 기술 스택: Vite + Vue 3 + TypeScript + Tailwind (프론트엔드 단독)
- 배포: GitHub Pages (`https://ilestri.github.io/json-lab/`, `vite.config.ts` base `/json-lab/`)

---

## 1. 현재 구현 (v2)
1) **메인 포맷터**
   - 입력: 텍스트 영역, `.json` 파일 선택·드래그&드롭(확장자/MIME 검증), 클립보드 읽기, 샘플 로드
   - 관리: 최근 JSON 스니펫 5개 저장/불러오기, LZ 압축 공유 링크 생성(URL 파라미터)
   - 포맷팅: `parseJson`으로 에러 라인/컬럼/position 표시, `formatJson`으로 들여쓰기(2/4/tab), Minify, 키 정렬 지원
   - 상태: ✅/❌ 아이콘, 메시지, 상세 리스트, 에러 라인 하이라이트
   - 자동화: 입력 디바운스로 자동 포맷, 업로드·URL fetch 시 자동 포맷 옵션
2) **도구(탭)**
   - Schema: Ajv 기반 검증(실시간·파일 업로드·결과 복사)
   - Diff: 두 JSON 비교(A/B 입력, 차이 요약)
   - Tree: 포맷된 JSON 구조 탐색(대용량 대응)
   - Fetch: URL 입력 후 JSON GET → 입력 영역에 주입
3) **설정**
   - 포맷 기본값: 들여쓰기, 키 정렬, 자동 포맷, 업로드/Fetch 자동 포맷, 기본 Minify
   - 가독성: 글자 크기, 줄 간격, 대비 프리셋
   - 테마: 라이트/다크(`prefers-color-scheme` 감지)
   - 모든 설정 LocalStorage 자동 저장 및 복원
4) **출력/피드백**
   - 읽기 전용 코드 블록 + 줄 번호, 전체 복사, 토스트 알림
   - 상태바에서 메시지·가이드 제공
5) **테스트·배포**
   - Vitest 도입(유틸/입출력/트리/디프/스키마/설정, URL fetch, 기본 플로우 통합 테스트)
   - GitHub Actions → Pages 배포 (`.github/workflows/deploy.yml`)

---

## 2. 다음 단계(백로그 v2+)
- 포맷/Minify/정렬 전후 히스토리·실험 모드, 샘플 갤러리
- Diff 머지 UI 고도화(key-path 단위 충돌 해소) 및 대용량 성능 측정
- 접근성 자동화(Lighthouse CI, a11y 매처), 대비/포커스 상태 정교화
- 업로드·Fetch 대용량 입력에 대한 추가 디바운스/메트릭 수집

---

## 3. 화면 설계
- **헤더**: 타이틀, 테마 토글, 간단 설명
- **내비게이션**: 포맷터 / 도구 / 설정 탭(aria-current, role 적용)
- **포맷터**: 좌측 입력(텍스트·파일·드래그&드롭·클립보드) / 우측 출력(상태바 + 코드 블록 + 복사)
- **도구**: Schema/Diff/Tree/Fetch를 탭으로 전환, Suspense 로딩 상태 제공
- **설정**: 포맷 기본값, 가독성(글자 크기/줄 간격/대비), 테마
- **푸터**: 버전/라이선스, GitHub, 라이브 링크
- **반응형**: 좁은 화면에서는 상하 스택, 주요 버튼은 한 줄 내 우선순위 배치

---

## 4. 동작 플로우
1) 입력 → `포맷팅` 클릭 또는 자동 포맷 → `parseJson` → 성공 시 `formatJson` → 상태·출력 갱신, 실패 시 에러 라인 강조.
2) 파일 업로드/드롭 → JSON만 허용 → 자동 포맷 후 상태 업데이트.
3) URL fetch → JSON 응답을 입력 영역에 삽입 → 옵션에 따라 자동 포맷.
4) 설정(포맷/가독성/테마) 변경 → 즉시 적용 → LocalStorage에 저장 → 재방문 시 복원.

---

## 5. 기술 스택 & 구성
- 프레임워크: Vue 3, Vite, TypeScript
- 스타일: Tailwind + CSS 변수(`:root`, `.theme-dark`, 대비 프리셋)
- 진입점: `src/main.ts`, 라우팅 `src/router/index.ts`
- 주요 컴포넌트: `JsonInputPanel`, `JsonOutputPanel`, `JsonSchemaValidator`, `JsonDiffViewer`, `JsonTreeView`, `HeaderBar`, `FooterBar`, `AppToast`
- 유틸: `src/utils/jsonFormatter.ts`, `utils/errorHandling.ts`, `utils/storage.ts`
- 배포: GitHub Pages(기본 브랜치 `main`, Actions 기반)
- 테스트: Vitest + Vue Test Utils

---

## 6. 개발/운영 명령
```bash
npm install          # Node 20.19+ 또는 22.12+ 권장
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드 (dist/)
npm run preview      # 빌드 미리보기
npm run lint         # ESLint
npm run type-check   # vue-tsc 타입 검사
npm run format       # Prettier 확인
npm run test         # Vitest
```
