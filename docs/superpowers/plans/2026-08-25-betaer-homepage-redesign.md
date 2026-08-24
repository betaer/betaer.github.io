# betaer 项目主页轻量重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 betaer 根页面重构为工具优先、域名单独分区、元数据与可见内容一致的轻量静态主页。

**Architecture:** 保持单个 `index.html` 承载语义 HTML、CSS、JSON-LD 和现有统计脚本；页面不依赖运行时数据。Node.js 测试读取静态文件验证 SEO、Schema、项目链接、24 个域名和社交图片尺寸，OG 源图继续使用 SVG 并导出固定尺寸 PNG。

**Tech Stack:** HTML5、CSS3、JSON-LD、Node.js 内置测试运行器、SVG、macOS Quick Look 与 `sips`

---

## 文件结构

| 文件 | 单一职责 | 变更 |
|---|---|---|
| `tests/seo.test.mjs` | 根页面静态契约 | 扩充 SEO、Schema、IA、项目、域名与可访问性断言 |
| `index.html` | 根页面内容、样式、Schema、元数据 | 完整重构 |
| `assets/social-preview.svg` | 社交预览可编辑源图 | 更新项目与域名定位 |
| `assets/social-preview.png` | OG 与 Twitter 位图 | 从 SVG 重新导出 |
| `README.md` | 仓库用途与验证说明 | 替换旧的一行标题 |
| `robots.txt` | 根站抓取许可 | 验证后保持不变 |
| `sitemap.xml` | 三个规范页面 | 验证后保持不变 |

## 固定数据

项目：

| 名称 | 在线地址 | 源码地址 | 版本 |
|---|---|---|---:|
| AI Signal Guard | `https://betaer.github.io/AiSignalGuard/` | `https://github.com/betaer/AiSignalGuard` | 2.0.0 |
| Password Generator | `https://betaer.github.io/password-generator/` | `https://github.com/betaer/password-generator` | 1.7.5 |

域名：

| 域名 | 含义 |
|---|---|
| `codeis.law` | Code is law，代码即法律 |
| `bifenle.com` | 比分乐 |
| `bifenle.cn` | 比分乐 |
| `chanhai.com` | 馋孩、禅海 |
| `chanhaier.com` | 馋孩儿 |
| `pzmb.com` | 品质美白 |
| `zbfw.com` | 正版服务 |
| `yvlu.com` | 语录 |
| `haxk.com` | 华澳星空 |
| `8kan.com` | 8kan |
| `xdpk.com` | 兄弟扑克、兄弟 PK |
| `puruike.com` | 普瑞克 |
| `shuaniao.com` | 刷鸟 |
| `daremen.com` | 大热门 |
| `betaer.com` | beta er |
| `weixinyuedu.com` | 微信阅读 |
| `youyue.app` | 有约 APP |
| `adasai.com` | ADAS AI、无人驾驶 AI |
| `chuoruo.com` | chuoruo |
| `miuti.com` | 缪体、谬题 |
| `jiatuguoji.com` | 佳途国际 |
| `asoinsight.com` | ASO 洞察 |
| `momocaipiao.com` | 陌陌彩票 |
| `yingyongkeji.com` | 应用科技 |

### Task 1: 建立重构后的静态契约测试

**Files:**

- Modify: `tests/seo.test.mjs`
- Test: `tests/seo.test.mjs`

- [ ] **Step 1: 增加共享数据与 JSON-LD 提取**

保留现有文件读取逻辑，加入：

```js
const jsonLdPayload = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
const domains = [
  "codeis.law", "bifenle.com", "bifenle.cn", "chanhai.com",
  "chanhaier.com", "pzmb.com", "zbfw.com", "yvlu.com",
  "haxk.com", "8kan.com", "xdpk.com", "puruike.com",
  "shuaniao.com", "daremen.com", "betaer.com", "weixinyuedu.com",
  "youyue.app", "adasai.com", "chuoruo.com", "miuti.com",
  "jiatuguoji.com", "asoinsight.com", "momocaipiao.com", "yingyongkeji.com",
];
```

- [ ] **Step 2: 用失败测试锁定元数据和双列表 Schema**

