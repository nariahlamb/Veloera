# Hugging Face Spaces 专用 Dockerfile for Veloera
# 多阶段构建：前端构建
FROM oven/bun:latest AS frontend-builder

WORKDIR /build

# 复制前端依赖文件
COPY web/package.json .
RUN bun install

# 复制前端源码和版本文件
COPY ./web .
COPY ./VERSION .

# 构建前端
RUN DISABLE_ESLINT_PLUGIN='true' VITE_REACT_APP_VERSION=$(cat VERSION) bun run build

# 多阶段构建：后端构建
FROM golang:alpine AS backend-builder

ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux

WORKDIR /build

# 复制 Go 模块文件
ADD go.mod go.sum ./
RUN go mod download

# 复制源码
COPY . .

# 复制前端构建结果
COPY --from=frontend-builder /build/dist ./web/dist

# 构建后端
RUN go build -ldflags "-s -w -X 'veloera/common.Version=$(cat VERSION)'" -o veloera

# 最终运行镜像
FROM alpine:latest

# 安装必要的系统依赖
RUN apk update && \
    apk upgrade && \
    apk add --no-cache ca-certificates tzdata postgresql-client && \
    update-ca-certificates

# 创建应用用户
RUN addgroup -g 1000 appuser && \
    adduser -D -s /bin/sh -u 1000 -G appuser appuser

# 复制构建的应用
COPY --from=backend-builder /build/veloera /app/veloera

# 创建数据目录并设置权限
RUN mkdir -p /app/data /app/logs && \
    chown -R appuser:appuser /app

# 切换到应用用户
USER appuser

# 设置工作目录
WORKDIR /app

# 设置 Hugging Face Spaces 环境变量
# 注意：PostgreSQL 连接字符串需要在 Spaces 中通过 Secrets 配置
ENV PORT=7860 \
    GIN_MODE=release \
    SESSION_SECRET="huggingface-spaces-veloera-secret" \
    MEMORY_CACHE_ENABLED=true \
    GENERATE_DEFAULT_TOKEN=true \
    UPDATE_TASK=true \
    STREAMING_TIMEOUT=90 \
    GET_MEDIA_TOKEN=true \
    DIFY_DEBUG=false \
    FORCE_STREAM_OPTION=true \
    COHERE_SAFETY_SETTING=CONTEXTUAL \
    GEMINI_VISION_MAX_IMAGE_NUM=16 \
    MAX_FILE_DOWNLOAD_MB=20 \
    NOTIFICATION_LIMIT_DURATION_MINUTE=10 \
    NOTIFY_LIMIT_COUNT=2

# 暴露端口（Hugging Face Spaces 使用 7860）
EXPOSE 7860

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:7860/api/status || exit 1

# 启动命令
CMD ["./veloera", "--log-dir", "/app/logs"]