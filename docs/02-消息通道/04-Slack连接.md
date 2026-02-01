---
title: "Slack 连接配置"
category: "消息通道"
difficulty: "intermediate"
estimated_time: "20 min"
tags: ["slack", "channels", "setup", "socket-mode", "http-mode"]
prerequisites:
  - Slack App Token 和 Bot Token
  - OpenClaw Gateway 已安装
related_docs:
  - "00-快速开始/04-首次连接"
  - "04-配置与运维/00-配置文件说明"
next_steps:
  - "05-GoogleChat连接"
last_updated: "2026-02-01"
source: "docs/channels/slack.md"
---

<ai-only>
**摘要**: 本文档介绍如何在 OpenClaw 中配置 Slack 通道，涵盖 Socket 模式和 HTTP webhook 模式的设置、令牌管理、DM/群组访问控制、斜杠命令配置和线程化回复。
</ai-only>

# Slack 连接配置

**状态**: Socket 模式默认启用，支持 DM + 群组/多对私聊。HTTP webhook 模式可选。

<ai-search-key>
Slack, Socket模式, HTTP webhook, App Token, Bot Token, 作用域, 事件订阅, 斜杠命令, 线程化回复, DM访问控制, 群组策略, 用户Token, 历史上下文, 媒体限制
</ai-search-key>

## Socket 模式（默认）

### 快速入门（适合新手）

1. 创建一个 Slack 应用并启用 **Socket 模式**。
2. 创建一个 **App Token**（`xapp-...`）和 **Bot Token**（`xoxb-...`）。
3. 为 OpenClaw 设置令牌并启动 gateway。
4. 将 bot 邀请到你想阅读消息的频道。
5. （可选）启用消息标签页。

**最小配置**：

```json5
{
  channels: {
      slack: {
          enabled: true,
          appToken: "xapp-...",
          botToken: "xoxb-...",
        },
  },
}
```

### 设置

1. 在 https://api.slack.com/apps 从头创建 Slack 应用（从零开始）。
2. **Socket 模式**→切换开启。然后转到**基本信息**→**应用级令牌**→**生成令牌和作用域**，并使用作用域 `connections:write` 复制 **App Token**（`xapp-...`）。
3. **OAuth & 权限**→添加 bot 令牌作用域（使用下面的清单）。点击**安装到工作区**并复制 **Bot 用户 OAuth Token**（`xoxb-...`）。
4. （可选）**OAuth & 权限**→添加 **用户令牌作用域**（见下方的只读清单）。重新安装应用并复制 **用户 OAuth Token**（`xoxp-...`）。
5. **事件订阅**→启用事件并订阅：
   - `message.*`（包含编辑/删除/线程广播）
   - `app_mention`
   - `reaction_added`、`reaction_removed`
   - `member_joined_channel`、`member_left_channel`
   - `channel_rename`
   - `pin_added`、`pin_removed`
6. 将 bot 邀请到频道。
7. **斜杠命令**→如果你使用 `channels.slack.slashCommand`，创建 `/openclaw`。如果你启用原生命令，为每个内置命令添加一个斜杠命令（与 `/help` 中的名称匹配）。原生命令默认对 Slack 关闭（全局 `commands.native` 为 `"auto"`，这会禁用 Telegram/Discord 但保持 Slack 关闭）。
8. **应用主页**→启用**消息标签页**，以便用户可以 DM bot。

