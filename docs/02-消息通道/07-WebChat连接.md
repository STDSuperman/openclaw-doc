---
title: "WebChat 连接配置"
category: "消息通道"
difficulty: "beginner"
estimated_time: "10 min"
tags: ["webchat", "channels", "ui", "gateway"]
prerequisites:
  - OpenClaw Gateway 已安装
  - macOS/iOS 应用或 Web UI
related_docs:
  - "00-快速开始/04-首次连接"
  - "03-核心概念/01-Gateway网关"
next_steps:
  - "08-平台对比与选择"
last_updated: "2026-02-01"
source: "docs/web/webchat.md"
---

<ai-only>
**摘要**: 本文档介绍 WebChat 通道，它是 macOS/iOS SwiftUI 聊天 UI，直接与 Gateway WebSocket 通信，提供与其它通道相同的会话和路由规则。
</ai-only>

# WebChat（Gateway WebSocket UI）

**状态**: macOS/iOS SwiftUI 聊天 UI，与 Gateway WebSocket 直接通信。

<ai-search-key>
WebChat, SwiftUI, WebSocket UI, 本地连接, 会话共享, 路由规则, 历史获取, 消息发送, 消息注入, 远程访问, SSH隧穿, Tailscale
</ai-search-key>

## 核心概念

- Gateway 的原生聊天 UI（无嵌入式浏览器，无本地静态服务器）。
- 使用与其它通道相同的会话和路由规则。
- 确定性路由：回复始终返回 WebChat。

## 快速开始

1. 启动 gateway。
2. 打开 WebChat UI（macOS/iOS 应用）或**控制 UI 聊天标签**。
3. 确保 gateway 认证已配置（默认必需，即使在环回上）。

## 工作原理（行为）

- UI 连接到 Gateway WebSocket 并使用 `chat.history`、`chat.send` 和 `chat.inject`。
- `chat.inject` 直接将助手笔记追加到脚本并向 UI 广播（无 agent 运行）。
- 历史始终从 gateway 获取（无本地文件监视）。
- 如果 gateway 不可达，WebChat 变为只读。

## 远程使用

- 远程模式通过 SSH/Tailscale 隧道传输 gateway WebSocket。
- 你不需要运行单独的 WebChat 服务器。

### 远程模式隧穿

Gateway 通过以下方式支持远程 WebSocket 连接：

**SSH 隧穿**：
- 通过 SSH 将本地端口转发到远程主机。
- 需要远程主机上的 SSH 访问。

**Tailscale**：
- 通过 Tailscale Serve（私用仪表板）或 Funnel（公网）暴露。
- 参考：[Tailscale 集成](/04-配置与运维/05-远程访问)文档。

### 远程隧道配置

使用这些选项配置 Gateway，以便从远程 WebChat UI 安全连接：

- **Tailscale**：暴露私用仪表板和公网 webhook 路径。
- **SSH**：直接 TCP 隧穿到本地 Gateway。

## 配置参考（WebChat）

完整配置：[配置](/04-配置与运维/00-配置文件说明)

**通道选项**：

- WebChat 没有专用的 `webchat.*` 配置块。它使用以下 gateway 端点和认证设置：

- **Gateway 端点/绑定**：
  - `gateway.port`, `gateway.bind`：WebSocket 主机/端口。
  - **认证**：
    - `gateway.auth.mode`, `gateway.auth.token`：WebSocket 认证。
    - `gateway.remote.url`, `gateway.remote.token`, `gateway.remote.password`：远程 gateway 目标。
- **会话存储**：
  - `session.*`：会话存储和主密钥默认值。

**相关全局选项**：

- **端点配置**：
  - `gateway.port`：WebSocket 端口（默认 18789）。
  - `gateway.bind`：绑定地址（默认 `loopback`）。
- **认证配置**：
  - `gateway.auth.mode`：认证模式（`password`、`token`、`none`）。
  - `gateway.auth.token`：Bearer token 认证（如果模式为 `token`）。
  - `gateway.auth.password`：密码认证（如果模式为 `password`）。
- **远程目标**：
  - `gateway.remote.url`：远程 gateway URL。
  - `gateway.remote.token`：远程 gateway token。
  - `gateway.remote.password`：远程 gateway 密码。
- **会话配置**：
  - `session.*`：会话作用域、空闲、存储、主密钥。

## 使用说明

1. **启动 Gateway**：确保 OpenClaw Gateway 正在运行。
2. **打开 UI**：
   - **macOS/iOS 应用**：直接打开 WebChat 标签页。
   - **控制 UI**：打开 Gateway 的"控制"UI，切换到"聊天"标签。
3. **验证连接**：
   - 确认已认证到 Gateway。
   - 查看聊天历史是否加载成功。

### 本地连接

- 如果在本地网络（同一主机），WebChat UI 会直接连接到 Gateway。
- 无需额外配置，仅需确保 Gateway 正在运行且认证已设置。

### 远程连接

- 如果使用 SSH 隧穿或 Tailscale：
  1. 配置远程隧道（参考上方说明）。
  2. 确保防火墙允许隧道访问。
  3. 在 WebChat UI 中连接到远程 Gateway 地址。

### 功能特性

- **消息发送**：使用 `chat.send` 向 WebChat UI 发送消息。
- **消息注入**：使用 `chat.inject` 直接向 UI 广播系统通知（无需 agent 执行）。
- **历史记录**：从 Gateway 获取并显示聊天历史。
- **只读模式**：当 Gateway 不可达时，UI 变为只读（无法发送消息）。

## 认证配置

### 环回本认证

默认情况下，Gateway 在环回接口（`127.0.0.1`）上运行并允许本地连接。推荐以下配置：

```json5
{
  "gateway": {
      "bind": "loopback",
      "port": 18789
    },
  "session": {
      "mainKey": "local"
    }
}
```

### 远程认证

如果通过远程隧道连接到 Gateway，可以配置认证：

**密码认证**：

```json5
{
  "gateway": {
      "remote": {
                    "url": "https://your-gateway.example.com",
                    "password": "your-secure-password"
                  }
    },
  "session": {
      "mainKey": "remote"
    }
}
```

**Token 认证**：

```json5
{
  "gateway": {
      "remote": {
                    "url": "https://your-gateway.example.com",
                    "token": "your-bearer-token"
                  }
    },
  "session": {
      "mainKey": "remote"
    }
}
```

### 认证模式

- `gateway.auth.mode`：控制认证方式。
  - `password`：使用密码认证。
  - `token`：使用 Bearer token 认证。
  - `none`：无需认证（仅环回本地）。

### 多会话管理

如果同时使用本地和远程 WebChat，可以配置多会话：

```json5
{
  "session": {
      "mainKey": "multi"
    }
}
```

## 故障排查

### 连接问题

**无法连接到 Gateway**：
- 检查 Gateway 是否正在运行。
- 验证认证配置是否正确。
- 确认防火墙或隧道配置是否正确。

**消息发送失败**：
- 确认 Gateway 可达。
- 检查认证是否有效。
- 查看 Gateway 日志。

### 相关文档

- [Gateway 网关](/03-核心概念/01-Gateway网关)
- [配置](/04-配置与运维/00-配置文件说明)
- [远程访问](/04-配置与运维/05-远程访问)
