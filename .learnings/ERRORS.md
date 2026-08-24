# Errors

## [ERR-20260825-001] apply_patch

**Logged**: 2026-08-25T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: docs

### Summary
创建长篇实施计划时，有一行缺少 unified diff 的 `+` 前缀，导致 `apply_patch` 拒绝整个新增文件补丁。

### Error

```text
apply_patch verification failed: invalid hunk at line 740, 'git status --short' is not a valid hunk header.
```

### Context

- 操作：通过 `*** Add File` 新增长篇 Markdown 计划。
- 原因：代码围栏中的一行没有 `+` 前缀，被补丁解析器误判为 hunk header。
- 影响：补丁原子失败，目标文件没有产生部分写入。

### Suggested Fix

长篇新增文件在提交前检查每一行都带有 `+` 前缀；失败后重新生成完整补丁，不尝试依赖未写入的部分文件。

### Metadata

- Reproducible: yes
- Related Files: docs/superpowers/plans/2026-08-25-betaer-homepage-redesign.md

### Resolution

- **Resolved**: 2026-08-25T00:00:00+08:00
- **Notes**: 重新生成格式完整的新增文件补丁。

---

## [ERR-20260825-003] qlmanage-svg-render

**Logged**: 2026-08-25T00:00:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: frontend

### Summary
Quick Look 把 1200 x 630 SVG 先缩放进方形缩略图，再居中裁切，输出尺寸正确但内容被放大并截断。

### Error

```text
PNG reports 1200 x 630, but the right project card is clipped after qlmanage plus sips cropping.
```

### Context

- 操作：`qlmanage -t -s 1200` 后使用 `sips --cropToHeightWidth 630 1200`。
- 原因：Quick Look 的 `-s` 表示方形缩略图边长，不是 SVG 原始画布宽度。
- 影响：自动尺寸测试通过，但社交预览视觉内容错误。

### Suggested Fix

使用 Chrome headless，以 `--window-size=1200,630` 和 `--force-device-scale-factor=1` 直接截图 SVG 根文档；完成后仍需人工查看 PNG。

### Metadata

- Reproducible: yes
- Related Files: assets/social-preview.svg, assets/social-preview.png

### Resolution

- **Resolved**: 2026-08-25T00:00:00+08:00
- **Notes**: 改用 Chrome headless 后完整保留 1200 x 630 画布内容。

---

## [ERR-20260825-002] apply_patch

**Logged**: 2026-08-25T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
同一补丁同时 `Delete File` 与 `Add File` 相同路径会被 `apply_patch` 拒绝。

### Error

```text
apply_patch verification failed: invalid patch: multiple operations target tests/seo.test.mjs
```

### Context

- 操作：完整替换测试文件。
- 原因：补丁工具不允许单个补丁对同一路径执行多种文件级操作。

### Suggested Fix

完整替换文件时使用单个 `Update File`，或把 `Delete File` 与 `Add File` 分成两次补丁调用。

### Metadata

- Reproducible: yes
- Related Files: tests/seo.test.mjs
- Recurrence-Count: 2
- Last-Seen: 2026-08-25
- See Also: ERR-20260825-001

### Resolution

- **Resolved**: 2026-08-25T00:00:00+08:00
- **Notes**: 拆分为删除和新增两次原子补丁后成功。

---

## [ERR-20260825-004] exec-command-workdir

**Logged**: 2026-08-25T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
命令打算在自身创建制品目录前就把该目录设为工作目录，进程因此无法启动。

### Error

```text
Failed to create unified exec process: No such file or directory
```

### Suggested Fix

先从已存在的仓库根目录创建制品目录，再在后续命令中把它设为工作目录。

### Metadata

- Reproducible: yes
- Related Files: output/playwright/homepage
- Recurrence-Count: 2
- Last-Seen: 2026-08-25

### Resolution

- **Resolved**: 2026-08-25T00:00:00+08:00
- **Notes**: 分开创建目录与启动 Playwright 会话；2026-08-25 再次复发，继续采用先创建、后切换工作目录的两步方式。

---

## [ERR-20260825-005] playwright-cli-network

**Logged**: 2026-08-25T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
当前 Playwright CLI 不支持参考文档中的 `network` 命令，实际命令名为 `requests`。

### Error

```text
Unknown command: network
```

### Suggested Fix

使用 `requests` 列出网络请求，再用 `request <index>` 查看详情。

### Metadata

