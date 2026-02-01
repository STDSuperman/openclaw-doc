import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <div className="hero-bg fixed inset-0 -z-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="var(--grid-line)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-16 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          OpenClaw 中文文档
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          个人 AI 助手完整中文文档
        </p>
        <p className="text-lg text-gray-500 mb-2">
          支持多平台消息通道
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
        <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
          <div className="text-3xl mb-3">📱</div>
          <h3 className="font-semibold mb-2">多平台支持</h3>
          <p className="text-sm text-gray-600">
            支持 WhatsApp、Telegram、Discord、Slack、iMessage、WebChat 等多种消息平台
          </p>
        </div>

        <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
          <div className="text-3xl mb-3">🚀</div>
          <h3 className="font-semibold mb-2">快速上手</h3>
          <p className="text-sm text-gray-600">
            5分钟完成安装配置，快速开始使用
          </p>
        </div>

        <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="font-semibold mb-2">AI 模型集成</h3>
          <p className="text-sm text-gray-600">
            支持 Anthropic、OpenAI 等主流 AI 模型
          </p>
        </div>

        <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="font-semibold mb-2">安全可靠</h3>
          <p className="text-sm text-gray-600">
            本地部署，数据安全可控
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/docs/00-快速开始/02-5分钟安装指南"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          快速开始
          <ArrowRight size={16} />
        </Link>
      </div>
      </div>
    </>
  );
}
