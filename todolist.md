# AI智能起名顾问 - 开发任务清单

> 版本: v2.1  
> 创建日期: 2026-02-05  
> 状态: 可开发

---

## 📋 项目概述

**产品名称**: AI智能起名顾问  
**技术栈**: React 19.2.4 + TypeScript 5.9.3 + Vite 7.3.1 + Tailwind CSS 4.1.18 + shadcn/ui + Zustand 5.0.11 + localForage 1.10.0 + Framer Motion 12.31.0  
**架构**: 纯前端 H5 Web 应用（AI Agent 驱动）

**核心设计原则**: 
> **AI 输出必须是结构化 JSON，前端基于预设数据结构直接渲染 UI 组件**，而非解析自由文本。

---

## 🎯 开发任务列表

### Phase 1: 项目初始化与环境搭建

| 序号 | 任务 | 优先级 | 预计工时 | 状态 |
|-----|------|--------|---------|------|
| 1.1 | 初始化 Vite + React 19 + TypeScript 项目 | P0 | 1h | ⬜ |
| 1.2 | 配置 Tailwind CSS + 自定义主题色（琥珀/橙色主色） | P0 | 1h | ⬜ |
| 1.3 | 集成 shadcn/ui 组件库 | P0 | 1h | ⬜ |
| 1.4 | 安装核心依赖：Zustand、Framer Motion、localForage | P0 | 0.5h | ⬜ |
| 1.5 | 配置 ESLint + Prettier 代码规范 | P1 | 1h | ⬜ |
| 1.6 | 配置路径别名 (@/components, @/hooks 等) | P1 | 0.5h | ⬜ |
| 1.7 | 创建项目目录结构 | P0 | 0.5h | ⬜ |

**目录结构规划**:
```
src/
├── components/        # UI 组件
│   ├── ui/           # shadcn 基础组件
│   ├── chat/         # 对话相关组件
│   ├── bazi/         # 八字展示组件（基于结构化数据渲染）
│   ├── naming/       # 起名相关组件（基于结构化数据渲染）
│   └── payment/      # 支付相关组件
├── pages/            # 页面组件
├── hooks/            # 自定义 Hooks
│   ├── useNamingFlow.ts
│   ├── usePayment.ts
│   └── useAI.ts
├── services/         # 服务层
│   ├── ai.ts         # AI 调用封装（强制 JSON 输出）
│   ├── db.ts         # IndexedDB 操作
│   └── payment.ts    # 支付服务
├── stores/           # Zustand 状态管理
├── types/            # TypeScript 类型定义（与 AI JSON 结构严格对应）
├── utils/            # 工具函数
└── lib/              # 第三方库配置
```

---

### Phase 2: 类型定义与数据层

| 序号 | 任务 | 优先级 | 预计工时 | 状态 |
|-----|------|--------|---------|------|
| 2.1 | 定义核心数据类型 (types/index.ts) - **与 AI JSON 输出严格对应** | P0 | 2h | ⬜ |
| 2.2 | 实现 IndexedDB 封装 (services/db.ts) | P0 | 3h | ⬜ |
| 2.3 | 实现 Session 增删改查操作 | P0 | 2h | ⬜ |
| 2.4 | 实现 Favorites 收藏数据操作 | P1 | 1h | ⬜ |
| 2.5 | 实现 Orders 订单数据操作 | P1 | 1h | ⬜ |

**核心类型清单**（与 AI JSON 输出结构一一对应）:
- `BabyInfo` - 宝宝信息
- `BabySession` - 起名会话
- `ChatMessage` - 对话消息
- `BaziAnalysis` - **AI 输出的八字分析 JSON 结构**
- `NameDetail` - **AI 输出的名字详情 JSON 结构**
- `Order` - 订单信息

---

### Phase 3: AI JSON Schema 定义与 Prompt 工程

> **关键原则**: AI 必须输出严格结构化的 JSON，前端组件直接消费这些 JSON 数据渲染 UI。

| 序号 | 任务 | 优先级 | 预计工时 | 状态 |
|-----|------|--------|---------|------|
| 3.1 | 定义八字分析 JSON Schema (BaziAnalysis) | P0 | 2h | ⬜ |
| 3.2 | 定义名字详情 JSON Schema (NameDetail) | P0 | 2h | ⬜ |
| 3.3 | 定义四维解析 JSON Schema (NameInterpretation) | P0 | 2h | ⬜ |
| 3.4 | 编写八字分析 AI Prompt（强制 JSON 输出） | P0 | 3h | ⬜ |
| 3.5 | 编写名字生成 AI Prompt（强制 JSON 输出） | P0 | 3h | ⬜ |
| 3.6 | 编写名字解析 AI Prompt（强制 JSON 输出） | P0 | 2h | ⬜ |
| 3.7 | AI JSON 输出校验与容错处理 | P0 | 2h | ⬜ |

