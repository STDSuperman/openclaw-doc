---
title: "iMessage 连接配置"
category: "消息通道"
difficulty: "advanced"
estimated_time: "30 min"
tags: ["imessage", "channels", "setup", "macos", "remote", "tunnel"]
prerequisites:
  - macOS 设备，已登录 Messages 应用
  - imsg CLI 工具已安装
  - OpenClaw Gateway 已安装
related_docs:
  - "00-快速开始/04-首次连接"
  - "04-配置与运维/00-配置文件说明"
next_steps:
  - "07-WebChat连接"
last_updated: "2026-02-01"
source: "docs/channels/imessage.md"
---

<ai-only>
**摘要**: 本文档介绍如何在 OpenClaw 中配置 iMessage 通道，包括 imsg CLI 工具设置、远程/SSH 变体、DM/群组访问控制、媒体限制和故障排查。
</ai-only>

# iMessage 连接配置（imsg）

**状态**: 外部 CLI 集成。Gateway 衍生 `imsg rpc`（stdio 上的 JSON-RPC）。

<ai-search-key>
iMessage, imsg CLI, JSON-RPC, stdio, 远程登录, 自动化权限, 磁盘访问, DM访问控制, 群组策略, 媒体限制, 群类线程
</ai-search-key>

## 快速入门（适合新手）

1. 确保此 Mac 上的 Messages 已登录。
2. 安装 `imsg`：
   - `brew install steipete/tap/imsg`
3. 配置 OpenClaw 的 `channels.imessage.cliPath` 和 `channels.imessage.dbPath`。
4. 启动 gateway 并批准任何 macOS 提示（自动化 + 完整磁盘访问）。

**最小配置**：

```json5
{
  channels: {
      imessage: {
          enabled: true,
          cliPath: "/usr/local/bin/imsg",
          dbPath: "/Users/<you>/Library/Messages/chat.db",
        },
  },
}
```

## 核心概念

- 通过 macOS 上的 `imsg` 支持的 iMessage 通道。
- 确定性路由：回复始终返回 iMessage。
- DM 共享 agent 的主会话；群组保持隔离（`agent:<agentId>:imessage:group:<chat_id>`）。
- 如果带有 `is_group=false` 的多参与者线程到达，你仍可以通过 `channels.imessage.groups`（见下方的"类群组线程"）使用 `chat_id` 将其隔离。

## 配置写入

默认情况下，iMessage 被允许通过 `/config set|unset` 触发配置更新（需要 `commands.config: true`）。

**禁用**：

```json5
{
  channels: { imessage: { configWrites: false } },
}
```

## 要求

- 运行 OpenClaw Gateway 的 macOS，且 Messages 已登录。
- iMessage 的完整磁盘访问，为 OpenClaw + `imsg`（Messages DB 访问）。
- 发送时的自动化权限。
- `channels.imessage.cliPath` 可以指向任何代理 stdin/stdout 的命令（例如，一个包装脚本，通过 SSH SSH 到另一台 Mac 并运行 `imsg rpc`）。

## 设置（快速路径）

1. 确保此 Mac 上的 Messages 已登录。
2. 配置 iMessage 并启动 gateway。

### 专用 bot macOS 用户（隔离标识）

如果你希望 bot 从**独立的 iMessage 身份**发送（并保持你的个人 Messages 整洁），使用专用的 Apple ID + 专用的 macOS 用户。

1. 创建一个专用的 Apple ID（例如，`my-cool-bot@icloud.com`）。
   - Apple 可能需要电话号码进行验证 / 2FA。
2. 创建一个 macOS 用户（例如，`openclawbot`）并使用该 bot Apple ID 登录到 iMessage。
3. 在该 macOS 用户中打开 Messages，并使用 bot Apple ID 登录到 iMessage。
4. 启用远程登录（系统设置 → 通用 → 共享 → 远程登录）。
5. 安装 `imsg`：
   - `brew install steipete/tap/imsg`
6. 设置 SSH，以便 `ssh <bot-macos-user>@localhost true` 可以无需密码工作。
7. 将 `channels.imessage.accounts.bot.cliPath` 指向运行 `imsg` 作为 bot 用户的 SSH 包装器。

**首次运行说明**：发送/接收时可能需要 GUI 批准（_bot macOS 用户_的自动化 + 完整磁盘访问）。如果 `imsg rpc` 看起来卡住或退出，登录到该用户（屏幕共享有帮助），运行一次 `imsg chats --limit 1` / `imsg send ...`，批准提示，然后重试。

**示例包装器（`chmod +x`）。将 `<bot-macos-user>` 替换为你的实际 macOS 用户名：

