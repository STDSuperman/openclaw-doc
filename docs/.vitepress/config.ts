import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'OpenClaw 中文文档',
  description: 'OpenClaw - 个人 AI 助手，支持多平台消息通道',
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c8772' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh_CN' }],
    ['meta', { name: 'og:title', content: 'OpenClaw 中文文档' }],
    ['meta', { name: 'og:description', content: 'OpenClaw 个人 AI 助手的完整中文文档 - 快速开始、配置使用、消息通道、核心概念、平台指南等' }],
  ],
  themeConfig: {
    sidebar: {
      '/00-快速开始/': [
        { text: '5分钟安装指南', link: '/00-快速开始/02-5分钟安装指南' },
        { text: '向导式配置', link: '/00-快速开始/03-向导式配置' },
        { text: '首次连接', link: '/00-快速开始/04-首次连接' },
        { text: '常见问题FAQ', link: '/00-快速开始/05-常见问题FAQ' },
      ],
      '/01-基础使用/': [
        { text: '发送消息', link: '/01-基础使用/01-发送消息' },
        { text: '使用斜杠命令', link: '/01-基础使用/02-使用斜杠命令' },
        { text: '会话管理', link: '/01-基础使用/03-会话管理' },
        { text: '查看状态', link: '/01-基础使用/04-查看状态' },
        { text: '帮助与调试', link: '/01-基础使用/05-帮助与调试' },
      ],
      '/02-消息通道/': [
        { text: 'WhatsApp', link: '/02-消息通道/01-WhatsApp连接' },
        { text: 'Telegram', link: '/02-消息通道/02-Telegram连接' },
        { text: 'Discord', link: '/02-消息通道/03-Discord连接' },
        { text: 'Slack', link: '/02-消息通道/04-Slack连接' },
        { text: 'GoogleChat', link: '/02-消息通道/05-GoogleChat连接' },
        { text: 'iMessage', link: '/02-消息通道/06-iMessage连接' },
        { text: 'WebChat', link: "/02-消息通道/07-WebChat连接" },
        { text: 'Signal', link: "/02-消息通道/08-Signal连接" },
        { text: '平台对比', link: "/02-消息通道/08-平台对比与选择" },
      ],
      '/03-核心概念/': [
        { text: '架构概览', link: '/03-核心概念/01-架构概览' },
        { text: 'Gateway网关', link: '/03-核心概念/02-Gateway网关' },
        { text: '会话模型', link: '/03-核心概念/03-会话模型' },
        { text: '上下文管理', link: '/03-核心概念/04-上下文管理' },
      ],
      '/04-配置与运维/': [
        { text: '配置文件说明', link: '/04-配置与运维/00-配置文件说明' },
        { text: '快速配置示例', link: '/04-配置与运维/01-快速配置示例' },
        { text: 'Gateway运维', link: '/04-配置与运维/02-Gateway运维' },
        { text: '远程访问', link: '/04-配置与运维/05-远程访问' },
        { text: '安全配置', link: '/04-配置与运维/06-安全配置' },
        { text: '日志与监控', link: '/04-配置与运维/08-日志与监控' },
        { text: '故障排查', link: '/04-配置与运维/09-故障排查' },
      ],
      '/05-自动化任务/': [
        { text: '自动化任务', link: '/05-自动化任务/01-自动化任务' },
        { text: '定时任务', link: '/05-自动化任务/02-定时任务' },
        { text: 'Webhooks', link: '/05-自动化任务/03-Webhooks' },
        { text: 'Gmail推送', link: '/05-自动化任务/04-Gmail推送' },
      ],
      '/06-工具与功能/': [
        { text: '消息工具', link: '/06-工具与功能/01-消息工具' },
        { text: '斜杠命令', link: '/06-工具与功能/02-斜杠命令' },
      ],
      '/07-平台指南/': [
        { text: 'macOS', link: '/07-平台指南/macOS' },
        { text: 'iOS', link: '/07-平台指南/iOS' },
        { text: 'Linux', link: '/07-平台指南/Linux' },
        { text: 'Windows', link: '/07-平台指南/Windows' },
      ],
      '/08-AI模型/': [
        { text: '模型故障排查', link: '/08-AI模型/01-模型故障排除' },
      ],
      '/09-开发者参考/': [
        { text: '配置参考', link: '/09-开发者参考/01-配置参考' },
        { text: 'Hooks参考', link: '/09-开发者参考/02-Hooks参考' },
      ],
      '/10-命令行工具/': [
        { text: '命令参考', link: '/10-命令行工具/01-命令参考' },
      ],
      '/11-附录/': [
        { text: '术语表', link: '/11-附录/01-术语表' },
      ],
      '/': [
        { text: '快速开始', link: '/00-快速开始/02-5分钟安装指南' },
        { text: '基础使用', link: '/01-基础使用/01-发送消息' },
        { text: '消息通道', link: '/02-消息通道/01-WhatsApp连接' },
        { text: '核心概念', link: '/03-核心概念/01-架构概览' },
        { text: '配置与运维', link: '/04-配置与运维/00-配置文件说明' },
        { text: '平台指南', link: '/07-平台指南/macOS' },
      ],
    },
    nav: [
      {
        text: '快速开始',
        items: [
          { text: '5分钟安装指南', link: '/00-快速开始/02-5分钟安装指南' },
        ],
      },
      {
        text: '基础使用',
        items: [
          { text: '发送消息', link: '/01-基础使用/01-发送消息' },
          { text: '使用斜杠命令', link: '/01-基础使用/02-使用斜杠命令' },
          { text: '会话管理', link: '/01-基础使用/03-会话管理' },
          { text: '查看状态', link: '/01-基础使用/04-查看状态' },
          { text: '帮助与调试', link: '/01-基础使用/05-帮助与调试' },
        ],
      },
      {
        text: '配置与运维',
        items: [
          { text: '配置文件说明', link: '/04-配置与运维/00-配置文件说明' },
          { text: '快速配置示例', link: '/04-配置与运维/01-快速配置示例' },
          { text: 'Gateway运维', link: '/04-配置与运维/02-Gateway运维' },
          { text: '远程访问', link: '/04-配置与运维/05-远程访问' },
          { text: '安全配置', link: '/04-配置与运维/06-安全配置' },
          { text: '日志与监控', link: '/04-配置与运维/08-日志与监控' },
          { text: '故障排查', link: '/04-配置与运维/09-故障排查' },
        ],
      },
      {
        text: '核心概念',
        items: [
          { text: '架构概览', link: '/03-核心概念/01-架构概览' },
          { text: 'Gateway网关', link: '/03-核心概念/02-Gateway网关' },
          { text: '会话模型', link: '/03-核心概念/02-会话模型' },
          { text: '上下文管理', link: '/03-核心概念/03-上下文管理' },
          { text: '消息流式传输', link: '/03-核心概念/06-消息流式传输' },
          { text: '重试策略', link: '/03-核心概念/05-重试策略' },
          { text: '通道路由', link: '/03-核心概念/08-通道路由' },
        ],
      },
      {
        text: '工具与功能',
        items: [
          { text: '消息工具', link: '/06-工具与功能/01-消息工具' },
          { text: '斜杠命令', link: '/06-工具与功能/02-斜杠命令' },
          { text: '自动化任务', link: '/05-自动化任务/01-自动化任务' },
          { text: '定时任务', link: '/05-自动化任务/02-定时任务' },
          { text: 'Webhooks', link: '/05-自动化任务/03-Webhooks' },
          { text: 'Gmail推送', link: '/05-自动化任务/04-Gmail推送' },
        ],
      },
      {
        text: '平台指南',
        items: [
          { text: 'macOS', link: '/07-平台指南/macOS' },
          { text: 'iOS', link: '/07-平台指南/iOS' },
          { text: 'Linux', link: '/07-平台指南/Linux' },
          { text: 'Windows', link: '/07-平台指南/Windows' },
        ],
      },
      {
        text: 'AI模型',
        items: [
          { text: '模型选择与优化', link: '/08-AI模型' },
          { text: '模型故障排查', link: '/08-AI模型/01-模型故障排查' },
        ],
      },
      {
        text: '开发者参考',
        items: [
          { text: '开发者参考', link: '/09-开发者参考' },
          { text: '命令行工具', link: '/10-命令行工具' },
        ],
      },
      {
        text: '消息通道',
        items: [
          { text: 'WhatsApp连接', link: '/02-消息通道/01-WhatsApp连接' },
          { text: 'Telegram连接', link: "/02-消息通道/02-Telegram连接" },
          { text: 'Discord连接', link: '/02-消息通道/03-Discord连接' },
          { text: 'Slack连接', link: '/02-消息通道/04-Slack连接' },
          { text: 'GoogleChat连接', link: '/02-消息通道/05-GoogleChat连接' },
          { text: 'iMessage连接', link: '/02-消息通道/06-iMessage连接' },
          { text: 'WebChat连接', link: "/02-消息通道/07-WebChat连接" },
          { text: '平台对比与选择', link: "/02-消息通道/08-平台对比与选择" },
        ],
      },
      {
        text: '附录',
        items: [
          { text: '术语表', link: '/11-附录/01-术语表' },
        ],
      },
    ]
  }
})