**JSON Schema 设计示例**:

```typescript
// types/bazi.ts - AI 必须严格按此结构输出
interface BaziAnalysis {
  // 四柱信息
  bazi: {
    yearPillar: string;      // 年柱，如"丙午"
    monthPillar: string;     // 月柱
    dayPillar: string;       // 日柱
    hourPillar: string;      // 时柱
    yearWuxing: string;      // 年柱五行
    monthWuxing: string;
    dayWuxing: string;
    hourWuxing: string;
    yearCanggan: string;     // 年柱藏干
    monthCanggan: string;
    dayCanggan: string;
    hourCanggan: string;
    yearNayin: string;       // 年柱纳音
    monthNayin: string;
    dayNayin: string;
    hourNayin: string;
    benming: string;         // 本命
  };
  // 五行分析
  wuxing: {
    gold: number;            // 金个数
    wood: number;
    water: number;
    fire: number;
    earth: number;
    goldValue: number;       // 金含量（0-5）
    woodValue: number;
    waterValue: number;
    fireValue: number;
    earthValue: number;
    xiyong: string[];        // 喜用神
    jiyong: string[];        // 忌用神
    rizhu: string;           // 日主天干
    rizhuWuxing: string;     // 日主五行
    tonglei: string[];       // 同类五行
    yilei: string[];         // 异类五行
    tongleiScore: number;    // 同类得分
    yileiScore: number;
    wangshuai: string;       // 旺衰判定
  };
  // 文字总结（仅用于展示，不参与渲染逻辑）
  analysis: string;
  suggestion: string;
}

// types/name.ts - AI 必须严格按此结构输出
interface NameDetail {
  name: string;              // 名字
  pinyin: string;            // 拼音
  characters: CharacterInfo[]; // 每个字的详情
  meaning: string;           // 整体寓意
  source: string;            // 出处典籍
  wuxing: string;            // 五行组合
  baziMatch: string;         // 八字匹配说明
  score: number;             // 综合评分（0-100）
  uniqueness: string;        // 重名度
  uniquenessCount: string;   // 重名数量估算
  yinyun: YinyunInfo;        // 音韵分析
  personalizedMeaning: string; // 专属寓意
}

interface CharacterInfo {
  char: string;
  pinyin: string;
  wuxing: string;            // 五行属性
  meaning: string;           // 字义
  explanation: string;       // 详细解释
  source: string;            // 出处
  kangxi: {
    strokes: number;         // 康熙笔画
    page: string;            // 康熙字典页码
    original: string;        // 原文
  };
}

interface YinyunInfo {
  tone: string;              // 声调组合
  initials: string;          // 声母组合
  score: number;             // 音韵评分
  analysis: string;          // 音韵分析说明
}
```

---

### Phase 4: UI 组件开发（基于结构化数据渲染）

> **组件设计原则**: 每个组件接收结构化的 JSON props，直接映射渲染，不做文本解析。

#### 4.1 基础组件

| 序号 | 任务 | 优先级 | 预计工时 | 状态 |
|-----|------|--------|---------|------|
| 4.1.1 | AI 生成中动画组件 (AIGenerating) | P0 | 2h | ⬜ |
| 4.1.2 | AI 徽章组件 (AIBadge) | P0 | 0.5h | ⬜ |
| 4.1.3 | 对话气泡组件 (ChatBubble) | P0 | 1h | ⬜ |
| 4.1.4 | 锁定遮罩组件 (LockOverlay) | P0 | 1h | ⬜ |
| 4.1.5 | 五行标签组件 (WuxingTag) - 接收五行字符串渲染 | P1 | 0.5h | ⬜ |

#### 4.2 八字分析组件（基于 BaziAnalysis JSON 渲染）

