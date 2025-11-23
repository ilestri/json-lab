# JSON Formatter (json-lab)

브라우저에서 JSON 문자열/파일을 포맷팅하고 유효성을 확인하는 정적 웹앱입니다. Vue 3 + Vite + TypeScript + Tailwind 기반으로 동작합니다.

> 현재 버전: v2 (입력/출력/설정/배포 기본 완료)

## 주요 기능
- 텍스트 입력, `.json` 파일 선택, 드래그&드롭 업로드 지원(드롭 시 Pretty/Minify 선택)
- JSON 파싱 및 지정 들여쓰기(2/4/tab) 포맷팅, Minify 옵션/키 정렬 지원
- 유효성 상태/에러 메시지 표시, 결과 복사, 줄 번호가 있는 코드 출력
- 라이트/다크 테마 및 들여쓰기/키 정렬/실시간 포맷 설정 (로컬스토리지 저장)
- 트리 뷰 탐색(대용량 가상 스크롤), URL에서 JSON 불러오기, JSON Schema 검증(실시간/파일 업로드/결과 복사), 두 JSON 비교(Diff)
- 공유 링크 생성(입력 JSON 압축 후 URL 파라미터) 및 최근 JSON 스니펫(최대 5개) 불러오기

## 화면 구성
- **포맷터**: 입력·출력·설정만 담은 메인 화면(경로 `/`). JSON 붙여넣기/업로드 후 바로 포맷 결과를 확인.
- **도구**: Schema 검증, Diff, 트리 뷰, URL 불러오기를 탭으로 선택(경로 `/tools`). 공통 상태/토스트를 공유하며 필요할 때만 열어서 사용.
- 헤더 아래 탭 내비게이션에서 현재 위치가 `aria-current="page"`로 표시되며, 도구 탭은 역할/aria 속성으로 키보드 전환을 지원.

## 개발/빌드
```bash
npm install          # 의존성 설치 (Node 20.19+ 권장)
npm run dev          # 개발 서버 (기본 localhost:5173)
npm run build        # 프로덕션 빌드 → dist/
npm run preview      # dist/ 미리보기 서버
npm run lint         # ESLint
npm run type-check   # vue-tsc 타입 검사
npm run format       # Prettier 확인
npm run test         # Vitest (단위 테스트)
```

## 빌드 결과(현재 버전)
- `dist/index.html` 0.47 kB (gzip 0.30 kB)
- `dist/assets/index-01a7r5sV.js` 76.47 kB (gzip 29.59 kB)
- `dist/assets/index-Dr2EJ2OI.css` 14.27 kB (gzip 3.69 kB)

## 배포 (GitHub Pages)
- 실제 배포 URL: https://ilestri.github.io/json-lab/
- Vite `base` 값: `/json-lab/` (리포지토리명이 다르면 `vite.config.ts`에서 수정)
- GitHub Actions 워크플로우: `.github/workflows/deploy.yml`
  - `main` 브랜치 푸시 시 `npm ci` → `npm run build` → Pages로 배포
  - 수동 실행도 가능 (`workflow_dispatch`)
- GitHub Pages 설정:
  1) 리포지토리 Settings → Pages → Source: GitHub Actions 선택
  2) 워크플로우 실행 후 제공되는 URL에서 배포본 확인

## 다음 단계(백로그)
- 작업 히스토리/실험 모드: 포맷/Minify/정렬 전후 스냅샷 이동, 샘플 갤러리
- 텍스트 비교 추가 개선: key-path 단위 머지 UI, 세밀한 충돌 해소
- 대용량 입력/업로드/URL 케이스 디바운스 및 성능 측정 고도화
- 접근성 심화: Lighthouse CI 또는 a11y 매처 파이프라인