```js
test("根首页元数据同时描述项目与域名资产", () => {
  const canonical = "https://betaer.github.io/";
  assert.match(html, /<title>[^<]*betaer[^<]*项目[^<]*域名[^<]*<\/title>/i);
  assert.match(html, /<meta name="description" content="[^"]*AI Signal Guard[^"]*Password Generator[^"]*域名[^"]*">/);
  assert.match(html, new RegExp(`<link rel="canonical" href="${canonical}"`));
  assert.match(html, /<meta property="og:title" content="[^"]*项目[^"]*域名[^"]*">/);
  assert.match(html, /<meta name="twitter:title" content="[^"]*项目[^"]*域名[^"]*">/);
  assert.doesNotMatch(html, /noindex|nofollow|noimageindex/i);
});

test("JSON-LD 分别建立项目列表与域名列表", () => {
  assert.ok(jsonLdPayload, "缺少 JSON-LD");
  const graph = JSON.parse(jsonLdPayload)["@graph"];
  assert.ok(graph.some((entry) => entry["@type"] === "WebSite"));
  assert.ok(graph.some((entry) => entry["@type"] === "Person"));
  assert.ok(graph.some((entry) => entry["@type"] === "CollectionPage"));
  assert.ok(graph.some((entry) => entry["@type"] === "BreadcrumbList"));
  assert.equal(graph.filter((entry) => entry["@type"] === "SoftwareApplication").length, 2);
  const projects = graph.find((entry) => entry["@id"] === "https://betaer.github.io/#projects");
  const portfolio = graph.find((entry) => entry["@id"] === "https://betaer.github.io/#domains");
  const page = graph.find((entry) => entry["@id"] === "https://betaer.github.io/#webpage");
  assert.equal(projects.numberOfItems, 2);
  assert.equal(portfolio.numberOfItems, 24);
  assert.equal(portfolio.itemListElement.length, 24);
  assert.deepEqual(page.hasPart, [
    { "@id": "https://betaer.github.io/#projects" },
    { "@id": "https://betaer.github.io/#domains" },
  ]);
  assert.doesNotMatch(JSON.stringify(portfolio), /"@type":"Offer"|"price"|"availability"/);
});
```

- [ ] **Step 3: 用失败测试锁定语义页面、项目入口和域名列表**

```js
test("页面使用语义分区和稳定页内导航", () => {
  assert.match(html, /<header class="site-header">/);
  assert.match(html, /<nav[^>]*aria-label="主要导航"/);
  assert.match(html, /href="#projects"[^>]*>项目<\/a>/);
  assert.match(html, /href="#domains"[^>]*>域名<\/a>/);
  assert.match(html, /href="#contact"[^>]*>联系<\/a>/);
  assert.match(html, /<main id="main-content">/);
  assert.match(html, /<section[^>]*id="projects"/);
  assert.match(html, /<section[^>]*id="principles"/);
  assert.match(html, /<section[^>]*id="domains"/);
  assert.match(html, /<footer[^>]*id="contact"/);
});

test("两个工具同时提供在线入口与源码入口", () => {
  for (const url of [
    "https://betaer.github.io/AiSignalGuard/",
    "https://betaer.github.io/password-generator/",
    "https://github.com/betaer/AiSignalGuard",
    "https://github.com/betaer/password-generator",
  ]) assert.ok(html.includes(`href="${url}"`), url);
});

test("域名区完整保留并规范化 24 个域名", () => {
  const section = html.match(/<section[^>]*id="domains"[\s\S]*?<\/section>/)?.[0];
  assert.ok(section, "缺少域名资产分区");
  assert.equal((section.match(/data-domain=/g) || []).length, domains.length);
  for (const domain of domains) {
    assert.ok(section.includes(`data-domain="${domain}"`), domain);
    assert.ok(section.includes(`>${domain}<`), domain);
  }
  assert.doesNotMatch(section, /[A-Za-z0-9]。(?:com|cn|law|app)/i);
});

test("外部链接与动效具备基础安全和可访问性", () => {
  const links = html.match(/<a[^>]*target="_blank"[^>]*>/g) || [];
  assert.ok(links.length >= 5);
  for (const link of links) assert.match(link, /rel="noopener noreferrer"/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(html, /@media \(max-width: 768px\)/);
});
```