| 序号 | 任务 | 优先级 | 预计工时 | 状态 |
|-----|------|--------|---------|------|
| 4.2.1 | 四柱展示组件 (BaziPillarCard) - 渲染 bazi 对象 | P0 | 2h | ⬜ |
| 4.2.2 | 五行统计组件 (WuxingStats) - 渲染 wuxing 统计数字 | P0 | 2h | ⬜ |
| 4.2.3 | 五行可视化图表 (WuxingChart) - 渲染 wuxingValue | P1 | 2h | ⬜ |
| 4.2.4 | 喜用神分析组件 (XiyongAnalysis) - 渲染 xiyong/jiyong 数组 | P0 | 1.5h | ⬜ |
| 4.2.5 | 旺衰判定组件 (WangshuaiBadge) - 渲染 wangshuai 字符串 | P1 | 0.5h | ⬜ |
| 4.2.6 | 八字分析总览卡片 (BaziAnalysisCard) - 组合以上组件 | P0 | 2h | ⬜ |

#### 4.3 起名组件（基于 NameDetail JSON 渲染）

| 序号 | 任务 | 优先级 | 预计工时 | 状态 |
|-----|------|--------|---------|------|
| 4.3.1 | 名字卡片组件 (NameCard) - 渲染 name/pinyin/score | P0 | 2h | ⬜ |
| 4.3.2 | 名字列表组件 (NameList) - 渲染 NameDetail[] 数组 | P0 | 1.5h | ⬜ |
| 4.3.3 | 汉字解析组件 (CharacterAnalysis) - 渲染 characters 数组 | P0 | 2h | ⬜ |
| 4.3.4 | 康熙字典展示组件 (KangxiInfo) - 渲染 kangxi 对象 | P1 | 1h | ⬜ |
| 4.3.5 | 音韵分析组件 (YinyunAnalysis) - 渲染 yinyun 对象 | P0 | 1.5h | ⬜ |
| 4.3.6 | 五行匹配组件 (WuxingMatch) - 渲染 wuxing/baziMatch | P0 | 1.5h | ⬜ |
| 4.3.7 | 名字评分组件 (NameScore) - 渲染 score/uniqueness | P1 | 1h | ⬜ |
| 4.3.8 | 专属寓意组件 (PersonalizedMeaning) - 渲染 personalizedMeaning | P1 | 0.5h | ⬜ |
| 4.3.9 | 名字详情页 (NameDetailPage) - 组合以上所有组件 | P0 | 3h | ⬜ |
| 4.3.10 | 收藏按钮组件 (FavoriteButton) | P1 | 0.5h | ⬜ |

#### 4.4 支付组件

| 序号 | 任务 | 优先级 | 预计工时 | 状态 |
|-----|------|--------|---------|------|
| 4.4.1 | 支付弹窗组件 (PaymentModal) | P0 | 2h | ⬜ |
| 4.4.2 | 价格标签组件 (PriceTag) | P1 | 0.5h | ⬜ |
| 4.4.3 | 解锁成功动画 (UnlockSuccess) | P1 | 1h | ⬜ |

---

### Phase 5: 核心 Hooks 开发

| 序号 | 任务 | 优先级 | 预计工时 | 状态 |
|-----|------|--------|---------|------|
| 5.1 | `useNamingFlow` - 起名流程状态管理 | P0 | 4h | ⬜ |
| 5.2 | `useSessions` - 会话管理 Hook | P0 | 2h | ⬜ |
| 5.3 | `useAI` - AI 调用封装 Hook（强制 JSON 输出） | P0 | 3h | ⬜ |
| 5.4 | `usePayment` - 支付流程 Hook | P0 | 3h | ⬜ |
| 5.5 | `useFavorites` - 收藏管理 Hook | P1 | 1h | ⬜ |

**useNamingFlow 核心方法**:
- `startFlow()` - 开始起名流程
- `submitBabyInfo(info)` - 提交宝宝信息
- `selectExpectation(style)` - 选择期望风格
- `generateBazi()` - 调用 AI 生成八字 JSON
- `generateNames(directionId)` - 调用 AI 生成名字 JSON 数组
- `unlockContent(type, directionId)` - 解锁内容

---

### Phase 6: AI 服务集成（强制 JSON 输出）

| 序号 | 任务 | 优先级 | 预计工时 | 状态 |
|-----|------|--------|---------|------|
| 6.1 | AI 服务配置与初始化 | P0 | 1h | ⬜ |
| 6.2 | 八字分析 AI 调用（response_format: json_object） | P0 | 3h | ⬜ |
| 6.3 | 名字生成 AI 调用（返回 NameDetail[] JSON 数组） | P0 | 3h | ⬜ |
| 6.4 | 名字解析 AI 调用（返回 NameInterpretation JSON） | P0 | 2h | ⬜ |
| 6.5 | AI JSON 输出校验与类型守卫 | P0 | 2h | ⬜ |
| 6.6 | AI 流式输出支持（SSE 逐字显示，但保持 JSON 结构） | P1 | 3h | ⬜ |
| 6.7 | AI 错误重试与降级机制 | P1 | 2h | ⬜ |
| 6.8 | AI 结果缓存机制（按 JSON 结构缓存） | P1 | 1h | ⬜ |

