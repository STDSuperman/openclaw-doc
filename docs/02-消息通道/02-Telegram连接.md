---
title: "Telegram 连接配置"
category: "消息通道"
difficulty: "beginner"
estimated_time: "20 min"
tags: ["telegram", "channels", "setup", "bot-api"]
prerequisites:
  - Telegram Bot Token (从 BotFather 获取)
  - OpenClaw Gateway 已安装
related_docs:
  - "00-快速开始/04-首次连接"
  - "04-配置与运维/00-配置文件说明"
next_steps:
  - "03-Discord连接"
last_updated: "2026-02-01"
source: "docs/channels/telegram.md"
---

<ai-only>
**摘要**: 本文档介绍如何在 OpenClaw 中配置 Telegram Bot API 通道，涵盖 Bot 创建、Token 配置、DM/群组访问控制、权限设置、草稿流式传输、贴纸支持和故障排查。
</ai-only>

# Telegram 连接配置（Bot API）

**状态**: 已就绪，支持通过 grammY 的 Bot DM + 群组。默认使用长轮询；webhook 可选。

<ai-search-key>
Telegram, Bot API, BotFather, Bot Token, 长轮询, webhook, 隐私模式, 群组访问控制, 草稿流式传输, 贴纸缓存, 表情符号, 内联按钮, 线程模式, 音频消息
</ai-search-key>

## 快速入门（适合新手）

1. 与 **@BotFather** 创建 bot 并复制 token。
2. 设置 token：
   - 环境变量：`TELEGRAM_BOT_TOKEN=...`
   - 或配置：`channels.telegram.botToken: "..."`。
   - 如果两者都设置了，配置优先（环境变量是默认账号的备选方案）。
3. 启动 gateway。
4. DM 访问默认为配对；首次联系时批准配对码。

**最小配置**：

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "123:abc",
      dmPolicy: "pairing",
    },
  },
}
```

## 核心概念

- 由 Gateway 管理的 Telegram Bot API 通道。
- 确定性路由：回复始终返回 Telegram；模型从不选择通道。
- DM 共享 agent 的主会话；群组保持隔离（`agent:<agentId>:telegram:group:<chatId>`）。

## 快速设置

### 1) 创建 Bot Token（BotFather）

1. 打开 Telegram 并与 **@BotFather** 聊天。
2. 运行 `/newbot`，然后按照提示操作（名称 + 以 `bot` 结尾的用户名）。
3. 复制 token 并安全存储。

**BotFather 可选设置**：

- `/setjoingroups` —— 允许/拒绝将 bot 添加到群组。
- `/setprivacy` —— 控制 bot 是否看到所有群组消息。

### 2) 配置 Token（环境变量或配置文件）

**示例**：

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "123:abc",
      dmPolicy: "pairing",
      groups: { "*": { requireMention: true } },
    },
  },
}
```

**环境变量选项**：`TELEGRAM_BOT_TOKEN=...`（适用于默认账号）。
如果同时设置了环境变量和配置，配置优先。

