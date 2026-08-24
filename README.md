# betaer Projects & Domains

betaer 的公开项目与域名主页，使用纯静态 HTML、CSS 和 JSON-LD 构建。

[访问主页](https://betaer.github.io/) | [AI Signal Guard](https://betaer.github.io/AiSignalGuard/) | [Password Generator](https://betaer.github.io/password-generator/)

## 页面内容

- AI Signal Guard：网络、浏览器隐私与环境一致性检测。
- Password Generator：浏览器本地密码、记忆短语与 PIN 生成。
- Domain Portfolio：betaer 管理的域名名称与含义。

## 本地预览

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8765/`。

## 验证

```bash
node --test tests/*.test.mjs
```

测试覆盖根页面 SEO、JSON-LD、项目链接、域名列表、抓取文件和社交图片尺寸。