**AI 调用示例**:
```typescript
// AI 必须返回严格格式化的 JSON
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: '你是八字命理专家，只输出 JSON 格式，不要任何额外文字。' },
    { role: 'user', content: baziPrompt }
  ],
  temperature: 0.7,
  response_format: { type: 'json_object' }  // 强制 JSON 输出
});

// 解析并校验
const baziData: BaziAnalysis = JSON.parse(response.choices[0].message.content);
// 类型守卫校验...
```

---

### Phase 7: 页面开发

| 序号 | 任务 | 优先级 | 预计工时 | 状态 |
|-----|------|--------|---------|------|
| 7.1 | 欢迎页 (WelcomePage) | P0 | 2h | ⬜ |
| 7.2 | 对话页 - 信息收集阶段 | P0 | 3h | ⬜ |
| 7.3 | 对话页 - 八字分析展示（渲染 AI 返回的 BaziAnalysis JSON） | P0 | 3h | ⬜ |
| 7.4 | 对话页 - 名字推荐展示（渲染 AI 返回的 NameDetail[] JSON） | P0 | 3h | ⬜ |
| 7.5 | 名字详情页（渲染完整 NameDetail JSON） | P0 | 3h | ⬜ |
| 7.6 | 收藏列表页 (FavoritesPage) | P1 | 2h | ⬜ |
| 7.7 | 会话管理页 (SessionsPage) | P1 | 2h | ⬜ |

---

### Phase 8: 支付功能开发

| 序号 | 任务 | 优先级 | 预计工时 | 状态 |
|-----|------|--------|---------|------|
| 8.1 | 微信支付 H5/JSAPI 集成 | P0 | 3h | ⬜ |
| 8.2 | 支付状态轮询查询 | P0 | 2h | ⬜ |
| 8.3 | 解锁状态管理 | P0 | 2h | ⬜ |
| 8.4 | 支付成功回调处理 | P0 | 1h | ⬜ |
| 8.5 | 订单数据持久化 | P1 | 1h | ⬜ |

**付费点配置**:
- 单个系列解锁：¥9.9
- 全部系列解锁：¥19.9

---

### Phase 9: 业务流程整合

| 序号 | 任务 | 优先级 | 预计工时 | 状态 |
|-----|------|--------|---------|------|
| 9.1 | 欢迎页 → 信息收集流程 | P0 | 2h | ⬜ |
| 9.2 | 信息收集 → AI 八字分析流程（获取 BaziAnalysis JSON） | P0 | 2h | ⬜ |
| 9.3 | 八字分析 → 风格选择流程 | P0 | 1h | ⬜ |
| 9.4 | 风格选择 → AI 名字生成流程（获取 NameDetail[] JSON） | P0 | 2h | ⬜ |
| 9.5 | 名字列表 → 支付解锁流程 | P0 | 2h | ⬜ |
| 9.6 | 解锁 → 名字详情流程（渲染完整 JSON） | P0 | 1h | ⬜ |
| 9.7 | 收藏/选定名字流程 | P1 | 1h | ⬜ |

---

### Phase 10: 优化与完善

| 序号 | 任务 | 优先级 | 预计工时 | 状态 |
|-----|------|--------|---------|------|
| 10.1 | 响应式布局适配 (320px-428px) | P0 | 3h | ⬜ |
| 10.2 | 页面切换动效 | P1 | 2h | ⬜ |
| 10.3 | AI 生成 Loading 状态优化 | P1 | 2h | ⬜ |
| 10.4 | JSON 解析错误边界处理 | P1 | 2h | ⬜ |
| 10.5 | 弱网环境适配 | P2 | 2h | ⬜ |
| 10.6 | PWA 配置 | P2 | 2h | ⬜ |

---

### Phase 11: 测试与部署

| 序号 | 任务 | 优先级 | 预计工时 | 状态 |
|-----|------|--------|---------|------|
| 11.1 | AI JSON 输出单元测试 | P0 | 3h | ⬜ |
| 11.2 | 组件渲染测试（基于 mock JSON 数据） | P1 | 3h | ⬜ |
| 11.3 | 集成测试 | P1 | 3h | ⬜ |
| 11.4 | 支付流程测试 | P0 | 2h | ⬜ |
| 11.5 | AI 生成测试（验证 JSON 结构） | P0 | 2h | ⬜ |
| 11.6 | 生产环境构建优化 | P1 | 2h | ⬜ |
| 11.7 | Vercel/Netlify 部署配置 | P0 | 1h | ⬜ |