- [ ] **Step 4: 保留抓取文件和 PNG 尺寸测试，运行测试确认失败**

Run: `node --test tests/*.test.mjs`

Expected: 新增测试失败，原有 robots、sitemap 与 1200 x 630 PNG 测试通过。

- [ ] **Step 5: 提交测试契约**

```bash
git add tests/seo.test.mjs
git commit -m "test: define betaer homepage content contract"
```

### Task 2: 对齐元数据与 JSON-LD

**Files:**

- Modify: `index.html:1-125`
- Test: `tests/seo.test.mjs`

- [ ] **Step 1: 替换元数据文案**

使用以下固定内容，canonical、OG URL、OG 图片和 Twitter 图片 URL 保持原值：

```html
<title>betaer 项目与域名主页｜AI Signal Guard、Password Generator</title>
<meta name="description" content="betaer 的公开项目与域名主页，收录 AI Signal Guard 网络与浏览器隐私检测、Password Generator 本地密码生成工具，以及域名资产列表。">
<meta property="og:site_name" content="betaer 项目与域名主页">
<meta property="og:title" content="betaer 项目与域名主页｜浏览器安全工具与域名资产">
<meta property="og:description" content="查看 AI Signal Guard、Password Generator，以及 betaer 的域名资产列表。">
<meta property="og:image:alt" content="betaer 项目与域名主页：浏览器安全工具与域名资产">
<meta name="twitter:title" content="betaer 项目与域名主页｜浏览器安全工具与域名资产">
<meta name="twitter:description" content="查看 AI Signal Guard、Password Generator，以及 betaer 的域名资产列表。">
<meta name="twitter:image:alt" content="betaer 项目与域名主页：浏览器安全工具与域名资产">
```

- [ ] **Step 2: 更新网站和页面实体引用**

```json
{
  "@type": "WebSite",
  "@id": "https://betaer.github.io/#website",
  "url": "https://betaer.github.io/",
  "name": "betaer 项目与域名主页",
  "alternateName": "betaer Projects and Domains",
  "description": "betaer 的公开浏览器安全工具、开源项目与域名资产集合。",
  "inLanguage": ["zh-CN", "en"],
  "publisher": { "@id": "https://betaer.github.io/#author" }
}
```

```json
{
  "@type": "CollectionPage",
  "@id": "https://betaer.github.io/#webpage",
  "url": "https://betaer.github.io/",
  "name": "betaer 项目与域名主页",
  "description": "AI Signal Guard、Password Generator 与 betaer 域名资产列表。",
  "isPartOf": { "@id": "https://betaer.github.io/#website" },
  "breadcrumb": { "@id": "https://betaer.github.io/#breadcrumb" },
  "mainEntity": { "@id": "https://betaer.github.io/#projects" },
  "hasPart": [
    { "@id": "https://betaer.github.io/#projects" },
    { "@id": "https://betaer.github.io/#domains" }
  ]
}
```

两个 `SoftwareApplication` 分别增加真实 `sameAs` 源码 URL。

- [ ] **Step 3: 增加域名 ItemList**

在 `@graph` 中加入 `@id` 为 `https://betaer.github.io/#domains` 的 `ItemList`。`numberOfItems` 为 24；`itemListElement` 按“固定数据”表格顺序写入 24 个对象，每个对象严格使用：

```json
{
  "@type": "ListItem",
  "position": 1,
  "name": "codeis.law",
  "description": "Code is law，代码即法律"
}
```

第 2-24 项只替换 `position`、`name`、`description` 为表格中的精确值。不得加入 `Offer`、`price` 或 `availability`。

- [ ] **Step 4: 运行定向测试**

Run: `node --test --test-name-pattern="元数据|JSON-LD" tests/seo.test.mjs`

Expected: 元数据与 JSON-LD 两项通过。

- [ ] **Step 5: 提交 SEO 与 Schema**

```bash
git add index.html
git commit -m "feat: align homepage metadata and schema"
```