```bash
#!/usr/bin/env bash
set -euo pipefail

# 运行一次交互式 SSH 以接受主机密钥：
#   ssh <bot-macos-user>@localhost true
exec /usr/bin/ssh -o BatchMode=yes -o ConnectTimeout=5 -T <bot-macos-user>@localhost \
      "/usr/local/bin/imsg" "$@"
```

**示例配置**：

```json5
{
  channels: {
      imessage: {
          enabled: true,
          accounts: {
                  bot: {
                              name: "Bot",
                              enabled: true,
                              cliPath: "/path/to/imsg-bot",
                              dbPath: "/Users/<bot-macos-user>/Library/Messages/chat.db",
                            },
                },
        },
  },
}
```

对于单账号设置，使用平铺选项（`channels.imessage.cliPath`、`channels.imessage.dbPath`）代替 `accounts` 映射。

### 远程/SSH 变体（可选）

如果你希望在另一台 Mac 上使用 iMessage，将 `channels.imessage.cliPath` 指向通过 SSH 在远程 macOS 主机上运行 `imsg` 的包装器。OpenClaw 仅需要 stdio。

**示例包装器**：

```bash
#!/usr/bin/env bash
exec ssh -T gateway-host imsg "$@"
```

**远程附件**：当 `cliPath` 通过 SSH 指向远程 Mac 主机时，Messages 数据库中的附件路径引用的是远程机器上的文件。OpenClaw 可以通过设置 `channels.imessage.remoteHost` 自动通过 SCP 获取这些文件：

```json5
{
  channels: {
      imessage: {
          cliPath: "~/imsg-ssh", // 指向远程 Mac 的 SSH 包装器
          remoteHost: "user@gateway-host", // 用于 SCP 文件传输
          includeAttachments: true,
        },
  },
}
```

如果未设置 `remoteHost`，OpenClaw 会尝试通过解析你的包装器脚本中的 SSH 命令来自动检测它。为可靠性起见，建议显式配置。

#### 通过 Tailscale（示例）的远程 Mac

如果你希望 Gateway 在 Linux 主机/VM 上运行，但 iMessage 必须在 Mac 上运行，Tailscale 是最简单的桥梁：Gateway 通过 tailnet 与 Mac 通信，通过 SSH 运行 `imsg`，并 SCP 传回附件。

**架构**：

```
┌──────────────────────────────┐          SSH (imsg rpc)          ┌──────────────────────────┐
│ Gateway 主机 (Linux/VM)      │──────────────────────────────────▶│ Mac 携带 Messages + imsg │
│ - openclaw gateway           │          SCP (附件)        │ - Messages 已登录     │
│ - channels.imessage.cliPath  │◀──────────────────────────────────│ - 远程登录已启用   │
└──────────────────────────────┘                                   └──────────────────────────┘
              ▲
               │ Tailscale tailnet (主机名或 100.x.y.z)
               ▼
         user@gateway-host
```

**Tailscale 主机名（示例）的具体配置**：

```json5
{
  channels: {
      imessage: {
          enabled: true,
          cliPath: "~/.openclaw/scripts/imsg-ssh",
          remoteHost: "bot@mac-mini.tailnet-1234.ts.net",
          includeAttachments: true,
          dbPath: "/Users/bot/Library/Messages/chat.db",
        },
  },
}
```

**示例包装器（`~/.openclaw/scripts/imsg-ssh`）**：

```bash
#!/usr/bin/env bash
exec ssh -T bot@mac-mini.tailnet-1234.ts.net imsg "$@"
```

**说明**：

- 确保 Mac 已登录到 Messages，并启用了远程登录。
- 使用 SSH 密钥，使 `ssh bot@mac-mini.tailnet-1234.ts.net` 无需密码工作。
- `remoteHost` 应与 SSH 目标匹配，以便 SCP 可以获取附件。
- 确保 `includeAttachments: true` 已设置。

