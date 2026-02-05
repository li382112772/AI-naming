# AI智能起名顾问 - 数据库设计文档

> 版本: v2.1  
> 更新日期: 2026-02-03  
> 状态: SQLite 简化版 + AI Agent 数据存储

## 1. 概述

本文档定义 AI智能起名顾问 的数据模型。采用 **SQLite** 作为数据库，支持两种部署模式：
- **纯前端模式**：IndexedDB（浏览器端 SQLite 等效存储）
- **轻后端模式**：SQLite 文件（Node.js better-sqlite3）

**核心特点**：
- 所有内容（八字、名字、解析）均由 AI Agent 实时生成
- 数据库仅存储会话、消息、订单等元数据
- 不存储固定名字库

---

## 2. 实体关系图

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │ naming_sessions │       │     orders      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ user_id (FK)    │       │ id (PK)         │
│ openid          │       │ id (PK)         │       │ user_id (FK)    │
│ phone           │       │ baby_info       │       │ session_id (FK) │
│ nickname        │       │ messages        │       │ order_no        │
│ status          │       │ bazi_cache      │       │ product_type    │
└─────────────────┘       │ names_cache     │       │ amount          │
                          │ unlock_status   │       │ status          │
                          │ created_at      │       └────────┬────────┘
                          └─────────────────┘                │
                                   │                         │
                          ┌────────▼────────┐       ┌────────▼────────┐
                          │   favorites     │       │    payments     │
                          ├─────────────────┤       ├─────────────────┤
                          │ id (PK)         │       │ id (PK)         │
                          │ user_id (FK)    │       │ order_id (FK)   │
                          │ session_id (FK) │       │ transaction_id  │
                          │ name            │       │ channel         │
                          │ name_detail     │       │ amount          │
                          └─────────────────┘       │ status          │
                                                  └─────────────────┘
```

**注意**：没有 `name_library` 表，所有名字由 AI 实时生成，仅缓存在 `names_cache` 中。

---

## 3. SQLite 表结构

### 3.1 用户表 (users)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,                  -- UUID
  openid TEXT UNIQUE,                   -- 微信openid
  unionid TEXT,                         -- 微信unionid
  phone TEXT UNIQUE,                    -- 手机号
  nickname TEXT,                        -- 昵称
  avatar TEXT,                          -- 头像URL
  status INTEGER DEFAULT 1,             -- 状态: 0-禁用, 1-正常
  created_at INTEGER,                   -- 创建时间戳
  updated_at INTEGER                    -- 更新时间戳
);

-- 索引
CREATE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_users_phone ON users(phone);
```

### 3.2 起名会话表 (naming_sessions)

```sql
CREATE TABLE naming_sessions (
  id TEXT PRIMARY KEY,                  -- UUID
  user_id TEXT REFERENCES users(id),    -- 用户ID
  
  -- 宝宝信息（JSON 存储）
  baby_info TEXT NOT NULL,              -- {surname, gender, birthDate, birthTime, birthLocation}
  
  -- 对话消息（JSON 数组）
  messages TEXT DEFAULT '[]',           -- ChatMessage[]
  
  -- 当前状态
  current_step TEXT DEFAULT 'welcome',  -- 当前步骤
  
  -- AI 生成内容缓存（重要：缓存而非预设）
  bazi_cache TEXT,                      -- BaziAnalysis JSON（AI生成的八字分析）
  names_cache TEXT,                     -- {directionId: NameDetail[]} AI生成的名字缓存
  
  -- 解锁状态
  unlock_status TEXT DEFAULT '{"isUnlocked":false,"unlockedDirections":[]}',  -- JSON
  unlock_order_id TEXT,                 -- 关联订单ID
  
  -- 选择记录
  selected_name TEXT,                   -- 最终选定的名字
  
  created_at INTEGER,
  updated_at INTEGER
);

-- 索引
CREATE INDEX idx_sessions_user ON naming_sessions(user_id);
CREATE INDEX idx_sessions_updated ON naming_sessions(updated_at DESC);
```

