# AI智能起名顾问 - 部署文档

> 版本: v2.1  
> 更新日期: 2026-02-03  
> 状态: H5 Web + SQLite 部署

## 1. 部署方案选型

### 1.1 方案对比

| 方案 | 架构 | 适用场景 | 成本 |
|-----|------|---------|------|
| A - 纯前端 | H5 + IndexedDB + AI直连 | 初期/MVP | 低 |
| B - 轻后端 | H5 + Node.js + SQLite | 小规模用户 | 中 |
| C - 标准后端 | H5 + Node.js + PostgreSQL | 大规模用户 | 高 |

**推荐：方案 A 起步，用户增长后迁移到方案 B**

---

## 2. 方案 A：纯前端部署（推荐初期）

### 2.1 架构

```
┌─────────────────────────────────────────┐
│           H5 Web 应用                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ React   │ │IndexedDB│ │OpenAI   │   │
│  │   UI    │ │  存储   │ │  Client │   │
│  └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
           │              │
           ▼              ▼
┌─────────────────┐  ┌─────────────────┐
│   静态托管      │  │   OpenAI API    │
│ Vercel/Netlify  │  │  (用户自备Key)  │
└─────────────────┘  └─────────────────┘
```

### 2.2 部署步骤

```bash
# 1. 构建生产版本
npm run build

# 2. 部署到 Vercel
vercel --prod

# 或者部署到 Netlify
netlify deploy --prod --dir=dist

# 或者部署到 GitHub Pages
npm run deploy
```

### 2.3 环境变量

```bash
# .env.production
VITE_APP_TITLE=起名大师
VITE_APP_VERSION=2.0.0

# AI 配置（用户端配置，非打包）
# 用户在界面输入自己的 OpenAI API Key
# 或使用免费额度

# 支付配置（如需）
VITE_PAY_API_URL=https://pay.naming.app/api
```

### 2.4 特点
- 无需服务器，零运维成本
- 用户数据存储在浏览器 IndexedDB
- AI 调用可前端直连（用户自备 API Key）或通过边缘函数代理

---

## 3. 方案 B：轻后端部署（推荐成长期）

### 2.1 架构

```
┌─────────────────────────────────────────┐
│           H5 Web 前端                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ React   │ │ HTTP    │ │ 状态管理 │   │
│  │   UI    │ │ Client  │ │ Zustand │   │
│  └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
                    │
                    ▼ HTTPS
┌─────────────────────────────────────────┐
│         轻量后端（Node.js）              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ Express  │ │ SQLite   │ │ 支付 SDK ││
│  │   API    │ │ Database │ │微信/支付宝││
│  └──────────┘ └──────────┘ └──────────┘│
│                                         │
│  ┌──────────┐ ┌──────────┐             │
│  │ AI 代理  │ │ 缓存     │             │
│  │ OpenAI   │ │ Redis    │             │
│  │ Claude   │ │(可选)    │             │
│  └──────────┘ └──────────┘             │
└─────────────────────────────────────────┘
```

### 2.2 服务器配置

**最低配置（支持 1000 日活）：**
- 1核2G 云服务器
- 20GB SSD 磁盘
- 2Mbps 带宽

**推荐配置（支持 1万 日活）：**
- 2核4G 云服务器
- 50GB SSD 磁盘
- 5Mbps 带宽

### 2.3 目录结构

```
/opt/naming-app/
├── docker-compose.yml          # Docker 编排
├── .env                        # 环境变量
├── nginx/
│   ├── nginx.conf              # Nginx 配置
│   └── ssl/                    # SSL 证书
├── backend/                    # 后端代码
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── frontend/                   # 前端代码
│   └── dist/                   # 构建产物
└── data/                       # SQLite 数据目录
    ├── naming.db               # 主数据库
    └── backup/                 # 备份目录
```

### 2.4 Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Nginx 网关
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./frontend/dist:/usr/share/nginx/html
    depends_on:
      - backend
    restart: always

  # 后端服务
  backend:
    image: naming/backend:latest
    build: ./backend
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_PATH=/data/naming.db
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - WECHAT_MCH_ID=${WECHAT_MCH_ID}
      - WECHAT_API_KEY=${WECHAT_API_KEY}
    volumes:
      - ./data:/data
    restart: always

volumes:
  naming_data:
```

### 2.5 SQLite 配置

```typescript
// backend/db/index.ts
import Database from 'better-sqlite3';

const db = new Database('/data/naming.db');

// 启用 WAL 模式，提高并发性能
db.pragma('journal_mode = WAL');

// 创建表（如果不存在）
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    openid TEXT UNIQUE,
    phone TEXT UNIQUE,
    nickname TEXT,
    avatar TEXT,
    status INTEGER DEFAULT 1,
    created_at INTEGER,
    updated_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS naming_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    baby_info TEXT NOT NULL,
    messages TEXT DEFAULT '[]',
    current_step TEXT DEFAULT 'welcome',
    bazi_cache TEXT,
    names_cache TEXT,
    unlock_status TEXT DEFAULT '{"isUnlocked":false,"unlockedDirections":[]}',
    created_at INTEGER,
    updated_at INTEGER
  );

  -- 更多表...
