---
title: "Discord 连接配置"
category: "消息通道"
difficulty: "beginner"
estimated_time: "25 min"
tags: ["discord", "channels", "setup", "bot", "intents"]
prerequisites:
  - Discord Bot Token（从 Discord Developer Portal 获取）
  - Discord 服务器权限配置
  - OpenClaw Gateway 已安装
related_docs:
  - "00-快速开始/04-首次连接"
  - "04-配置与运维/00-配置文件说明"
next_steps:
  - "04-Slack连接"
last_updated: "2026-02-01"
source: "docs/channels/discord.md"
---


# Discord 连接配置（Bot API）

**状态**: 已就绪，支持通过官方 Discord bot 网关进行 DM 和公会文本频道。

<ai-search-key>
Discord, Bot API, Gateway Intents, Message Content, Server Members, 斜杠命令, DM访问控制, 群组路由, 线程化, 表情符号, 贴纸, 管理员权限, PluralKit, 重试策略
</ai-search-key>

## 快速入门（适合新手）

1. 创建 Discord bot 并复制 bot token。
2. 在 Discord 应用设置中，启用**消息内容意图**（如果你计划使用白名单或名称查找，还需要**服务器成员意图**）。
3. 为 OpenClaw 设置 token：
   - 环境变量：`DISCORD_BOT_TOKEN=...`
   - 或配置：`channels.discord.token: "..."`。
   - 如果两者都设置了，配置优先（环境变量仅作为默认账号的备选方案）。
4. 将 bot 邀请到你的服务器，并授予消息权限（如果你只需要 DM，可以创建一个私有服务器）。
5. 启动 gateway。
6. DM 访问默认为配对；首次联系时批准配对码。

**最小配置**：

```json5
{
  channels: {
      discord: {
          enabled: true,
          token: "YOUR_BOT_TOKEN",
      },
  },
}
```

## 核心目标

- 通过 Discord DM 或公会频道与 OpenClaw 对话。
- 直接聊折收到 agent 的主会话（默认 `agent:main:main`）；公会频道保持隔离为 `agent:<agentId>:discord:channel:<channelId>`（显示名称使用 `discord:<guildSlug>#<channelSlug>`）。
- 默认情况下忽略群组 DM；通过 `channels.discord.dm.groupEnabled` 启用，并可选地通过 `channels.discord.dm.groupChannels` 限制。
- 保持路由确定性：回复始终返回到它们到达的频道。
- 群组 DM 默认被忽略；通过 `channels.discord.dm.groupEnabled` 启用，并可选地通过 `channels.discord.dm.groupChannels` 限制。

## 工作原理

1. 创建 Discord 应用 → Bot，启用你需要的意图（DM + 公会消息 + 消息内容），并获取 bot token。
2. 将 bot 邀请到你的服务器，并授予读取/发送消息所需的权限。
3. 使用 `channels.discord.token`（或 `DISCORD_BOT_TOKEN` 作为回退）为 OpenClaw 配置。
4. 运行 gateway；当 token 可用（配置优先，环境变量回退）且 `channels.discord.enabled` 不为 `false` 时，它会自动启动 Discord 频道。
   - 如果你更喜欢环境变量，请设置 `DISCORD_BOT_TOKEN`（配置块是可选的）。
5. 直接聊天：投递时使用 `user:<id>`（或 `<@id>` 提及）；所有轮次都落在共享的 `main` 会话中。仅数字 ID 有歧义并被拒绝。
6. 公会频道：投递时使用 `channel:<channelId>`。默认需要提及并可以按公会或频道设置。
7. 直接聊天：默认通过 `channels.discord.dm.policy`（默认：`"pairing"`）安全保护。未知发送者获得配对码（1 小时后过期）；通过 `openclaw pairing approve discord <code>` 批准。
   - 要保持旧的"对所有人开放"行为：设置 `channels.discord.dm.policy="open"` 和 `channels.discord.dm.allowFrom=["*"]`。
   - 要硬白名单：设置 `channels.discord.dm.policy="allowlist"` 并在 `channels.discord.dm.allowFrom` 中列出发送者。
   - 要忽略所有 DM：设置 `channels.discord.dm.enabled=false` 或 `channels.discord.dm.policy="disabled"`。
