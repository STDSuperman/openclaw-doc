---
title: "Google Chat 连接配置"
category: "消息通道"
difficulty: "intermediate"
estimated_time: "25 min"
tags: ["googlechat", "channels", "setup", "service-account", "webhook"]
prerequisites:
  - Google Cloud 项目和 Google Chat API 已启用
  - 服务账号（Service Account）已创建
  - OpenClaw Gateway 已安装
related_docs:
  - "00-快速开始/04-首次连接"
  - "04-配置与运维/00-配置文件说明"
next_steps:
  - "06-iMessage连接"
last_updated: "2026-02-01"
source: "docs/channels/googlechat.md"
---


# Google Chat 连接配置（Chat API）

**状态**: 已就绪，支持通过 Google Chat API webhook 的 DM 和群组空间（仅 HTTP）。

<ai-search-key>
Google Chat, Chat API, 服务账号, 应用配置, webhook受众, Tailscale, 反向代理, 消息路由, 提及闸门, 反应, 输入指示符, 媒体限制
</ai-search-key>

## 快速入门（适合新手）

1. 创建一个 Google Cloud 项目并启用 **Google Chat API**。
2. 创建一个 **服务账号**：
   - 按**创建凭证** > **服务账号**进入。
   - 命名取任何你想要的（例如，`openclaw-chat`）。
   - 保留权限为空（按**继续**）。
   - 保留"具有访问权限的委托人"为空（按**继续**）。
3. 创建并下载 **JSON 密钥**：
   - 在服务账号列表中，点击你刚创建的账号。
   - 转到**密钥**标签。
   - 点击**添加密钥** > **创建新密钥**。
   - 选择 **JSON**并按**创建**。
   - 将下载的 JSON 文件存储在你的 gateway 主机上（例如，`~/.openclaw/googlechat-service-account.json`）。
4. 在 Google Cloud Console 的[Google Chat API 配置](https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat)中创建一个 Google Chat 应用：
   - 填写**应用信息**：
     - **应用名称**：（例如，`OpenClaw`）
     - **头像 URL**：（例如，`https://openclaw.ai/logo.png`）
     - **描述**：（例如，`个人 AI 助手`）
   - 启用**交互功能**。
   - 在**功能**下，检查**加入群组和群组会话**。
   - 在**连接设置**下，选择 **HTTP 端点 URL**。
   - 在**触发器**下，选择**为所有触发器使用通用的 HTTP 端点 URL**并设置为你的 gateway 的 webhook 路径。
     - _提示：运行 `openclaw status` 以查找你的 gateway 的公共 URL。_
   - 在**可见性**下，在**&lt;你的域名&gt;****文本框中输入你的电子邮件地址（例如，`user@example.com`）。
   - 点击页面底部的**保存**。
5. **启用应用状态**：
   - 保存后，**刷新**页面。
   - 寻找**应用状态**部分（通常在顶部或底部附近）。
   - 将状态更改为**实时 - 对用户可用**。
   - 再次点击**保存**。
6. 使用服务账号路径 + webhook 受众配置 OpenClaw：
   - 环境变量：`GOOGLE_CHAT_SERVICE_ACCOUNT_FILE=/path/to/service-account.json`
   - 或配置：`channels.googlechat.serviceAccountFile: "/path/to/service-account.json"`。
7. 设置 webhook 受众类型 + 值（匹配你的 Chat 应用配置）。
8. 启动 gateway。Google Chat 将向你的 webhook 路径 POST 请求。

## 添加到 Google Chat

在 gateway 运行且你的电子邮件被添加到可见性列表后：

