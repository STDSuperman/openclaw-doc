---
title: "Windows 平台指南"
category: "平台指南"
difficulty: "beginner"
estimated_time: "15 min"
tags: ["windows", "wsl2", "gateway", "cli"]
prerequisites: ["快速开始"]
related_docs: ["Gateway运维", "配置与运维"]
next_steps: ["Linux指南", "iOS指南"]
last_updated: "2026-01-01"
source: "docs/platforms/windows.md"
---


# Windows 平台指南(WSL2)

OpenClaw 在 Windows 上**通过 WSL2 运行**(推荐)。CLI 和 Gateway 运行在 Linux 内部,
使运行时一致且工具兼容性更好(Node/Bun/pnpm, Linux 二进制,技能)。
原生 Windows 安装未经测试且问题较多。

## 快速入门(WSL2)

### 1) 安装 WSL2 + Ubuntu

打开 PowerShell(管理员):

```powershell
wsl --install
# 或选择发行版:
wsl --list --online
wsl --install -d Ubuntu-24.04
```

如果 Windows 询问则重启。

### 2) 安装 OpenClaw

在 WSL 终端内:

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm ui:build  # 首次运行自动安装 UI 依赖
pnpm build
openclaw onboard --install-daemon
```

### 3) 从你的电脑访问

```bash
# 替换 <username> 和 <host-ip>
ssh -N -L 2222:localhost <username>@<host-ip>
```

然后打开 `http://127.0.0.1:18789/`

## Gateway

- [Gateway 运行指南](/04-配置与运维/02-Gateway运维)
- [Gateway 配置](/04-配置与运维/00-配置文件说明)

## Gateway 服务安装(CLI)

在 WSL 内部:

```bash
openclaw gateway install
```

或:

```bash
openclaw configure
# 选择 Gateway service
```

## 高级:通过端口代理在 LAN 上公开 WSL 服务

WSL 有自己的虚拟网络。如果另一台机器需要访问在 **WSL 内部** 运行的服务(SSH、本地 TTS 服务器或 Gateway),
你必须将 Windows 端口转发到当前 WSL IP。

### 获取 WSL IP

```powershell
# PowerShell (管理员)
$Distro = "Ubuntu-24.04"
$ListenPort = 2222
$TargetPort = 22
$WslIp = (wsl -d $Distro --hostname -I).Trim().Split(" ")[0]
if (-not $WslIp) { throw "WSL IP not found." }

netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=$ListenPort `
  connectaddress=$WslIp connectport=$TargetPort
```

### 允许通过 Windows 防火墙(一次性)

```powershell
New-NetFirewallRule -DisplayName "WSL SSH $ListenPort" -Direction Inbound `
  -Protocol TCP -LocalPort $ListenPort -Action Allow
```

### WSL 重启后刷新端口代理

```powershell
netsh interface portproxy delete v4tov4 listenport=$ListenPort listenaddress=0.0.0.0 | Out-Null
netsh interface portproxy add v4tov4 listenport=$ListenPort listenaddress=0.0.0.0 `
  connectaddress=$WslIp connectport=$TargetPort | Out-Null
```

注意:

- 来自另一台机器的 SSH 目标 **Windows 主机 IP**(例如:`ssh user@windows-host -p 2222`)
- 节点必须指向 **可访问的 Gateway URL**(不是 `127.0.0.1`);使用 `openclaw status --all` 确认
- 使用 `listenaddress=0.0.0.0` 进行 LAN 访问;`127.0.0.1` 保持仅本地
- 如果需要自动化,在登录时注册计划任务以刷新

## 修复/迁移

```bash
openclaw doctor
```

## 注意事项

- WSL IP 在重启后会更改,因此你可能需要更新端口代理规则
- 从远程机器访问 WSL 服务时,确保节点指向正确的 Gateway URL
