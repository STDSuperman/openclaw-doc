---
title: "Hooks 参考"
category: "开发者参考"
difficulty: "advanced"
estimated_time: "15 min"
tags: ["hooks", "生命周期", "会话管理", "工具"]
prerequisites: ["核心概念", "配置文件说明"]
related_docs: []
next_steps: []
last_updated: "2026-01-01"
source: "docs/concepts/hooks.md"
---

<ai-only>
**摘要**: Hooks 是 OpenClaw 的生命周期系统,允许在会话的各个阶段注入自定义逻辑,包括启动前钩子、执行后钩子、工具调用钩子等。
</ai-only>

# Hooks 参考

Hooks 是 OpenClaw 的生命周期系统,允许你在 agent 运行的各个阶段注入自定义逻辑。

## Hook 类型

### 启动前钩子(Before Run)

在 agent 开始处理消息之前执行:

- **加载模型前**: 访问原始消息
- **修改系统提示**: 注入或修改提示内容
- **设置会话变量**: 设置初始状态

### 执行后钩子(After Run)

在 agent 完成处理后执行:

- **修改输出**: 处理或格式化响应
- **发送额外消息**: 触发其他操作
- **记录指标**: 收集使用统计
- **触发事件**: 派发自定义事件

### 工具调用钩子(Tool Calls)

在 agent 调用工具之前/之后:

- **调用前验证**: 检查参数和权限
- **调用后处理**: 处理工具返回值
- **错误处理**: 捕获和处理工具错误

## Hook 配置

Hooks 在工作空间技能或配置文件中定义:

### 技能目录

Hook 定义位于 `~/.openclaw/workspace/skills/<skill>/SKILL.md`:

```md
# 技能名称

## 启动前钩子

### @before:run

在 agent 开始前执行的 JavaScript/TypeScript 代码:

```typescript
export default function beforeRun(context) {
  const { message, session } = context;
  
  // 可以修改消息
  context.message = `修改后的消息: ${message}`;
  
  // 可以设置会话变量
  context.session.set('myVar', 'value');
}
```

### @after:run

在 agent 完成后执行的代码:

```typescript
export default function afterRun(context) {
  const { response, session } = context;
  
  // 处理输出
  const processedResponse = processResponse(response);
  
  // 记录指标
  session.metrics.increment('messages_processed');
}
```

### @tool:invoke

在调用工具之前/之后:

```typescript
export default function toolInvoke(context) {
  const { tool, params } = context;
  
  // 调用前验证
  if (!validateTool(tool, params)) {
    throw new Error('Invalid tool parameters');
  }
  
  // 调用后处理
  const result = await callTool(tool, params);
  return processToolResult(result);
}
```

## 内置 Hook

OpenClaw 内置了一些常用 Hook:

### 会话初始化

- 自动加载配置
- 验证工作空间
- 初始化会话状态

### 消息处理

- 自动消息路由
- 组消息解析
- 提及检测

### 工具执行

- 参数验证
- 权限检查
- 错误处理
- 结果处理

### 日志记录

- 自动记录 agent 运行
- 捕获错误和异常
- 记录工具调用

### 指标收集

- 消息计数
- 工具使用统计
- 会话持续时间
- 错误率

## 高级用法

### 条件 Hook

基于条件执行 Hook:

```typescript
export default function conditionalHook(context) {
  const { message, session } = context;
  
  // 只在特定条件下执行
  if (message.includes('!debug') && isAuthorized(session)) {
    return executeDebugHook();
  }
  
  return null;
}
```

### 异步 Hook

支持异步操作:

```typescript
export default async function asyncHook(context) {
  const { session } = context;
  
  // 执行异步操作
  await someAsyncOperation();
  
  // 更新会话状态
  session.set('asyncComplete', true);
}
```

### 错误处理 Hook

全局错误处理:

```typescript
export default function errorHook(context, error) {
  const { session } = context;
  
  // 记录错误
  console.error(`Error in session ${session.id}:`, error);
  
  // 清理资源
  session.cleanup();
  
  // 返回友好的错误消息
  return formatErrorMessage(error);
}
```

## 调试 Hooks

添加调试日志:

```typescript
export default function debugHook(context) {
  const { session, message } = context;
  
  // 详细日志
  console.log(`Processing message: ${message}`);
  console.log(`Session state:`, session.getState());
}
```

## 最佳实践

1. **保持 Hook 简单**: 每个 Hook 应该专注于单一职责
2. **避免副作用**: Hook 不应该修改外部状态
3. **正确处理错误**: 总是提供有意义的错误消息
4. **性能考虑**: 避免在 Hook 中执行耗时操作
5. **测试 Hook**: 确保 Hook 在各种场景下正常工作

## 示例技能

完整的技能示例,展示如何使用 Hooks:

```markdown
# 调试技能

## @before:run
export default function debugLog(context) {
  console.log(`[DEBUG] Incoming: ${context.message}`);
}

## @after:run
export default function logResponse(context) {
  console.log(`[DEBUG] Response: ${context.response}`);
}

## @tool:invoke
export default function validateParams(context) {
  const { tool } = context;
  console.log(`[DEBUG] Tool: ${tool}, Params: ${context.params}`);
}
```

## 注意事项

- Hook 在 agent 运行时执行,可能会影响性能
- 确保不会创建无限循环
- 正确处理异步操作
- 测试 Hook 在各种场景下的行为
