# OpenClaw 中文文档

> OpenClaw 个人 AI 助手完整中文文档，基于 VitePress 构建

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VitePress](https://img.shields.io/badge/VitePress-1.0.0-green.svg)](https://vitepress.dev/)
[![Build Status](https://github.com/openclaw/openclaw-docs/actions/workflows/deploy.yml/badge.svg)](https://github.com/openclaw/openclaw-docs/actions)

## 📖 关于 OpenClaw

OpenClaw 是一个功能强大的个人 AI 助手，支持多平台消息通道，包括：

- 📱 **WhatsApp** - 全球最流行的消息应用
- 💬 **Telegram** - 安全快速的跨平台消息
- 🎮 **Discord** - 社区与游戏平台集成
- 💼 **Slack** - 企业协作工具
- 🍎 **iMessage** - Apple 生态系统集成
- 🌐 **WebChat** - 网页版聊天界面

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

开发服务器将在 `http://localhost:5173` 启动。

### 在线访问

文档部署于：[docs.openclaw.ai](https://docs.openclaw.ai)

## 📚 文档结构

```
docs/
├── 00-快速开始/          # 入门指南（5分钟上手）
├── 01-基础使用/          # 日常操作与核心功能
├── 02-消息通道/          # 各平台配置指南
├── 03-核心概念/          # 架构与原理深入
├── 04-配置与运维/        # 生产部署与优化
├── 05-自动化任务/        # 定时任务与触发器
├── 06-工具与功能/        # 高级工具使用
├── 07-平台指南/          # macOS/iOS/Windows/Linux
├── 08-AI模型/            # 模型选择与优化
├── 09-开发者参考/        # API 与插件开发
├── 10-命令行工具/        # CLI 命令参考
└── 11-附录/              # 术语表与贡献指南
```

详细的文档导航请查看：[文档导航](./docs/00-文档导航.md)

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [VitePress](https://vitepress.dev/) | ^1.0.0 | 静态站点生成器 |
| [vitepress-plugin-llms](https://github.com/okineadev/vitepress-plugin-llms) | ^1.0.0 | LLM 优化与搜索增强 |
| [Node.js](https://nodejs.org/) | >= 22 | 运行时环境 |
| [pnpm](https://pnpm.io/) | >= 9 | 包管理器 |

### 搜索方案

本站支持两种搜索方案：

- **Local Search** - 基于 MiniSearch 的本地搜索（默认）
- **vitepress-knowledge** - 基于 Google Gemini Flash 的 AI 语义搜索（可选）

详见：[技术栈规划](./docs/技术栈规划.md)

## 🔧 开发指南

### 环境要求

- Node.js >= 22
- pnpm >= 9

### 创建新文档

所有文档应使用标准模板：[`.docs-template.md`](./docs/.docs-template.md)

```bash
# 复制模板
cp docs/.docs-template.md docs/00-快速开始/你的文档.md
```

### Frontmatter 规范

每个文档必须包含元数据：

```yaml
---
title: "文档标题"
category: "章节名"
difficulty: "入门|进阶|高级"
estimated_time: "5分钟阅读"
tags:
  - 标签1
  - 标签2
prerequisites:
  - "前置知识1"
related_docs:
  - "相关文档1"
next_steps:
  - "下一步学习1"
last_updated: "2026-02-01"
---
```

### 代码示例

支持多平台命令示例：

#### Windows PowerShell

```powershell
npm install -g openclaw@latest
```

#### macOS / Linux (Bash)

```bash
npm install -g openclaw@latest
```

## 🌐 部署

### GitHub Actions

文档通过 GitHub Actions 自动部署到 GitHub Pages：

```yaml
触发条件：push 到 main 分支
部署目标：GitHub Pages (docs.openclaw.ai)
```

### 手动部署

```bash
# 构建文档
pnpm build

# 部署到 GitHub Pages
pnpm deploy
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 报告问题

在 [GitHub Issues](https://github.com/openclaw/openclaw-docs/issues) 提交 Bug 或功能请求。

### 提交文档改进

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

详见：[贡献指南](./docs/11-附录/04-贡献指南.md)

## 📜 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 🔗 相关链接

- [OpenClaw 主仓库](https://github.com/openclaw/openclaw)
- [在线文档](https://docs.openclaw.ai)
- [VitePress 官方文档](https://vitepress.dev/)
- [问题反馈](https://github.com/openclaw/openclaw-docs/issues)

## 📊 项目统计

- 📝 文档页面：100+
- 🌐 支持平台：6+
- 🤖 集成模型：Anthropic、OpenAI 等
- 💻 支持操作系统：macOS、iOS、Android、Windows、Linux

---

*最后更新：2026-02-01*