**多账号支持**：使用 `channels.telegram.accounts` 配合每个账号的 token 和可选的 `name`。参见[`网关配置`](/04-配置与运维/00-配置文件说明#telegramaccounts--discordaccounts--slackaccounts--signalaccounts--imessageaccounts)了解共享模式。

3. 启动 gateway。当解析出 token（配置优先，环境变量回退）时，Telegram 启动。
4. DM 访问默认为配对。首次联系 bot 时批准代码。
5. 对于群组：将 bot 添加到群组，决定隐私/管理行为（见下文），然后设置 `channels.telegram.groups` 以控制提及闸门 + 白名单。

## Token + 隐私 + 权限（Telegram 侧）

### Token 创建（BotFather）

- `/newbot` 创建 bot 并返回 token（请保密）。
- 如果 token 泄露，通过 @BotFather 撤销/重新生成并更新配置。

### 群组消息可见性（隐私模式）

Telegram Bot 默认使用**隐私模式**，限制了它们接收哪些群组消息。
如果 bot 必须看到_所有_群组消息，你有两个选项：

- 使用 `/setprivacy` **禁用隐私模式**或
- 将 bot 添加为群组**管理员**（管理员 bot 接收所有消息）

**注意**：切换隐私模式时，Telegram 要求将 bot 从每个群组中移除并重新添加，以使更改生效。

### 群组权限（管理员权限）

管理员状态在群组内（Telegram UI）设置。管理员 bot 始终接收所有群组消息，因此需要完全可见性时请使用管理员。

## 工作原理（行为）

- 入站消息被规范化为带有回复上下文和媒体占位符的共享通道信封。
- 群组回复默认需要提及（本地 @提及或 `agents.list[].groupChat.mentionPatterns` / `messages.groupChat.mentionPatterns`）。
- 多 Agent 覆盖：在 `agents.list[].groupChat.mentionPatterns` 上设置每个 agent 模式。
- 回复始终路由回同一 Telegram 聊天。
- 长轮询使用 grammY 运行器配合每聊排序；整体并发上限为 `agents.defaults.maxConcurrent`。
- Telegram Bot API 不支持已读回执；没有 `sendReadReceipts` 选项。

## 草稿流式传输

OpenClaw 可以使用 `sendMessageDraft` 在 Telegram DM 中流式传输部分回复。

**要求**：

- Bot 在 @BotFather 中启用了**线程模式**（论坛主题模式）。
- 仅私密聊天线程（Telegram 在入站消息中包含 `message_thread_id`）。
- `channels.telegram.streamMode` 未设置为 `"off"`（默认：`"partial"`，`"block"` 启用分块草稿更新）。

草稿流式传输仅适用于 DM；Telegram 不在群组或频道中支持它。

## 格式化（Telegram HTML）

- 出站 Telegram 文本使用 `parse_mode: "HTML"`（Telegram 支持的标签子集）。
- 类 Markdown 输入被渲染为 **Telegram 安全的 HTML**（粗体/斜体/删除线/代码/链接）；块元素被展平为带有换行符/项目符号的文本。
- 来自模型的原始 HTML 被转义以避免 Telegram 解析错误。
- 如果 Telegram 拒绝 HTML 载荷，OpenClaw 将同一消息作为纯文本重试。

## 命令（原生 + 自定义）

OpenClaw 在启动时使用 Telegram 的 bot 菜单注册原生命令（如 `/status`、`/reset`、`/model`）。
你可以通过配置添加自定义命令到菜單：

```json5
{
  channels: {
    telegram: {
          customCommands: [
                { command: "backup", description: "Git 备份" },
                { command: "generate", description: "创建图像" },
              ],
        },
  },
}
```

## 故障排查

- 日志中的 `setMyCommands failed` 通常意味着到 `api.telegram.org` 的出站 HTTPS/DNS 被阻塞。
- 如果看到 `sendMessage` 或 `sendChatAction` 失败，检查 IPv6 路由和 DNS。

更多帮助：[通道故障排查](/02-消息通道/08-平台对比与选择#故障排查)。

**注意**：

- 自定义命令**仅是菜單条目**；除非你在其他地方处理，否则 OpenClaw 不实现它们。
- 命令名称被规范化（去除前导的 `/`，小写）并且必须匹配 `a-z`、`0-9`、`_`（1–32 个字符）。
- 自定义命令**不能覆盖原生命令**。冲突被忽略并记录。
- 如果禁用 `commands.native`，则只注册自定义命令（如果没有则清空）。

## 限制

- 出站文本被分块到 `channels.telegram.textChunkLimit`（默认 4000）。
- 可选换行分块：设置 `channels.telegram.chunkMode="newline"` 在长度分块之前按空行（段落边界）分割。
- 媒体下载/上传上限为 `channels.telegram.mediaMaxMb`（默认 5）。
- Telegram Bot API 请求在 `channels.telegram.timeoutSeconds`（默认 500，通过 grammY）后超时。设置更低值以避免长时间挂起。
- 群组历史上下文使用 `channels.telegram.historyLimit`（或 `channels.telegram.accounts.*.historyLimit`），回退到 `messages.groupChat.historyLimit`。设置为 `0` 禁用（默认 50）。
- DM 历史可以使用 `channels.telegram.dmHistoryLimit` 限制（用户轮次）。每个用户覆盖：`channels.telegram.dms["<user_id>"].historyLimit`。

## 群组激活模式

默认情况下，bot 仅在群组中响应提及（`@botname` 或 `agents.list[].groupChat.mentionPatterns` 中的模式）。要更改此行为：

### 通过配置（推荐）

```json5
{
  channels: {
    telegram: {
          groups: {
                "-1001234567890": { requireMention: false }, // 在此群组中始终响应
              },
        },
  },
}
```

**重要**：设置 `channels.telegram.groups` 会创建一个**白名单**——仅列出的群组（或 `"*"`）将被接受。

要允许所有群组并始终响应：

```json5
{
  channels: {
    telegram: {
          groups: {
                "*": { requireMention: false }, // 所有群组，始终响应
              },
        },
  },
}
```

要保持所有群组仅提及（默认行为）：

```json5
{
  channels: {
    telegram: {
          groups: {
                "*": { requireMention: true }, // 或省略 groups 完全
              },
        },
  },
}
```

### 通过命令（会话级别）

在群组中发送：

- `/activation always` —— 响应所有消息
- `/activation mention` —— 要求提及（默认）

**注意**：命令仅更新会话状态。要跨重启获得持久行为，请使用配置。

### 获取群组聊天 ID

将群组中的任何消息转发到 Telegram 的 `@userinfobot` 或 `@getidsbot` 以查看聊天 ID（类似 `-1001234567890` 的负数）。

**提示**：要获取你自己的用户 ID，DM bot 并且它会回复配对消息（或命令启用后使用 `/whoami`）。

**隐私说明**：`@userinfobot` 是第三方 bot。如果愿意，将 bot 添加到群组，发送消息，然后使用 `openclaw logs --follow` 读取 `chat.id`，或使用 Bot API `getUpdates`。

## 配置写入

默认情况下，Telegram 被允许通过通道事件或 `/config set|unset` 写入配置更新。

这种情况发生在：

- 当群组升级为超级群组且 Telegram 发出 `migrate_to_chat_id`（聊天 ID 变更）时，OpenClaw 可以自动迁移 `channels.telegram.groups`。
- 当你在 Telegram 聊天中运行 `/config set` 或 `/config unset` 时（需要 `commands.config: true`）。

**禁用**：

```json5
{
  channels: { telegram: { configWrites: false } },
}
```

## 主题（论坛超级群组）

Telegram 论坛主题包含每条消息的 `message_thread_id`。OpenClaw：

- 将 `:topic:<threadId>` 追加到 Telegram 群组会话密钥，以便每个主题被隔离。
- 使用 `message_thread_id` 发送输入指示符和回复，使响应保留在主题中。
- 常规主题（线程 id `1`）是特殊的：消息发送省略 `message_thread_id`（Telegram 拒绝它），但输入指示符仍包含它。
- 在模板上下文中暴露 `MessageThreadId` + `IsForum` 以便进行路由/模板化。
- 在 `channels.telegram.groups.<chatId>.topics.<threadId>` 下提供特定主题配置（技能、白名单、自动回复、系统提示、禁用）。
- 主题配置继承群组设置（requireMention、白名单、技能、提示、enabled）除非每个主题被覆盖。

私密聊天在某些边缘情况可能包含 `message_thread_id`。OpenClaw 保持 DM 会话密钥不变，但当它存在时仍将线程 id 用于回复/草稿流式传输。

## 内联按钮

Telegram 支持带有回调按钮的内联键盘。

```json5
{
  channels: {
    telegram: {
          capabilities: {
                inlineButtons: "allowlist",
              },
        },
  },
}
```

**每个账号配置**：

```json5
{
  channels: {
    telegram: {
          accounts: {
                main: {
                        capabilities: {
                                          inlineButtons: "allowlist",
                                        },
                      },
              },
        },
  },
}
```

**作用域**：

- `off` —— 内联按钮禁用
- `dm` —— 仅 DM（群组目标被阻止）
- `group` —— 仅群组（DM 目标被阻止）
- `all` —— DM + 群组
- `allowlist` —— DM + 群组，但仅允许被 `allowFrom`/`groupAllowFrom` 的发送者（与控制命令相同的规则）

默认：`allowlist`。
遗留：`capabilities: ["inlineButtons"]` = `inlineButtons: "all"`。

### 发送按钮

使用带有 `buttons` 参数的消息工具：

```json5
{
  action: "send",
  channel: "telegram",
  to: "123456789",
  message: "选择一个选项：",
  buttons: [
                [
                  { text: "是", callback_data: "yes" },
                  { text: "否", callback_data: "no" },
                ],
                [{ text: "取消", callback_data: "cancel" }],
              ],
}
```

当用户点击按钮时，回调数据作为以下格式的消息发送回 agent：
`callback_data: value`

### 配置选项

Telegram 能力可以在两个级别配置（上面显示的对象形式；遗留字符串数组仍被支持）：

- `channels.telegram.capabilities`：应用于所有 Telegram 账号的全局默认能配置，除非被覆盖。
- `channels.telegram.accounts.<account>.capabilities`：覆盖全局默认的特定账号能力。

当所有 Telegram bot/账号应表现相同时使用全局设置。当不同的 bot 需要不同的行为时，使用每个账号配置（例如，一个账号仅处理 DM，而另一个被允许在群组中）。

## 访问控制（DM + 群组）

### DM 访问

- 默认：`channels.telegram.dmPolicy = "pairing"`。未知发送者收到配对码；在被批准前消息被忽略（1 小时后过期）。
- 批准方式：
  - `openclaw pairing list telegram`
  - `openclaw pairing approve telegram <CODE>`
- 配对是 Telegram DM 使用的默认 token 交换机制。详情：[配对](/00-快速开始/05-常见问题FAQ#配对)。
- `channels.telegram.allowFrom` 接受数字用户 ID（推荐）或 `@username` 条目。它**不是** bot 用户名；使用人类发送者的 ID。向导接受 `@username` 并在可能时将其解析为数字 ID。

#### 查找你的 Telegram 用户 ID

**更安全（无第三方 bot）**：

1. 启动 gateway 并 DM 你的 bot。
2. 运行 `openclaw logs --follow` 并查找 `from.id`。

**备选（官方 Bot API）**：

1. DM 你的 bot。
2. 使用你的 bot token 获取更新并读取 `message.from.id`：
   ```bash
   curl "https://api.telegram.org/bot<bot_token>/getUpdates"
   ```

**第三方（隐私较低）**：

- DM `@userinfobot` 或 `@getidsbot` 并使用返回的用户 id。

### 群组访问

两个独立控制：

**1. 允许哪些群组**（通过 `channels.telegram.groups` 群组白名单）：

- 无 `groups` 配置 = 允许所有群组
- 有 `groups` 配置 = 仅列出的群组或 `"*"` 被允许
- 示例：`"groups": { "-1001234567890": {}, "*": {} }` 允许所有群组

**2. 允许哪些发送者**（通过 `channels.telegram.groupPolicy` 的发送者过滤）：

- `"open"` = 允许群组中的所有发送者
- `"allowlist"` = 仅允许 `channels.telegram.groupAllowFrom` 中的发送者
- `"disabled"` = 完全不接受群组消息
  默认是 `groupPolicy: "allowlist"`（除非你添加 `groupAllowFrom` 则被阻止）。

大多数用户需要：`groupPolicy: "allowlist"` + `groupAllowFrom` + `channels.telegram.groups` 中列出的特定群组。

## 长轮询 vs Webhook

- 默认：长轮询（不需要公共 URL）。
- Webhook 模式：设置 `channels.telegram.webhookUrl`（可选 `channels.telegram.webhookSecret` + `channels.telegram.webhookPath`）。
  - 本地监听器绑定到 `0.0.0.0:8787` 并默认提供 `POST /telegram-webhook`。
  - 如果你的公共 URL 不同，使用反向代理并指向 `channels.telegram.webhookUrl` 到公共端点。

## 回复线程化

Telegram 支持通过标签的可选线程化回复：

- `[[reply_to_current]]` -- 回复触发消息。
- `[[reply_to:<id>]]` -- 回复历史/上下文中的特定消息 id。

由 `channels.telegram.replyToMode` 控制：

- `first`（默认）、`all`、`off`。

## 音频消息（语音 vs 文件）

Telegram 区分**语音消息**（圆气泡）与**音频文件**（元数据卡）。OpenClaw 默认为音频文件以保持向后兼容。

要在 agent 回复中强制语音消息气泡，在回复中包含以下标签：

- `[[audio_as_voice]]` —— 发送音频为语音消息而不是文件。

标签将从已交付的文本中被剥离。其他通道忽略此标签。

对于消息工具发送，使用带有语音兼容音频 `media` URL 的 `asVoice: true`（如果存在媒体则 `message` 是可选的）：

```json5
{
  action: "send",
  channel: "telegram",
  to: "123456789",
  media: "https://example.com/voice.ogg",
  asVoice: true,
}
```

## 贴纸

OpenClaw 支持接收和发送 Telegram 贴纸，具有智能缓存功能。

### 接收贴纸

当用户发送贴纸时，OpenClaw 根据贴纸类型进行处理：

- **静态贴纸（WEBP）**：下载并通过视觉处理。贴纸作为 `<media:sticker>` 占位符出现在消息内容中。
- **动画贴纸（TGS）**：跳过（Lottie 格式不支持处理）。
- **视频贴纸（WEBM）**：跳过（视频格式不支持处理）。

接收贴纸时可用的模板上下文字段：

- `Sticker` —— 包含以下内容的对象：
  - `emoji` —— 与贴纸关联的表情符号
  - `setName` —— 贴纸集名称
  - `fileId` —— Telegram 文件 ID（发回同一贴纸）
  - `fileUniqueId` —— 用于缓存查找的稳定 ID
  - `cachedDescription` —— 可用时的缓存视觉描述

### 贴纸缓存

贴纸通过 AI 的视觉能力处理以生成描述。由于相同贴纸经常被重复发送，OpenClaw 缓存这些描述以避免冗余 API 调用。

**工作原理**：

1. **首次遇到**：贴纸图像被发送到 AI 进行视觉分析。AI 生成描述（例如，"一只热情挥手的小猫"）。
2. **缓存存储**：描述随贴纸的文件 ID、表情符号和集名称一起保存。
3. **后续遇到**：再次看到同一贴纸时，直接使用缓存描述。图像不被发送到 AI。

**缓存位置**：`~/.openclaw/telegram/sticker-cache.json`

**缓存条目格式**：

```json
{
  "fileId": "CAACAgIAAxkBAAI...",
  "fileUniqueId": "AgADBAADb6cxG2Y",
  "emoji": "👋",
  "setName": "CoolCats",
  "description": "一只热情挥手的小猫",
  "cachedAt": "2026-01-15T10:30:00.000Z"
}
```

**好处**：

- 通过避免重复的视觉调用减少 API 成本
- 缓存贴纸的响应时间更快（无视觉处理延迟）
- 基于缓存描述的贴纸搜索功能

缓存会在贴纸被接收时自动填充。无需手动缓存管理。

### 发送贴纸

agent 可以使用 `sticker` 和 `sticker-search` 动作发送和搜索贴纸。这些默认被禁用，必须在配置中启用：

```json5
{
  channels: {
    telegram: {
          actions: {
                sticker: true,
              },
        },
  },
}
```

**发送贴纸**：

```json5
{
  action: "sticker",
  channel: "telegram",
  to: "123456789",
  fileId: "CAACAgIAAxkBAAI...",
}
```

**参数**：

- `fileId`（必需）—— Telegram 文件 ID。接收贴纸时从 `Sticker.fileId` 或 `sticker-search` 结果获取。
- `replyTo`（可选）——要回复的消息 ID。
- `threadId`（可选）——论坛主题的消息线程 ID。

**搜索贴纸**：

agent 可以通过描述、表情符号或集名称搜索缓存贴纸：

```json5
{
  action: "sticker-search",
  channel: "telegram",
  to: "123456789",
  query: "猫 挥手",
  limit: 5,
}
```

从缓存返回匹配的贴纸：

```json5
{
  ok: true,
  count: 2,
  stickers: [
                {
                      fileId: "CAACAgIAAxkBAAI...",
                      emoji: "👋",
                      description: "一只热情挥手的小猫",
                      setName: "CoolCats",
                    },
              ],
}
```

搜索在描述文本、表情符号字符和集名称上使用模糊匹配。

**带线程化的示例**：

```json5
{
  action: "sticker",
  channel: "telegram",
  to: "-1001234567890",
  fileId: "CAACAgIAAxkBAAI...",
  replyTo: 42,
  threadId: 123,
}
```

## 流式传输（草稿）

Telegram 可以在 agent 生成响应时流式传输**草稿气泡**。OpenClaw 使用 Bot API `sendMessageDraft`（非真实消息），然后作为正常消息发送最终回复。

**要求（Telegram Bot API 9.3+）**：

- **带有主题的私密聊天**（bot 的论坛主题模式）。
- 入站消息必须包含 `message_thread_id`（私密主题线程）。
- 流式传输在群组/超级群组/频道中被忽略。

**配置**：

- `channels.telegram.streamMode: "off" | "partial" | "block"`（默认：`partial`）
  - `partial`：用最新的流式传输文本更新草稿气泡。
  - `block`：在更大的块中更新草稿气泡（分块）。
  - `off`：禁用草稿流式传输。
- 可选（仅适用于 `streamMode: "block"`）：
  - `channels.telegram.draftChunk: { minChars?, maxChars?, breakPreference? }`
    - 默认值：`minChars: 200`、`maxChars: 800`、`breakPreference: "paragraph"`（限制到 `channels.telegram.textChunkLimit`）。

**注意**：草稿流式传输与**块流式传输**（通道消息）是分开的。块流式传输默认关闭，如果你希望使用早期 Telegram 消息而不是草稿更新，需要 `channels.telegram.blockStreaming: true`。

**推理流式传输（仅 Telegram）**：

- `/reasoning stream` 在回复生成时将推理流式传输到草稿气泡中，然后发送最终答案而不包含推理。
- 如果 `channels.telegram.streamMode` 为 `off`，则禁用推理流式传输。
- 更多上下文：[流式传输 + 分块](/03-核心概念/06-上下文管理#流式传输-和-分块)。

## 重试策略

出站 Telegram API 调用在暂态网络/429 错误时使用指数退避和抖动重试。通过 `channels.telegram.retry` 配置。参见[重试策略](/03-核心概念/05-上下文管理#重试策略)。

## Agent 工具（消息 + 反应）

- 工具：`telegram` 配合 `sendMessage` 动作（`to`、`content`、可选的 `mediaUrl`、`replyToMessageId`、`messageThreadId`）。
- 工具：`telegram` 配合 `react` 动作（`chatId`、`messageId`、`emoji`）。
- 工具：`telegram` 配合 `deleteMessage` 动作（`chatId`、`messageId`）。
- 反应移除语义：参见[/工具/反应](/06-工具与功能/02-消息工具#反应)。
- 工具闸门：`channels.telegram.actions.reactions`、`channels.telegram.actions.sendMessage`、`channels.telegram.actions.deleteMessage`（默认：已启用），以及 `channels.telegram.actions.sticker`（默认：已禁用）。

## 反应通知

**反应如何工作**：

Telegram 反应作为单独的 `message_reaction` 事件到达，而不是作为消息载荷中的属性。当用户添加反应时，OpenClaw：

1. 从 Telegram API 接收 `message_reaction` 更新
2. 将其转换为**系统事件**，格式为：`"Telegram reaction added: {emoji} by {user} on msg {id}"`
3. 使用**相同的会话密钥**将系统事件入队，就像常规消息一样
4. 当该对话中的下一条消息到达时，系统事件被排空并前置到 agent 的上下文

agent 将反应视为对话历史中的**系统通知**，而不是消息元数据。

**配置**：

- `channels.telegram.reactionNotifications`：控制哪些反应触发通知
  - `"off"` —— 忽略所有反应
  - `"own"` —— 当用户对 bot 的消息做出反应时通知（尽力而为；内存中）（默认）
  - `"all"` —— 通知所有反应
- `channels.telegram.reactionLevel`：控制 agent 的反应能力
  - `"off"` —— agent 无法反应
  - `"ack"` —— bot 发送确认反应（👀 在处理时）（默认）
  - `"minimal"` —— agent 可以谨慎反应（指南：每 5-10 次交换 1 次）
  - `"extensive"` —— agent 可以在适当时自由反应

**论坛群组**：论坛群组中的反应包含 `message_thread_id` 并使用类似 `agent:main:telegram:group:{chatId}:topic:{threadId}` 的会话密钥。这确保同一主题中的反应和消息保持在一起。

**示例配置**：

```json5
{
  channels: {
    telegram: {
          reactionNotifications: "all", // 查看所有反应
          reactionLevel: "minimal", // Agent 可以谨慎反应
        },
  },
}
```

**要求**：

- Telegram bot 必须在 `allowed_updates` 中显式请求 `message_reaction`（OpenClaw 自动配置）。
- 对于 webhook 模式，反应包含在 webhook `allowed_updates` 中。
- 对于轮询模式，反应包含在 `getUpdates` `allowed_updates` 中。

## 投递目标（CLI/cron）

- 使用聊天 id（`123456789`）或用户名（`@name`）作为目标。
- 示例：`openclaw message send --channel telegram --target 123456789 --message "hi"`。

## 故障排查

**Bot 在群组中不响应非提及消息：**

- 如果你设置了 `channels.telegram.groups.*.requireMention=false`，Telegram 的 Bot API **隐私模式**必须被禁用。
  - BotFather：`/setprivacy` → **禁用**（然后从群组中移除并重新添加 bot）
  - `openclaw channels status` 在配置期望未提及的群组消息时显示警告。
  - `openclaw channels status --probe` 可以额外检查显式数字群组 ID 的成员资格（它无法审计通配符 `"*"` 规则）。
  - 快速测试：`/activation always`（仅会话；使用配置进行持久化）

**Bot 完全看不到群组消息：**

- 如果设置了 `channels.telegram.groups`，群组必须被列出或使用 `"*"`
- 检查 @BotFather 中的"隐私设置" -> "群组隐私"应为**关闭**
- 验证 bot 实际是成员（不仅仅是具有读取权限的管理员）
- 检查 gateway 日志：`openclaw logs --follow`（查找"skipping group message"）

**Bot 响应提及但不响应 `/activation always`：**

- `/activation` 命令仅更新会话状态但不持久化到配置
- 要持久化行为，将群组添加到 `channels.telegram.groups` 并设置 `requireMention: false`

**像 `/status` 这样的命令不起作用：**

- 确保你的 Telegram 用户 ID 已被授权（通过配对或 `channels.telegram.allowFrom`）
- 即使在具有 `groupPolicy: "open"` 的群组中，命令也需要授权

**Node 22+ 时长轮询立即中止（通常带有代理/自定义 fetch）：**

- Node 22+ 对 `AbortSignal` 实例更严格；外部信号可能立即中止 `fetch` 调用。
- 升级到规范化中止信号的 OpenClaw 版本，或在可以升级之前在 Node 20 上运行 gateway。

**Bot 启动，然后静默停止响应（或记录 `HttpError: Network request ... failed`）：**

- 某些主机首先将 `api.telegram.org` 解析为 IPv6。如果你的服务器没有可用的 IPv6 出站，grammY 可能会卡在仅 IPv6 的请求上。
- 通过启用 IPv6 出站**或**为 `api.telegram.org` 强制 IPv4 解析（例如，添加使用 IPv4 A 记录的 `/etc/hosts` 条目，或在你的 OS DNS 堆栈中首选 IPv4）进行修复，然后重启 gateway。
- 快速检查：`dig +short api.telegram.org A` 和 `dig +short api.telegram.org AAAA` 以确认 DNS 返回的内容。

## 配置参考（Telegram）

完整配置：[配置](/04-配置与运维/00-配置文件说明)

提供者选项：

- `channels.telegram.enabled`：启用/禁用通道启动。
- `channels.telegram.botToken`：bot token（BotFather）。
- `channels.telegram.tokenFile`：从文件路径读取 token。
- `channels.telegram.dmPolicy`：`pairing | allowlist | open | disabled`（默认：pairing）。
- `channels.telegram.allowFrom`：DM 白名单（ids/用户名）。`open` 需要 `"*"`。
- `channels.telegram.groupPolicy`：`open | allowlist | disabled`（默认：allowlist）。
- `channels.telegram.groupAllowFrom`：群组发送者白名单（ids/用户名）。
- `channels.telegram.groups`：每个群组默认 + 白名单（使用 `"*"` 获取全局默认）。
  - `channels.telegram.groups.<id>.requireMention`：提及闸门默认。
  - `channels.telegram.groups.<id>.skills`：技能过滤器（省略 = 所有技能，空 = 无）。
  - `channels.telegram.groups.<id>.allowFrom`：每个群组发送者白名单覆盖。
  - `channels.telegram.groups.<id>.systemPrompt`：群组的额外系统提示。
  - `channels.telegram.groups.<id>.enabled`：禁用群组时设置为 `false`。
  - `channels.telegram.groups.<id>.topics.<threadId>.*`：每个主题覆盖（与群组相同的字段）。
  - `channels.telegram.groups.<id>.topics.<threadId>.requireMention`：每个主题提及闸门覆盖。
- `channels.telegram.capabilities.inlineButtons`：`off | dm | group | all | allowlist`（默认：allowlist）。
- `channels.telegram.accounts.<account>.capabilities.inlineButtons`：每个账号覆盖。
- `channels.telegram.replyToMode`：`off | first | all`（默认：`first`）。
- `channels.telegram.textChunkLimit`：出站块大小（字符）。
- `channels.telegram.chunkMode`：`length`（默认）或在长度分块之前按空行（段落边界）分割的 `newline`。
- `channels.telegram.linkPreview`：切换出站消息的链接预览（默认：true）。
- `channels.telegram.streamMode`：`off | partial | block`（草稿流式传输）。
- `channels.telegram.mediaMaxMb`：入站/出站媒体上限（MB）。
- `channels.telegram.retry`：出站 Telegram API 调用的重试策略（attempts、minDelayMs、maxDelayMs、jitter）。
- `channels.telegram.network.autoSelectFamily`：覆盖 Node autoSelectFamily（true=启用，false=禁用）。在 Node 22 上默认禁用以避免 Happy Eyeballs 超时。
- `channels.telegram.proxy`：Bot API 调用的代理 URL（SOCKS/HTTP）。
- `channels.telegram.webhookUrl`：启用 webhook 模式。
- `channels.telegram.webhookSecret`：webhook 密钥（可选）。
- `channels.telegram.webhookPath`：本地 webhook 路径（默认 `/telegram-webhook`）。
- `channels.telegram.actions.reactions`：闸门 Telegram 工具反应。
- `channels.telegram.actions.sendMessage`：闸门 Telegram 工具消息发送。
- `channels.telegram.actions.deleteMessage`：闸门 Telegram 工具消息删除。
- `channels.telegram.actions.sticker`：闸门 Telegram 贴纸动作——发送和搜索（默认：false）。
- `channels.telegram.reactionNotifications`：`off | own | all` —— 控制哪些反应触发系统事件（当未设置时默认为 `own`）。
- `channels.telegram.reactionLevel`：`off | ack | minimal | extensive` —— 控制 agent 的反应能力（当未设置时默认为 `minimal`）。

相关全局选项：

- `agents.list[].groupChat.mentionPatterns`（提及闸门模式）。
- `messages.groupChat.mentionPatterns`（全局回退）。
- `commands.native`（默认为 `"auto"` → 对 Telegram/Discord 启用，对 Slack 关闭），`commands.text`、`commands.useAccessGroups`（命令行为）。使用 `channels.telegram.commands.native` 覆盖。
- `messages.responsePrefix`、`messages.ackReaction`、`messages.ackReactionScope`、`messages.removeAckAfterReply`。
