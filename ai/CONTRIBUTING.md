# AIBook 챕터 작성 가이드

## 기여 자료의 라이선스

기여하는 실행 코드와 문서 안의 실행 코드 예제는 [MIT](LICENSE-MIT), 교재 본문·그림·문제·해설과 README 및 작성 가이드의 설명 문장은 [CC BY 4.0](LICENSE-CC-BY-4.0)으로 제공합니다. HTML·JS 안의 코드와 교육 콘텐츠도 이 구분을 따릅니다. 자세한 범위와 출처 표기 예시는 [라이선스 안내](LICENSE.md)를 참고하세요.

제3자 자료를 추가할 때는 원저작자·출처·라이선스를 표시하고, 별도 이용 조건이 있으면 해당 자료 가까이에 명시하세요.

빌드 과정 없는 정적 사이트다. `index.html` + `chapters/<slug>.html` + 공통 `css/style.css`, `js/common.js`.
로컬 실행: `python3 -m http.server 8000` → http://localhost:8000 (file://로 열어도 동작하게 classic script만 사용한다. ES module 금지.)

## 원칙
- **한국어**, 대상은 공대 학부생(미적분·기초 선형대수·프로그래밍 경험이 있다고 가정, 머신러닝은 처음). 영어 원어는 `<span class="en">(Self-Attention)</span>`처럼 병기. AI 분야는 영어 용어를 그대로 쓰는 경우가 많으므로 "어텐션", "임베딩", "토큰"처럼 업계에서 실제 쓰는 표기를 우선한다.
- 개념 → 직관 그림(SVG) → 수식(KaTeX) → 시뮬레이터 → 실제 수치 예 → 요약/퀴즈 순서.
- 수치는 실제 모델에서 합리적인 범위를 쓴다(예: Llama 3 8B = d_model 4096, 32층, 32 헤드·8 KV 헤드(GQA), FFN 14336, 어휘 128,256; GPT-2 small = 768, 12층, 12헤드, 어휘 50,257; H100 SXM HBM3 80 GB·약 3.35 TB/s·BF16 dense 약 989 TFLOPS). 확실하지 않은 최신 수치는 '약', '~' 로 표기하고 연도를 적는다.
- **시뮬레이터는 진짜로 계산한다.** 소프트맥스·행렬곱·경사하강·양자화·검색은 JS로 실제 계산해 보여 준다(가짜 애니메이션 금지). 사전학습 가중치가 필요한 부분은 손으로 설계한 작은 벡터/코퍼스를 쓰고, 본문에 "교육용으로 만든 작은 예시"라고 밝힌다. 난수는 `AB.rng(seed)`로 재현 가능하게.
- **직접 조작**이 핵심이다: 벡터 끝점 드래그, 행렬 셀 드래그로 값 변경, 토큰 클릭으로 어텐션 선택 등 포인터 이벤트(`pointerdown/move/up`, `touch-action:none`)로 모바일에서도 동작하게 만든다.
- 외부 라이브러리는 아래 head 템플릿에 있는 것만(KaTeX, three.js r147). 이미지 파일 대신 인라인 SVG/canvas로 그린다.
- 색은 하드코딩하지 말고 CSS 변수(`var(--accent)` 등)나 `AB.palette()`를 쓴다. 라이트/다크 둘 다 읽혀야 한다. 히트맵은 `AB.heat(t)`(0→배경, 1→accent), 부호 있는 값은 `AB.diverge(t)`(−1→accent-2, +1→accent)를 쓴다.
- 모바일(폭 360px)에서 가로 스크롤이 생기면 안 된다. SVG는 `viewBox`만 주고 width/height 속성 생략.

## head 템플릿
```html
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="../favicon.ico" sizes="any">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
<title>어텐션 · AIBook</title>
<meta name="description" content="한 문장 설명">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
<link rel="stylesheet" href="../css/style.css">
<script src="../js/common.js"></script>
<!-- 3D가 필요한 페이지만 -->
<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body data-chapter="attention">
<main class="chapter">
  <header class="chapter-hero">
    <div class="eyebrow">Chapter 05</div>
    <h1>어텐션</h1>
    <p class="lead">...</p>
    <ul class="objectives"><li>...</li></ul>
  </header>

  <section id="intro"><h2>제목</h2> ... </section>   <!-- h2 번호와 우측 목차는 자동 생성 -->
  ...
  <section class="keypoints" id="summary"><h2>핵심 정리</h2><ol><li>...</li></ol></section>
  <section class="quiz-sec" id="quiz"><h2>확인 퀴즈</h2><div class="quiz"> ... </div></section>
</main>
<script> /* 페이지 스크립트: 여기서 AB 사용 */ </script>
</body>
</html>
```
상단바, 챕터 서랍, 목차, 이전/다음, 푸터, 테마 토글, 퀴즈 동작, KaTeX 렌더는 `common.js`가 자동 처리한다.

## 컴포넌트
```html
<figure class="diagram"><svg viewBox="0 0 800 300">...</svg><figcaption><b>그림 5-1.</b> 설명</figcaption></figure>
```
SVG 안 유틸 클래스: `.t .t-dim .t-mono .t-acc`(텍스트), `.s-line .s-axis .s-acc`(선), `.f-surface .f-elev .f-acc .f-acc-soft .f-acc2-soft`(면).

