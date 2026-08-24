# Bilingual Repository READMEs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Password Generator 与 AI Signal Guard 建立默认中文、可切换英文的准确 README，并同步 GitHub Description、Homepage 与 Topics。

**Architecture:** 每个仓库的根 `README.md` 是中文权威版本，`docs/readme-en.md` 是事实一致的自然英文版本。两个版本共享相同的功能结构、技术数据和隐私边界；GitHub 仓库元数据从 README 顶部定位中提炼，避免独立漂移。

**Tech Stack:** Markdown、GitHub CLI、Node.js 测试、GitHub Pages。

---

## 文件结构

- `/Users/aa/Documents/my/codex/Password-Generator/README.md`：Password Generator 中文主文档。
- `/Users/aa/Documents/my/codex/Password-Generator/docs/readme-en.md`：Password Generator 英文文档。
- `/Users/aa/Documents/my/codex/github/AiSignalGuard/README.md`：AI Signal Guard 中文主文档。
- `/Users/aa/Documents/my/codex/github/AiSignalGuard/docs/readme-en.md`：AI Signal Guard 英文文档。

### Task 1: Password Generator 双语 README

**Files:**
- Modify: `/Users/aa/Documents/my/codex/Password-Generator/README.md`
- Create: `/Users/aa/Documents/my/codex/Password-Generator/docs/readme-en.md`

- [ ] **Step 1: 写入中文主文档**

中文 README 顶部必须包含：

```markdown
# Password Generator｜密码生成器

[简体中文](README.md) · [English](docs/readme-en.md)

浏览器本地运行的专业密码生成器，支持随机密码、记忆短语与 PIN，并提供细粒度生成规则、格式测试方案和基于实际结果的量化强度分析。
```

正文必须明确 Web Crypto、拒绝采样、实际结果强度计算、`log2(实际词池数量)`、7,776 词异步加载、PIN 三类过滤、格式测试字符串边界和 Google Analytics 边界；不得出现“记忆故事”或“真实钱包私钥”。

- [ ] **Step 2: 写入英文文档**

英文 README 顶部必须包含：

```markdown
# Password Generator

[简体中文](../README.md) · [English](readme-en.md)

A browser-local password generator for random passwords, passphrases, and PINs, with fine-grained rules, format-oriented test schemes, and quantitative strength analysis based on each generated result.
```

英文版必须与中文版本保持相同数字、公式、功能和限制，不逐字硬译。

- [ ] **Step 3: 验证内容与测试**

Run:

```bash
rg -n "记忆故事|Math\.random|真实私钥|有效银行卡|零追踪" README.md docs/readme-en.md
npm test
```

Expected: `rg` 只允许在否定性能力边界中出现；测试全部通过。

- [ ] **Step 4: 提交 Password Generator 文档**

```bash
git add README.md docs/readme-en.md
git commit -m "docs: add bilingual project documentation"
```

### Task 2: AI Signal Guard 双语 README

**Files:**
- Modify: `/Users/aa/Documents/my/codex/github/AiSignalGuard/README.md`
- Create: `/Users/aa/Documents/my/codex/github/AiSignalGuard/docs/readme-en.md`

- [ ] **Step 1: 重写中文主文档**

中文 README 顶部必须包含：

```markdown
# AI Signal Guard

[简体中文](README.md) · [English](docs/readme-en.md)

浏览器端网络与数字身份信号诊断工具，通过多源证据核验 IP、DNS、WebRTC、浏览器环境和 AI 服务连通性，并明确区分事实、推断、失败与未知状态。
```

正文必须明确三个来源注册表各 10 个唯一成员、独立 `RTCPeerConnection`、`voteEligible`、来源归一化、画像动态权重、服务探针二态含义、固定脱敏和第三方请求边界；删除实时 GitHub Star、20 个 STUN、MCP/Agent API、零网络请求及平台解锁暗示。

- [ ] **Step 2: 写入英文文档**

英文 README 顶部必须包含：

```markdown
# AI Signal Guard

[简体中文](../README.md) · [English](readme-en.md)

A browser-based network and digital identity signal diagnostic tool that cross-checks IP, DNS, WebRTC, browser-environment, and AI-service connectivity evidence while keeping facts, inferences, failures, and unknown states distinct.
```

英文版必须复用中文版本的确定性数字和能力边界。

- [ ] **Step 3: 验证内容与测试**

Run:

```bash
rg -n "20 个|20 STUN|实时.*Star|MCP|Agent API|完全本地|零网络请求" README.md docs/readme-en.md
npm test
```

Expected: 过时或过度宣传只允许在否定性能力边界中出现；测试全部通过。

- [ ] **Step 4: 提交 AI Signal Guard 文档**

```bash
git add README.md docs/readme-en.md
git commit -m "docs: add bilingual project documentation"
```

### Task 3: 更新 GitHub 仓库元数据

**Files:**
- No repository files.

- [ ] **Step 1: 更新 Password Generator**

```bash
gh repo edit betaer/password-generator \
  --description "浏览器本地 Password Generator｜Web Crypto 随机密码、Passphrase 与 PIN，支持细粒度规则、格式模板和实时熵值分析。" \
  --homepage "https://betaer.github.io/password-generator/"
```

随后用 GitHub Topics API 把 Topics 精确替换为规范中列出的 16 项。

- [ ] **Step 2: 更新 AI Signal Guard**

```bash
gh repo edit betaer/AiSignalGuard \
  --description "网络与数字身份信号诊断｜Multi-source IP, DNS, WebRTC, fingerprint and AI connectivity checks with explicit privacy boundaries." \
  --homepage "https://betaer.github.io/AiSignalGuard/"
```

随后用 GitHub Topics API 把 Topics 精确替换为规范中列出的 16 项。

- [ ] **Step 3: 推送并回读验证**

```bash
git -C /Users/aa/Documents/my/codex/Password-Generator push origin main
git -C /Users/aa/Documents/my/codex/github/AiSignalGuard push origin main
gh repo view betaer/password-generator --json description,homepageUrl,repositoryTopics,url
gh repo view betaer/AiSignalGuard --json description,homepageUrl,repositoryTopics,url
```

Expected: 两个仓库 `main` 推送成功；Description、Homepage 与 Topics 和设计规范一致；GitHub 页面可从中文 README 切换到英文 README，再返回中文版。