### 3.3 订单表 (orders)

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_no TEXT UNIQUE NOT NULL,        -- 订单号 N202402031200001
  user_id TEXT REFERENCES users(id),
  session_id TEXT REFERENCES naming_sessions(id),
  
  -- 商品信息
  product_type TEXT NOT NULL,           -- single/all/report
  product_name TEXT NOT NULL,           -- 商品名称
  direction_id TEXT,                    -- 单系列解锁时指定
  
  -- 金额信息（单位：分）
  amount INTEGER NOT NULL,              -- 订单金额
  discount_amount INTEGER DEFAULT 0,    -- 优惠金额
  payable_amount INTEGER NOT NULL,      -- 应付金额
  
  -- 支付信息
  status TEXT DEFAULT 'pending',        -- pending/paid/closed/refunded
  pay_channel TEXT,                     -- wechat/alipay
  pay_time INTEGER,                     -- 支付时间戳
  expire_time INTEGER,                  -- 订单过期时间戳
  
  -- 退款信息
  refund_status TEXT,
  refund_amount INTEGER DEFAULT 0,
  refund_time INTEGER,
  
  created_at INTEGER,
  updated_at INTEGER
);

-- 索引
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_session ON orders(session_id);
CREATE INDEX idx_orders_no ON orders(order_no);
CREATE INDEX idx_orders_status ON orders(status);
```

### 3.4 支付流水表 (payments)

```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id),
  channel TEXT NOT NULL,                -- wechat/alipay
  transaction_id TEXT,                  -- 第三方交易号
  amount INTEGER NOT NULL,              -- 支付金额（分）
  status TEXT DEFAULT 'pending',        -- pending/success/failed
  prepay_id TEXT,                       -- 微信预支付ID
  pay_params TEXT,                      -- 支付参数 JSON
  notify_data TEXT,                     -- 回调通知数据 JSON
  notify_time INTEGER,
  error_code TEXT,
  error_msg TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_trans ON payments(transaction_id);
```

### 3.5 收藏表 (favorites)

```sql
CREATE TABLE favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES naming_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                   -- 名字
  name_detail TEXT NOT NULL,            -- NameDetail JSON（AI生成的详情）
  created_at INTEGER,
  
  UNIQUE(user_id, session_id, name)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_session ON favorites(session_id);
```

---

## 4. IndexedDB 等效结构（纯前端）

当使用纯前端方案时，使用 localForage 存储，数据结构同上：

```typescript
// 使用 localForage 模拟 SQLite 表

// users store
interface User {
  id: string;
  openid?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  status: number;
  createdAt: number;
  updatedAt: number;
}

// sessions store
interface NamingSession {
  id: string;
  userId: string;
  babyInfo: BabyInfo;
  messages: ChatMessage[];
  currentStep: string;
  baziCache?: BaziAnalysis;        // AI 生成的八字分析
  namesCache?: {                   // AI 生成的名字缓存
    [directionId: string]: {
      names: NameDetail[];
      generatedAt: number;
    }
  };
  unlockStatus: {
    isUnlocked: boolean;
    unlockType?: 'single' | 'all';
    unlockedDirections: string[];
    orderNo?: string;
  };
  selectedName?: string;
  createdAt: number;
  updatedAt: number;
}

// orders store
interface Order {
  id: string;
  orderNo: string;
  userId: string;
  sessionId: string;
  productType: 'single' | 'all' | 'report';
  productName: string;
  directionId?: string;
  amount: number;
  discountAmount: number;
  payableAmount: number;
  status: 'pending' | 'paid' | 'closed' | 'refunded';
  payChannel?: 'wechat' | 'alipay';
  payTime?: number;
  createdAt: number;
  updatedAt: number;
}
```

---

## 5. 核心业务流程

### 5.1 AI 生成八字并缓存

```typescript
// 1. 检查缓存
const session = await db.getSession(sessionId);
if (session.baziCache) {
  return session.baziCache;  // 直接返回缓存
}

// 2. 调用 AI 生成
const baziAnalysis = await aiAgent.analyzeBazi(babyInfo);

// 3. 保存缓存
await db.updateSession(sessionId, {
  baziCache: JSON.stringify(baziAnalysis),
  updatedAt: Date.now()
});