### Task 3: 重构主页面语义与视觉系统

**Files:**

- Modify: `index.html:127-377`
- Test: `tests/seo.test.mjs`

- [ ] **Step 1: 建立页面设计令牌**

删除现有单卡片页面 CSS，建立以下基础令牌：

```css
:root {
  color-scheme: light;
  --page: #f7f9fc;
  --surface: #ffffff;
  --surface-muted: #eef4fb;
  --text: #172033;
  --muted: #5d6c82;
  --line: #d9e2ee;
  --accent: #1769e0;
  --accent-strong: #0d4fae;
  --accent-soft: #e9f2ff;
  --radius: 16px;
  --shadow: 0 18px 50px rgba(31, 72, 125, .09);
  --page-width: 1120px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; min-width: 320px; color: var(--text); background: var(--page); }
.shell { width: min(calc(100% - 40px), var(--page-width)); margin-inline: auto; }
a:focus-visible { outline: 3px solid rgba(23, 105, 224, .32); outline-offset: 4px; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
@media (max-width: 768px) {
  .shell { width: min(calc(100% - 28px), var(--page-width)); }
}
```

- [ ] **Step 2: 建立 header 与 hero**

```html
<a class="skip-link" href="#main-content">跳到主要内容</a>
<header class="site-header">
  <div class="shell header-inner">
    <a class="brand" href="/" aria-label="betaer 首页">betaer</a>
    <nav aria-label="主要导航">
      <a href="#projects">项目</a>
      <a href="#domains">域名</a>
      <a href="https://github.com/betaer" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="#contact">联系</a>
    </nav>
  </div>
</header>
<main id="main-content">
  <section class="hero shell" aria-labelledby="hero-title">
    <div class="hero-copy">
      <p class="eyebrow">betaer projects</p>
      <h1 id="hero-title">在浏览器里，做可信的安全工具。</h1>
      <p class="hero-summary">构建隐私检测与本地凭据工具。本页同时展示 betaer 管理的域名资产。</p>
      <div class="hero-actions">
        <a class="button button-primary" href="#projects">查看项目</a>
        <a class="button button-secondary" href="https://github.com/betaer" target="_blank" rel="noopener noreferrer">浏览 GitHub</a>
      </div>
    </div>
    <aside class="hero-note" aria-label="项目共同边界">
      <strong>Browser-first</strong>
      <span>敏感数据尽量留在当前浏览器中处理。</span>
    </aside>
  </section>
```

桌面 Hero 使用 `1.45fr / .55fr` 两列，移动端一列；导航桌面高度不超过 80px，移动端允许横向紧凑排列但不换成脚本菜单。

- [ ] **Step 3: 建立项目与安全原则**

```html
<section class="projects shell" id="projects" aria-labelledby="projects-title">
  <header class="section-heading">
    <h2 id="projects-title">浏览器安全工具</h2>
    <p>两个可以直接使用、也可以公开审计的独立项目。</p>
  </header>
  <div class="project-list">
    <article class="project project-primary">
      <p class="project-category">网络与浏览器隐私检测</p>
      <h3>AI Signal Guard</h3>
      <p>检查公网 IPv4/IPv6、DNS、WebRTC、浏览器指纹和 AI 服务连通性，并如实展示来源、失败与超时。</p>
      <div class="project-actions">
        <a href="https://betaer.github.io/AiSignalGuard/" target="_blank" rel="noopener noreferrer">打开 AI Signal Guard</a>
        <a href="https://github.com/betaer/AiSignalGuard" target="_blank" rel="noopener noreferrer">查看源码</a>
      </div>
    </article>
    <article class="project">
      <p class="project-category">本地密码与记忆短语生成</p>
      <h3>Password Generator</h3>
      <p>使用 Web Crypto API 在浏览器本地生成随机密码、记忆短语和 PIN，并分析实际结果强度。</p>
      <div class="project-actions">
        <a href="https://betaer.github.io/password-generator/" target="_blank" rel="noopener noreferrer">打开 Password Generator</a>
        <a href="https://github.com/betaer/password-generator" target="_blank" rel="noopener noreferrer">查看源码</a>
      </div>
    </article>
  </div>
</section>
<section class="principles" id="principles" aria-labelledby="principles-title">
  <div class="shell principles-inner">
    <h2 id="principles-title">共同的安全原则</h2>
    <dl class="principle-list">
      <div><dt>浏览器优先</dt><dd>能够本地完成的处理，不交给远程服务。</dd></div>
      <div><dt>敏感数据本地处理</dt><dd>密码、PIN 与记忆短语不会发送到项目服务器。</dd></div>
      <div><dt>公开可审计</dt><dd>项目代码与关键安全边界可以直接检查。</dd></div>
      <div><dt>说明能力边界</dt><dd>检测结果和强度估算不包装成无法验证的承诺。</dd></div>
    </dl>
  </div>
</section>
```

