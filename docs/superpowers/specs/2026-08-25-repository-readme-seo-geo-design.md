# 两个工具仓库 README、SEO 与 GEO 优化设计

## 目标

为 `betaer/password-generator` 与 `betaer/AiSignalGuard` 建立准确、专业、双语且易维护的仓库说明体系，同时优化 GitHub 仓库简介与 Topics。

成功标准：

- 每个仓库默认 `README.md` 使用中文。
- 每个仓库提供 `docs/readme-en.md` 英文版。
- 两种语言在顶部互相链接，且核心事实、数字、能力边界保持一致。
- README 顶部能在较短篇幅内解释项目定位、核心价值、在线地址与安全边界。
- 技术章节说明真实策略、算法、证据模型、测试方式及限制，不堆砌关键词、不引用无法验证的外部评分。
- GitHub Description 和 Topics 与 README、网页元数据及实际代码一致。

## 双语导航

中文 README 顶部：

```text
[简体中文](README.md) · [English](docs/readme-en.md)
```

英文 README 顶部：

```text
[简体中文](../README.md) · [English](readme-en.md)
```

中文是默认主文档；英文版不是逐字翻译，而是保持事实一致的自然英文表达。

## 两个 README 的统一结构

1. 项目名称、定位语、语言切换、在线体验。
2. 一段中文或英文摘要，说明项目解决什么问题。
3. “为什么使用”或“核心优势”：最多四点，避免绝对化宣传。
4. 核心能力表：功能、用途、实现策略。
5. 技术策略与算法：用可复核的实际实现体现专业度。
6. 隐私与数据边界：区分本地计算、第三方请求和访问统计。
7. 适用场景与不适用场景。
8. 快速使用、本地开发、测试和部署。
9. SEO/GEO 与机器可读发现信息。
10. 能力边界、免责声明、许可证或词库来源。

## Password Generator 内容设计

### 顶部定位

浏览器本地运行的专业密码生成器，支持随机密码、记忆短语与 PIN，并提供细粒度规则、格式测试方案和基于实际结果的量化强度分析。

### 必须说明的核心能力

- 三种生成模式：随机密码、PIN、记忆短语。
- 长度、字符类型、符号比例、首尾类型、排除易混淆字符和批量数量等规则。
- 银行卡数字格式、ETH/TRON/BTC 地址样式与 64 位 Hex 私钥样式仅作为测试字符串。
- 记忆短语使用简单词库、7,776 词标准词库及主题词包。
- 强度分析展示字符多样性、理论熵、穷举次数和预计破解时间。
- 自动复制、会话历史和 URL 锚点入口。

### 技术策略

- 使用 `crypto.getRandomValues()`，不使用 `Math.random()`。
- 随机索引使用拒绝采样，避免 `randomUint32 % size` 产生 modulo bias。
- 记忆短语每词理论熵按 `log2(实际词池数量)` 计算，整条理论熵按每词熵乘以词数计算；用户场景描述不计入熵。
- 标准词包按需异步加载，两个冷启动小型模块压缩后内置，避免首次打开的依赖竞态。
- 密码强度根据本次实际生成结果重新计算，不复用目标规则的预估结果。
- 破解时间使用明确写出的尝试速率假设，说明它是理论估算而不是破解承诺。
- PIN 过滤分别处理弱组合、重复数字和连续数字，不把过滤结果夸大为绝对安全。

### 必须避免的错误表述

- 不再描述已移除的“记忆故事”。
- 不把格式测试字符串描述成有效银行卡号、有效链上地址或真实私钥。
- 不把密码生成器描述成密码管理器、钱包或密钥托管服务。
- 不使用“零追踪”；页面包含基础访问统计，但生成结果、PIN、记忆短语和输入内容不进入统计事件。

### GitHub 仓库简介

```text
浏览器本地 Password Generator｜Web Crypto 随机密码、Passphrase 与 PIN，支持细粒度规则、格式模板和实时熵值分析。
```

### Topics

```text
password-generator
passphrase-generator
pin-generator
web-crypto
password-security
password-strength
entropy
cryptography
privacy-tools
security-tools
offline-first
javascript
github-pages
open-source
developer-tools
diceware
```

