---
title: Veloera AI API Gateway
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: gpl-3.0
app_port: 7860
---

# Veloera - AI API Gateway

[![License](https://img.shields.io/github/license/Veloera/Veloera)](https://github.com/Veloera/Veloera/blob/main/LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/Veloera/Veloera)](https://github.com/Veloera/Veloera/releases)

优秀的 AI API 网关系统，部署在 Hugging Face Spaces 上。

## 🌟 特性

- 🔑 支持多种 AI 模型 API 统一管理
- 🎯 支持以 `,` 分割的单渠道多 Key，随机选取
- 🎁 支持礼品码功能，全局每用户一次使用
- 🔒 原生支持 /hf/v1 接口
- 🛡️ 支持正则表达式屏蔽词
- 📊 详细的使用日志和统计
- 🌐 现代化的 Web 管理界面
- 🐳 Docker 容器化部署

## 🚀 快速开始

### 默认管理员账户

- **用户名**: `root`
- **密码**: `123456`

⚠️ **重要**: 首次登录后请立即修改默认密码！

### 访问地址

- **管理面板**: 点击上方的 "Open in Browser" 按钮
- **API 端点**: `https://your-space-name.hf.space/v1/`

## 📖 使用说明

### 1. 登录管理面板

使用默认账户登录后，您可以：
- 添加和管理 AI 模型渠道
- 创建和管理用户令牌
- 查看使用统计和日志
- 配置系统设置

### 2. 添加 AI 模型渠道

在管理面板中：
1. 进入 "渠道" 页面
2. 点击 "添加渠道"
3. 选择模型类型（OpenAI、Claude、Gemini 等）
4. 填入 API Key 和相关配置
5. 测试连接并保存

### 3. 创建用户令牌

1. 进入 "令牌" 页面
2. 点击 "添加令牌"
3. 设置令牌名称、额度和权限
4. 复制生成的令牌用于 API 调用

### 4. API 调用示例

```bash
curl -X POST "https://your-space-name.hf.space/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

## ⚙️ 环境配置

本 Space 已预配置以下环境变量：

- `PORT=7860` - Hugging Face Spaces 标准端口
- `SQL_DSN=sqlite:///app/data/veloera.db` - SQLite 数据库
- `MEMORY_CACHE_ENABLED=true` - 启用内存缓存
- `GENERATE_DEFAULT_TOKEN=true` - 自动生成默认令牌

## 🔧 高级配置

如果您需要自定义配置，可以 fork 此 Space 并修改 Dockerfile 中的环境变量。

## 📚 文档和支持

- [官方文档](https://github.com/Veloera/Veloera)
- [GitHub 仓库](https://github.com/Veloera/Veloera)
- [问题反馈](https://github.com/Veloera/Veloera/issues)

## 📄 许可证

本项目采用 GPL-3.0 许可证。详见 [LICENSE](https://github.com/Veloera/Veloera/blob/main/LICENSE) 文件。

## 🙏 致谢

- 基于 [Veloera](https://github.com/Veloera/Veloera) 项目
- 感谢所有贡献者的努力

---

**注意**: 这是一个演示部署，请勿在生产环境中使用默认配置。建议您 fork 此 Space 并根据需要进行安全配置。