---
title: "常见问题 FAQ"
category: "快速开始"
difficulty: "入门"
estimated_time: "15分钟阅读"
tags:
  - FAQ
  - 问题
  - 故障排查
prerequisites:
  - "[已完成安装](./02-5分钟安装指南.md)"
  - "[已完成配置](./03-向导式配置.md)"
  - "[完成首次连接](./04-首次连接.md)"
related_docs:
  - []
next_steps:
  - []
last_updated: "2026-02-01"
---

# 常见问题 FAQ


---

## 安装相关

### Q1: 安装后 `openclaw: command not found`？

**A**: Node.js 全局路径未添加到环境变量 PATH。

**解决方案**：

**方法 1：检查安装位置**
```bash
# 查看全局安装位置
npm list -g openclaw

# macOS/Linux 通常在
# /usr/local/lib/node_modules/openclaw
# ~/.npm-global/node_modules/openclaw
```

**方法 2：添加到 PATH（macOS/Linux）**

```bash
export PATH="$(npm prefix -g)/bin:$PATH"

# 或编辑 shell 配置文件
echo 'export PATH="$(npm prefix -g)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**方法 3：添加到 PATH（Windows）**

```powershell
# 打开系统环境变量设置
[System.Environment]::SetEnvironmentVariable("Path", "$Env:Path;$(npm prefix -g)", "User")

# 刷新环境变量（需要重启终端）
```

**验证**：
```bash
# 重新打开终端或运行
which openclaw
# 应该显示安装路径
```

---

### Q2: Windows WSL2 安装问题

**A**: WSL2 内的 Node.js 版本过旧或工具链不完整。

**解决方案**：

```bash
# 更新 WSL2
sudo apt update && sudo apt upgrade -y

# 安装新版 Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo bash -
```

**Windows 特定提示**：
- ✅ 使用 WSL2 版本 2（Ubuntu 22.04 LTS）
- ⚠️ 避免在 WSL1 中运行 OpenClaw（支持不佳）
- 💡 使用 `sudo npm install -g` 避免权限问题

---

### Q3: Bun 已知问题

**A**: Bun 在某些场景下与 WhatsApp 或 Telegram 通道不兼容。

**解决方案**：
- ✅ 使用 Node.js 运行 Gateway（推荐）
- 📋 查看 [Issue 跟踪页面](https://github.com/openclaw/openclaw/issues?q=is%3Aissue+bun)

---

### Q4: `sharp` 安装失败

**A**: 系统有全局 libvips 导致 sharp 原生编译失败。

**解决方案**：

**方法 1：强制使用预构建二进制**

```bash
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest
```

**方法 2：安装构建工具（如需要）**

```bash
npm install -g node-gyp
```

---

## 配置相关

### Q5: 配置文件语法错误

**A**: JSON5 格式不正确，Gateway 拒绝启动。

**解决方案**：

```bash
# 验证配置文件语法
openclaw doctor --fix

# 或手动检查
cat ~/.openclaw/openclaw.json
```

---

### Q6: 如何重置配置？

**A**: 配置出现问题或想从头开始。

**解决方案**：

```bash
# 完全重置（删除配置、会话、技能）
openclaw onboard --reset

# 仅重置配置但保留会话
openclaw config reset --keep-sessions

# 删除特定配置项
openclaw config unset channels.whatsapp.allowFrom
```

---

### Q7: 模型认证失败

**A**: API Key 无效或格式错误。

**解决方案**：

```bash
# 验证 API Key 格式（Anthropic: sk-ant-xxx）
openclaw config set models.providers.anthropic.apiKey "sk-ant-xxx"

# 测试连接
openclaw health

# 查看错误日志
openclaw logs --level error
```

---

## 消息通道相关

### Q8: WhatsApp QR 码不显示

**A**: Gateway 未正确启动或网络问题。

**解决方案**：

```bash
# 检查 Gateway 状态
openclaw gateway status

# 检查 WhatsApp 通道
openclaw channels status whatsapp

# 重新连接
openclaw channels login whatsapp
```

---

### Q9: Telegram Bot 无响应

**A**: Bot Token 错误或未正确配置。

**解决方案**：

```bash
# 检查 Bot 配置
openclaw config get channels.telegram

# 验证 Bot Token（格式：123456:ABC-DEF）
openclaw config set channels.telegram.botToken "123456:ABC-DEF"