**多账号支持**：使用 `channels.slack.accounts` 配合每个账号的令牌和可选的 `name`。参见[`网关配置`](/04-配置与运维/00-配置文件说明#telegramaccounts--discordaccounts--slackaccounts--signalaccounts--imessageaccounts)了解共享模式。

### OpenClaw 配置（最小）

**使用环境变量（推荐）**：

- `SLACK_APP_TOKEN=xapp-...`
- `SLACK_BOT_TOKEN=xoxb-...`

**或通过配置**：

```json5
{
  channels: {
      slack: {
          enabled: true,
          appToken: "xapp-...",
          botToken: "xoxb-...",
        },
  },
}
```

### 用户令牌（可选）

OpenClaw 可以使用 Slack 用户令牌（`xoxp-...`）进行读取操作（历史、固定、反应、表情符号、成员信息）。默认情况下，这保持只读：当用户令牌存在时优先用于读取，写入操作仍然使用 bot 令牌，除非你显式选择退出。即使使用 `userTokenReadOnly: false` 且没有 bot 令牌可用，OpenClaw 会回退到用户令牌用于写入，这意味着操作以安装用户令牌的访问权限运行。

**用户令牌在配置文件中配置（不支持环境变量）。**对于多账号配置，在 `channels.slack.accounts.<id>.userToken` 中设置。**

**使用 bot + app + 用户令牌的示例**：

```json5
{
  channels: {
      slack: {
          enabled: true,
          appToken: "xapp-...",
          botToken: "xoxb-...",
          userToken: "xoxp-...",
        },
  },
}
```

**使用 userTokenReadOnly 显式允许用户令牌写入的示例**：

```json5
{
  channels: {
      slack: {
          enabled: true,
          appToken: "xapp-...",
          botToken: "xoxb-...",
          userToken: "xoxp-...",
          userTokenReadOnly: false,
        },
  },
}
```

**令牌使用说明**：

- **读取操作**（历史、反应列表、固定列表、表情符号列表、成员信息）：如果有用户令牌则优先使用，否则使用 bot 令牌。
- **写入操作**（发送/编辑/删除消息、添加/移除反应、固定/取消固定）：默认使用 bot 令牌。如果 `userTokenReadOnly: false` 且没有 bot 令牌可用，则回退到用户令牌进行写入。
- **设置 `userTokenReadOnly: false` 允许用户令牌用于写入**当 bot 令牌不可用时。这意味着操作将以用户的身份运行（安装了用户令牌的访问权限）。将用户令牌视为高度特权，并保持操作门和白名单严格。

### 历史上下文

- `channels.slack.historyLimit`（或 `channels.slack.accounts.*.historyLimit`）控制有多少最近的频道/群组消息被包装到提示中。
- 回退到 `messages.groupChat.historyLimit`。设置为 `0` 禁用（默认 50）。

## HTTP 模式（Events API）

当你的 Gateway 可以通过 HTTPS 从 Slack 访问时使用（典型于服务器部署）。HTTP 模式使用 Events API + 交互 + 斜杠命令和共享请求 URL。

### 设置

1. 创建一个 Slack 应用并**禁用 Socket 模式**（如果你只使用 HTTP 则可选）。
2. **基本信息**→复制**签名密钥**。
3. **OAuth & 权限**→安装应用并复制 **Bot 用户 OAuth Token**（`xoxb-...`）。
4. **事件订阅**→启用事件并设置**请求 URL**到你的 gateway webhook 路径（默认 `/slack/events`）。
5. **交互 & 快捷方式**→启用并设置**相同**的**请求 URL**给你的命令。
6. **斜杠命令**→将**相同**的**请求 URL**设置给你的斜杠命令（如果你想使用 `channels.slack.slashCommand`）。

**示例请求 URL**：

`https://gateway-host/slack/events`

### OpenClaw 配置（最小）

```json5
{
  channels: {
      slack: {
          enabled: true,
          mode: "http",
          botToken: "xoxb-...",
          signingSecret: "your-signing-secret",
          webhookPath: "/slack/events",
        },
  },
}
```

**HTTP 模式的多账号**：将 `channels.slack.accounts.<id>.mode = "http"` 并为每个账号提供唯一的 `webhookPath`，以便每个 Slack 应用可以指向自己的 URL。

### 清单（可选）

使用此 Slack 应用清单快速创建应用（如果需要调整名称/命令，请执行此操作）。包含用户作用域，如果你计划配置用户令牌。

```json
{
  "display_information": {
      "name": "OpenClaw",
      "description": "Slack 连接器 for OpenClaw"
    },
  "features": {
      "bot_user": {
          "display_name": "OpenClaw",
          "always_online": false
        },
      "app_home": {
          "messages_tab_enabled": true,
          "messages_tab_read_only_enabled": false
        },
      "slash_commands": [
                {
                      "command": "/openclaw",
                      "description": "向 OpenClaw 发送消息",
                      "should_escape": false
                    }
              ]
    },
  "oauth_config": {
      "scopes": {
          "bot": [
                      "chat:write",
                      "channels:history",
                      "channels:read",
                      "groups:history",
                      "groups:read",
                      "groups:write",
                      "im:history",
                      "im:read",
                      "im:write",
                      "mpim:history",
                      "mpim:read",
                      "mpim:write",
                      "users:read",
                      "app_mentions:read",
                      "reactions:write",
                      "pins:write",
                      "emoji:read",
                      "commands",
                      "files:read",
                      "files:write"
                    ],
          "user": [
                      "channels:history",
                      "channels:read",
                      "groups:history",
                      "groups:read",
                      "im:history",
                      "im:read",
                      "mpim:history",
                      "mpim:read",
                      "users:read",
                      "reactions:read",
                      "pins:read",
                      "emoji:read",
                      "search:read"
                    ]
      },
      "settings": {
          "socket_mode_enabled": false,
          "event_subscriptions": {
                      "bot_events": [
                          "app_mention",
                          "message.channels",
                          "message.groups",
                          "message.im",
                          "message.mpim",
                          "reaction_added",
                          "reaction_removed",
                          "member_joined_channel",
                          "member_left_channel",
                          "channel_rename",
                          "pin_added",
                          "pin_removed"
                        ]
                    }
        }
  }
}
```

如果你启用原生命令，在清单中为每个你想暴露的命令添加一个 `slash_commands` 条目（匹配 `/help`）。使用 `channels.slack.commands.native: true|false|"auto"` 覆盖（全局默认 `"auto"` 会为 Slack 禁用）。

**当前作用域（可选）**

Slack 的 Conversations API 是按类型作用域的：你只需要为你实际接触的对话类型设置作用域。参见 https://docs.slack.dev/apis/web-api/using-the-conversations-api/ 了解概览。

### Bot 令牌作用域（必需）

- `chat:write`（通过 `chat.postMessage` 发送/更新/删除消息）
  - https://docs.slack.dev/reference/methods/chat.postMessage
- `im:write`（通过 `conversations.open` 打开用户 DM）
  - https://docs.slack.dev/reference/methods/conversations.open
- `channels:history`、`groups:history`、`im:history`、`mpim:history`
  - https://docs.slack.dev/reference/methods/conversations.history
- `channels:read`、`groups:read`、`im:read`、`mpim:read`
  - https://docs.slack.dev/reference/methods/conversations.info
- `users:read`（用户查找）
  - https://docs.slack.dev/reference/methods/users.info
- `reactions:read`、`reactions:write`（`reactions.get` / `reactions.add`）
  - https://docs.slack.dev/reference/methods/reactions.get
  - https://docs.slack.dev/reference/methods/reactions.add
- `pins:read`、`pins:write`（`pins.list` / `pins.add` / `pins.remove`）
  - https://docs.slack.dev/reference/scopes/pins.read
  - https://docs.slack.dev/reference/scopes/pins.write
- `emoji:read`（`emoji.list`）
  - https://docs.slack.dev/reference/scopes/emoji.read
- `files:read`、`files:write`（通过 `files.uploadV2` 上传）
  - https://docs.slack.dev/messaging/working-with-files/#upload

### 用户令牌作用域（可选，默认只读）

**如果你配置 `channels.slack.userToken`，在 Slack 应用的"用户令牌作用域"下添加这些作用域**：

- `channels:history`、`groups:history`、`im:history`、`mpim:history`
- `channels:read`、`groups:read`、`im:read`、`mpim:read`
- `users:read`
- `reactions:read`
- `pins:read`
- `emoji:read`
- `search:read`

### 现在不需要（但可能未来）

- `mpim:write`（仅当我们添加对群组 DM 打开/DM 启动支持时）
- `groups:write`（仅当我们添加私有频道管理：创建/重命名/邀请/归档）
- `chat:write.public`（仅当我们希望 bot 发送到它未加入的频道）
  - https://docs.slack.dev/reference/scopes/chat.write.public
- `files:read`（仅当我们开始列出/读取文件元数据时）
- `users:read.email`（仅当我们需要用户配置中的电子邮件字段时）
  - https://docs.slack.dev/changelog/2017-04-narrowing-email-access

## 作用域说明（当前 vs 可选）

Slack 的 Conversations API 是按类型作用域的：你只需要为你实际接触的对话类型设置作用域。

### Bot 令牌作用域（必需）

- `chat:write`（发送/更新/删除消息）
- `im:write`（打开用户 DM）
- `channels:history`、`groups:history`、`im:history`、`mpim:history`
- `channels:read`、`groups:read`、`im:read`、`mpim:read`
- `users:read`（用户查找）
- `reactions:read`、`reactions:write`（反应）
- `pins:read`、`pins:write`（固定）
- `emoji:read`（表情符号）
- `commands`（斜杠命令）
- `files:read`、`files:write`（上传）

## 配置

Slack 仅使用 Socket 模式（没有 HTTP webhook 服务器）。提供两个令牌：

```json5
{
  "slack": {
      "enabled": true,
      "botToken": "xoxb-...",
      "appToken": "xapp-...",
      "groupPolicy": "allowlist",
      "dm": {
                  "enabled": true,
                  "policy": "pairing",
                  "allowFrom": ["U123", "U456", "*"],
                  "groupEnabled": false,
                  "groupChannels": ["G123"],
                  "replyToMode": "all"
                },
      "channels": {
                  "C123": { "allow": true, "requireMention": true },
                  "#general": {
                                           "allow": true,
                                           "requireMention": true,
                                           "users": ["U123"],
                                           "skills": ["search", "docs"],
                                           "systemPrompt": "保持答案简短。"
                                         },
                },
      "reactionNotifications": "own",
      "reactionAllowlist": ["U123"],
      "replyToMode": "off",
      "actions": {
                      "reactions": true,
                      "messages": true,
                      "pins": true,
                      "memberInfo": true,
                      "emojiList": true
                    },
      "slashCommand": {
                      "enabled": true,
                      "name": "openclaw",
                      "sessionPrefix": "slack:slash",
                      "ephemeral": true
                    },
      "textChunkLimit": 4000,
      "mediaMaxMb": 20
  }
}
```

**令牌也可以通过环境变量提供**：

- `SLACK_BOT_TOKEN`
- `SLACK_APP_TOKEN`

确认反应通过 `messages.ackReaction` + `messages.ackReactionScope` 全局控制。使用 `messages.removeAckAfterReply` 在 bot 回复后清除确认反应。

- `dm.enabled`：设置为 `false` 以忽略所有 DM（默认 `true`）。
- `dm.policy`：DM 访问控制（`pairing` 推荐）。`"open"` 需要 `dm.allowFrom=["*"]`。
- `dm.allowFrom`：DM 白名单（用户 ID）。通过 `dm.policy="allowlist"` 和 `dm.policy="open"` 的验证使用。向导接受用户名并在可能时将其解析为 ID（当令牌允许时）。
- `dm.groupEnabled`：启用群组 DM（默认 `false`）。
- `dm.groupChannels`：群组 DM 频道 id 或 slug 的可选白名单。
- `dm.replyToMode`：DM 的回复模式（默认从 `replyToMode` 回退）。
- `groupPolicy`：控制频道处理（`open|disabled|allowlist`）；`allowlist` 需要频道白名单。
- `channels`：频道规则。键是频道 id 或名称。
  - `allow`：当 `groupPolicy="allowlist"` 时允许/拒绝频道。
  - `requireMention`：频道的提及闸门。
  - `tools`：可选的每个频道工具策略覆盖（当频道覆盖缺失时应用 `allow`/`deny`/`alsoAllow`）。
  - `toolsBySender`：频道内每个发送者的可选工具策略覆盖（键是发送者 id/@handles/电子邮件；支持 `"*"` 通配符）。
  - `allowBots`：在此频道中允许 bot 撰写的消息（默认：`false`）。
  - `users`：可选的每个频道用户白名单。
  - `skills`：技能过滤器（省略 = 所有技能，空 = 无）。
  - `systemPrompt`：频道的额外系统提示（与频道主题组合）。
  - `enabled`：设置为 `false` 以禁用频道。
- `reactionAllowlist`：反应白名单（用于 `reactionNotifications="allowlist"` 模式）。
- `replyToMode`：`off`（默认）、`first`、`all`。控制自动线程化。
- `slashCommand.enabled`：是否注册 `/openclaw` 斜杠命令。
- `slashCommand.name`：斜杠命令的名称（如果 `enabled=true`）。
- `slashCommand.sessionPrefix`：斜杠命令会话密钥的前缀（默认：`slack:slash`）。
- `slashCommand.ephemeral`：命令是否为临时消息（从历史中隐藏）。
- `textChunkLimit`：出站块大小（字符）。
- `mediaMaxMb`：媒体上限（MB）。

## 限制

- 出站文本被分块到 `channels.slack.textChunkLimit`（默认 4000）。
- 可选换行分块：设置 `channels.slack.chunkMode="newline"` 在长度分块之前按空行（段落边界）分割。
- 媒体上传上限为 `channels.slack.mediaMaxMb`（默认 20）。

## 线程化回复

默认情况下，OpenClaw 在主频道中回复。使用 `channels.slack.replyToMode` 控制自动线程化：

| 模式   | 行为                                                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `off`   | **默认。** 在主频道回复。只有当触发消息已在主题中时才创建线程回复。                                                                  |
| `first` | 第一个回复进入线程（在触发消息下），后续回复进入主频道。有利于保持上下文可见，同时避免线程混乱。                                              |
| `all`   | 所有回复都进入线程。保持对话包含，但可能会降低可见性。                                                                                  |

此模式既适用于自动回复，也适用于 agent 工具调用（`slack sendMessage`）。

### 按聊天类型进行线程化

你可以通过设置 `channels.slack.replyToModeByChatType` 来配置不同聊天类型的不同线程化行为：

```json5
{
  channels: {
      slack: {
          replyToMode: "off", // 频道的默认
          replyToModeByChatType: {
                        direct: "all", // DM 始终线程化
                        group: "first", // 群组 DM/MPIM 首次回复进入线程
                      },
        },
  },
}
```

**支持的聊天类型**：

- `direct`：1:1 DM（Slack `im`）
- `group`：群组 DM / MPIM（Slack `mpim`）
- `channel`：标准频道（公开/私有）

**优先级**：

1. `replyToModeByChatType.<chatType>`
2. `replyToMode`
3. 提供者默认（`off` 用于频道）

**遗留的 `channels.slack.dm.replyToMode` 仍作为 `direct` 在没有聊天类型覆盖时被接受。**

**示例**：

仅线程化 DM：

```json5
{
  channels: {
      slack: {
          replyToMode: "off",
          replyToModeByChatType: { direct: "all" },
        },
  },
}
```

线程化群组 DM 但将频道保持在根目录：

```json5
{
  channels: {
      slack: {
          replyToMode: "off",
          replyToModeByChatType: { group: "first" },
        },
  },
}
```

保持频道线程化，但将 DM 保留在根目录：

```json5
{
  channels: {
      slack: {
          replyToMode: "first",
          replyToModeByChatType: { direct: "off", group: "off" },
        },
  },
}
```

### 手动线程化标签

要进行细粒度控制，请在 agent 回复中使用这些标签：

- `[[reply_to_current]]` — 回复触发 Slack 消息（开始/继续线程）。
- `[[reply_to:<id>]]` — 回复来自上下文/历史的特定消息 id。

## 会话 + 路由

- DM 共享 `main` 会话（类似 WhatsApp/Telegram）。
- 频道映射到 `agent:<agentId>:slack:channel:<channelId>` 会话。
- 斜杠命令使用 `agent:<agentId>:slack:slash:<userId>` 会话（前缀可通过 `channels.slack.slashCommand.sessionPrefix` 配置）。
- 如果 Slack 未提供 `channel_type`，OpenClaw 通过频道 ID 前缀（`D`、`C`、`G`）进行推断，并默认为 `channel` 以保持会话密钥稳定。
- 原生命令注册使用 `commands.native`（全局默认 `"auto"` → Slack 关闭），并可以通过每个工作空间使用 `channels.slack.commands.native` 覆盖。文本命令需要独立的 `/...` 消息，并且可以使用 `commands.text: false` 禁用。Slack 斜杠命令在 Slack 应用中管理，OpenClaw 不会自动删除它们。使用 `commands.useAccessGroups: false` 绕过命令的访问组检查。
- 完整命令列表 + 配置：[斜杠命令](/06-工具与功能/01-斜杠命令)。

## DM 安全（配对）

- 默认：`channels.slack.dm.policy="pairing"` —— 未知发送者收到配对码；在被批准前消息被忽略（1 小时后过期）。
- 批准方式：
  - `openclaw pairing list slack`
  - `openclaw pairing approve slack <CODE>`
- 要允许任何人：设置 `channels.slack.dm.policy="open"` 和 `channels.slack.dm.allowFrom=["*"]`。
- `channels.slack.dm.allowFrom` 接受用户 ID、@handles 或电子邮件（在令牌允许时在启动时被解析）。向导接受用户名并在可能时将其解析为 ID。
- 配对是 Slack DM 使用的默认令牌交换机制。详情：[配对](/00-快速开始/05-常见问题FAQ#配对)。

## 群组策略

- `channels.slack.groupPolicy` 控制频道处理（`open|disabled|allowlist`）。
- `allowlist` 需要将频道列在 `channels.slack.channels` 中。
- 如果你仅设置 `SLACK_BOT_TOKEN`/`SLACK_APP_TOKEN` 且从未创建 `channels.slack` 部分，运行时默认 `groupPolicy` 为 `open`。添加 `channels.slack.groupPolicy`、`channels.defaults.groupPolicy` 或频道白名单以锁定它。
- 配置向导接受 `#channel` 名称并在可能时将其解析为 ID（公开 + 私有）；如果存在多个匹配项，它倾向于活动频道。
- 在启动时，当令牌允许时，OpenClaw 将白名单中的频道/用户名解析为 ID（并记录映射）；未解析的条目保持为输入形式。
- 要允许**无频道**，设置 `channels.slack.groupPolicy: "disabled"`（或保留空白的白名单）。
- 要允许**所有频道**，在白名单中设置 `"*"` 条目。

**频道选项（`channels.slack.channels.<id>` 或 `channels.slack.channels.<name>`）**：

- `allow`：当 `groupPolicy="allowlist"` 时允许/拒绝频道。
- `requireMention`：频道的提及闸门。
- `tools`：可选的每个频道工具策略覆盖（当频道覆盖缺失时应用 `allow`/`deny`/`alsoAllow`）。
- `toolsBySender`：频道内每个发送者的可选工具策略覆盖（键是发送者 id/@handles/电子邮件；支持 `"*"` 通配符）。
- `allowBots`：在此频道中允许 bot 撰写的消息（默认：`false`）。
- `users`：可选的每个频道用户白名单。
- `skills`：技能过滤器（省略 = 所有技能，空 = 无）。
- `systemPrompt`：频道的额外系统提示（与频道主题组合）。
- `enabled`：设置为 `false` 以禁用频道。

**提及闸门说明**：

- 闸门通过 `channels.slack.channels` 上的 `requireMention`（设置或从 `agents.list[].groupChat.mentionPatterns` / `messages.groupChat.mentionPatterns`）控制。
- 多 Agent 覆盖：在 `agents.list[].groupChat.mentionPatterns` 上设置每个 agent 模式。
- Bot 撰写的消息默认被忽略；通过 `channels.slack.allowBots` 或 `channels.slack.channels.<id>.allowBots=true` 来启用它们。
- **警告**：如果你允许对其他 bot 的回复（`channels.slack.allowBots=true` 或 `channels.slack.channels.<id>.allowBots=true`），请通过 `requireMention`、`channels.slack.channels.<id>.users` 白名单和/或在 `AGENTS.md` 和 `SOUL.md` 中清除护栏来防止 bot 对 bot 的回复循环。

## 投递目标

使用这些标识符进行 cron/CLI 发送：

- `user:<id>` 用于 DM。
- `channel:<id>` 用于频道。

## 工具动作

Slack 工具动作可以通过 `channels.slack.actions.*` 进行闸门：

| 操作组        | 默认  | 说明                  |
| -------------- | ------- | ---------------------- |
| reactions        | 已启用  | 反应 + 列出反应        |
| messages         | 已启用  | 读取/发送/编辑/删除  |
| pins             | 已启用  | 固定/取消固定/列出          |
| memberInfo       | 已启用  | 成员信息                        |
| emojiList        | 已启用  | 自定义表情符号列表              |

**省略操作以允许所有**（设置为 `false` 以禁用）。

**Slack 工具（仅反应移除）**：反应移除语义参见[/工具/反应](/06-工具与功能/02-消息工具#反应)。

## 安全说明

- 写入默认使用 bot 令牌，因此状态更改操作保持在与应用的 bot 权限和身份一致的范围。
- 设置 `userTokenReadOnly: false` 允许在 bot 令牌不可用时使用用户令牌进行写入，这意味着操作将以用户的身份运行（安装了用户令牌的访问权限）。将用户令牌视为高度特权，并保持操作门和白名单严格。
- 如果你启用用户令牌写入，请确保用户令牌包含你期望的写入作用域（`chat:write`、`reactions:write`、`pins:write`、`files:write`）或这些操作将会失败。

## 注意事项

- 闸门通过 `channels.slack.channels` 上的 `requireMention` 进行控制（设置 `requireMention: true`）；`agents.list[].groupChat.mentionPatterns`（或 `messages.groupChat.mentionPatterns`）也算作提及。
- 多 Agent 覆盖：在 `agents.list[].groupChat.mentionPatterns` 上设置每个 agent 模式。
- 反应通知遵循 `channels.slack.reactionNotifications`（通过 `reactionAllowlist` 使用 `allowlist` 模式）。
- Bot 撰写的消息默认被忽略；通过 `channels.slack.allowBots` 或 `channels.slack.channels.<id>.allowBots=true` 来启用它们。
- **警告**：如果你允许对其他 bot 的回复（`channels.slack.allowBots=true` 或 `channels.slack.channels.<id>.allowBots=true`），请通过 `requireMention`、`channels.slack.channels.<id>.users` 白名单和/或在 `AGENTS.md` 和 `SOUL.md` 中清除护栏来防止 bot 对 bot 的回复循环。
- 对于 Slack 工具，反应移除语义在[/工具/反应](/06-工具与功能/02-消息工具#反应)。
- 附件在被允许时被下载到媒体存储并受大小限制。