项目列表桌面端用 `1.2fr / .8fr` 非对称网格、移动端单列；原则区使用定义列表和稀疏分隔线，不做四张功能卡片。

- [ ] **Step 4: 增加完整域名静态列表**

使用以下固定结构，把“固定数据”表格的 24 行逐项展开为 24 个 `<li>`：

```html
<section class="domains shell" id="domains" aria-labelledby="domains-title">
  <header class="section-heading">
    <h2 id="domains-title">域名资产</h2>
    <p>以下域名由 betaer 管理。名称与含义仅作资产展示，具体咨询请通过页尾联系方式。</p>
  </header>
  <ul class="domain-grid" aria-label="betaer 域名资产列表">
    <li class="domain-item" data-domain="codeis.law"><span class="domain-name">codeis.law</span><span class="domain-meaning">Code is law，代码即法律</span></li>
    <li class="domain-item" data-domain="bifenle.com"><span class="domain-name">bifenle.com</span><span class="domain-meaning">比分乐</span></li>
    <li class="domain-item" data-domain="bifenle.cn"><span class="domain-name">bifenle.cn</span><span class="domain-meaning">比分乐</span></li>
    <li class="domain-item" data-domain="chanhai.com"><span class="domain-name">chanhai.com</span><span class="domain-meaning">馋孩、禅海</span></li>
    <li class="domain-item" data-domain="chanhaier.com"><span class="domain-name">chanhaier.com</span><span class="domain-meaning">馋孩儿</span></li>
    <li class="domain-item" data-domain="pzmb.com"><span class="domain-name">pzmb.com</span><span class="domain-meaning">品质美白</span></li>
    <li class="domain-item" data-domain="zbfw.com"><span class="domain-name">zbfw.com</span><span class="domain-meaning">正版服务</span></li>
    <li class="domain-item" data-domain="yvlu.com"><span class="domain-name">yvlu.com</span><span class="domain-meaning">语录</span></li>
    <li class="domain-item" data-domain="haxk.com"><span class="domain-name">haxk.com</span><span class="domain-meaning">华澳星空</span></li>
    <li class="domain-item" data-domain="8kan.com"><span class="domain-name">8kan.com</span><span class="domain-meaning">8kan</span></li>
    <li class="domain-item" data-domain="xdpk.com"><span class="domain-name">xdpk.com</span><span class="domain-meaning">兄弟扑克、兄弟 PK</span></li>
    <li class="domain-item" data-domain="puruike.com"><span class="domain-name">puruike.com</span><span class="domain-meaning">普瑞克</span></li>
    <li class="domain-item" data-domain="shuaniao.com"><span class="domain-name">shuaniao.com</span><span class="domain-meaning">刷鸟</span></li>
    <li class="domain-item" data-domain="daremen.com"><span class="domain-name">daremen.com</span><span class="domain-meaning">大热门</span></li>
    <li class="domain-item" data-domain="betaer.com"><span class="domain-name">betaer.com</span><span class="domain-meaning">beta er</span></li>
    <li class="domain-item" data-domain="weixinyuedu.com"><span class="domain-name">weixinyuedu.com</span><span class="domain-meaning">微信阅读</span></li>
    <li class="domain-item" data-domain="youyue.app"><span class="domain-name">youyue.app</span><span class="domain-meaning">有约 APP</span></li>
    <li class="domain-item" data-domain="adasai.com"><span class="domain-name">adasai.com</span><span class="domain-meaning">ADAS AI、无人驾驶 AI</span></li>
    <li class="domain-item" data-domain="chuoruo.com"><span class="domain-name">chuoruo.com</span><span class="domain-meaning">chuoruo</span></li>
    <li class="domain-item" data-domain="miuti.com"><span class="domain-name">miuti.com</span><span class="domain-meaning">缪体、谬题</span></li>
    <li class="domain-item" data-domain="jiatuguoji.com"><span class="domain-name">jiatuguoji.com</span><span class="domain-meaning">佳途国际</span></li>
    <li class="domain-item" data-domain="asoinsight.com"><span class="domain-name">asoinsight.com</span><span class="domain-meaning">ASO 洞察</span></li>
    <li class="domain-item" data-domain="momocaipiao.com"><span class="domain-name">momocaipiao.com</span><span class="domain-meaning">陌陌彩票</span></li>
    <li class="domain-item" data-domain="yingyongkeji.com"><span class="domain-name">yingyongkeji.com</span><span class="domain-meaning">应用科技</span></li>
  </ul>
</section>
```

