#!/usr/bin/env python3
"""
Veloera 自动部署到 Hugging Face Spaces 脚本
使用 Hugging Face Hub API 自动创建和配置 Space
"""

import os
import sys
import subprocess
import tempfile
import shutil
from pathlib import Path

try:
    from huggingface_hub import HfApi, create_repo, upload_folder
    from huggingface_hub.errors import RepositoryNotFoundError
except ImportError:
    print("错误：需要安装 huggingface_hub")
    print("请运行：pip install huggingface_hub")
    sys.exit(1)

# 配置信息
HF_TOKEN = os.getenv("HF_TOKEN", "your-huggingface-token-here")
SPACE_NAME = "mariahlamb/velana"
VELOERA_REPO = "https://github.com/Veloera/Veloera.git"

def setup_hf_api():
    """设置 Hugging Face API"""
    try:
        api = HfApi(token=HF_TOKEN)
        # 测试 token 是否有效
        api.whoami()
        print("✅ Hugging Face API 连接成功")
        return api
    except Exception as e:
        print(f"❌ Hugging Face API 连接失败: {e}")
        sys.exit(1)

def clone_veloera_repo(temp_dir):
    """克隆 Veloera 源代码"""
    print("📥 正在克隆 Veloera 源代码...")
    veloera_dir = temp_dir / "veloera"
    
    try:
        subprocess.run([
            "git", "clone", "--depth", "1", 
            VELOERA_REPO, str(veloera_dir)
        ], check=True, capture_output=True)
        print("✅ Veloera 源代码克隆成功")
        return veloera_dir
    except subprocess.CalledProcessError as e:
        print(f"❌ 克隆失败: {e}")
        sys.exit(1)

def copy_deployment_files(veloera_dir):
    """复制部署配置文件到 Veloera 目录"""
    print("📋 正在复制部署配置文件...")
    
    current_dir = Path(__file__).parent
    files_to_copy = [
        "Dockerfile",
        "README.md", 
        ".env",
        ".dockerignore",
        "DEPLOYMENT_GUIDE.md"
    ]
    
    for file_name in files_to_copy:
        src_file = current_dir / file_name
        dst_file = veloera_dir / file_name
        
        if src_file.exists():
            shutil.copy2(src_file, dst_file)
            print(f"  ✅ 复制 {file_name}")
        else:
            print(f"  ⚠️  文件不存在: {file_name}")

def create_hf_space(api):
    """创建 Hugging Face Space"""
    print(f"🚀 正在创建 Hugging Face Space: {SPACE_NAME}")
    
    try:
        # 检查 Space 是否已存在
        try:
            api.space_info(SPACE_NAME)
            print(f"⚠️  Space {SPACE_NAME} 已存在，将更新现有 Space")
            return True
        except RepositoryNotFoundError:
            pass
        
        # 创建新的 Space
        create_repo(
            repo_id=SPACE_NAME,
            repo_type="space",
            space_sdk="docker",
            token=HF_TOKEN,
            private=False
        )
        print(f"✅ Space {SPACE_NAME} 创建成功")
        return True
        
    except Exception as e:
        print(f"❌ 创建 Space 失败: {e}")
        return False

def upload_to_space(api, veloera_dir):
    """上传文件到 Hugging Face Space"""
    print("📤 正在上传文件到 Hugging Face Space...")
    
    try:
        # 上传整个目录
        upload_folder(
            folder_path=str(veloera_dir),
            repo_id=SPACE_NAME,
            repo_type="space",
            token=HF_TOKEN,
            commit_message="Deploy Veloera to Hugging Face Spaces"
        )
        print("✅ 文件上传成功")
        return True
        
    except Exception as e:
        print(f"❌ 文件上传失败: {e}")
        return False

def print_next_steps():
    """打印后续步骤说明"""
    print("\n" + "="*60)
    print("🎉 部署完成！后续步骤：")
    print("="*60)
    print(f"1. 访问您的 Space: https://huggingface.co/spaces/{SPACE_NAME}")
    print("2. 在 Space 设置中添加 PostgreSQL 数据库连接：")
    print("   - 进入 Settings > Repository secrets")
    print("   - 添加 Secret: SQL_DSN")
    print("   - 值: postgres://username:password@host:port/database?sslmode=require")
    print("3. 等待 Docker 镜像构建完成（可能需要几分钟）")
    print("4. 使用默认账户登录：")
    print("   - 用户名: root")
    print("   - 密码: 123456")
    print("5. ⚠️  重要：首次登录后立即修改默认密码！")
    print("\n📚 详细说明请查看 DEPLOYMENT_GUIDE.md")
    print("="*60)

def main():
    """主函数"""
    print("🚀 开始部署 Veloera 到 Hugging Face Spaces")
    print(f"目标 Space: {SPACE_NAME}")
    print("-" * 50)
    
    # 设置 API
    api = setup_hf_api()
    
    # 创建临时目录
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # 克隆源代码
        veloera_dir = clone_veloera_repo(temp_path)
        
        # 复制配置文件
        copy_deployment_files(veloera_dir)
        
        # 创建 Space
        if not create_hf_space(api):
            sys.exit(1)
        
        # 上传文件
        if not upload_to_space(api, veloera_dir):
            sys.exit(1)
    
    # 打印后续步骤
    print_next_steps()

if __name__ == "__main__":
    main()