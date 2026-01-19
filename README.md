# SiaxCDN

> 基于 Serverless 的多功能CDN反向代理服务，零成本、高可用  
> **支持国内外主流前端资源库、API服务及字体加速**  
> 🌐 **[演示站点：cdn.siax.cn](https://cdn.siax.cn)**

基于 Vercel/Netlify/腾讯云 Serverless 架构编写的全能CDN反向代理解决方案，不仅解决 jsDelivr 在中国大陆访问受限问题，更扩展支持 Google Fonts、Gravatar、Gemini API 等多种服务。

![License](https://img.shields.io/badge/license-MIT-green)
![Deploy](https://img.shields.io/badge/Deploy-Vercel%7CNetlify%7CTencent%20Cloud-blue)

---

## ✨ 核心特性

- **多平台支持**：同时支持 Vercel、Netlify、腾讯云等主流 Serverless 平台
- **统一配置管理**：通过单一配置文件管理所有代理规则，自动生成各平台配置
- **高性能设计**：启用缓存控制、Gzip/Brotli压缩、HTTP/2支持
- **安全可靠**：内置 CORS 支持、安全头设置、文件类型限制
- **丰富的代理服务**：支持12+种主流CDN和API服务代理
- **现代化UI**：浅色调渐变色设计，响应式布局，支持搜索功能

## 📦 支持的代理服务

| 本地路径 | 目标CDN | 用途说明 |
|----------|---------|----------|
| **AI API** | `/gemini/*` | Google Generative Language API | Gemini 模型接口代理 |
| **NPM加速** | `/npm/*` | jsDelivr NPM | NPM 包文件加速 |
| **GitHub加速** | `/gh/*` | jsDelivr GitHub | GitHub 仓库文件代理 |
| **WordPress加速** | `/wp/*` | jsDelivr WordPress | WordPress 插件/主题加速 |
| **头像服务** | `/avatar/*` | Gravatar | 头像服务反代 |
| **NPM浏览器化** | `/unpkg/*` | unpkg | 自动解析NPM包浏览器入口 |
| **前端库** | `/cdnjs/*` | cdnjs.cloudflare.com | 通用前端库加速 |
| **字体样式** | `/fonts/*` | Google Fonts CSS | Web字体样式表代理 |
| **字体文件** | `/fonts-gstatic/*` | Google Fonts Static | WOFF2字体文件加速 |
| **jQuery官方** | `/jquery/*` | code.jquery.com | jQuery 官方CDN |
| **Bootstrap** | `/bootstrap/*` | BootstrapCDN | Bootstrap 框架加速 |
| **图标库** | `/fontawesome/*` | Font Awesome | 图标字体库代理 |

## 🚀 快速部署

### Vercel 一键部署
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/siaxcdn&project-name=siaxcdn&repository-name=siaxcdn)

### Netlify 一键部署
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/siaxcdn)

### 腾讯云 Serverless 部署

1. 安装 Serverless CLI
```bash
npm install -g serverless
```

2. 配置腾讯云凭证
```bash
serverless config credentials --provider tencent --secret-id YOUR_SECRET_ID --secret-key YOUR_SECRET_KEY
```

3. 部署项目
```bash
serverless deploy
```

### 腾讯云静态网站托管部署

#### 方式一：从仓库直接导入（推荐）

1. 登录 [腾讯云静态网站托管控制台](https://console.cloud.tencent.com/cos)
2. 点击 "新建站点"，选择 "从 GitHub/GitLab 导入"
3. 授权腾讯云访问您的仓库
4. 选择要部署的仓库和分支
5. 配置构建命令（可选，本项目无需构建）
6. 点击 "部署"，系统会自动识别并使用 `tencent-hosting.json` 配置
7. 部署完成后，配置自定义域名 `cdn.siax.cn`

#### 方式二：手动上传部署

1. 登录 [腾讯云静态网站托管控制台](https://console.cloud.tencent.com/cos)
2. 创建存储桶并启用静态网站托管
3. 上传项目文件（index.html、tencent-hosting.json）
4. 在 "基础配置" 中导入 `tencent-hosting.json` 配置

## 🔧 配置指南

### 域名解析设置

| 平台    | 记录类型 | 主机名       | 指向地址                     |
|---------|----------|--------------|-----------------------------|
| Vercel  | CNAME    | @ 或 www     | `cname-china.vercel-dns.com`| 
| Netlify | CNAME    | @ 或 www     | 自动分配的 xxx.netlify.app  |
| 腾讯云  | CNAME    | @ 或 www     | 云函数/静态网站分配的域名    |

### 平台配置步骤

**Vercel 配置流程**：
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入项目 → Settings → Domains
3. 添加已解析的域名（如 `cdn.siax.cn`）
4. 等待 SSL 证书自动签发（约2分钟）

**Netlify 配置流程**：
1. 登录 [Netlify 控制台](https://app.netlify.com/)
2. 进入 Site configuration → Domain management
3. 添加自定义域名并验证所有权
4. 开启 [HTTPS 强制跳转](https://docs.netlify.com/domains-https/https-ssl/#automatic-https)

**腾讯云配置流程**：
1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入对应的服务（云函数/静态网站托管）
3. 添加自定义域名并完成备案
4. 配置 HTTPS 证书

## 💡 使用示例

将原 CDN 链接中的域名替换为你的镜像域名 `cdn.siax.cn`：

```bash
# 原链接
https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.js

# 替换后
https://cdn.siax.cn/npm/vue@3/dist/vue.global.js
```

### HTML 中使用

```html
<!-- 原链接 -->
<script src="https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.global.js"></script>

<!-- 替换后 -->
<script src="https://cdn.siax.cn/npm/vue@3.3.4/dist/vue.global.js"></script>
```

### Gravatar 头像调用

```html
<img src="https://cdn.siax.cn/avatar/EMAIL_MD5_HASH?s=200&d=mp" alt="用户头像">
```

### API 调用示例

```bash
# 访问 Gemini API
POST https://cdn.siax.cn/gemini/v1/models/gemini-pro:generateContent
```

## 🛠️ 开发与维护

### 项目结构

```
siaxcdn/
├── config/              # 配置目录
│   └── proxies.json    # 统一代理规则配置
├── scripts/             # 脚本目录
│   └── build-config.js # 配置生成脚本
├── index.html           # 主页面
├── index.js             # 腾讯云函数入口
├── package.json         # 项目依赖
├── vercel.json          # Vercel 配置（自动生成）
├── netlify.toml         # Netlify 配置（自动生成）
├── serverless.yml       # 腾讯云函数配置（自动生成）
└── tencent-hosting.json # 腾讯云静态托管配置（自动生成）
```

### 修改代理规则

1. 编辑 `config/proxies.json` 文件，添加或修改代理规则
2. 运行配置生成脚本：
```bash
npm run build:config
```
3. 部署更新后的配置到对应平台

### 自定义配置项

| 配置项 | 说明 |
|--------|------|
| `name` | 项目名称 |
| `version` | 项目版本 |
| `domain` | 自定义域名 |
| `rules` | 代理规则列表 |
| `security.blockedExtensions` | 阻止的文件扩展名 |
| `security.hotlinkProtection` | 防盗链配置 |
| `security.hotlinkProtection.enabled` | 是否启用防盗链 |
| `security.hotlinkProtection.allowedReferers` | 允许的 Referer 列表 |
| `security.cors` | CORS 配置 |
| `security.headers` | 安全头设置 |
| `performance.cacheControl` | 缓存控制策略 |
| `performance.contentEncoding` | 内容编码方式 |

### 防盗链配置示例

```json
"security": {
  "hotlinkProtection": {
    "enabled": true,
    "allowedReferers": [
      "*.siax.cn",       // 允许所有 siax.cn 子域名
      "localhost",       // 允许本地访问
      "127.0.0.1",       // 允许本地 IP 访问
      "yourdomain.com"   // 允许特定域名
    ]
  }
}
```

### 平台支持说明

| 平台 | 防盗链支持情况 |
|------|---------------|
| Vercel | 需要通过 Edge Functions 实现 |
| Netlify | 支持（通过 headers.conditions） |
| 腾讯云函数 | 支持（通过代码实现） |
| 腾讯云静态托管 | 支持（通过控制台配置） |

## 🤝 参与贡献

欢迎通过以下方式参与项目：
1. 提交 [Issue](https://github.com/yourusername/siaxcdn/issues) 反馈问题
2. Fork 项目并提交 Pull Request
3. 完善文档和示例
4. 分享项目给更多需要的人

## � 开源协议

本项目采用 [MIT License](LICENSE) 开源

---

> 如果本项目对您有帮助，请点亮 ⭐ Star 支持！

---

## 🔍 技术栈

- **前端**：HTML5 + CSS3 + JavaScript (ES6+)
- **Serverless**：Vercel Functions / Netlify Functions / 腾讯云函数
- **配置管理**：JSON + Node.js 脚本
- **依赖**：axios (用于腾讯云函数代理请求)

## �📊 性能优化

- **缓存策略**：设置 `public, max-age=31536000, immutable` 长期缓存
- **压缩支持**：启用 Gzip 和 Brotli 压缩
- **安全头**：
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-XSS-Protection: 1; mode=block`
- **CORS**：支持跨域请求，允许所有来源

## 📝 变更日志

### v1.0.0 (2026-01-19)
- ✨ 初始版本发布
- 🚀 支持 Vercel、Netlify、腾讯云多平台部署
- 📦 支持12种主流CDN和API服务代理
- 🎨 现代化浅色调渐变色UI设计
- 🔍 内置搜索功能
- 📋 一键复制示例链接
- 🔒 安全配置优化

---

**SiaxCDN** - 让CDN访问更简单、更快速、更可靠！