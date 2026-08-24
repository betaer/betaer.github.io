import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const robots = await readFile(new URL("robots.txt", root), "utf8");
const sitemap = await readFile(new URL("sitemap.xml", root), "utf8");
const socialPreview = await readFile(new URL("assets/social-preview.png", root));
const projectPreviewFiles = [
  "assets/ai-signal-guard-preview-600.webp",
  "assets/ai-signal-guard-preview-1200.webp",
  "assets/password-generator-preview-600.webp",
  "assets/password-generator-preview-1200.webp",
];
const jsonLdPayload = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];

const domains = [
  "codeis.law",
  "bifenle.com",
  "bifenle.cn",
  "chanhai.com",
  "chanhaier.com",
  "pzmb.com",
  "zbfw.com",
  "yvlu.com",
  "haxk.com",
  "8kan.com",
  "xdpk.com",
  "puruike.com",
  "shuaniao.com",
  "daremen.com",
  "betaer.com",
  "weixinyuedu.com",
  "youyue.app",
  "adasai.com",
  "chuoruo.com",
  "miuti.com",
  "jiatuguoji.com",
  "asoinsight.com",
  "momocaipiao.com",
  "yingyongkeji.com",
];

test("根首页元数据同时描述项目与域名资产", () => {
  const canonical = "https://betaer.github.io/";
  assert.match(html, /<title>[^<]*betaer[^<]*项目[^<]*域名[^<]*<\/title>/i);
  assert.match(html, /<meta name="description" content="[^"]*AI Signal Guard[^"]*Password Generator[^"]*域名[^"]*">/);
  assert.match(html, new RegExp(`<link rel="canonical" href="${canonical}"`));
  assert.match(html, new RegExp(`<meta property="og:url" content="${canonical}"`));
  assert.match(html, /<meta property="og:title" content="[^"]*项目[^"]*域名[^"]*">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/betaer\.github\.io\/assets\/social-preview\.png">/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(html, /<meta name="twitter:title" content="[^"]*项目[^"]*域名[^"]*">/);
  assert.doesNotMatch(html, /noindex|nofollow|noimageindex/i);
});

test("根首页声明站内图标且不预加载已删除的 Hero 资源", () => {
  assert.match(html, /<link rel="icon" type="image\/svg\+xml" href="\/assets\/favicon\.svg">/);
  assert.doesNotMatch(html, /<link rel="preload"[^>]*href="\/assets\/(?:social-preview\.png|ai-signal-guard-preview-[^"]+)"/);
});

test("JSON-LD 分别建立项目列表与域名列表", () => {
  assert.ok(jsonLdPayload, "缺少 JSON-LD");
  const graph = JSON.parse(jsonLdPayload)["@graph"];
  assert.ok(Array.isArray(graph));
  assert.ok(graph.some((entry) => entry["@type"] === "WebSite"));
  assert.ok(graph.some((entry) => entry["@type"] === "Person"));
  assert.ok(graph.some((entry) => entry["@type"] === "CollectionPage"));
  assert.ok(graph.some((entry) => entry["@type"] === "BreadcrumbList"));
  assert.equal(graph.filter((entry) => entry["@type"] === "SoftwareApplication").length, 2);

  const projects = graph.find((entry) => entry["@id"] === "https://betaer.github.io/#projects");
  const portfolio = graph.find((entry) => entry["@id"] === "https://betaer.github.io/#domains");
  const page = graph.find((entry) => entry["@id"] === "https://betaer.github.io/#webpage");
  assert.equal(projects.numberOfItems, 2);
  assert.equal(portfolio.numberOfItems, domains.length);
  assert.equal(portfolio.itemListOrder, "https://schema.org/ItemListUnordered");
  assert.equal(portfolio.itemListElement.length, domains.length);
  assert.deepEqual(page.hasPart, [
    { "@id": "https://betaer.github.io/#projects" },
    { "@id": "https://betaer.github.io/#domains" },
  ]);
  assert.equal(portfolio.itemListElement[0].name, "codeis.law");
  assert.equal(portfolio.itemListElement.at(-1).name, "yingyongkeji.com");
  assert.doesNotMatch(JSON.stringify(portfolio), /"@type":"Offer"|"price"|"availability"/);
});

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
  assert.match(html, /<nav class="contact-links" aria-label="联系方式">/);
});

