import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const robots = await readFile(new URL("robots.txt", root), "utf8");
const sitemap = await readFile(new URL("sitemap.xml", root), "utf8");
const socialPreview = await readFile(new URL("assets/social-preview.png", root));

test("根首页提供 canonical、Open Graph 与 Twitter Card", () => {
  const canonical = "https://betaer.github.io/";
  assert.match(html, new RegExp(`<link rel="canonical" href="${canonical}"`));
  assert.match(html, new RegExp(`<meta property="og:url" content="${canonical}"`));
  assert.match(html, /<meta property="og:image" content="https:\/\/betaer\.github\.io\/assets\/social-preview\.png">/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(html, /<meta name="twitter:image" content="https:\/\/betaer\.github\.io\/assets\/social-preview\.png">/);
  assert.doesNotMatch(html, /noindex|nofollow|noimageindex/i);
});

test("根首页 JSON-LD 描述网站、项目集合、软件与面包屑", () => {
  const payload = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(payload, "缺少 JSON-LD");
  const data = JSON.parse(payload);
  const graph = data["@graph"];
  assert.ok(Array.isArray(graph));
  assert.ok(graph.some((entry) => entry["@type"] === "WebSite"));
  assert.ok(graph.some((entry) => entry["@type"] === "CollectionPage"));
  assert.ok(graph.some((entry) => entry["@type"] === "BreadcrumbList"));
  assert.equal(graph.filter((entry) => entry["@type"] === "SoftwareApplication").length, 2);
  const itemList = graph.find((entry) => entry["@type"] === "ItemList");
  assert.equal(itemList.numberOfItems, 2);
});

test("Host 根级 robots 与 sitemap 收录三个规范页面", () => {
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/betaer\.github\.io\/sitemap\.xml/);
  for (const url of [
    "https://betaer.github.io/",
    "https://betaer.github.io/AiSignalGuard/",
    "https://betaer.github.io/password-generator/",
  ]) {
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), url);
  }
});

test("根首页社交预览图为 1200×630 PNG", () => {
  assert.equal(socialPreview.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(socialPreview.readUInt32BE(16), 1200);
  assert.equal(socialPreview.readUInt32BE(20), 630);
});