## AI Signal Guard 内容设计

### 顶部定位

浏览器端网络与数字身份信号诊断工具，通过多源证据核验 IP、DNS、WebRTC、浏览器环境和 AI 服务连通性，并明确区分事实、推断、失败和未知状态。

### 必须说明的核心能力

- IPv4/IPv6 出口、ASN、组织、网络类型及多源 IP 情报。
- DNS 与 WebRTC 泄漏诊断。
- 浏览器语言、时区、字体、Canvas、WebAudio 和设备公开信息。
- AI 服务与常用服务的浏览器可达性、AI 路径和官方状态排障。
- 目标画像、动态权重、证据置信度、覆盖率、正反原因和建议。
- 默认脱敏的 Markdown 诊断报告与不含敏感原值的分享摘要。

### 技术策略

- 使用注册表管理独立来源；当前确定性测试验证 IP、STUN 和路由来源注册表各包含 10 个唯一成员，不宣传“20 个 STUN 节点”。
- 每个 STUN 来源使用独立 `RTCPeerConnection`，不借用其他节点候选结果。
- 多源结论只统计 `voteEligible` 的有效证据；失败、超时和字段缺失保持失败或未知，不作为安全票。
- IP 地理、ASN 和组织字段按来源真实结构分别归一化，缺失字段不构造冲突。
- 身份匹配采用画像动态权重、证据置信度、覆盖率和关键差异上限；通用分析不输出伪精确的百分制画像分。
- 服务探针只说明浏览器请求路径“可达 / 本次未连通”，不推断登录、解锁、账号状态、支付能力或平台健康。
- 复制诊断时对 IPv4、IPv6、DNS、WebRTC、AI 路径、mDNS 与指纹标识执行固定脱敏策略。

### 隐私边界

- 语言、时区、字体和浏览器指纹在本地读取与计算。
- IP 情报、DNS、STUN、服务可达性和状态检测需要请求相应第三方公开服务。
- 项目没有自建诊断数据后端，但第三方服务会看到请求产生的网络元数据。
- Google Analytics 用于基础访问统计；检测结果本身不作为统计事件上传。

### 必须避免的错误表述

- 不宣传“所有检测完全本地”或“零网络请求”。
- 不宣传不存在的 20 个 STUN 节点、MCP 服务、Agent API 或第三方满分评级。
- 不把工具描述成 VPN、反指纹、防追踪或平台封号预测器。
- 不把单次可达性结果描述成账号可用、平台解锁或服务健康结论。
- GitHub Star 显示为固定展示，不再描述成实时读取仓库计数。

### GitHub 仓库简介

```text
网络与数字身份信号诊断｜Multi-source IP, DNS, WebRTC, fingerprint and AI connectivity checks with explicit privacy boundaries.
```

### Topics

```text
network-diagnostics
privacy-tools
ip-checker
dns-leak
webrtc
browser-fingerprint
network-privacy
digital-identity
vpn
proxy
ipv6
ai-tools
cybersecurity
javascript
github-pages
open-source
```

## SEO 与 GEO 策略

- 标题和首段自然包含中英文产品名、问题类型与关键能力，不机械重复关键词。
- 表格、短列表、FAQ、能力边界和公式使搜索引擎与生成式检索能直接提取事实。
- 所有链接使用正式 HTTPS 规范地址；README 与网页 canonical、Open Graph、Twitter Card、JSON-LD 和根级 Sitemap 保持一致。
- 不声称尚未部署的 `llms-full.txt`、MCP、Agent API 或 `/.well-known/` 协议。
- 通过准确的限制条件提高可引用性；不使用“顶尖”“不可替代”“零信任成本”等无法验证的绝对化措辞。

## 验证与发布

- Password Generator 运行 `npm test`。
- AI Signal Guard 运行 `npm test`，并确保根入口与 `v2/` 固定入口保持一致。
- 检查 README 中不存在过时功能、错误节点数量、未部署协议和绝对化安全承诺。
- 使用 GitHub CLI 更新 Description、Homepage 与 Topics，并重新读取仓库设置确认结果。
- 两个仓库分别提交、推送，线上检查 README 链接和仓库设置。
