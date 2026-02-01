---
title: "iOS 节点"
category: "平台指南"
difficulty: "intermediate"
estimated_time: "15 min"
tags: ["ios", "node", "gateway", "canvas", "相机", "屏幕录制"]
prerequisites: ["macOS指南"]
related_docs: ["Gateway运维", "远程访问", "配置文件说明"]
next_steps: ["Linux指南", "Android节点"]
last_updated: "2026-01-01"
source: "docs/platforms/ios.md"
---

<ai-only>
**摘要**: iOS 节点应用连接到 Gateway over WebSocket,公开 Canvas、屏幕快照、相机捕获、位置、Talk 模式和语音唤醒,支持通过本地网络或 Tailnet 发现。
</ai-only>

# iOS 节点(Node 应用)

可用性:内部预览。iOS 应用目前未公开分发。

## 主要功能

- 通过 WebSocket(LAN 或 tailnet)连接到 Gateway
- 公开节点功能:Canvas、屏幕快照、相机捕获、位置、Talk 模式、语音唤醒
- 接收 `node.invoke` 命令并报告节点状态事件
- Gateway 运行在另一台设备上(macOS、Linux 或 Windows VPS)

## 要求

- Gateway 在另一台设备上运行(macOS、Linux 或 Windows 通过 WSL2)
- 网络路径:
  - 同一 LAN 通过 Bonjour
  - **或**
  - Tailnet 通过单播 DNS-SD 区域(选择一个域名;示例:`openclaw.internal.`)
  - **或**
  - 手动主机/端口(回退)

## 快速开始(配对 + 连接)

### 1) 启动 Gateway

```bash
openclaw gateway --port 18789
```

### 2) 在 iOS 应用中,打开设置并选择发现的网关(或启用 Manual Host 并输入主机 + 端口)

### 3) 在 Gateway 主机上批准配对请求

```bash
openclaw nodes pending
openclaw nodes approve <requestId>
```

### 4) 验证连接

```bash
openclaw nodes status
openclaw gateway call node.list --params "{}"
```

## 发现路径

### Bonjour(LAN)

Gateway 在 `local.` 上播 `_openclaw-gw._tcp`。iOS 应用自动列出这些。

### Tailnet(跨网络)

如果 mDNS 被阻止,使用单播 DNS-SD 区域:
- 选择一个域名(示例:`openclaw.internal.`)
- 使用 Tailscale Split DNS
- 参见 [Bonjour](/03-核心概念/02-Gateway网关#bonjour) 以获取 CoreDNS 示例

### 手动主机/端口

在设置中,启用 **Manual Host** 并输入 Gateway 主机 + 端口(默认 `18789`)。

## Canvas + A2UI

iOS 节点渲染 WKWebView canvas。使用 `node.invoke` 来驱动它:

```bash
openclaw nodes invoke --node "iOS Node" --command canvas.navigate --params '{"url":"http://<gateway-host>:18793/__openclaw__/canvas/"}'
```

注意:

- Gateway canvas host 服务 `/__openclaw__/canvas/` 和 `/__openclaw__/a2ui/`
- iOS 节点在连接时自动导航到 A2UI(当通告了 canvas host URL 时)
- 返回到内置脚手架使用 `canvas.navigate` 和 `{"url":""}`

### Canvas eval / snapshot

```bash
# Canvas eval
openclaw nodes invoke --node "iOS Node" --command canvas.eval --params '{"javaScript":"(() => { const {ctx} = window.__openclaw; ctx.clearRect(0,0,innerWidth,innerHeight); ctx.lineWidth=6; ctx.strokeStyle=\"#ff2d55\"; ctx.beginPath(); ctx.moveTo(40,40); ctx.lineTo(innerWidth-40, innerHeight-40); ctx.stroke(); return \"ok\"; })()"}'

# Canvas snapshot
openclaw nodes invoke --node "iOS Node" --command canvas.snapshot --params '{"maxWidth":900,"format":"jpeg"}'
```

## 语音唤醒 + Talk 模式

- 语音唤醒和 Talk 模式在设置中可用
- iOS 可能挂起后台音频;当应用不活动时将语音功能视为尽力而为

## 常见错误

- `NODE_BACKGROUND_UNAVAILABLE`: 将 iOS 应用带到前台(Canvas/相机/屏幕命令需要)
- `A2UI_HOST_NOT_CONFIGURED`: Gateway 没有通告 canvas host URL;检查 [Gateway 配置](/04-配置与运维/00-配置文件说明)中的 `canvasHost`
- 配对提示从未出现:运行 `openclaw nodes pending` 并手动批准

## 节点服务 + 应用 IPC

当无头节点主机服务在 **远程** 模式下运行时,它通过 Gateway WebSocket 作为节点连接。

## 相机

- `camera.snap` - 拍摄静态图像
- `camera.clip` - 录制视频片段

## 屏幕录制

- `screen.record` - 录制屏幕视频(仅屏幕内容)
