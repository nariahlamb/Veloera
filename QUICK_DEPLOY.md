# 🚀 Veloera 快速部署指南

## 方法一：自动部署（推荐）

### 1. 安装依赖
```bash
pip install huggingface_hub
```

### 2. 运行部署脚本
```bash
export HF_TOKEN=your-huggingface-token
python deploy_to_hf.py
```

### 3. 配置数据库
在 Hugging Face Space 设置中添加：
- **Secret Name**: `SQL_DSN`
- **Secret Value**: `postgres://username:password@host:port/database?sslmode=require`

---

## 方法二：手动部署

### 1. 创建 Hugging Face Space
- 访问：https://huggingface.co/spaces
- 点击 "Create new Space"
- 配置：
  - Space name: `velana`
  - Owner: `mariahlamb`
  - SDK: `Docker`
  - License: `GPL-3.0`

### 2. 准备源代码
```bash
# 克隆 Veloera 源代码
git clone https://github.com/Veloera/Veloera.git
cd Veloera

# 复制我们的配置文件到项目根目录
# - Dockerfile
# - README.md
# - .env
# - .dockerignore
```

### 3. 上传到 Space
将所有文件上传到您的 Hugging Face Space

### 4. 配置数据库连接
在 Space 设置中添加 Secret：
```
Name: SQL_DSN
Value: postgres://your-db-connection-string
```

---

## 📋 部署后检查清单

- [ ] Space 创建成功
- [ ] 源代码上传完成
- [ ] PostgreSQL 连接配置正确
- [ ] Docker 构建成功
- [ ] 应用启动正常
- [ ] 默认管理员账户可登录
- [ ] 修改默认密码

## 🔗 访问地址

部署成功后，访问：
**https://mariahlamb-velana.hf.space**

## 🔑 默认登录信息

- **用户名**: `root`
- **密码**: `123456`

⚠️ **重要**：首次登录后立即修改密码！

## 📞 需要帮助？

查看详细部署指南：`DEPLOYMENT_GUIDE.md`