---

## 📊 开发计划估算

| Phase | 阶段名称 | 预计工时 | 里程碑 |
|-------|---------|---------|--------|
| Phase 1 | 项目初始化 | 5.5h | 项目可启动 |
| Phase 2 | 类型定义与数据层 | 9h | 数据层就绪 |
| Phase 3 | AI JSON Schema 与 Prompt | 16h | AI 数据结构定义完成 |
| Phase 4 | UI 组件开发 | 25h | 组件库就绪 |
| Phase 5 | 核心 Hooks | 13h | 业务逻辑就绪 |
| Phase 6 | AI 服务集成 | 17h | AI JSON 输出就绪 |
| Phase 7 | 页面开发 | 18h | 页面完整 |
| Phase 8 | 支付功能 | 9h | 支付流程完整 |
| Phase 9 | 业务流程整合 | 11h | MVP 可运行 |
| Phase 10 | 优化与完善 | 13h | 体验优化 |
| Phase 11 | 测试与部署 | 16h | 生产就绪 |
| **合计** | | **~153h** | |

---

## 🚀 推荐开发顺序

### Week 1: 基础搭建 + AI Schema 定义
1. Phase 1: 项目初始化
2. Phase 2: 类型定义与数据层
3. Phase 3: AI JSON Schema 定义与 Prompt 工程（关键！）

### Week 2: 核心组件 + AI 集成
1. Phase 4.1-4.2: 基础组件 + 八字分析组件
2. Phase 5: 核心 Hooks
3. Phase 6.1-6.4: AI 服务基础集成

### Week 3: 起名组件 + 页面开发
1. Phase 4.3: 起名相关组件
2. Phase 6.5-6.8: AI 完善
3. Phase 7: 页面开发

### Week 4: 支付 + 整合 + 上线
1. Phase 8: 支付功能
2. Phase 9: 业务流程整合
3. Phase 10: 优化
4. Phase 11: 测试与部署

---

## 📝 开发注意事项

### 关键技术原则

1. **AI 输出必须是结构化 JSON**
   - 八字分析 → `BaziAnalysis` JSON 对象
   - 名字列表 → `NameDetail[]` JSON 数组
   - 名字详情 → `NameDetail` JSON 对象
   - 前端组件直接消费 JSON，不做文本解析

2. **Prompt 工程要点**
   - 使用 `response_format: { type: 'json_object' }` 强制 JSON 输出
   - Prompt 中提供完整的 JSON Schema 示例
   - 要求 AI "只输出 JSON，不要任何额外文字"

3. **类型安全**
   - TypeScript 类型必须与 AI JSON 输出严格对应
   - 实现类型守卫函数校验 AI 返回值
   - 异常 JSON 结构要有降级处理

4. **组件设计**
   - 组件 props 直接接收结构化数据
   - 例如：`<BaziAnalysisCard data={baziData} />`
   - 不接收自由文本进行解析

### UI 规范
- **设计稿基准**: 375px 宽度
- **最大宽度**: 428px，超出居中
- **主色调**: #F59E0B（琥珀色）
- **AI 标识色**: #3B82F6（科技蓝）

### 性能要求
- 首屏加载 < 2s
- AI 响应 < 5s（显示 loading）
- 支付调起 < 500ms

---

## ✅ 验收标准

### MVP 必须完成
- [ ] 欢迎页、信息收集表单
- [ ] AI 生成结构化八字分析 JSON 并正确渲染
- [ ] AI 生成结构化名字 JSON 数组并正确渲染
- [ ] 第一个名字免费，其余锁定
- [ ] 支付解锁功能
- [ ] 名字详情 JSON 完整渲染（四维解析）
- [ ] 数据持久化（IndexedDB）

### JSON 结构验收
- [ ] 八字分析 JSON 包含完整 bazi + wuxing 结构
- [ ] 名字详情 JSON 包含完整 NameDetail 结构
- [ ] AI 输出通过类型校验
- [ ] 异常 JSON 有降级处理

### 加分项
- [ ] 流式 AI 输出（保持 JSON 结构）
- [ ] 收藏功能
- [ ] 多宝宝管理
- [ ] PWA 支持