8. 群组 DM 默认被忽略；通过 `channels.discord.dm.groupEnabled` 启用，并可选地通过 `channels.discord.dm.groupChannels` 限制。
9. 可选的公会规则：设置 `channels.discord.guilds`，键为公会 id（首选）或 slug，并带有每个频道规则。
10. 可选的原生命令：`commands.native` 默认为 `"auto"`（对 Discord/Telegram 启用，对 Slack 关闭），可通过 `channels.discord.commands.native: true|false|"auto"` 覆盖；`false` 清除之前注册的命令。文本命令由 `commands.text` 控制，必须作为独立的 `/...` 消息发送。使用 `commands.useAccessGroups: false` 绕过命令的访问组检查。
    - 完整命令列表 + 配置：[斜杠命令](/06-工具与功能/01-斜杠命令)。
11. 可选的公会上下文历史：设置 `channels.discord.historyLimit`（默认 20，回退到 `messages.groupChat.historyLimit`）以在回复提及时包含最近的 N 条公会消息。设置为 `0` 禁用。
12. 反应：agent 可以通过 `discord` 工具触发反应（由 `channels.discord.actions.*` 闸门）。
    - 反应移除语义：参见[/工具/反应](/06-工具与功能/02-消息工具#反应)。
    - `discord` 工具仅在当前频道是 Discord 时暴露。
13. 原生命令使用隔离的会话密钥（`agent:<agentId>:discord:slash:<userId>`）而不是共享的 `main` 会话。

**注意**：名称 → id 解析使用公会成员搜索并需要服务器成员意图；如果 bot 无法搜索成员，请使用 id 或 `<@id>` 提及。
**注意**：Slug 为小写，空格替换为 `-`。频道名称在加前导 `#` 去除 slug。
**注意**：公会上下文 `[from:]` 行包含 `author.tag` + `id` 以使 ping 就绪的回复变得简单。

## 配置写入

默认情况下，Discord 被允许通过 `/config set|unset` 触发的配置更新（需要 `commands.config: true`）。

**禁用**：

```json5
{
  channels: { discord: { configWrites: false } },
}
```

## 如何创建你自己的 bot

这是在服务器（公会）频道中运行 OpenClaw 的"Discord Developer Portal"设置，如 `#help`。

### 1) 创建 Discord 应用 + bot 用户

1. Discord Developer Portal → **应用** → **新应用**
2. 在你的应用中：
   - **Bot** → **添加 Bot**
   - 复制 **Bot Token**（这是你放在 `DISCORD_BOT_TOKEN` 中的内容）

### 2) 启用 OpenClaw 需要的 Gateway Intents

Discord 会阻止"特权意图"，除非你显式启用它们。

在 **Bot** → **特权 Gateway Intents** 中，启用：

- **消息内容意图**（必需，用于读取大多数公会中的消息文本；没有它你会看到"使用了不允许的意图"或 bot 会连接但不响应消息）
- **服务器成员意图**（推荐；某些成员/用户查找和公会中的白名单匹配所必需）

你通常**不需要****" **存在意图**。

### 3) 生成邀请 URL（OAuth2 URL 生成器）

在你的应用中：**OAuth2** → **URL 生成器**

**范围（Scopes）**

- ✅ `bot`
- ✅ `applications.commands`（原生命令所必需）

**Bot 权限（最低基线）**

- ✅ 查看频道
- ✅ 发送消息
- ✅ 读取消息历史
- ✅ 嵌入链接
- ✅ 附加文件
- ✅ 添加反应（可选但推荐）
- ✅ 使用外部表情符号/贴纸（可选，仅在需要时）

**避免**使用 **管理员**，除非你在调试并完全信任 bot。

复制生成的 URL，打开它，选择你的服务器，并安装 bot。

### 4) 获取 ID（公会/用户/频道）

Discord 到处使用数字 id；OpenClaw 配置优先考虑 id。

1. Discord（桌面/Web）→**用户设置**→**高级**→启用**开发者模式**
2. 右键点击：
   - 服务器名称 →**复制服务器 ID**（公会 id）
   - 频道（例如 `#help`）→**复制频道 ID**
   - 你的用户 →**复制用户 ID**

### 5) 配置 OpenClaw

#### Token

通过环境变量在服务器上设置 bot token（推荐）：

- `DISCORD_BOT_TOKEN=...`

或通过配置：

```json5
{
  channels: {
      discord: {
          enabled: true,
          token: "YOUR_BOT_TOKEN",
      },
  },
}
```

**多账号支持**：使用 `channels.discord.accounts` 配合每个账号的 token 和可选的 `name`。参见[`网关配置`](/04-配置与运维/00-配置文件说明#telegramaccounts--discordaccounts--slackaccounts--signalaccounts--imessageaccounts)了解共享模式。

#### 白名单 + 频道路由

**示例"单服务器，仅允许我，仅允许 #help"**：

```json5
{
  channels: {
      discord: {
          enabled: true,
          dm: { enabled: false },
          guilds: {
                YOUR_GUILD_ID: {
                      users: ["YOUR_USER_ID"],
                      requireMention: true,
                      channels: {
                                  help: { allow: true, requireMention: true },
                                },
                },
          },
          retry: {
                      attempts: 3,
                      minDelayMs: 500,
                      maxDelayMs: 30000,
                      jitter: 0.1,
                    },
        },
  },
}
```

**注意**：

- `requireMention: true` 意味着 bot 仅在收到提及时才回复（推荐用于共享频道）。
- `agents.list[].groupChat.mentionPatterns`（或 `messages.groupChat.mentionPatterns`）也算作公会消息的提及。
- 多 agent 覆盖：在 `agents.list[].groupChat.mentionPatterns` 上设置每个 agent 模式。
- 如果存在 `channels`，任何未列出的频道默认被拒绝。
- 使用 `"*"` 频道条目以对所有频道应用默认值；显式的频道条目覆盖通配符。
- 线程继承父频道配置（白名单、`requireMention`、技能、提示等），除非你添加显式的线程频道 id。
- Bot 撰写的消息默认被忽略；设置 `channels.discord.allowBots=true` 以允许它们（自己的消息仍被过滤）。
- **警告**：如果你允许对其他 bot 的回复（`channels.discord.allowBots=true`），通过 `requireMention`、`channels.discord.guilds.*.channels.<id>.users` 白名单和/或在 `AGENTS.md` 和 `SOUL.md` 中清除护栏来防止 bot 对 bot 的回复循环。

### 6) 验证它正常工作

1. 启动 gateway。
2. 在你的服务器频道中，发送：`@Krill hello`（或你的 bot 名称）。
3. 如果没有任何反应，检查下方的**故障排查**。

### 故障排查

- 首先，运行 `openclaw doctor` 和 `openclaw channels status --probe`（可操作的警告 + 快速审计）。
- **"使用了不允许的意图"**：启用**消息内容意图**（以及可能需要**服务器成员意图**），然后重启 gateway。
- **"Bot 在公会频道中连接但从不起复"**：
   - 缺少**消息内容意图**，或
   - bot 缺少频道权限（查看/发送/读取历史），或
   - 你的配置要求提及且你没有提它，或
   - 你的公会/频道白名单拒绝了频道/用户。
- **"`requireMention: false` 但仍不回复"**：
   - `channels.discord.groupPolicy` 默认为 **allowlist**；将其设置为 `"open"` 或添加公会条目到 `channels.discord.guilds`（或选择性列出频道）。
   - 如果你仅设置 `DISCORD_BOT_TOKEN` 且从不创建 `channels.discord` 部分，运行时默认 `groupPolicy` 为 `open`。添加 `channels.discord.groupPolicy`、`channels.defaults.groupPolicy` 或公会/频道白名单以锁定它。
   - `requireMention` 必须位于 `channels.discord.guilds`（或特定频道）下。顶层的 `channels.discord.requireMention` 被忽略。
   - **权限审计**（`channels status --probe`）仅检查数字频道 ID。如果你在 `channels.discord.guilds.*.channels` 中使用 slug/名称作为密钥，则审计无法验证权限。
- **"DM 不起作用"**：`channels.discord.dm.enabled=false`、`channels.discord.dm.policy="disabled"`，或你尚未被批准（`channels.discord.dm.policy="pairing"`）。
- **权限审计**（`channels status --probe`）仅检查数字频道 ID。如果你使用 slug/名称作为 `channels.discord.guilds.*.channels` 密钥，则审计无法验证权限。

## 能力 & 限制

- DM 和公会文本频道（线程被视为单独的频道；不支持语音）。
- 尽力发送输入指示符；消息分块使用 `channels.discord.textChunkLimit`（默认 2000）并按行数分割高回复（`channels.discord.maxLinesPerMessage`，默认 17）。
- 可选换行分块：设置 `channels.discord.chunkMode="newline"` 在长度分块之前按空行（段落边界）分割。
- 文件上传支持高达配置的 `channels.discord.mediaMaxMb`（默认 8 MB）。
- 默认情况下，通过提及闸门避免在公会中响应嘈杂的 bot。
- 当消息引用另一消息时，会注入回复上下文（引用内容 + id）。
- 默认情况下，原生回复线程化**关闭**；通过 `channels.discord.replyToMode` 和回复标签启用。

## 重试策略

出站 Discord API 调用在速率限制（429）时使用 Discord 的 `retry_after`（当可用时），并配合指数退避和抖动重试。通过 `channels.discord.retry` 配置。参见[重试策略](/03-核心概念/05-上下文管理#重试策略)。

## 配置

```json5
{
  channels: {
      discord: {
          enabled: true,
          token: "abc.123",
          groupPolicy: "allowlist",
          guilds: {
                      "*": {
                              channels: {
                                              general: { allow: true },
                                            },
                            },
                },
          mediaMaxMb: 8,
          actions: {
                      reactions: true,
                      stickers: true,
                      emojiUploads: true,
                      stickerUploads: true,
                      polls: true,
                      permissions: true,
                      messages: true,
                      threads: true,
                      pins: true,
                      search: true,
                      memberInfo: true,
                      roleInfo: true,
                      channelInfo: true,
                      channels: true,
                      voiceStatus: true,
                      events: true,
                      moderation: false,
                    },
          replyToMode: "off",
          dm: {
                      enabled: true,
                      policy: "pairing", // pairing | allowlist | open | disabled
                      allowFrom: ["123456789012345678", "steipete"],
                      groupEnabled: false,
                      groupChannels: ["openclaw-dm"],
                    },
          guilds: {
                      "*": { requireMention: true },
                      "123456789012345678": {
                                            slug: "friends-of-openclaw",
                                            requireMention: false,
                                            reactionNotifications: "own",
                                            users: ["987654321098765432", "steipete"],
                                            channels: {
                                              general: { allow: true },
                                              help: {
                                                allow: true,
                                                requireMention: true,
                                                users: ["987654321098765432"],
                                                skills: ["search", "docs"],
                                                systemPrompt: "保持答案简短。",
                                              },
                                            },
                                          },
                },
        },
  },
}
```

确认反应通过 `messages.ackReaction` + `messages.ackReactionScope` 全局控制。使用 `messages.removeAckAfterReply` 在 bot 回复后清除确认反应。

- `dm.enabled`：设置为 `false` 以忽略所有 DM（默认 `true`）。
- `dm.policy`：DM 访问控制（`pairing` 推荐）。`"open"` 需要 `dm.allowFrom=["*"]`。
- `dm.allowFrom`：DM 白名单（用户 id 或名称）。由 `dm.policy="allowlist"` 和 `dm.policy="open"` 的验证使用。向导接受用户名并在可能时将其解析为 id。
- `dm.groupEnabled`：启用群组 DM（默认 `false`）。
- `dm.groupChannels`：群组 DM 频道 id 或 slug 的可选白名单。
- `groupPolicy`：控制公会频道处理（`open|disabled|allowlist`）；`allowlist` 需要频道白名单。
- `guilds`：按公会 id（首选）或 slug 键入的每个公会规则。
- `guilds."*"`：当没有显式条目存在时应用的每个公会默认设置。
- `guilds.<id>.slug`：用于显示名称的可选友好 slug。
- `guilds.<id>.users`：可选的每个公会用户白名单（id 或名称）。
- `guilds.<id>.tools`：可选的每个公会工具策略覆盖（当频道覆盖缺失时使用；当缺失时应用 `allow`/`deny`/`alsoAllow`）。
- `guilds.<id>.toolsBySender`：可选的每个公会内发送者工具策略覆盖（频道覆盖缺失时应用；支持 `"*"` 通配符）。
- `guilds.<id>.channels.<channel>.allow`：当 `groupPolicy="allowlist"` 时允许/拒绝频道。
- `guilds.<id>.channels.<channel>.requireMention`：频道的提及闸门。
- `guilds.<id>.channels.<channel>.tools`：可选的每个频道工具策略覆盖（`allow`/`deny`/`alsoAllow`）。
- `guilds.<id>.channels.<channel>.toolsBySender`：频道内每个发送者的可选工具策略覆盖（支持 `"*"` 通配符）。
- `guilds.<id>.channels.<channel>.users`：频道的可选用户白名单。
- `guilds.<id>.channels.<channel>.skills`：技能过滤器（省略 = 所有技能，空 = 无）。
- `guilds.<id>.channels.<channel>.systemPrompt`：频道的额外系统提示（与频道主题组合）。
- `guilds.<id>.channels.<channel>.enabled`：设置为 `false` 以禁用频道。
- `guilds.<id>.channels`：频道规则（密钥为频道 slug 或 id）。
- `guilds.<id>.requireMention`：每个公会的提及要求（可被频道覆盖）。
- `guilds.<id>.reactionNotifications`：反应系统事件模式（`off`、`own`、`all`、`allowlist`）。
- `textChunkLimit`：出站块大小（字符）。默认：2000。
- `chunkMode`：`length`（默认）或在长度分块之前按空行（段落边界）分割的 `newline`。
- `maxLinesPerMessage`：每条消息的软最大行数。默认：17。
- `mediaMaxMb`：限制入站媒体保存到磁盘。
- `historyLimit`：在回复提及时包含为上下文的最近公会消息数量（默认 20；回退到 `messages.groupChat.historyLimit`）。设置为 `0` 禁用。
- `dmHistoryLimit`：DM 历史限制，用户轮次。每个用户覆盖：`dms["<user_id>"].historyLimit`。
- `retry`：出站 Discord API 调用的重试策略（attempts、minDelayMs、maxDelayMs、jitter）。
- `pluralkit`：解析 PluralKit 代理消息，以便系统成员作为不同的发送者显示。
- `actions`：每个操作的工具闸门；省略以允许所有（设置为 `false` 以禁用）。
  - `reactions`（涵盖 react + 读取反应）
  - `stickers`（发送贴纸）
  - `emojiUploads`（上传表情符号）
  - `stickerUploads`（上传贴纸）
  - `polls`（创建投票）
  - `permissions`（频道权限快照）
  - `messages`（读取/发送/编辑/删除）
  - `threads`（创建/列出/回复）
  - `pins`（固定/取消固定/列出）
  - `search`（消息搜索——预览功能）
  - `memberInfo`（成员信息）
  - `roleInfo`（角色列表）
  - `channelInfo`（频道信息 + 列出）
  - `voiceStatus`（语音状态查找）
  - `events`（列出/创建计划事件）
  - `channels`（创建/编辑/删除频道 + 分类 + 权限）
  - `roles`（角色添加/删除，默认 `false`）
  - `moderation`（超时/踢出/封禁，默认 `false`）

反应通知使用 `guilds.<id>.reactionNotifications`：

- `off`：无反应事件。
- `own`：bot 自己的消息上的反应（默认）。
- `all`：所有消息上的所有反应。
- `allowlist`：`guilds.<id>.users` 中用户的反应（空列表则禁用）。

- `replyToMode`：`off`（默认）、`first` 或 `all`。仅在模型包含回复标签时应用。

## 回复标签

要请求线程化回复，模型可以在其输出中包含一个标签：

- `[[reply_to_current]]` —— 回复触发 Discord 消息。
- `[[reply_to:<id>]]` —— 回复来自上下文/历史的特定消息 id。
  当前消息 id 作为 `[message_id: …]` 被添加到提示中；历史条目已包含 id。

行为由 `channels.discord.replyToMode` 控制：

- `off`：忽略标签。
- `first`：仅第一个出站块/附件是回复。
- `all`：每个出站块/附件都是回复。

**白名单匹配说明**：

- `allowFrom`/`users`/`groupChannels` 接受 id、名称、标签或类似 `<@id>` 的提及。
- 支持如 `discord:`/`user:`（用户）和 `channel:`（群组 DM）等前缀。
- 使用 `*` 允许任何发送者/频道。
- 当存在 `guilds.<id>.channels` 时，未列出的频道默认被拒绝。
- 要允许**无频道**，设置 `channels.discord.groupPolicy: "disabled"`（或保留空白名单）。
- 当省略 `guilds.<id>.channels` 时，已列入白名单的公会中的所有频道都被允许。
- 在启动时，当令牌允许时，OpenClaw 将白名单中的频道/用户名解析为 ID（并记录映射）；未解析的条目保持为输入。
- 原生命令注册的命令镜像 OpenClaw 的聊天命令。
- 原生命令遵循与 DM/公会消息相同的白名单（`channels.discord.dm.allowFrom`、`channels.discord.guilds`、每个频道规则）。
- 斜杠命令可能对 Discord UI 中未被列入白名单的用户仍然可见；OpenClaw 在执行时强制执行白名单并对"未授权"作出响应。
- 使用 `commands.useAccessGroups: false` 绕过命令的访问组检查。

**原生命令说明**：

- 注册的命令镜像 OpenClaw 的聊天命令。
- 原生命令在公会中尊重相同的白名单（`channels.discord.dm.allowFrom`、`channels.discord.guilds`、每个频道规则）。
- 斜杠命令可能仍然对 Discord UI 中未被列入白名单的用户可见；OpenClaw 在执行时强制执行白名单并对"未授权"作出响应。

## 工具动作

agent 可以调用 `discord` 执行如下动作：

- `react` / `reactions`（添加或列出反应）
- `sticker`、`poll`、`permissions`
- `readMessages`、`sendMessage`、`editMessage`、`deleteMessage`
- `threadCreate`、`threadList`、`threadReply`
- `pinMessage`、`unpinMessage`、`listPins`
- `searchMessages`、`memberInfo`、`roleInfo`、`roleAdd`、`roleRemove`
- `channelInfo`、`channelList`、`voiceStatus`、`eventList`、`eventCreate`
- `timeout`、`kick`、`ban`

读取/搜索/固定工具载荷中包含规范化的 `timestampMs`（UTC 纪元毫秒）和 `timestampUtc`，以及原始 Discord `timestamp`。
Discord 消息 id 作为注入的上下文（`[discord message id: …]` 和历史行）中被暴露，以便 agent 可以定位它们。
表情符号可以是 unicode（例如，`✅`）或自定义表情符号语法，如 `<:party_blob:1234567890>`。

## 安全 & 运维

- 将 bot token 视为密码；在受管主机上倾向于使用 `DISCORD_BOT_TOKEN` 环境变量或锁定配置文件权限。
- 只授予 bot 所需的权限（通常为读取/发送消息）。
- 如果 bot 卡住或被速率限制，重启 gateway（在确认没有其他进程拥有 Discord 会话后，通过 `openclaw gateway --force`）。

## PluralKit（PK）支持

启用 PK 查找，以便代理消息解析为底层系统 + 成员。启用后，OpenClaw 使用成员身份进行白名单和将发送者标记为 `Member (PK:System)` 以避免意外的 Discord ping。

```json5
{
  channels: {
      discord: {
                pluralkit: {
                      enabled: true,
                      token: "pk_live_...", // 可选；私有系统所必需
                    },
          },
  },
}
```

**PK 启用时的白名单说明**：

- 在 `dm.allowFrom`、`guilds.<id>.users` 或每个频道 `users` 中使用 `pk:<memberId>`。
- 成员显示名称也通过名称/slug 匹配。
- 查找使用**原始** Discord 消息 ID（代理前消息），因此 PK API 仅在其 30 分钟窗口内解析它。
- 如果 PK 查找失败（例如，没有令牌的私有系统），代理消息被视为 bot 消息并在 `channels.discord.allowBots=true` 之前被丢弃。

### 工具操作默认值

| 操作组        | 默认    | 说明                              |
| -------------- | -------- | ---------------------------------- |
| reactions      | 已启用  | 反应 + 读取反应               |
| stickers       | 已启用  | 发送贴纸                       |
| emojiUploads   | 已启用  | 上传表情符号                    |
| stickerUploads | 已启用  | 上传贴纸                       |
| polls          | 已启用  | 创建投票                         |
| permissions    | 已启用  | 频道权限快照                   |
| messages       | 已启用  | 读取/发送/编辑/删除              |
| threads        | 已启用  | 创建/列出/回覆                  |
| pins           | 已启用  | 固定/取消固定/列出                  |
| search         | 已启用  | 消息搜索（预览功能）   |
| memberInfo     | 已启用  | 成员信息                         |
| roleInfo       | 已启用  | 角色列表                          |
| channelInfo    | 已启用  | 频道信息 + 列出                |
| voiceStatus    | 已启用  | 语音状态查找                   |
| events         | 已启用  | 列出/创建计划事件           |
| roles          | 已禁用  | 角色添加/删除                     |
| moderation     | 已禁用  | 超时/踢出/封禁                  |

- `replyToMode`：`off`（默认）、`first` 或 `all`。仅在模型包含回复标签时应用。