test("浏览器安全工具直接成为首屏主体", () => {
  const main = html.match(/<main id="main-content">([\s\S]*?)<\/main>/)?.[1];
  const projects = html.match(/<section class="projects shell"[^>]*id="projects"[\s\S]*?<\/section>/)?.[0];
  assert.ok(main, "缺少主要内容");
  assert.ok(projects, "缺少项目分区");
  assert.match(main, /^\s*<section class="projects shell" id="projects"/);
  assert.match(projects, /<h1 id="projects-title">浏览器安全工具<\/h1>/);
  assert.match(projects, /<h2>AI Signal Guard<\/h2>/);
  assert.match(projects, /<h2>Password Generator<\/h2>/);
  assert.doesNotMatch(projects, /<h3>/);
  assert.match(projects, /<img[^>]*ai-signal-guard-preview-600\.webp[^>]*loading="eager"[^>]*fetchpriority="high"/);
  assert.doesNotMatch(main, /class="hero|可信的浏览器工具|清楚的安全边界|hero-summary|hero-actions|hero-visual/);
});

test("两个工具同时提供在线入口与源码入口", () => {
  for (const url of [
    "https://betaer.github.io/AiSignalGuard/",
    "https://betaer.github.io/password-generator/",
    "https://github.com/betaer/AiSignalGuard",
    "https://github.com/betaer/password-generator",
  ]) {
    assert.ok(html.includes(`href="${url}"`), url);
  }
  assert.match(html, /AI Signal Guard/);
  assert.match(html, /Password Generator/);
  assert.match(html, /浏览器本地/);
});

test("项目卡片使用本地响应式 WebP 并保持 1200 比 630 比例", async () => {
  assert.match(html, /src="\/assets\/ai-signal-guard-preview-600\.webp"/);
  assert.match(html, /src="\/assets\/password-generator-preview-600\.webp"/);
  assert.match(html, /srcset="\/assets\/ai-signal-guard-preview-600\.webp 600w, \/assets\/ai-signal-guard-preview-1200\.webp 1200w"/);
  assert.match(html, /srcset="\/assets\/password-generator-preview-600\.webp 600w, \/assets\/password-generator-preview-1200\.webp 1200w"/);
  assert.match(html, /\.project-media \{[\s\S]*?aspect-ratio:\s*1200 \/ 630;/);
  assert.match(html, /\.project-media img \{[\s\S]*?height:\s*100%;[\s\S]*?object-fit:\s*cover;/);

  for (const file of projectPreviewFiles) {
    const image = await readFile(new URL(file, root));
    assert.equal(image.subarray(0, 4).toString("ascii"), "RIFF", file);
    assert.equal(image.subarray(8, 12).toString("ascii"), "WEBP", file);
    assert.ok(image.byteLength < 250_000, `${file} 体积过大：${image.byteLength}`);
  }
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
  assert.doesNotMatch(section, /<a[^>]+data-domain=/);
});

test("外部链接与动效具备基础安全和可访问性", () => {
  const links = html.match(/<a[^>]*target="_blank"[^>]*>/g) || [];
  assert.ok(links.length >= 5);
  for (const link of links) {
    assert.match(link, /rel="noopener noreferrer"/);
  }
  assert.match(html, /class="skip-link"/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(html, /@media \(prefers-color-scheme: dark\)/);
  assert.match(html, /@media \(max-width: 768px\)/);
});

test("联系区使用 X 账号而不是明文邮箱", () => {
  assert.match(html, /<a href="https:\/\/x\.com\/betaer" target="_blank" rel="noopener noreferrer">X \/ @betaer<\/a>/);
  assert.doesNotMatch(html, /DownBer|Gmail\.com|请将 # 替换为 @/);
});

test("页面文案没有禁止的长破折号和装饰性滚动提示", () => {
  const visibleMarkup = html.slice(html.indexOf("<body>"), html.indexOf("</body>"));
  assert.doesNotMatch(visibleMarkup, /—|–/);
  assert.doesNotMatch(visibleMarkup, />\s*(?:Scroll|滚动探索|向下滚动)\s*</i);
});

test("Host 根级 robots 与 sitemap 只收录三个规范页面", () => {
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/betaer\.github\.io\/sitemap\.xml/);
  const urls = [
    "https://betaer.github.io/",
    "https://betaer.github.io/AiSignalGuard/",
    "https://betaer.github.io/password-generator/",
  ];
  for (const url of urls) {
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), url);
  }
  assert.equal((sitemap.match(/<loc>/g) || []).length, urls.length);
});

test("根首页社交预览图为 1200 x 630 PNG", () => {
  assert.equal(socialPreview.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(socialPreview.readUInt32BE(16), 1200);
  assert.equal(socialPreview.readUInt32BE(20), 630);
});
