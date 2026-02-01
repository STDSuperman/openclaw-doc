---
title: "Signal 连接配置"
category: "消息通道"
difficulty: "intermediate"
estimated_time: "20 min"
tags: ["signal", "channels", "setup", "signal-cli", "http-json-rpc"]
prerequisites:
  - Signal 号码（推荐独立号码）
  - signal-cli 工具已安装
  - Java 运行环境
  - OpenClaw Gateway 已安装
related_docs:
  - "00-快速开始/04-首次连接"
  - "04-配置与运维/00-配置文件说明"
next_steps:
  - "08-平台对比与选择"
last_updated: "2026-02-01"
source: "docs/channels/signal.md"
---

<ai-only>
**摘要**: 本文档介绍如何在 OpenClaw 中配置 Signal 通道，包括 signal-cli 设置、多账号支持、外部守护进程模式、DM/群组访问控制、反应支持和故障排查。
</ai-only>

# Signal 连接配置（signal-cli）

**状态**: 外部 CLI 集成。Gateway 通过 HTTP JSON-RPC + SSE 与 `signal-cli` 通信。

<ai-search-key>
Signal, signal-cli, JSON-RPC, SSE, 守护进程模式, HTTP URL, 配对, 群组策略, 已读回执, 消息反应, 媒体附件, 分块限制
</ai-search-key>

## 快速入门（适合新手）

1. 使用**独立的 Signal 号码**（推荐）。
2. 安装 `signal-cli`（需要 Java）。
3. 关联 bot 设备并启动守护进程：
   - `signal-cli link -n "OpenClaw"`
   - 然后在 Signal 中扫描二维码。
4. 配置 OpenClaw 并启动 gateway。

**最小配置**：

```json5
{
  channels: {
      signal: {
          enabled: true,
          account: "+15551234567",
          cliPath: "signal-cli",
          dmPolicy: "pairing",
          allowFrom: ["+15557654321"],
        },
  },
}
```

## 核心概念

- 通过 `signal-cli`（非嵌入式 libsignal）的 Signal 通道。
- 确定性路由：回复始终返回 Signal。
- DM 共享 agent 的主会话；群组保持隔离（`agent:<agentId>:signal:group:<groupId>`）。

## 配置写入

默认情况下，Signal 被允许通过 `/config set|unset` 触发配置更新（需要 `commands.config: true`）。

**禁用**：

```json5
{
  channels: { signal: { configWrites: false } },
}
```

## 号码模型（重要）

- gateway 连接到一个 **Signal 设备**（`signal-cli` 账号）。
- 如果你在**你个人的 Signal 账号**上运行 bot，它将忽略你自己的消息（循环保护）。
- 对于"我给 bot 发消息它回复"的用例，使用**独立的 bot 号码**。

## 设置（快速路径）

1. 安装 `signal-cli`（需要 Java）。
2. 关联一个 bot 账号：
   - `signal-cli link -n "OpenClaw"`
   - 然后在 Signal 中扫描二维码。
3. 配置 Signal 并启动 gateway。

**示例**：

```json5
{
  channels: {
      signal: {
          enabled: true,
          account: "+15551234567",
          cliPath: "signal-cli",
          dmPolicy: "pairing",
          allowFrom: ["+15557654321"],
        },
  },
}
```