1. 访问 [Google Chat](https://chat.google.com/)。
2. 点击 **+**（加号）**直接消息**图标旁边的搜索栏。
3. 在通常添加联系人/人的搜索栏中，输入**应用名称**你配置的（例如，`OpenClaw`。
   - _注意_：bot **不会**出现在"市场"浏览列表中，因为它是私有应用。你必须通过名称搜索它。_
4. 从结果中选择你的 bot。
5. 点击**添加**或**开始聊天**以启动 1:1 对话。
6. 发送"你好"以触发助手！

## 公共 URL（仅 webhook）

Google Chat webhook 需要公共 HTTPS 端点。为了安全，**仅暴露 `/googlechat` 路径**到互联网。保持 OpenClaw 仪表板和其他敏感端点在你的私用网络上。

### 选项 A：Tailscale Funnel（推荐）

使用 Tailscale Serve 获取私用仪表板，并使用 Funnel 获取公共 webhook 路径。这将在保持 `/` 私有的同时仅暴露 `/googlechat`。

1. **检查你的 gateway 绑定到什么地址**：

   ```bash
      ss -tlnp | grep 18789
      ```

   _注意 IP 地址_（例如，`127.0.0.1`、`0.0.0.0` 或你的 Tailscale IP 如 `100.x.x.x`）。

2. **仅向 tailnet 暴露仪表板（端口 8443）**：

   ```bash
      # 如果绑定到 localhost（127.0.0.1 或 0.0.0.0）：
      tailscale serve --bg --https 8443 http://127.0.0.1:18789

      # 如果仅绑定到 Tailscale IP（例如，100.106.161.80）：
      tailscale serve --bg --https 8443 http://100.106.161.80:18789
      ```

3. **仅公开 webhook 路径**：

   ```bash
      # 如果绑定到 localhost（127.0.0.1 或 0.0.0.0）：
      tailscale funnel --bg --set-path /googlechat http://127.0.0.1:18789/googlechat

      # 如果绑定到 Tailscale IP 仅（例如，100.106.161.80）：
      tailscale funnel --bg --set-path /googlechat http://100.106.161.80:18789/googlechat
      ```

4. **为节点授权 Funnel 访问**：
   如果出现提示，访问输出中显示的授权 URL 以在 tailnet 策略中为此节点启用 Funnel。

5. **验证配置**：

   ```bash
      tailscale serve status
      tailscale funnel status
      ```

你的公共 webhook URL 将是：

`https://<node-name>.<tailnet>.ts.net/googlechat`

你的私用仪表板保持仅 tailnet 可访问：

`https://<node-name>.<tailnet>.ts.net:8443/`

_注意：_此配置在重启后持久化。要稍后移除它，运行 `tailscale funnel reset` 和 `tailscale serve reset`。

### 选项 B：反向代理（Caddy）

如果你使用反向代理（如 Caddy），仅代理特定路径：

```caddy
your-domain.com {
      reverse_proxy /googlechat* localhost:18789
    }
```

使用此配置，任何对 `your-domain.com/` 的请求都将被忽略或返回 404，而 `your-domain.com/googlechat` 被安全路由到 OpenClaw。

### 选项 C：Cloudflare 隧道

配置隧道的入站规则以仅路由到 webhook 路径：

- **路径**：`/googlechat` -> `http://localhost:18789/googlechat`
- **默认规则**：HTTP 404（未找到）

## 工作原理

1. Google Chat 向 gateway 的 webhook 路径发送 webhook POST 请求。每个请求包括 `Authorization: Bearer <token>` 头。
2. OpenClaw 根据配置的 `audienceType` + `audience` 验证令牌：
   - `audienceType: "app-url"` → 受众是你的 HTTPS webhook URL。
   - `audienceType: "project-number"` → 受众是云项目编号。
3. 消息按空间路由：
   - DM 使用会话密钥 `agent:<agentId>:googlechat:dm:<spaceId>`。
   - 群组空间使用会话密钥 `agent:<agentId>:googlechat:group:<spaceId>`。
4. DM 访问默认为配对。未知发送者收到配对码；通过以下命令批准：
   - `openclaw pairing approve googlechat <code>`
5. 群组空间默认需要 @-提及。使用 `botUser`（如果提及检测需要应用的用户名）。

## 目标标识符

用于投递和允许列表：

- **直接消息**：`users/<userId>` 或 `users/<email>`（电子邮件地址被接受）。
- **群组空间**：`spaces/<spaceId>`。

## 配置亮点

```json5
{
  channels: {
      googlechat: {
          enabled: true,
          serviceAccountFile: "/path/to/service-account.json",
          audienceType: "app-url",
          audience: "https://gateway.example.com/googlechat",
          webhookPath: "/googlechat",
          botUser: "users/1234567890", // 可选；有助于提及检测
          dm: {
                      policy: "pairing",
                      allowFrom: ["users/1234567890", "name@example.com"],
                    },
          groupPolicy: "allowlist",
          groups: {
                      "spaces/AAAA": {
                                          allow: true,
                                          requireMention: true,
                                          users: ["users/1234567890"],
                                          systemPrompt: "仅简短答案。",
                                        },
                    },
          actions: { reactions: true },
          typingIndicator: "message",
          mediaMaxMb: 20,
        },
  },
}
```

**说明**：

- 服务账号凭证也可以作为字符串通过 `serviceAccount`（JSON 字符串）内联传递。
- 如果未设置 `webhookPath`，则默认为 `/googlechat`。
- 反应通过 `reactions` 工具和 `channels action` 在 `actions.reactions` 启用时可用。
- `typingIndicator` 支持 `none`、`message`（默认）和 `reaction`（需要用户 OAuth）。
- 附件通过 Chat API 获取并存储在媒体管线中（大小受 `mediaMaxMb` 限制）。

## 故障排查

### 405 方法不允许

如果 Google Cloud 日志浏览器显示如下错误：

```
status code: 405, reason phrase: HTTP error response: HTTP/1.1 405 Method Not Allowed
```

这意味着 webhook 处理程序未注册。常见原因：

1. **未配置频道**：配置中缺少 `channels.googlechat` 部分。使用以下命令验证：
   
   ```bash
      openclaw config get channels.googlechat
      ```

   如果返回"配置路径未找到"，则添加配置（参见[配置亮点](#配置亮点)）。

2. **插件未启用**：检查插件状态：
   
   ```bash
      openclaw plugins list | grep googlechat
      ```

   如果显示"disabled"，则添加 `plugins.entries.googlechat.enabled: true` 到你的配置。

3. **Gateway 未重启**：添加配置后，重启 gateway：
   
   ```bash
      openclaw gateway restart
      ```

**验证频道正在运行**：

```bash
openclaw channels status
# 应该显示：Google Chat 默认：enabled, configured, ...
```

### 其他问题

- 使用 `openclaw channels status --probe` 检查身份验证错误或缺失的受众配置。
- 如果没有消息到达，确认 Chat 应用的 webhook URL + 事件订阅。
- 如果提及闸门阻止回复，设置 `botUser` 为应用的用户资源名称并验证 `requireMention`。
- 在发送测试消息时使用 `openclaw logs --follow` 以查看请求是否到达 gateway。

**相关文档**：

- [网关配置](/04-配置与运维/00-配置文件说明)
- [安全](/04-配置与运维/06-安全配置)
- [反应](/06-工具与功能/02-消息工具#反应)
