# JSON Formatter (json-lab)

브라우저에서 JSON 문자열/파일을 포맷팅하고 유효성을 확인하는 정적 웹앱입니다. Vue 3 + Vite + TypeScript + Tailwind 기반으로 동작합니다.

## 주요 기능
- 텍스트 입력, `.json` 파일 선택, 드래그&드롭 업로드 지원
- JSON 파싱 및 지정 들여쓰기(2/4/tab) 포맷팅
- 유효성 상태/에러 메시지 표시, 결과 복사, 줄 번호가 있는 코드 출력
- 라이트/다크 테마 및 들여쓰기 설정 (로컬스토리지 저장)

## 개발/빌드
```bash
npm install          # 의존성 설치 (Node 20.19+ 권장)
npm run dev          # 개발 서버 (기본 localhost:5173)
npm run build        # 프로덕션 빌드 → dist/
npm run preview      # dist/ 미리보기 서버
npm run lint         # ESLint
npm run type-check   # vue-tsc 타입 검사
npm run format       # Prettier 확인
```

## 빌드 결과(현재 버전)
- `dist/index.html` 0.44 kB (gzip 0.29 kB)
- `dist/assets/index-01a7r5sV.js` 76.47 kB (gzip 29.59 kB)
- `dist/assets/index-Dr2EJ2OI.css` 14.27 kB (gzip 3.69 kB)

## 배포 (GitHub Pages)
- Vite `base` 값: `/json-lab/` (리포지토리명이 다르면 `vite.config.ts`에서 수정)
- GitHub Actions 워크플로우: `.github/workflows/deploy.yml`
  - `main` 브랜치 푸시 시 `npm ci` → `npm run build` → Pages로 배포
  - 수동 실행도 가능 (`workflow_dispatch`)
- GitHub Pages 설정:
  1) 리포지토리 Settings → Pages → Source: GitHub Actions 선택
  2) 워크플로우 실행 후 제공되는 URL에서 배포본 확인 (예: `https://<USER>.github.io/json-lab/`)
