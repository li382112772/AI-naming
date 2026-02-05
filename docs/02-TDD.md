# AI智能起名顾问 - 技术设计文档 (TDD)

> 版本: v2.1  
> 更新日期: 2026-02-03  
> 状态: H5 Web + AI Agent + SQLite

## 1. 技术栈选型

### 1.1 前端（H5 Web）
| 技术 | 版本 | 用途 |
|-----|------|------|
| React | ^19.2.4 | UI框架 (最新稳定版) |
| TypeScript | ~5.9.3 | 类型系统 (最新稳定版) |
| Vite | ^7.3.1 | 构建工具 (v7 最新) |
| Tailwind CSS | ^4.1.18 | CSS框架 (v4 最新) |
| shadcn/ui | 最新 | UI组件库 |
| Framer Motion | ^12.31.0 | 动画 (v12 最新) |
| Zustand | ^5.0.11 | 全局状态管理 (v5 最新) |
| sql.js | ^1.10.0 | SQLite for JavaScript |
| localForage | ^1.10.0 | IndexedDB 封装 |

### 1.2 轻量后端（可选）
| 技术 | 版本 | 用途 |
|-----|------|------|
| Node.js | ^20.0.0 | 运行环境 |
| Express | ^4.18.0 | Web框架 |
| better-sqlite3 | ^9.0.0 | SQLite 驱动 |
| 微信支付 SDK | 最新 | 支付对接 |

### 1.3 AI 服务
| 服务 | 用途 |
|-----|------|
| Deepseek | 八字分析、名字生成 |
| Claude  | 备选方案 |
| OpenAI | 备选 |
| 通义千问 | 备选 |

---

## 2. 系统架构

### 2.1 架构选型

**方案 A：纯前端（推荐初期）**
```
┌─────────────────────────────────────────┐
│           H5 Web 应用                    │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ React   │ │ SQLite  │ │ AI SDK  │   │
│  │   UI    │ │(sql.js) │ │(OpenAI) │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                         │
│  存储：IndexedDB / localStorage         │
└─────────────────────────────────────────┘
```

**方案 B：轻量后端**
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
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           第三方服务                     │
│  ┌──────────┐ ┌──────────┐             │
│  │ Deepseek │ │ 微信支付 │             │
│  │ Claude   │ │ 支付宝   │             │
│  └──────────┘ └──────────┘             │
└─────────────────────────────────────────┘
```

### 2.2 推荐架构（方案 A 起步，后期可迁 B）

初期采用 **纯前端方案**：
- 所有数据存储在浏览器 IndexedDB
- AI 直接调用 Deepseek/Claude API（前端直连或简单代理）
- 支付通过 H5 支付完成

后期如需扩展：
- 添加轻量 Node.js 后端
- SQLite 移至服务端
- AI 调用走服务端转发（安全/缓存）

---

## 3. AI Agent 设计

> **设计原则**: AI 必须输出**严格结构化的 JSON**，前端组件基于这些预设的数据结构直接渲染 UI，不做自由文本解析。

### 3.1 Agent 架构

```typescript
// AI Agent 核心接口
interface AIAgent {
  // 八字分析 Agent
  analyzeBazi(birthInfo: BirthInfo): Promise<BaziAnalysis>;
  
  // 名字生成 Agent
  generateNames(params: NameGenParams): Promise<NameDetail[]>;
  
