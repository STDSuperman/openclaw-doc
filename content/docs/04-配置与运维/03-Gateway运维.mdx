---
title: "Gateway 运维"
category: "配置与运维"
difficulty: "进阶"
estimated_time: "15分钟阅读"
tags:
  - Gateway
  - 运维
  - 服务管理
  - 监控
  - 备份
prerequisites:
  - "[已完成安装](../00-快速开始/02-5分钟安装指南.md)"
  - "[已完成配置](../00-快速开始/03-向导式配置.md)"
related_docs:
  - ["配置文件说明", "远程访问", "日志与监控"]
next_steps:
  - ["远程访问", "日志与监控"]
last_updated: "2026-02-01"
source: "docs/gateway/doctor.md, docs/gateway/troubleshooting.md"
---

# Gateway 运维

> **TL;DR**: Gateway 是 OpenClaw 的核心进程，需要持续运行、监控和维护。


## 服务管理

### 启动 Gateway

#### 方法 1：前台运行（开发）

```bash
# 使用默认端口
openclaw gateway

# 指定端口
openclaw gateway --port 18789

# 启用详细日志
openclaw gateway --verbose
```

#### 方法 2：后台运行（推荐）

**macOS**

```bash
# 使用 LaunchAgent
sudo launchctl start com.openclaw.gateway

# 检查状态
sudo launchctl list | grep openclaw

# 查看日志
tail -f ~/Library/Logs/com.openclaw.gateway.log

# 停止
sudo launchctl stop com.openclaw.gateway

# 重新启动
sudo launchctl restart com.openclaw.gateway
```

**Linux / WSL2**

```bash
# 使用 systemd
sudo systemctl start --user openclaw-gateway.service

# 检查状态
sudo systemctl status --user openclaw-gateway.service

# 查看日志
journalctl --user -u openclaw-gateway -f

# 停止
sudo systemctl stop --user openclaw-gateway.service

# 重新启动
sudo systemctl restart --user openclaw-gateway.service

# 启用开机自启
sudo systemctl enable --user openclaw-gateway.service
```

---

## 监控 Gateway

### 实时监控

#### 检查进程状态

```bash
# 检查 Gateway 进程
pgrep -f openclaw gateway

# 查看 PID
lsof -i :18789 | grep openclaw

# 检查内存使用
ps aux | grep openclaw gateway | awk '{print $4/1024 "MB ($6/1024"}'
```

#### 查看日志

```bash
# 实时查看日志（最新 50 行）
openclaw logs --tail 50

# 查看特定级别的日志
openclaw logs --level error

# 查看特定模块的日志
openclaw logs --module gateway
```

---

## 健康检查

### 快速检查

```bash
# 基础健康检查
openclaw health

# 包含通道探测的深度检查
openclaw health --probe

# 显示配置状态
openclaw status --all
```

### 健康检查输出

```
🏥 健康检查结果

✓ Gateway: running (PID: 12345)
└─ 运行时间: 2d 14h 32m

✓ 模型配置:
  ├─ 默认模型: anthropic/claude-opus-4-5
  ├─ 提供商: 2 (Anthropic、OpenAI)
  └─ 状态: ✅ 已配置

✓ 通道连接:
  ├─ WhatsApp: ✅ 已连接
  ├─ Telegram: ✅ 已连接
  ├─ Discord: ⏸️ 未配置
  └─ iMessage: ❌ 未启用

✓ 会话:
  ├─ 活跃会话: 3
  ├─ 总消息数: 156
  └─ 内存使用: 245MB / 512MB (47.7%)
```

---

## 日志管理

### 日志位置

```
主目录: ~/.openclaw/logs/
  ├─ gateway.log          # Gateway 主日志
  ├─ agent.log             # Agent 执行日志
  ├─ channels.log           # 通道连接日志
  ├─ error.log             # 错误日志（汇总）
  └─ debug.log            # 调试日志
```

### 日志轮转

```bash
# 配置日志轮转（保留最近 100MB）
openclaw config set logging.rotate.enabled true

# 设置单文件最大 10MB
openclaw config set logging.rotate.maxSize 10485760

# 保留最近 10 个日志文件
openclaw config set logging.rotate.maxFiles 10

# 手动触发轮转
openclaw logs rotate
```

### 日志清理

```bash
# 删除超过 30 天的日志
openclaw logs prune --days 30

# 清空所有日志（危险操作）
openclaw logs clear
```

---

## 备份与恢复

### 配置文件备份

```bash
# 备份配置文件
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.backup

# 备份工作空间
tar -czf ~/.openclaw/workspace-backup-$(date +%Y%m%d).tar.gz ~/.openclaw/workspace

# 列出所有备份
ls -la ~/.openclaw/backups/
```

### 配置文件恢复

```bash
# 恢复备份配置
cp ~/.openclaw/openclaw.json.backup ~/.openclaw/openclaw.json

# 重启 Gateway 使配置生效
sudo systemctl restart --user openclaw-gateway.service

# 或 macOS
sudo launchctl restart com.openclaw.gateway
```

---

## 性能优化

### 内存使用优化

```bash
# 压缩闲置会话释放内存
openclaw compact --all-sessions

# 删除超时闲置会话
openclaw sessions prune --idle-days 7

# 降低最大会话数
openclaw config set session.maxMessages 50
```

### 启动优化

```bash
# 检查启动时间
sudo journalctl -u openclaw-gateway -n 50 --no-pager

# 优化启动配置
openclaw doctor --fix

# 调整超时设置
openclaw config set gateway.auth.timeout 5000
```

---

## 自动化运维

### 定时任务（Cron）

