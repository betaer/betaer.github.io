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
- See Also: ERR-20260825-001

### Resolution

- **Resolved**: 2026-08-25T00:00:00+08:00
- **Notes**: 拆分为删除和新增两次原子补丁后成功。

---