  // 名字解析 Agent
  interpretName(name: string, context: Context): Promise<NameInterpretation>;
}
```

### 3.2 八字分析 Agent

**输出要求**: AI 必须返回结构化的 `BaziAnalysis` JSON 对象，前端 `BaziAnalysisCard` 组件直接消费此 JSON 渲染。

**Prompt 设计**:
```typescript
const BAZI_ANALYZE_PROMPT = `
你是一位精通中国传统八字命理的 AI 分析师。

请根据以下出生信息，进行专业八字分析：
- 出生日期：{birthDate}
- 出生时间：{birthTime}
- 性别：{gender}

请输出以下内容的 JSON 格式：
{
  "bazi": {
    "yearPillar": "年柱",
    "monthPillar": "月柱",
    "dayPillar": "日柱",
    "hourPillar": "时柱",
    "yearWuxing": "年柱五行",
    "monthWuxing": "月柱五行",
    "dayWuxing": "日柱五行",
    "hourWuxing": "时柱五行",
    "yearCanggan": "年柱藏干",
    "monthCanggan": "月柱藏干",
    "dayCanggan": "日柱藏干",
    "hourCanggan": "时柱藏干",
    "yearNayin": "年柱纳音",
    "monthNayin": "月柱纳音",
    "dayNayin": "日柱纳音",
    "hourNayin": "时柱纳音",
    "benming": "本命"
  },
  "wuxing": {
    "gold": 金个数,
    "wood": 木个数,
    "water": 水个数,
    "fire": 火个数,
    "earth": 土个数,
    "goldValue": 金含量(0-5),
    "woodValue": 木含量(0-5),
    "waterValue": 水含量(0-5),
    "fireValue": 火含量(0-5),
    "earthValue": 土含量(0-5),
    "xiyong": ["喜用五行"],
    "jiyong": ["忌用五行"],
    "rizhu": "日主天干",
    "rizhuWuxing": "日主五行",
    "tonglei": ["同类五行"],
    "yilei": ["异类五行"],
    "tongleiScore": 同类得分,
    "yileiScore": 异类得分,
    "wangshuai": "旺衰判定"
  },
  "analysis": "八字分析文字说明",
  "suggestion": "起名建议"
}
`;
```

### 3.3 名字生成 Agent

**输出要求**: AI 必须返回结构化的 `NameDetail[]` JSON 数组，前端 `NameList` 组件直接遍历渲染每个 `NameCard`。

**Prompt 设计**:
```typescript
const NAME_GENERATE_PROMPT = `
你是一位精通中国传统文化、诗词典籍的 AI 起名专家。

请根据以下信息，生成 6 个名字：
- 姓氏：{surname}
- 性别：{gender}
- 八字喜用：{xiyong}
- 期望风格：{style}（诗词雅韵/山河大气/现代简约）
- 避讳字：{tabooWords}
- 喜欢的意象：{imagery}

要求：
1. 每个名字要符合八字喜用
2. 风格要符合期望
3. 避免避讳字
4. 寓意美好，出处典雅

请输出 JSON 数组，每个名字包含：
{
  "name": "名字",
  "pinyin": "拼音",
  "characters": [
    {
      "char": "字",
      "pinyin": "拼音",
      "wuxing": "五行",
      "meaning": "字义",
      "explanation": "详细解释",
      "source": "出处",
      "kangxi": {
        "strokes": 笔画数,
        "page": "康熙字典页码",
        "original": "原文"
      }
    }
  ],
  "meaning": "整体寓意",
  "source": "出处典籍",
  "wuxing": "五行组合",
  "baziMatch": "八字匹配说明",
  "score": 综合评分(0-100),
  "uniqueness": "重名度(低/较低/中等/较高/高)",
  "uniquenessCount": "重名数量估算",
  "yinyun": {
    "tone": "声调组合",
    "initials": "声母组合",
    "score": 音韵评分(0-100)
  },
  "personalizedMeaning": "专属寓意解读"
}
`;
```

### 3.4 AI 调用封装

```typescript
// services/ai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 前端直连（仅演示，生产建议走代理）
});

export async function analyzeBaziWithAI(birthInfo: BirthInfo): Promise<BaziAnalysis> {
  const prompt = generateBaziPrompt(birthInfo);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: '你是八字命理专家，只输出 JSON 格式。' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });
  
  const content = response.choices[0].message.content;
  return JSON.parse(content);
}

export async function* generateNamesStream(params: NameGenParams) {
  const prompt = generateNamePrompt(params);
  
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: '你是起名专家，生成独特好名。' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.8,
    stream: true,
    response_format: { type: 'json_object' }
  });
  
  for await (const chunk of stream) {
    yield chunk.choices[0]?.delta?.content || '';
  }
}
```

---

## 4. 数据存储设计

### 4.1 存储方案对比

| 方案 | 技术 | 适用场景 |
|-----|------|---------|
| 方案 A | IndexedDB + localStorage | 纯前端，无后端 |
| 方案 B | sql.js (SQLite in WASM) | 纯前端，需要 SQL |
| 方案 C | better-sqlite3 (Node.js) | 轻量后端 |

**推荐：方案 A 起步，数据结构对标 SQLite**

### 4.2 IndexedDB 封装

```typescript
// db/index.ts
import localforage from 'localforage';

// 配置多个 store
const sessionsDB = localforage.createInstance({
  name: 'namingApp',
  storeName: 'sessions'
});

const favoritesDB = localforage.createInstance({
  name: 'namingApp',
  storeName: 'favorites'
});

const ordersDB = localforage.createInstance({
  name: 'namingApp',
  storeName: 'orders'
});

// Session 操作
export async function saveSession(session: BabySession): Promise<void> {
  await sessionsDB.setItem(session.id, session);
}

export async function getSession(id: string): Promise<BabySession | null> {
  return await sessionsDB.getItem(id);
}

