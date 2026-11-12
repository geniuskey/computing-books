# ComputingBooks · 컴퓨터·AI 교과서 서가

스위치 하나에서 CPU와 운영체제, 패킷과 TCP, 신경망과 LLM, 제조업의 AI 전환까지. 직접 돌려 보며 배우는 한국어 인터랙티브 컴퓨터·AI 교과서를 한 저장소에서 관리합니다. 홈은 MoneyBooks·SemiBooks의 책장·검색·분야 필터·실습·읽는 순서 구성을 따릅니다.

서비스 주소: **https://computing.euiyun.com/** · 책 한 권의 홈은 **`/{slug}/`**, 각 장은 **`/{slug}/chapters/{chapter}.html`**입니다.

## 수록 책

| 경로 | 책 | 서가 분야 | 처음 가져온 곳 |
|---|---|---|---|
| `/computer/` | ComputerBook · 누구나 읽는 컴퓨터 교과서 | 컴퓨터 기초 | `geniuskey/computerbook` |
| `/network/` | NetworkBook · 누구나 읽는 네트워크 교과서 | 네트워크·데이터 | `geniuskey/networkbook` |
| `/ai/` | AIBook · 신경망에서 LLM까지 | 데이터와 AI | `geniuskey/aibook` |
| `/ax/` | AXBook · 제조업 AI 전환 교과서 | 데이터와 AI | `geniuskey/axbook` |

준비 중인 GPUBook·OSBook·DatabaseBook·StatBook은 `roadmap.json`에 적습니다(books 포털 로드맵과 같은 목록).

## 구성

```text
index.html                             서가 홈: 책장·분야 필터·검색, 대표 실험, 읽는 순서
shelf.css                              서가 홈 스타일(공통 파일, 직접 수정하지 않음)
catalog.js                            생성된 책 목록(직접 수정하지 않음)
catalog.json                          생성된 책 목록과 서가 지도(books.euiyun.com이 읽음, 직접 수정하지 않음)
book.json                             서가 메타데이터, 각 책의 book.json 목록
roadmap.json                          준비 중인 책
migration/books.json                  책마다 slug·서가 정보(표지 motif·색·서가 분야)와 원본 저장소, 가져올 때 쓴 주소 바꾸기 규칙
shared/js/shelf.js                    서가 홈의 책장·필터·지도·실험 덱(공통 파일, 직접 수정하지 않음)
shared/js/covers.js                   SVG 책 표지(geniuskey/books 포털 코드)
shared/js/book-shell.js               모든 책 상단 바·서랍의 ‘컴퓨터·AI 서가’ 연결
shared/img/sims/                      홈 ‘직접 해보기’의 시뮬레이터 화면
{slug}/                               각 책의 본문, 시뮬레이터, 용어 데이터, 책별 회귀 검사(scripts/)
tools/sync-catalog.py                 catalog.js·catalog.json 생성(migration/books.json + roadmap.json, 장·시뮬레이터 수는 소스에서 셈 + book.json의 map)
tools/sync-sitemap.py                 루트 사이트맵 생성
tools/build.mjs                       정적 배포물(.book-dist/) 생성, 분석 태그 추가
tools/check.py                        메타데이터·링크 정적 검사
tools/factcheck.cjs                   각 책의 scripts/*.cjs 회귀 검사 실행
tools/browser-check.cjs               데스크톱·모바일 브라우저 검사(Playwright)
tools/og.mjs                          서가 공유 이미지 og.png 생성(Playwright)
```

## 실행과 배포

```bash
npm ci
npm test
npm run build
python3 -m http.server 8000 --directory .book-dist
node tools/browser-check.cjs            # Playwright 필요(PW_PATH 또는 ../book 체크아웃)
```

배포물은 `.book-dist/`입니다. GitHub Pages의 Source를 GitHub Actions로 설정하고 커스텀 도메인 `computing.euiyun.com`과 DNS를 연결합니다. `main`에 push하거나 Deploy Book 워크플로를 실행하면 검사·빌드 후 배포합니다. 이 저장소의 CNAME 설정만으로 DNS나 GitHub 설정이 자동으로 바뀌지는 않습니다.