`);

export default db;
```

### 2.6 部署步骤

```bash
# 1. 登录服务器
ssh root@your-server-ip

# 2. 安装 Docker
curl -fsSL https://get.docker.com | sh

# 3. 创建目录
mkdir -p /opt/naming-app
cd /opt/naming-app

# 4. 上传代码（通过 git 或 scp）
git clone https://github.com/yourname/naming-app.git .

# 5. 配置环境变量
cp .env.example .env
vi .env

# 6. 启动服务
docker-compose up -d

# 7. 查看日志
docker-compose logs -f

# 8. 初始化数据库
docker-compose exec backend npm run migrate
```

---

## 3. 环境变量配置

### 3.1 完整 .env 示例

```bash
# 应用配置
NODE_ENV=production
PORT=3000
APP_NAME=起名大师
APP_URL=https://naming.app

# 数据库（SQLite）
DB_PATH=/data/naming.db

# Redis（可选，用于缓存和会话）
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_random_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000

# 微信支付
WECHAT_APP_ID=wx1234567890
WECHAT_APP_SECRET=your_wechat_secret
WECHAT_MCH_ID=1234567890
WECHAT_API_KEY=your_wechat_mch_key
WECHAT_NOTIFY_URL=https://api.naming.app/webhooks/wechat

# 支付宝
ALIPAY_APP_ID=2024XXXXXXXX
ALIPAY_PRIVATE_KEY=your_private_key
ALIPAY_PUBLIC_KEY=alipay_public_key
ALIPAY_NOTIFY_URL=https://api.naming.app/webhooks/alipay

# 日志
LOG_LEVEL=info
LOG_FILE=/data/logs/app.log
```

---

## 4. Nginx 配置

### 4.1 基本配置

```nginx
# /etc/nginx/nginx.conf

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript;

    # 上游服务
    upstream backend {
        server backend:3000;
    }

    # HTTP 重定向到 HTTPS
    server {
        listen 80;
        server_name naming.app www.naming.app;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS 服务
    server {
        listen 443 ssl http2;
        server_name naming.app www.naming.app;

        # SSL 证书
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # 前端静态文件
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
            expires 1d;
        }

        # API 代理
        location /api {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_cache_bypass $http_upgrade;
        }

        # WebSocket 支持
        location /ws {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

---

## 5. 备份策略

### 5.1 SQLite 备份脚本

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR=/opt/naming-app/backup
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH=/opt/naming-app/data/naming.db

# 创建备份目录
mkdir -p $BACKUP_DIR

# 热备份（SQLite 支持在线备份）
sqlite3 $DB_PATH ".backup '$BACKUP_DIR/naming_$DATE.db'"

# 压缩
gzip $BACKUP_DIR/naming_$DATE.db

# 上传到云存储（可选）
# aws s3 cp $BACKUP_DIR/naming_$DATE.db.gz s3://naming-backup/

# 清理7天前的备份
find $BACKUP_DIR -name "naming_*.db.gz" -mtime +7 -delete

echo "Backup completed: naming_$DATE.db.gz"
```

### 5.2 定时任务

```bash
# 添加到 crontab
crontab -e

# 每天凌晨3点备份
0 3 * * * /opt/naming-app/scripts/backup.sh >> /var/log/backup.log 2>&1

# 每周日清理旧数据
0 4 * * 0 /opt/naming-app/scripts/cleanup.sh
```

---

## 6. 监控与日志

### 6.1 日志配置

```typescript
// backend/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: '/data/logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: '/data/logs/combined.log'
    })
  ]
});

export default logger;
```

### 6.2 健康检查

```bash
# 健康检查端点
curl https://api.naming.app/health

# 预期响应
{
  "status": "ok",
  "timestamp": "2024-02-03T12:00:00Z",
  "version": "2.0.0",
  "services": {
    "database": "connected",
    "redis": "connected",
    "openai": "available"
  }
}
```

---

## 7. CI/CD 配置

### 7.1 GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build frontend
        run: npm run build:frontend
      
      - name: Build backend
        run: npm run build:backend
      
      - name: Deploy to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          source: "dist,backend,docker-compose.yml"
          target: "/opt/naming-app"
      
      - name: Restart services
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/naming-app
            docker-compose pull
            docker-compose up -d
```

---

## 8. 扩容方案

### 8.1 当 SQLite 成为瓶颈时

迁移到 PostgreSQL：

```bash
# 1. 导出 SQLite 数据
sqlite3 naming.db ".dump" > naming.sql

# 2. 修改后端数据库连接
# DATABASE_URL=postgresql://user:pass@localhost:5432/naming

# 3. 重新部署
docker-compose up -d
```

### 8.2 当单服务器成为瓶颈时

- 使用 RDS PostgreSQL
- 使用 ElastiCache Redis
- 使用负载均衡 + 多实例

---

## 9. 安全检查清单

部署前确认：

- [ ] 修改默认密码和密钥
- [ ] 配置 HTTPS
- [ ] 开启防火墙
- [ ] 配置自动备份
- [ ] 设置监控告警
- [ ] 测试支付流程
- [ ] 测试 AI 生成
- [ ] 配置日志轮转