export async function getAllSessions(): Promise<BabySession[]> {
  const sessions: BabySession[] = [];
  await sessionsDB.iterate((value) => {
    sessions.push(value as BabySession);
  });
  return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteSession(id: string): Promise<void> {
  await sessionsDB.removeItem(id);
}
```

### 4.3 数据结构（对标 SQLite）

```typescript
// types/index.ts

interface BabySession {
  id: string;
  babyInfo: BabyInfo;
  messages: ChatMessage[];
  currentStep: string;
  
  // AI 生成的数据
  baziData?: BaziAnalysis;      // AI 生成的八字分析
  generatedNames?: {             // AI 生成的名字
    [directionId: string]: {
      names: NameDetail[];
      generatedAt: number;
    }
  };
  
  // 解锁状态
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

interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  component?: string;
  data?: any;
  createdAt: number;
}

interface BaziAnalysis {
  // AI 生成的八字数据
  bazi: BaziInfo;
  wuxing: WuxingAnalysis;
  analysis: string;      // AI 分析文字
  suggestion: string;    // AI 起名建议
}

interface NameDetail {
  // AI 生成的名字详情
  name: string;
  pinyin: string;
  characters: CharacterInfo[];
  meaning: string;
  source: string;
  wuxing: string;
  baziMatch: string;
  score: number;
  uniqueness: string;
  uniquenessCount: string;
  yinyun: YinyunInfo;
  personalizedMeaning: string;
  
  // 元数据
  generatedBy: 'ai';
  generatedAt: number;
}
```

---

## 5. 核心 Hook 设计

### 5.1 useNamingFlow（AI Agent 版）

```typescript
// hooks/useNamingFlow.ts

interface UseNamingFlowReturn {
  // 状态
  currentSession: BabySession | null;
  sessions: BabySession[];
  messages: ChatMessage[];
  isTyping: boolean;
  isGenerating: boolean;      // AI 生成中
  
  // 操作
  startFlow: () => Promise<void>;
  submitBabyInfo: (info: BabyInfo) => Promise<void>;
  selectExpectation: (style: string) => Promise<void>;
  
  // AI 相关
  generateBazi: () => Promise<BaziAnalysis>;           // AI 生成八字
  generateNames: (directionId: string) => Promise<NameDetail[]>;  // AI 生成名字
  changeName: (directionId: string) => Promise<NameDetail>;       // AI 换名字
  
  // 支付相关
  unlockContent: (type: 'single' | 'all', directionId?: string) => Promise<void>;
  
  // ... 其他方法
}

export function useNamingFlow(): UseNamingFlowReturn {
  // 使用 Zustand 管理状态
  // 使用 IndexedDB 持久化
  // 调用 AI 服务生成内容
}
```

---

## 6. 支付集成

### 6.1 H5 支付流程

```typescript
// services/payment.ts

export async function createH5Order(params: CreateOrderParams): Promise<Order> {
  // 调用后端创建订单
  const { data } = await api.post('/orders', params);
  return data.order;
}

export function launchWechatPay(order: Order): void {
  // 调起微信支付
  const params = {
    appId: order.payParams.appId,
    timeStamp: order.payParams.timeStamp,
    nonceStr: order.payParams.nonceStr,
    package: order.payParams.package,
    signType: 'RSA',
    paySign: order.payParams.paySign,
    success: () => {
      // 支付成功，解锁内容
      unlockContent(order.sessionId, order.productType);
    },
    fail: (err: any) => {
      console.error('支付失败:', err);
    }
  };
  
  // 调用微信 JSAPI
  if (typeof WeixinJSBridge !== 'undefined') {
    WeixinJSBridge.invoke('getBrandWCPayRequest', params);
  }
}
```

---

## 7. 性能优化

### 7.1 AI 响应优化
- 流式输出：显示生成过程
- 缓存结果：相同八字直接返回缓存
- 降级策略：AI 失败时使用备用模型

### 7.2 前端优化
- 路由懒加载
- 组件按需加载
- 虚拟滚动（长列表）

### 7.3 存储优化
- 数据压缩存储
- 定期清理过期数据
- 图片懒加载

---

## 8. 安全设计

### 8.1 API Key 安全
```typescript
// 方案 1：前端直连（仅演示，不安全）
// 用户需提供自己的 OpenAI API Key

// 方案 2：后端代理（推荐）
// 后端转发请求，隐藏 API Key

// 方案 3：边缘函数
// 使用 Cloudflare Workers/Vercel Edge 转发
```

### 8.2 支付安全
- HTTPS 全站加密
- 支付签名验证
- 敏感数据加密存储

---

## 9. 部署方案

### 9.1 纯前端部署（推荐初期）
- 平台：Vercel / Netlify / GitHub Pages
- 后端：无（或边缘函数）
- 存储：IndexedDB（用户浏览器）
- AI：前端直连（用户提供 API Key）或边缘函数代理

### 9.2 轻量后端部署
- 平台：VPS / 云服务器
- 后端：Node.js + SQLite
- 存储：SQLite 文件
- AI：服务端转发

详见 [07-Deployment.md](./07-Deployment.md)