**多账号支持**：使用 `channels.imessage.accounts` 配合每个账号的配置和可选的 `name`。参见[`网关配置`](/04-配置与运维/00-配置文件说明#telegramaccounts--discordaccounts--slackaccounts--signalaccounts--imessageaccounts)了解共享模式。**请勿提交 `~/.openclaw/openclaw.json`（它通常包含令牌）。

## 访问控制（DM + 群组）

### DM

- 默认：`channels.imessage.dmPolicy = "pairing"`。
- 未知发送者收到配对码；在被批准前消息被忽略（1 小时后过期）。
- 批准方式：
  - `openclaw pairing list imessage`
  - `openclaw pairing approve imessage <CODE>`
- 配对是 iMessage DM 使用的默认令牌交换机制。详情：[配对](/00-快速开始/05-常见问题FAQ#配对)。

### 群组

- `channels.imessage.groupPolicy = open | allowlist | disabled`。
- `channels.imessage.groupAllowFrom` 控制在 `allowlist` 模式下群组中谁可以触发。
- 提及闸门使用 `agents.list[].groupChat.mentionPatterns`（或 `messages.groupChat.mentionPatterns`），因为 iMessage 没有原生提及元数据。
- 多 Agent 覆盖：在 `agents.list[].groupChat.mentionPatterns` 上设置每个 agent 模式。

## 工作原理（行为）

- `imsg` 流式传输消息事件；gateway 将其规范化为共享通道信封。
- 回复始终路由回相同的聊天 id 或句柄。

## 类群组线程（`is_group=false`）

某些 iMessage 线程可能有多个参与者，但仍以 `is_group=false` 到达，这取决于 Messages 如何存储聊天标识符。

如果你在 `channels.imessage.groups` 下明确配置 `chat_id`，OpenClaw 会将该线程视为一个"群组"，用于：

- 会话隔离（分离的 `agent:<agentId>:imessage:group:<chat_id>` 会话密钥）
- 群组白名单/提及闸门行为

**示例**：

```json5
{
  channels: {
      imessage: {
          groupPolicy: "allowlist",
          groupAllowFrom: ["+15555550123"],
          groups: {
                      "42": { requireMention: false },
                    },
        },
  },
}
```

这在你想要为特定线程使用隔离 personality/model 时非常有用（参见[多 Agent 路由](/03-核心概念/02-会话模型)）。对于文件系统隔离，参见[沙盒化](/04-配置与运维/07-安全配置)。

## 媒体 + 限制

- 可选的附件接收，通过 `channels.imessage.includeAttachments` 启用。
- 媒体上限通过 `channels.imessage.mediaMaxMb` 控制。

## 限制

- 出站文本被分块到 `channels.imessage.textChunkLimit`（默认 4000）。
- 可选换行分块：设置 `channels.imessage.chunkMode="newline"` 在长度分块之前按空行（段落边界）分割。
- 媒体上传上限为 `channels.imessage.mediaMaxMb`（默认 16）。

## 寻址/投递目标

优先使用 `chat_id` 以实现稳定路由：

- `chat_id:123`（首选）
- `chat_guid:...`
- `chat_identifier:...`
- 直接句柄：`imessage:+1555` / `sms:+1555` / `user@example.com`

**列出聊天**：

```
imsg chats --limit 20
```

## 配置参考（iMessage）

完整配置：[配置](/04-配置与运维/00-配置文件说明)

提供者选项：

- `channels.imessage.enabled`：启用/禁用通道启动。
- `channels.imessage.cliPath`：`imsg` 的路径。
- `channels.imessage.dbPath`：Messages DB 路径。
- `channels.imessage.remoteHost`：用于 SCP 附件传输的 SSH 主机（当 `cliPath` 指向远程 Mac 时；如果未设置，则从 SSH 包装器解析命令自动检测）。
- `channels.imessage.service`：`imessage` | `sms` | `auto`。
- `channels.imessage.region`：短信区域。
- `channels.imessage.dmPolicy`：`pairing | allowlist | open | disabled`（默认：pairing）。
- `channels.imessage.allowFrom`：DM 白名单（句柄、电子邮件、E.164 号码或 `chat_id:*`）。`open` 需要 `"*"`。iMessage 没有用户名；使用句柄或聊天目标。
- `channels.imessage.groupPolicy`：`open | allowlist | disabled`（默认：allowlist）。
- `channels.imessage.groupAllowFrom`：群组发送者白名单。
- `channels.imessage.historyLimit` / `channels.imessage.accounts.*.historyLimit`：最大群组消息数量以包含在上下文中（0 禁用）。
- `channels.imessage.dmHistoryLimit`：DM 历史限制，用户轮次。每个用户覆盖：`channels.imessage.dms["<handle>"].historyLimit`。
- `channels.imessage.groups`：每个群组的默认 + 白名单（使用 `"*"` 获取全局默认）。
- `channels.imessage.includeAttachments`：将附件提取到上下文。
- `channels.imessage.mediaMaxMb`：入站/出站媒体上限（MB）。
- `channels.imessage.textChunkLimit`：出站块大小（字符）。
- `channels.imessage.chunkMode`：`length`（默认）或在长度分块之前按空行（段落边界）分割的 `newline`。

相关全局选项：

- `agents.list[].groupChat.mentionPatterns`（或 `messages.groupChat.mentionPatterns`）。
- `messages.responsePrefix`。
