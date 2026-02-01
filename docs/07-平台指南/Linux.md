---
title: "Linux 平台指南"
category: "平台指南"
difficulty: "beginner"
estimated_time: "15 min"
tags: ["linux", "systemd", "gateway", "cli"]
prerequisites: ["快速开始", "配置与运维"]
related_docs: ["Gateway运维", "配置文件说明"]
next_steps: ["Android节点"]
last_updated: "2026-01-01"
source: "docs/platforms/linux.md"
---


# Linux 平台指南

Gateway 在 Linux 上完全受支持。**Node 是推荐运行时**(macOS 的 Bun 会导致 WhatsApp/Telegram 问题)。

## 初学者快速路径(VPS)

### 1) 安装 Node 22+

```bash
curl -fsSL https://nodejs.org | sudo bash -
sudo apt install -y nodejs npm
```

或使用 Node 版本管理器:

```bash
nvm install 22
nvm use 22
```

### 2) 安装 OpenClaw

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
npm i -g openclaw@latest
# 或
pnpm add -g openclaw@latest
```

### 3) 初始化并启动

```bash
openclaw onboard --install-daemon
```

从你的笔记本电脑:

```bash
ssh -N -L 18789:127.0.0.1 user@your-vps
```

然后打开 `http://127.0.0.1:18789/`

## Gateway

- [Gateway 运行指南](/04-配置与运维/02-Gateway运维)
- [Gateway 配置](/04-配置与运维/00-配置文件说明)

## Gateway 服务安装(CLI)

```bash
openclaw gateway install
```

或:

```bash
openclaw configure
# 选择 Gateway service
```

## 系统控制(systemd 用户单元)

OpenClaw 默认安装 systemd **用户** 服务。使用 `system` 服务进行共享或常开服务器。

完整的单元示例和指导在 [Gateway 运行指南](/04-配置与运维/02-Gateway运维)。

### 最小设置

创建 `~/.config/systemd/user/openclaw-gateway[-<profile>].service`:

```ini
[Unit]
Description=OpenClaw Gateway (profile: <profile>, v<version>)
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/local/bin/openclaw gateway --port 18789
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
```

启用它:

```bash
systemctl --user enable --now openclaw-gateway[-<profile>].service
```

注意:

- 如果使用 `--profile`,在服务名称中替换为 `openclaw-gateway.<profile>`
- `After=network-online.target` 确保网络已准备就绪
- `Wants=network-online.target` 也要求网络
- `Restart=always` 确保服务在故障后重启

## 安装选项

- [快速开始](/00-快速开始) - 包含主要安装步骤
- [安装 & 更新](/01-安装与更新) - 详细的安装选项
  - [Bun (实验性)](/01-安装与更新/bun)
  - [Docker](/01-安装与更新/docker)
  - [Nix](/01-安装与更新/nix)
- [系统控制](/04-配置与运维/02-Gateway运维) - 完整的 systemd 指南

## 注意事项

- **Node vs Bun**: 在 Linux 上使用 Node 作为 Gateway 运行时。macOS 上的 Bun 会导致 WhatsApp/Telegram 有问题。
- **systemd 用户服务**: 适用于桌面使用。对于共享或常开服务器,考虑使用系统服务。
- **配置文件位置**: `~/.config/systemd/user/` 适用于 systemd 用户服务
