# Veloera 部署到 Hugging Face Spaces 指南

本指南将帮助您将 Veloera 项目成功部署到 Hugging Face Spaces，使用 PostgreSQL 数据库。

## 📋 前置要求

1. **Hugging Face 账户**：确保您有 Hugging Face 账户
2. **PostgreSQL 数据库**：准备好 PostgreSQL 数据库连接信息
3. **Hugging Face API Token**：从 Hugging Face 设置中获取您的 API Token

## 🚀 部署步骤

### 步骤 1：创建 Hugging Face Space

1. 访问 [Hugging Face Spaces](https://huggingface.co/spaces)
2. 点击 "Create new Space"
3. 填写以下信息：
   - **Space name**: `velana`
   - **Owner**: `mariahlamb`
   - **License**: `GPL-3.0`
   - **SDK**: `Docker`
   - **Hardware**: 建议选择 `CPU basic` 或更高配置

### 步骤 2：上传项目文件

将以下文件上传到您的 Space：

```
├── Dockerfile
├── README.md
├── .env
├── .dockerignore
└── DEPLOYMENT_GUIDE.md (本文件)
```

### 步骤 3：配置数据库连接

在 Hugging Face Spaces 中配置 PostgreSQL 连接：

1. 进入您的 Space 设置页面
2. 找到 "Repository secrets" 部分
3. 添加以下 Secret：

```
Name: SQL_DSN
Value: postgres://username:password@host:port/database?sslmode=require
```

**重要**：将上述连接字符串中的参数替换为您的实际 PostgreSQL 数据库信息：
- `username`: 数据库用户名
- `password`: 数据库密码
- `host`: 数据库主机地址
- `port`: 数据库端口（通常是 5432）
- `database`: 数据库名称

### 步骤 4：配置其他环境变量（可选）

如果需要，您还可以添加以下 Secrets：

```
REDIS_CONN_STRING=redis://your-redis-url
SESSION_SECRET=your-custom-session-secret
```

### 步骤 5：克隆 Veloera 源代码

由于 Hugging Face Spaces 需要完整的源代码，您需要：

1. 在 Space 的文件管理器中，创建一个新的 Git 仓库
2. 或者使用 Git 命令克隆 Veloera 源代码：

```bash
git clone https://github.com/Veloera/Veloera.git
```

3. 将我们创建的配置文件（Dockerfile, README.md, .env 等）复制到克隆的项目根目录中，替换原有文件

### 步骤 6：启动部署

1. 提交所有文件到 Space
2. Hugging Face 将自动开始构建 Docker 镜像
3. 构建完成后，应用将自动启动

## 🔧 配置说明

### 数据库初始化

Veloera 会在首次启动时自动创建必要的数据库表。确保您的 PostgreSQL 数据库：

1. 已创建目标数据库
2. 用户具有创建表的权限
3. 网络连接正常（如果使用云数据库，确保允许外部连接）

### 默认管理员账户

- **用户名**: `root`
- **密码**: `123456`

⚠️ **安全提醒**：首次登录后请立即修改默认密码！

### 端口配置

- Hugging Face Spaces 使用端口 `7860`
- 应用将在 `https://mariahlamb-velana.hf.space` 上可用

## 🛠️ 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `SQL_DSN` Secret 是否正确配置
   - 确认数据库服务器允许外部连接
   - 验证用户名、密码和数据库名称

2. **构建失败**
   - 检查 Dockerfile 语法
   - 确保所有必要的源代码文件都已上传
   - 查看构建日志获取详细错误信息

3. **应用启动失败**
   - 检查环境变量配置
   - 查看应用日志
   - 确认端口 7860 未被占用

### 日志查看

在 Hugging Face Spaces 中：
1. 进入您的 Space
2. 点击 "Logs" 标签
3. 查看实时日志输出

## 📚 后续配置

部署成功后，您可以：

1. **登录管理面板**：使用默认账户登录
2. **添加 AI 模型渠道**：配置 OpenAI、Claude、Gemini 等 API
3. **创建用户令牌**：为不同用户分配访问权限
4. **监控使用情况**：查看 API 调用统计和日志

## 🔒 安全建议

1. 立即修改默认管理员密码
2. 定期更新 SESSION_SECRET
3. 使用强密码保护数据库
4. 定期备份数据库数据
5. 监控异常访问和使用情况

## 📞 支持

如果遇到问题：
1. 查看 [Veloera 官方文档](https://github.com/Veloera/Veloera)
2. 在 [GitHub Issues](https://github.com/Veloera/Veloera/issues) 中搜索相关问题
3. 查看 Hugging Face Spaces 官方文档

---

**注意**：本部署配置适用于演示和测试环境。生产环境使用时，请根据实际需求调整安全配置和性能参数。