return baziAnalysis;
```

### 5.2 AI 生成名字并缓存

```typescript
// 1. 检查缓存
const session = await db.getSession(sessionId);
const cached = session.namesCache?.[directionId];
if (cached && Date.now() - cached.generatedAt < 24 * 60 * 60 * 1000) {
  return cached.names;  // 24小时内缓存有效
}

// 2. 调用 AI 生成
const names = await aiAgent.generateNames({
  surname: session.babyInfo.surname,
  gender: session.babyInfo.gender,
  bazi: session.baziCache,
  style: directionId
});

// 3. 保存缓存
const newCache = {
  ...session.namesCache,
  [directionId]: {
    names,
    generatedAt: Date.now()
  }
};
await db.updateSession(sessionId, {
  namesCache: JSON.stringify(newCache),
  updatedAt: Date.now()
});

return names;
```

### 5.3 支付解锁流程

```sql
-- 1. 创建订单
INSERT INTO orders (id, order_no, user_id, session_id, product_type, 
                    product_name, direction_id, amount, payable_amount, 
                    expire_time, created_at)
VALUES ('uuid', 'N202402031200001', 'user_id', 'session_id', 'single',
        '诗词雅韵系列解锁', 'poetic', 990, 990, 
        1706963200, 1706961400);

-- 2. 支付成功后更新
UPDATE orders 
SET status = 'paid', pay_channel = 'wechat', pay_time = 1706963200
WHERE order_no = 'N202402031200001';

-- 3. 更新会话解锁状态
UPDATE naming_sessions
SET unlock_status = '{"isUnlocked":true,"unlockType":"single","unlockedDirections":["poetic"],"orderNo":"N202402031200001"}',
    unlock_order_id = 'order_uuid',
    updated_at = 1706963200
WHERE id = 'session_id';
```

---

## 6. 数据迁移

### 6.1 从 IndexedDB 迁移到 SQLite

```typescript
// 导出 IndexedDB 数据
async function exportFromIndexedDB(): Promise<ExportData> {
  const sessions = await sessionsDB.getAll();
  const orders = await ordersDB.getAll();
  const favorites = await favoritesDB.getAll();
  
  return { sessions, orders, favorites };
}

// 导入到 SQLite
async function importToSQLite(data: ExportData): Promise<void> {
  const db = new Database('naming.db');
  
  for (const session of data.sessions) {
    db.prepare(`
      INSERT INTO naming_sessions 
      (id, user_id, baby_info, messages, current_step, bazi_cache, 
       names_cache, unlock_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      session.id,
      session.userId,
      JSON.stringify(session.babyInfo),
      JSON.stringify(session.messages),
      session.currentStep,
      JSON.stringify(session.baziCache),
      JSON.stringify(session.namesCache),
      JSON.stringify(session.unlockStatus),
      session.createdAt,
      session.updatedAt
    );
  }
}
```

---

## 7. 备份策略

### 7.1 SQLite 备份

```bash
# 热备份
sqlite3 naming.db ".backup '/backup/naming-$(date +%Y%m%d).db'"

# 压缩
gzip /backup/naming-*.db

# 上传云端
aws s3 cp /backup/naming-*.db.gz s3://naming-backup/
```

### 7.2 IndexedDB 备份（纯前端）

```typescript
// 导出数据为 JSON 文件
async function backupIndexedDB(): Promise<void> {
  const data = {
    sessions: await getAllSessions(),
    orders: await getAllOrders(),
    favorites: await getAllFavorites(),
    backupAt: Date.now()
  };
  
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // 触发下载
  const a = document.createElement('a');
  a.href = url;
  a.download = `naming-backup-${Date.now()}.json`;
  a.click();
}
```

---

## 8. 数据清理

### 8.1 自动清理策略

```sql
-- 清理过期订单（超过30天未支付）
DELETE FROM orders 
WHERE status = 'pending' 
AND created_at < strftime('%s', 'now', '-30 days');

-- 清理已退款且超过90天的订单
DELETE FROM orders 
WHERE status = 'refunded' 
AND refund_time < strftime('%s', 'now', '-90 days');
```

### 8.2 缓存刷新策略

```typescript
// AI 生成内容缓存 7 天过期
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

function isCacheValid(cache: { generatedAt: number }): boolean {
  return Date.now() - cache.generatedAt < CACHE_TTL;
}
```
