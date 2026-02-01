---
title: "macOS 平台指南"
category: "平台指南"
difficulty: "intermediate"
estimated_time: "20 min"
tags: ["macos", "mac", "mac应用", "node", "gateway"]
prerequisites: ["快速开始", "配置与运维"]
related_docs: ["配置文件说明", "Gateway运维", "远程访问"]
next_steps: ["iOS指南", "Linux指南"]
last_updated: "2026-01-01"
source: "docs/platforms/macos.md"
---

<ai-only>
**摘要**: OpenClaw macOS 伴侣应用是菜单栏应用,管理 Gateway 连接、TCC 权限和 macOS 特定工具(Canvas、相机、系统运行等),支持本地和远程 Gateway 模式。
</ai-only>

# macOS 平台指南

## OpenClaw macOS 伴侣应用(菜单栏 + Gateway broker)

macOS 应用是 OpenClaw 的 **菜单栏伴侣应用**。它拥有权限、
管理/附加到本地 Gateway(通过 launchd 或手动),并向 agent 公开 macOS
特定工具(Canvas、相机、屏幕录制、`system.run`)、
可选择地托管 **PeekabooBridge** 用于 UI 自动化。

## 主要功能

- 在菜单栏中显示原生通知和状态
- 拥有 TCC 提示(通知、辅助功能、屏幕录制、麦克风、语音识别、自动化/AppleScript)
- 运行或连接到 Gateway(本地或远程)
- 公开 macOS‑仅工具(Canvas、相机、屏幕、`system.run`)
- 在 **远程** 模式下启动本地节点主机服务,以便远程 Gateway 可以访问此 Mac
- 可选择地托管 **PeekabooBridge** 用于 UI 自动化
- 按需通过 npm/pnpm 全局安装 CLI(`bun 不推荐用于 Gateway 运行时)

## 本地 vs 远程模式

### 本地(默认)

- 应用附加到正在运行的本地 Gateway(如果存在)
- 否则,它通过 `openclaw gateway install` 启用 launchd 服务

### 远程

- 应用通过 SSH/Tailscale 连接到 Gateway,并且从不启动本地进程
- 应用启动本地 **节点主机服务**,以便远程 Gateway 可以访问此 Mac
- 应用不作为子进程生成 Gateway

## launchd 控制

应用管理标记为 `bot.molt.gateway` 的每用户启动代理
(或在运行 `--profile`/`OPENCLAW_PROFILE` 时使用 `bot.molt.<profile>`)
(旧版 `com.openclaw.*` 标签仍然卸载)。

```bash
launchctl kickstart -k gui/$UID/bot.molt.gateway
launchctl bootout gui/$UID/bot.molt.gateway
```

使用 `--profile` 时,将标签替换为 `bot.molt.<profile>`。

如果未安装 LaunchAgent,请从应用或运行 `openclaw gateway install` 启用它。

## 节点功能(mac)

macOS 应用将自身呈现为节点。常用命令:

- Canvas: `canvas.present`, `canvas.navigate`, `canvas.eval`, `canvas.snapshot`, `canvas.a2ui.*`
- 相机: `camera.snap`, `camera.clip`
- 屏幕: `screen.record`
- 系统: `system.run`, `system.notify`

节点报告一个 `permissions` 映射,以便 agent 可以决定允许什么。

## 节点服务 + 应用 IPC

当无头节点主机服务在 **远程** 模式下运行时,它通过 Gateway WebSocket 作为节点连接:

```
Gateway -> 节点服务 (WS)
                  |  IPC (UDS + token + HMAC + TTL)
                  v
              Mac 应用(UI + TCC + system.run)
```

- `system.run` 在 macOS 应用上下(UI/TCC)中通过本地 Unix 套接字执行,并将提示和输出保持在应用中
- 当远程模式时,macOS 应用在应用上下中执行 `system.run`

## 执行审批(system.run)

`system.run` 在 macOS 应用中受 **执行审批** 控制(设置 → 执行审批)。

安全性 + 询问 + 允许列表存储在 Mac 上:

```json
{
  "version": 1,
  "defaults": {
    "security": "deny",
    "ask": "on-miss"
  },
  "agents": {
    "main": {
      "security": "allowlist",
      "ask": "on-miss",
      "allowlist": [{ "pattern": "/opt/homebrew/bin/rg" }]
    }
  }
}
```

注意:

- `allowlist` 条目是已解析二进制路径的 glob 模式
- 在提示中选择"始终允许"会将该命令添加到允许列表
- `system.run` 环境变量被过滤(删除 `PATH`, `DYLD_*`, `LD_*`, `NODE_OPTIONS`, `PYTHON*`, `PERL*`, `RUBYOPT`)然后与应用的环境合并
- 如果没有有效的 `key`,应用会提示确认

## 深度链接

应用注册 `openclaw://` URL scheme 以进行本地操作。

### `openclaw://agent`

触发 Gateway `agent` 请求。

```bash
open 'openclaw://agent?message=Hello%20from%20deep%20link'
```

查询参数:

- `message`(必需)
- `sessionKey`(可选)
- `thinking`(可选)
- `deliver`/`to`/`channel`(可选)
- `timeoutSeconds`(可选)
- `key`(可选,无看护模式)

安全性:

- 没有 `key`,应用会提示确认
- 有效的 `key`,在无看护模式下运行(预期用于个人自动化)

## 构建和开发工作流(原生)

```bash
cd apps/macos && swift build
swift run OpenClaw
# 或使用 Xcode
```

打包应用:

```bash
scripts/package-mac-app.sh
```

## 调试 Gateway 连接性(macOS CLI)

使用调试 CLI 来练习相同的 Gateway WebSocket 握手和发现。

## 执行审批说明

`system.run` 执行受 macOS 应用中的执行审批控制。这对于安全性非常重要。

**允许列表** 指定了 `system.run` 可以执行的命令,而不需要每次都询问。

**询问模式** 控制 agent 是否应该询问批准或总是执行(仅在安全列表中):

- `on-miss`: 仅允许列表中的命令需要批准
- `ask`: 总是询问批准
- `on-miss` + 允许列表中的命令: 无需批准
- `always`: 总是执行(不推荐)

建议对于常用的开发工具(如 `rg`、`git`、`npm`)设置允许列表,并使用 `on-miss` 对于其他命令。