```bash
# 每天凌晨 2 点重启 Gateway
0 2 * * * /usr/bin/openclaw restart > /dev/null 2>&1

# 每周日凌晨 3 点执行健康检查
0 3 * * * $(date +\%u) /usr/bin/openclaw health > /dev/null 2>&1

# 每周日凌晨 4 点清理旧日志
0 4 * * * $(date +\%u) /usr/bin/openclaw logs prune --days 30 > /dev/null 2>&1
```

### 监控脚本

```bash
#!/bin/bash
# monitor-gateway.sh - Gateway 监控脚本

LOG_FILE="/var/log/openclaw-gateway-monitor.log"
ALERT_EMAIL="admin@example.com"
GATEWAY_PID=$(pgrep -f "openclaw gateway" | head -1 | cut -d ' ' -f2)

while true; do
  # 检查进程状态
  if ! ps -p $GATEWAY_PID > /dev/null; then
    echo "[$(date)] Gateway 进程停止！"
    # 发送告警
    echo "Gateway 进程已停止" | mail -s "Gateway Alert" $ALERT_EMAIL
    # 尝试重启
    sudo systemctl restart --user openclaw-gateway.service
    break
  fi
  
  # 检查日志中的错误
  if tail -n 100 ~/.openclaw/logs/error.log | grep -i "error"; then
    ERROR_COUNT=$(tail -n 100 ~/.openclaw/logs/error.log | grep -c "error" | wc -l)
    if [ $ERROR_COUNT -gt 5 ]; then
      echo "[$(date)] 检测到 $ERROR_COUNT 个错误"
    fi
  
  sleep 60
done
```

---

## 故障排查

### 常见问题

**Q1: Gateway 无法启动**

**可能原因**：
1. 端口被占用
2. 配置文件错误
3. 模型认证失败
4. 依赖缺失

**解决方案**：
```bash
# 1. 检查端口占用
lsof -i :18789
netstat -ano | grep 18789

# 2. 验证配置
openclaw doctor

# 3. 检查详细日志
openclaw logs --tail 100

# 4. 检查系统资源
free -h
df -h
```

**Q2: Gateway 频繁重启**

**可能原因**：
1. 内存泄漏
2. 未捕获异常
3. 外部信号终止

**解决方案**：
```bash
# 1. 检查内存使用
ps aux | grep openclaw gateway | awk '{print $4/1024 "MB"}'

# 2. 检查日志中的重启记录
grep -i "restart" ~/.openclaw/logs/gateway.log | tail -20

# 3. 调整 systemd 超时设置
sudo systemctl edit openclaw-gateway.service
# 添加: Restart=on-failure=10s
# 重启服务
sudo systemctl daemon-reload
```

**Q3: 通道连接不稳定**

**可能原因**：
1. 网络不稳定
2. 通道 API 变更
3. 频率限制

**解决方案**：
```bash
# 1. 检查网络连接
ping api.telegram.org
ping wa.me

# 2. 重新连接通道
openclaw channels reconnect whatsapp
openclaw channels reconnect telegram

# 3. 调整重试策略
openclaw config set channels.whatsapp.reconnectInterval 60000  # 1 分钟
```

---

## 最佳实践

### 1. 定期备份

**备份计划**：
- ✅ 每日备份配置文件
- ✅ 每周备份工作空间
- ✅ 保留最近 7 天的日志
- ✅ 将备份文件纳入 Git 管理

### 2. 监控策略

**监控项**：
- ✅ 进程存活监控
- ✅ 错误日志监控
- ✅ 性能指标收集
- ✅ 自动告警（邮件/通知）

### 3. 容量规划

**资源需求**：
| 使用场景 | CPU | 内存 | 磁盘 | 网络 |
|----------|-----|------|------|------|
| **个人使用** | 1-2 核心 | 512MB-1GB | 10-20GB | 宽带 |
| **家庭团队** | 2-4 核心 | 2-4GB | 50-100GB | 千兆 |
| **生产环境** | 4-8 核心 | 4-16GB | 500GB-1TB | 高速 |

### 4. 更新策略

**更新前检查**：
1. ✅ 阅读更新日志
2. ✅ 备份当前配置
3. ✅ 测试配置文件
4. ✅ 在测试环境验证

**更新后验证**：
1. ✅ 检查 Gateway 运行状态
2. ✅ 执行健康检查
3. ✅ 验证通道连接
4. ✅ 测试基本功能

---

## 下一步文档

- [远程访问](./05-远程访问.md) - 学习 SSH 隧道和 Tailscale 配置
- [日志与监控](./08-日志与监控.md) - 深入了解日志管理和监控
- [安全配置](./06-安全配置.md) - 学习安全策略和配置
- [故障排查](./09-故障排查.md) - 深入问题排查流程

---

<ai-search-key>
Gateway, 运维, 服务管理, 启动, 停止, 监控, 健康检查, 日志, 备份, 恢复, 性能优化, 自动化, Cron, 监控脚本, 定期备份, 更新策略, 最佳实践, 故障排查, 重启, 调试
</ai-search-key>

**Gateway 运维要点总结**：
- 🏥 **服务管理**：LaunchAgent/systemd 服务启动、停止、重启
- 📊 **监控**：实时监控进程状态、日志、健康检查
- 📝 **日志**：日志轮转、清理、归档
- 💾 **备份**：配置文件和工作空间定期备份
- 🎯 **性能优化**：内存管理、会话压缩、启动优化
- 🤖 **自动化**：Cron 定时任务、监控脚本
- 🔧 **故障排查**：常见问题和解决方案
- 📋 **最佳实践**：容量规划、更新策略、监控策略

*更多信息请参考 [文档导航](../00-文档导航.md)*