域名使用两列列表和单条底边线，移动端一列；域名为纯文本，不自动外链、不显示价格或状态。

- [ ] **Step 5: 建立联系页尾并闭合 main**

```html
<footer class="site-footer" id="contact">
  <div class="shell footer-grid">
    <div>
      <p class="footer-brand">betaer</p>
      <h2>项目合作或域名咨询</h2>
      <p>请在联系时说明项目名称或具体域名，便于直接处理。</p>
    </div>
    <div class="contact-links" aria-label="联系方式">
      <a href="https://github.com/betaer" target="_blank" rel="noopener noreferrer">GitHub / betaer</a>
      <span>邮箱：DownBer # Gmail.com（请将 # 替换为 @）</span>
      <a href="https://jq.qq.com/?_wv=1027&amp;k=wWOQVzep" target="_blank" rel="noopener noreferrer">QQ 联系方式 1</a>
      <a href="https://qm.qq.com/cgi-bin/qm/qr?k=Cmt-5FPQsfNBFyTz3aCK7UUkTfhuy-30&amp;noverify=0" target="_blank" rel="noopener noreferrer">QQ 联系方式 2</a>
    </div>
  </div>
  <div class="shell footer-meta"><span>浏览器安全工具与域名资产</span><a href="#main-content">返回顶部</a></div>
</footer>
</main>
```

- [ ] **Step 6: 运行完整测试并提交页面**

Run: `node --test tests/*.test.mjs`

Expected: 除社交图片文案不属于自动断言外，全部静态契约通过。

```bash
git add index.html
git commit -m "feat: rebuild betaer homepage"
```

### Task 4: 更新社交预览与 README

**Files:**

- Modify: `assets/social-preview.svg`
- Modify: `assets/social-preview.png`
- Modify: `README.md`
- Test: `tests/seo.test.mjs`

- [ ] **Step 1: 更新 SVG 定位文字**

保留现有 1200 x 630 画布、容器与两个项目块，替换标题区并在底部增加域名摘要：

```svg
<text x="110" y="205" fill="#1769e0" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="4">PROJECTS &amp; DOMAINS</text>
<text x="110" y="270" fill="#172033" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="700">betaer</text>
<text x="110" y="312" fill="#5d6c82" font-family="Arial, Helvetica, sans-serif" font-size="22">Browser security tools and a curated domain portfolio</text>
<text x="110" y="535" fill="#5d6c82" font-family="Arial, Helvetica, sans-serif" font-size="18">24 domains | codeis.law | betaer.com | youyue.app</text>
```

- [ ] **Step 2: 导出 1200 x 630 PNG**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --force-device-scale-factor=1 \
  --window-size=1200,630 \
  --screenshot="$(pwd)/assets/social-preview.png" \
  "file://$(pwd)/assets/social-preview.svg"