# 检查 Bot 权限
# 在 Telegram 中向 Bot 发送 /start 查看命令列表
```

---

### Q10: Discord Bot 无权限

**A**: Bot 缺少必要 Intent 权限。

**解决方案**：

1. 检查 Bot 配置页面的 Privileged Intents
2. 确保 "Message Content Intent" 已启用
3. 重新邀请 Bot 到服务器

```bash
# 检查连接状态
openclaw channels status discord
```

---

## 网关与连接相关

### Q11: 无法连接到远程 Gateway

**A**: SSH 隧道中断或认证失败。

**解决方案**：

```bash
# 检查 SSH 连接
ssh user@host -p 2222

# 测试 Gateway WebSocket 连接
telnet host 18789
```

---

### Q12: Dashboard 无法打开

**A**: Gateway 未运行或端口被占用。

**解决方案**：

```bash
# 检查 Gateway 状态
openclaw gateway status

# 检查端口占用
lsof -i :18789

# 或更换端口
openclaw config set gateway.port 18790
```

---

## 技能相关

### Q13: AI 不响应

**A**: 模型认证失败或请求超时。

**解决方案**：

```bash
# 检查健康状态
openclaw health

# 查看配置
openclaw config get

# 查看日志
openclaw logs --tail 100
```

---

### Q14: 消息发送失败

**A**: 目标平台未连接或配置错误。

**解决方案**：

```bash
# 检查所有通道状态
openclaw channels status --all

# 检查特定通道
openclaw channels status whatsapp
openclaw channels status telegram
```

---

## 运维与部署

### Q15: 后台服务启动失败

**A**: systemd/LaunchAgent 配置错误或权限不足。

**解决方案**：

```bash
# 检查 systemd 状态
sudo systemctl status openclaw-gateway

# 查看详细日志
sudo journalctl -u openclaw-gateway -n 50

# 检查配置文件语法
systemctl cat openclaw-gateway.service

# 重新加载配置
sudo systemctl daemon-reload
sudo systemctl restart openclaw-gateway
```

---

### Q16: Docker 部署问题

**A**: 容器启动失败或网络问题。

**解决方案**：

```bash
# 查看容器状态
docker ps -a

# 查看容器日志
docker logs openclaw-gateway

# 重启容器
docker restart openclaw-gateway
```

---

## 性能优化

### Q17: 响应速度慢

**A**: 网络延迟或模型响应慢。

**解决方案**：

1. 检查网络连接速度
2. 尝试更快的模型（如 Claude 3.5 Opus → GPT-4o-mini）
3. 减少上下文窗口大小（使用 `/compact` 命令）
4. 启用流式响应（某些模型默认启用）

---

### Q18: 内存使用过高

**A**: 会话历史累积过多。

**解决方案**：

```bash
# 自动压缩会话（Gateway 默认行为）
openclaw config set session.maxMessages 50

# 手动压缩特定会话
openclaw compact --session "agent:main:whatsapp:dm:+86138000000"
```

---

## 安全相关

### Q19: 如何启用 HTTPS？

**A**: 使用 Nginx 或 Caddy 反向代理。

**解决方案**：

```nginx
# Nginx 配置示例
server {
    listen 443 ssl;
    server_name docs.openclaw.ai;
    
    location / {
        proxy_pass http://127.0.0.1:18789;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

### Q20: 如何备份配置？

**A**: 定期备份配置文件以防丢失。

**解决方案**：

```bash
# 备份配置文件
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.backup.$(date +%Y%m%d)

# 备份工作空间
tar -czf ~/.openclaw/workspace-backup-$(date +%Y%m%d).tar.gz ~/.openclaw/workspace
```

---

## 获取更多帮助

### 其他资源

- **GitHub Issues**: https://github.com/openclaw/openclaw/issues
- **Discord 社区**: https://discord.gg/clawd
- **官方文档**: https://docs.openclaw.ai
- **DeepWiki**: https://deepwiki.com/openclaw/openclaw

---

<ai-search-key>
安装, 配置, 消息通道, 网关, 连接, 技能, 性能, 安全, 备份, 问题, 故障排查, 日志
</ai-search-key>

*最后更新：2026-02-01*

---

**提示**：如果这里没有找到答案，请查看 [文档导航](../00-文档导航.md) 寻找相关章节，或在 [GitHub Issues](https://github.com/openclaw/openclaw/issues) 提问。