네 권은 가져올 때의 canonical·Open Graph·구조화 데이터와 CDN 의존성을 그대로 씁니다(주소만 `computing.euiyun.com/{slug}/`로 바꿈). AIBook처럼 canonical이 없던 쪽은 빌드가 붙입니다. 책 안의 `tools/` 스크립트는 개별 저장소 시절의 도구로, 서가 빌드에는 쓰지 않습니다.

책·장·시뮬레이터 수가 바뀌면 `npm run catalog`, `npm run sitemap`, `node tools/og.mjs`로 목록과 공유 이미지를 갱신합니다. 서가 지도(분야 버튼과 ‘읽는 순서’ 위의 지도)는 `book.json`의 `map`에서 고칩니다. 묶음 `id`는 책의 `stage`와 같고, 모든 책은 한 묶음에 들어가야 합니다. 바꾼 뒤 books 저장소에서 `python3 tools/sync-books.py`를 실행하면 books.euiyun.com 지식 지도에도 반영됩니다. `shelf.css`와 `shared/js/shelf.js`는 books 저장소 `tools/shelf-kit/`의 공통 파일을 `python3 tools/sync-shelf-kit.py`로 복사한 것입니다. 서가마다 다른 값(제목·주소·표지의 짧은 이름 `coverTitles`·지도 `map`)은 `book.json`에 둡니다.

## 가져온 책

네 권은 2026-11-07에 개별 저장소에서 `tools/import-books.py --write`(지금은 지움)로 가져왔습니다. 지금부터는 이 저장소에서 직접 고칩니다. 가져올 때 바꾼 것은 다음뿐입니다.

- 각 책의 옛 주소(`https://{책}book.euiyun.com/`)를 `https://computing.euiyun.com/{slug}/`로 바꾸고, 본문 링크는 `/{slug}/…` 같은 사이트 안 경로로 바꿨습니다. 네 권 사이의 교차 링크도 서가 안 주소를 씁니다.
- 다른 서가로 옮겨 간 책의 옛 주소를 새 주소로 바꿨습니다(`migration/books.json`의 `pathAliases`, books 포털의 `legacyUrls`에서 만듦). ComputerBook의 ‘센서를 더 깊이’ 상자는 이미지 센서 DB(`sensors.euiyun.com`) 대신 SensorBook(`semi.euiyun.com/sensor/`)으로 잇습니다.
- 쪽마다 `shared/css/book-shell.css`·`shared/js/book-shell.js`를 붙여 상단 바의 ‘전체 책’ 버튼을 ‘컴퓨터·AI 서가’로 바꿨습니다. Cloudflare 비컨은 지우고 빌드가 분석 태그를 붙입니다.
- 테마 저장 키를 `computing-theme` 하나로 통일했습니다. 진도 같은 다른 저장 키는 책마다 접두어가 달라 그대로 둡니다. 각 책의 `book.json`은 서가 주소·저장소·`basePath`로 바꿨습니다.

원본 저장소는 2026-11-07에 옛 주소의 같은 쪽으로 넘기는 리다이렉트 페이지만 남겼습니다. 그래서 MathBooks처럼 `tools/import-books.py`와 `migration/import-state.json`을 지우고, 서가 정보가 든 `migration/books.json`만 남겼습니다. 가져온 원본 커밋은 geniuskey/computerbook@1cefef4 · geniuskey/networkbook@ab460dc · geniuskey/aibook@6a857dc · geniuskey/axbook@5e317aa이며, 파일별 해시는 첫 가져오기 커밋의 `migration/import-state.json`에 남아 있습니다.

## 라이선스

코드는 MIT, 교육 콘텐츠는 CC BY 4.0입니다. [라이선스 안내](LICENSE.md)와 각 책의 저작권 표시를 참고하세요.