sips -g pixelWidth -g pixelHeight assets/social-preview.png
```

Expected: `pixelWidth: 1200` 和 `pixelHeight: 630`。

- [ ] **Step 3: 替换 README**

```markdown
# betaer Projects & Domains

betaer 的公开项目与域名主页，使用纯静态 HTML、CSS 和 JSON-LD 构建。

[访问主页](https://betaer.github.io/) | [AI Signal Guard](https://betaer.github.io/AiSignalGuard/) | [Password Generator](https://betaer.github.io/password-generator/)

## 页面内容

- AI Signal Guard：网络、浏览器隐私与环境一致性检测。
- Password Generator：浏览器本地密码、记忆短语与 PIN 生成。
- Domain Portfolio：betaer 管理的域名名称与含义。

## 本地预览

运行 `python3 -m http.server 8765 --bind 127.0.0.1`，打开 `http://127.0.0.1:8765/`。

## 验证

运行 `node --test tests/*.test.mjs`。测试覆盖根页面 SEO、JSON-LD、项目链接、域名列表、抓取文件和社交图片尺寸。
```

- [ ] **Step 4: 测试并提交社交资产与说明**

Run: `node --test tests/*.test.mjs`

Expected: 全部测试通过，PNG 保持 1200 x 630。

```bash
git add assets/social-preview.svg assets/social-preview.png README.md
git commit -m "docs: refresh homepage social identity"
```

### Task 5: 浏览器验收与质量审计

**Files:**

- Verify: `index.html`
- Verify: `assets/social-preview.png`
- Verify: `robots.txt`
- Verify: `sitemap.xml`

- [ ] **Step 1: 启动本地服务器**

Run: `python3 -m http.server 8765 --bind 127.0.0.1`

Expected: `Serving HTTP on 127.0.0.1 port 8765`，主页返回 HTTP 200。

- [ ] **Step 2: 验收桌面与移动视口**

在 1440 x 1000 与 390 x 844 两个视口逐项确认：导航单行且不覆盖内容；首屏按钮无需滚动可见；项目区视觉优先于域名区；24 个域名没有中文句号、自动外链或布局溢出；所有链接可由键盘访问；移动端所有多列区域明确切换单列。

- [ ] **Step 3: 检查焦点、减弱动画和文案**

使用 Tab 遍历所有交互元素，确认焦点可见且顺序正确；开启 `prefers-reduced-motion: reduce` 后确认滚动和悬停立即完成。逐字检查标题、按钮、域名含义、邮箱说明和图片 alt 文案，不出现虚构价格、可售状态或无法验证的安全承诺。

- [ ] **Step 4: 运行最终自动检查**

```bash
node --test tests/*.test.mjs
git diff --check main...HEAD
git status --short
```

Expected: 测试全部通过，`git diff --check` 与 `git status --short` 均无输出。

- [ ] **Step 5: 运行 Lighthouse**

```bash
npx --yes lighthouse http://127.0.0.1:8765/ --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=/tmp/betaer-homepage-lighthouse.json --chrome-flags="--headless --no-sandbox"
node -e 'const r=require("/tmp/betaer-homepage-lighthouse.json"); for (const k of Object.keys(r.categories)) console.log(k, Math.round(r.categories[k].score*100))'
```

Expected: Performance、Accessibility、Best Practices 与 SEO 均不低于 95。低于 95 时修复对应审计项并重新运行完整验证。

- [ ] **Step 6: 仅在验收修复产生变更时提交**

```bash
git add index.html assets/social-preview.svg assets/social-preview.png README.md tests/seo.test.mjs
git commit -m "fix: complete homepage quality audit"
```

若 `git status --short` 为空，则不创建空提交。

## 完成条件

- Node 测试全部通过。
- title、description、OG、Twitter Card、JSON-LD 与页面可见定位一致。
- 两个工具均有在线入口和源码入口。
- 24 个域名完整、规范化、纯文本展示。
- 桌面与移动视口没有横向溢出、遮挡或不必要的复杂交互。
- 键盘焦点、对比度、减弱动画和外部链接属性通过检查。
- 社交预览 PNG 为 1200 x 630，并包含项目与域名定位。
- Lighthouse 四个指定分类均不低于 95。
