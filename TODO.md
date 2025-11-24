# TODO – JSON Formatter 웹 앱

> 규칙: 큰 단계부터 순서대로 진행. 각 단계 안에서도 위에서 아래로 순서대로 처리.

## 1) 메타/헤드 최적화
- `index.html` `<head>`에 SEO용 기본값 정리: 명확한 `<title>`(예: `JSON Formatter | JSON Lab`), `<meta name="description" content="브라우저에서 JSON을 포맷/검증하고 트리/스키마/디프/URL fetch까지 지원하는 도구">`, `<meta name="robots" content="index,follow">`, `<meta name="theme-color" content="#0f172a">`, `lang="ko"` 적용.
- 캐노니컬 지정: `<link rel="canonical" href="https://ilestri.github.io/json-lab/">` 추가해 중복 URL 방지.
- 오픈 그래프/Twitter 카드 메타 삽입: `og:title/description/url/site_name/type=image`, `twitter:card=summary_large_image` 등. `public/og-image.png`(1200x630, 다크/라이트 대비 선명) 제작 후 참조.
- 파비콘/웹앱 매니페스트 확인: `public/`에 아이콘 세트 배치, `<link rel="icon">`/`apple-touch-icon`/`manifest`가 맞게 연결되어 있는지 점검.
- 구조화 데이터(JSON-LD) 추가: `WebApplication` 또는 `SoftwareApplication` 타입으로 이름, 설명, URL, 애플리케이션 카테고리(`DeveloperApplication`), 운영체제(`"Web"`), 브라우저 지원, 제공 기능을 명시. 가능하면 `WebSite` + `potentialAction`(SearchAction)도 함께 선언.

## 2) 색인/사이트맵·로봇 설정
- `public/robots.txt` 작성: `User-agent: *` + `Allow: /json-lab/` + `Sitemap: https://ilestri.github.io/json-lab/sitemap.xml` 명시.
- 정적 `public/sitemap.xml` 추가: 홈(`/json-lab/`)과 주요 섹션(anchor 링크 포함 시 가장 핵심만) 기록, `<lastmod>`를 배포 시점으로 유지.
- GitHub Pages 도메인 확인: `https://ilestri.github.io/json-lab/` 외에 별칭 도메인 사용 시 캐노니컬/사이트맵/OG URL도 동일하게 교체.

## 3) 콘텐츠/접근성·성능 개선
- 본문 H 태그 구조 점검: 최상단 H1에 도구 목적을 명확히 기술(예: `JSON 포맷터 & 검증 도구`), 섹션별 H2/H3 정리.
- 시멘틱 마크업 보강: 주요 버튼에 `aria-label`, 입력 영역에 `aria-describedby`로 상태 안내, 결과 영역에 `role="status"`/`aria-live`로 포맷 성공/실패 전달.
- 이미지/아이콘 `alt` 채우기, 코드/결과 영역에 명확한 라벨 텍스트 추가해 키워드 노출과 접근성 모두 개선.
- LCP/FCP 개선: 폰트/중요 CSS `preload`, 불필요한 초기 렌더 블로킹 제거, 필요 시 Tailwind 임포트 최소화 점검.
- 모바일 대응 재검증: `viewport` 메타 확인, 모바일에서 입력/출력 영역 스크롤·줌 문제 없는지 확인 후 짧은 안내 문구 추가.

## 4) 신뢰 신호 및 모니터링
- Google Search Console 등록: `https://ilestri.github.io/json-lab/` 속성 추가, `sitemap.xml` 제출, 색인 요청/커버리지 모니터링.
- PageSpeed Insights/Lighthouse 한 번 돌려 Core Web Vitals 체크 후 주요 개선점 기록.
- 소셜 미리보기 테스트: Facebook Sharing Debugger/Twitter Card Validator로 `og:image` 등 정상 노출 확인.