```html
<div class="sim" id="sim-attn">
  <div class="sim-head"><span class="sim-tag">SIMULATOR</span><h3>제목</h3></div>   <!-- 3D는 <span class="sim-tag three">3D</span> -->
  <div class="sim-body side">                                    <!-- side: 넓은 화면에서 컨트롤을 오른쪽에 -->
    <div class="sim-view"><canvas id="cv-attn"></canvas></div>     <!-- 3D는 <div class="sim-view three" id="v3d"></div> -->
    <div class="sim-controls">
      <label class="ctrl"><span>온도 T <output id="temp-out"></output></span><input type="range" id="temp" min="0.1" max="3" step="0.05" value="1"></label>
      <div class="ctrl"><span>모드</span><div class="seg" id="mode"><button data-value="causal" class="on">Causal</button><button data-value="full">Full</button></div></div>
      <label class="check"><input type="checkbox" id="showx"> 옵션</label>
      <button class="btn primary" id="run">실행</button>
    </div>
  </div>
  <div class="sim-readout">
    <div class="stat"><span class="k">엔트로피</span><span class="v" id="o-ent">—</span></div>
  </div>
  <div class="sim-note">해볼 것: ...</div>
</div>
```
콜아웃: `<div class="callout">`, `.tip`, `.warn`, `.deep`(심화). 수식: `<div class="formula">$$...$$<div class="where">여기서 ...</div></div>`, 인라인 `\( ... \)`.
표: `<div class="table-wrap"><table>...</table></div>`. 퀴즈:
```html
<div class="quiz-q"><p>질문?</p><div class="opts">
  <button class="opt">보기</button><button class="opt" data-correct>정답</button>
</div><div class="quiz-exp">해설</div></div>
```

## JS 헬퍼 (`js/common.js`)
- `AB.canvas(el, (ctx,w,h)=>{}, {aspect:0.5, height, minHeight, maxHeight})` → `{ctx,w,h,redraw()}` HiDPI, 리사이즈/테마 시 자동 redraw(배경 `--canvas-bg`로 칠해 줌).
- `AB.chart(ctx, box|null, {x:[a,b], y:[a,b], logX, logY, xLabel, yLabel, series:[{data:[[x,y]],color,width,dash,fill}], vlines, hlines, points, bands, xFmt, yFmt})` → `{X,Y,box}`.
- `AB.loop(el, (dt,t)=>{})` 화면에 보일 때만 도는 rAF 루프 `{start,stop,toggle}`.
- `AB.range(id, fmt, onInput)` → getter `get()`, `get.set(v)`. `AB.seg(id, onChange)` → getter. `AB.stat(id, html)`.
- `AB.palette()` 테마 색, `AB.color('accent')`, `AB.onTheme(cb)`, `AB.isDark()`.
- `AB.wl2rgb(nm, alpha)`, `AB.wl2rgbArr(nm)`, `AB.randn()`, `AB.poisson(λ)`, `AB.fmt(x, digits)`, `AB.si(x,'m')`, `AB.clamp/lerp/map`, `AB.C = {h,c,q,k}`.
- `AB.three(el, {camera:[x,y,z], target:[x,y,z], fov, autoRotate, minDistance, maxDistance})` → `T = {THREE, scene, camera, renderer, controls, onFrame(cb), label(html, Vector3|[x,y,z]) , material(color, opts)}`. 조명/리사이즈/화면밖 정지 포함. 라벨의 `L.obj = mesh`로 두면 로컬 좌표를 따라감.

- `AB.bytes(x, digits, bin=true)` → "3 GiB" / (bin=false) "3 GB". `AB.big(7.2e9)` → "7.2B".
- 벡터/행렬: `AB.dot, AB.norm, AB.cos, AB.add, AB.sub, AB.scale, AB.matmul(A,B), AB.matvec(A,x), AB.transpose(A)` (배열/배열의 배열).
- `AB.softmax(z, T=1)` (−Infinity = 마스크 → 0), `AB.argmax, AB.sigmoid, AB.gelu, AB.entropy(p)`(비트).
- `AB.rng(seed)` → `r()` 균등 [0,1), `r.n()` 정규분포. 재현 가능한 초기화·데이터 생성에 쓴다.
- 색: `AB.heat(t, hue='accent')`, `AB.diverge(t)`, `AB.mix(c1,c2,t)`, `AB.alpha(c, a)`, `AB.rgb(c)`.

## 추가 SVG/HTML 유틸
`.s-acc2`(보조 강조선), `.f-acc2`, `.f-ok-soft .f-warn-soft .f-bad-soft`(상태 면). 본문용 `.bits`(모노 비트열), `.pill`.

AI 전용: `.tok`(토큰 칩, `.alt` `.dim` 변형) / `.toks`(토큰 줄), `.ab-input`(텍스트 입력, `textarea.ab-input`), `.mat`(행렬 숫자 표, 셀 배경은 `AB.heat`로), `.sim-panel`(시뮬레이터 안의 추가 패널, 가로 스크롤 허용).

## 챕터 간 연결
본문에서 다른 장을 언급할 때는 `<a href="attention.html">5장</a>`처럼 링크한다. 슬러그: ml(00) vector(01) neuron(02) training(03) embedding(04) attention(05) transformer(06) llm(07) generation(08) quantization(09) rag(10) agent(11) design(12) prompt(13) aisystem(14) multimodal(15) practice(16) glossary(17).

새 개념을 추가하면 `chapters/glossary.html`의 커리큘럼 맵(`#curriculum`)에 앵커 링크를 함께 등록한다.