**多账号支持**：使用 `channels.signal.accounts` 配合每个账号的配置和可选的 `name`。参见[`网关配置`](/04-配置与运维/00-配置文件说明#telegramaccounts--discordaccounts--slackaccounts--signalaccounts--imessageaccounts)了解共享模式。

## 外部守护进程模式（httpUrl）

如果你想自己管理 `signal-cli`（JVM 冷启动慢、容器初始化或共享 CPU），可以单独运行守护进程，并将 OpenClaw 指向它：

```json5
{
  channels: {
      signal: {
          httpUrl: "http://127.0.0.1:8080",
          autoStart: false,
        },
  },
}
```

这会跳过 OpenClaw 内的自动衍生并等待内部启动。如果 `httpUrl` 未设置，OpenClaw 会默认衍生它。对于因自动衍生而导致的慢启动，设置 `channels.signal.startupTimeoutMs`（上限 120000ms）。

## 访问控制（DM + 群组）

### DM

- 默认：`channels.signal.dmPolicy = "pairing"`。
- 未知发送者收到配对码；在被批准前消息被忽略（1 小时后过期）。
- 批准方式：
  - `openclaw pairing list signal`
  - `openclaw pairing approve signal <CODE>`
- 配对是 Signal DM 使用的默认令牌交换机制。详情：[配对](/00-快速开始/05-常见问题FAQ#配对)。
- 仅 UUID 发送者（来自 `sourceUuid`）被存储为 `uuid:<id>` 在 `channels.signal.allowFrom` 中。

### 群组

- `channels.signal.groupPolicy = open | allowlist | disabled`。
- `channels.signal.groupAllowFrom` 控制在 `allowlist` 模式下群组中谁可以触发。

## 工作原理（行为）

- `signal-cli` 作为守护进程运行；gateway 通过 SSE 读取事件。
- 入站消息被规范化为共享通道信封。
- 回复始终路由回相同的号码或群组。

## 媒体 + 限制

- 出站文本被分块到 `channels.signal.textChunkLimit`（默认 4000）。
- 可选换行分块：设置 `channels.signal.chunkMode="newline"` 在长度分块之前按空行（段落边界）分割。
- 支持附件（通过 `signal-cli` 以 base64 获取）。
- 默认媒体上限：`channels.signal.mediaMaxMb`（默认 8）。
- 使用 `channels.signal.ignoreAttachments` 跳过附件下载。
- 群组历史上下文使用 `channels.signal.historyLimit`（或 `channels.signal.accounts.*.historyLimit`），回退到 `messages.groupChat.historyLimit`。设置为 `0` 禁用（默认 50）。

## 输入指示符 + 已读回执

**输入指示符**：

- OpenClaw 在回复生成时通过 `signal-cli sendTyping` 发送输入指示符，并在回复运行时刷新它们。

**已读回执**：

- 当 `channels.signal.sendReadReceipts` 为 true 时，OpenClaw 为允许的 DM 转发已读回执。
- `signal-cli` 不会为群组暴露已读回执。

## 反应（消息工具）

- 使用 `message action=react` 配合 `channel=signal`。
- 目标：发送者 E.164 或 UUID（对来自 `sourceUuid` 的配对输出使用 `uuid:<id>`；仅 UUID 也有效）。
- `messageId` 是 Signal 消息的时间戳，即你正在反应的消息。
- 群组反应需要 `targetAuthor` 或 `targetAuthorUuid`。

**示例**：

```
message action=react channel=signal target=uuid:123e4567-e89b-12d3-a456-426614174000 messageId=1737630212345 emoji=🔥
message action=react channel=signal target=+15551234567 messageId=1737630212345 emoji=🔥 remove=true
message action=react channel=signal target=signal:group:<groupId> targetAuthor=uuid:<sender-uuid> messageId=1737630212345 emoji=✅
```

**配置**：

- `channels.signal.actions.reactions`：启用/禁用反应动作（默认 true）。
- `channels.signal.reactionLevel`：`off | ack | minimal | extensive`。
  - `off`/`ack` 禁用 agent 反应（`message action=react` 将错误）。
  - `minimal`/`extensive` 启用 agent 反应并设置指南级别。
  - 每个账号覆盖：`channels.signal.accounts.<id>.actions.reactions`、`channels.signal.accounts.<id>.reactionLevel`。

## 投递目标（CLI/cron）

- DM：`signal:+15551234567`（或纯 E.164）。
- UUID DM：`uuid:<id>`（或纯 UUID）。
- 群组：`signal:group:<groupId>`。
- 用户名：`username:<name>`（如果你的 Signal 账号支持）。

## 配置参考（Signal）

完整配置：[配置](/04-配置与运维/00-配置文件说明)

提供者选项：

- `channels.signal.enabled`：启用/禁用通道启动。
- `channels.signal.account`：bot 账号的 E.164。
- `channels.signal.cliPath`：`signal-cli` 的路径。
- `channels.signal.httpUrl`：完整守护进程 URL（覆盖 host/port）。
- `channels.signal.httpHost`、`channels.signal.httpPort`：守护进程绑定（默认 127.0.0.1:8080）。
- `channels.signal.autoStart`：自动衍生守护进程（默认当 `httpUrl` 设置时为 true）。
- `channels.signal.startupTimeoutMs`：启动等待超时（毫秒），上限 120000。
- `channels.signal.receiveMode`：`on-start | manual`。
- `channels.signal.ignoreAttachments`：跳过附件下载。
- `channels.signal.ignoreStories`：忽略动态消息。
- `channels.signal.sendReadReceipts`：为允许的 DM 转发已读回执。
- `channels.signal.dmPolicy`：`pairing | allowlist | open | disabled`（默认：pairing）。
- `channels.signal.allowFrom`：DM 白名单（E.164 或 `uuid:<id>`）。`open` 需要 `"*"`。Signal 没有用户名；使用电话/UUID ids。
- `channels.signal.groupPolicy`：`open | allowlist | disabled`（默认：allowlist）。
- `channels.signal.groupAllowFrom`：群组发送者白名单。
- `channels.signal.historyLimit`：最大群组消息数量以包含在上下文中（0 禁用）。
- `channels.signal.dmHistoryLimit`：DM 历史限制，用户轮次。每个用户覆盖：`channels.signal.dms["<phone_or_uuid>"].historyLimit`。
- `channels.signal.textChunkLimit`：出站块大小（字符）。
- `channels.signal.chunkMode`：`length`（默认）或在长度分块之前按空行（段落边界）分割的 `newline`。
- `channels.signal.mediaMaxMb`：入站/出站媒体上限（MB）。

相关全局选项：

- `agents.list[].groupChat.mentionPatterns`（Signal 不支持原生提及）。
- `messages.groupChat.mentionPatterns`（全局回退）。
- `messages.responsePrefix`。