- Reproducible: yes
- Related Files: output/playwright/homepage

### Resolution

- **Resolved**: 2026-08-25T00:00:00+08:00
- **Notes**: 改用 `requests` 并确认静态资源与 Analytics 请求状态。

---

## [ERR-20260825-006] shell-test-workdir

**Logged**: 2026-08-25T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
从 Playwright 制品目录运行仓库测试 glob，zsh 因当前目录没有匹配文件而拒绝命令。

### Error

```text
zsh: no matches found: tests/*.test.mjs
```

### Suggested Fix

仓库测试始终从仓库根目录执行；Playwright CLI 命令才从制品目录执行。

### Metadata

- Reproducible: yes
- Related Files: tests/seo.test.mjs

### Resolution

- **Resolved**: 2026-08-25T00:00:00+08:00
- **Notes**: 分离测试命令和浏览器命令的工作目录；2026-08-25 再次把 Git 状态检查放进 Playwright 临时目录，改回仓库根目录后重跑。

---

## [ERR-20260825-007] playwright-cli-run-code

**Logged**: 2026-08-25T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
当前 Playwright CLI 的 `run-code` 需要接收函数表达式，直接传入多条 `await page...` 语句会产生语法错误。

### Error

```text
SyntaxError: Unexpected identifier 'page'
```

### Suggested Fix

使用 `async (page) => { ... }` 包装多条 Playwright 操作。

### Metadata

- Reproducible: yes
- Related Files: output/playwright/homepage

### Resolution

- **Resolved**: 2026-08-25T00:00:00+08:00
- **Notes**: 使用异步函数表达式后成功验证深色与减弱动画模式。

---

## [ERR-20260825-008] destructive-cleanup-policy

**Logged**: 2026-08-25T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tooling

### Summary
尝试删除本次生成的 Playwright 制品目录时，统一执行器拒绝了 `rm -rf` 风格命令。

### Error

```text
rejected: rm -f style commands are not permitted. Use a safer approach
```

### Suggested Fix

清理生成制品时优先移动到 `mktemp -d` 创建的临时隔离目录，保持可恢复性。

### Metadata

- Reproducible: yes
- Related Files: output/playwright/homepage

### Resolution

- **Resolved**: 2026-08-25T00:00:00+08:00
- **Notes**: 改用临时隔离目录接收本次生成的浏览器制品。

---

## [ERR-20260825-009] manual-url-case-check

**Logged**: 2026-08-25T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
手工外链检查输入了错误的 GitHub Pages 大小写和连字符形式，产生了与页面实现无关的 404。

### Error

```text
404 https://betaer.github.io/AI-Signal-Guard/
404 https://betaer.github.io/Password-Generator/
```

### Suggested Fix

从 `index.html` 或 `sitemap.xml` 直接提取链接进行检查，不要凭记忆重新输入大小写敏感路径。

### Metadata

- Reproducible: yes
- Related Files: index.html, sitemap.xml

### Resolution

- **Resolved**: 2026-08-25T00:00:00+08:00
- **Notes**: 使用页面实际链接重新检查，两个在线入口和两个源码入口均返回 200。

---

## [ERR-20260825-010] local-preview-port-conflict

**Logged**: 2026-08-25T05:40:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
启动主页本地预览时固定端口 8765 已被另一个 Python 进程占用。

### Error

```text
OSError: [Errno 48] Address already in use
```

### Suggested Fix

启动预览前检查端口，若占用来源不属于当前任务，则使用独立端口，不终止不明进程。

### Metadata

- Reproducible: yes
- Related Files: index.html

### Resolution

- **Resolved**: 2026-08-25T05:40:00+08:00
- **Notes**: 保留占用 8765 的既有进程，改用 8876 进行本次浏览器验证。

---

## [ERR-20260825-011] preflight-shell-quoting

**Logged**: 2026-08-25T07:30:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
把 Lighthouse、Node 解析和包含单双引号的正则扫描组合进同一条 Shell 命令，导致 zsh 在执行前发现引号未闭合。

### Error

```text
zsh:7: unmatched "
```

### Suggested Fix

将 Lighthouse 和复杂正则扫描拆成独立命令；正则包含引号时避免嵌套在同一段 Shell 字符串中。

### Metadata

- Reproducible: yes
- Related Files: index.html

### Resolution

- **Resolved**: 2026-08-25T07:30:00+08:00
- **Notes**: 改为分别运行 Lighthouse、报告解析和页面文本扫描。

---
